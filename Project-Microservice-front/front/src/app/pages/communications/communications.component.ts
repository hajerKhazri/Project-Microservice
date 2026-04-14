import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, finalize, forkJoin, interval, Observable, of, Subscription, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CommunicationTraceService } from '../../core/services/communication-trace.service';
import { Formation } from '../../models/formation.model';
import { Project } from '../../models/project.model';
import { FormationsService } from '../../services/formations.service';
import { ProjectsService } from '../../services/projects.service';
import { ReviewsService } from '../../services/reviews.service';
import { SkillsService } from '../../services/skills.service';
import { UsersService } from '../../services/users.service';

interface CommunicationFlow {
  source: string;
  target: string;
  mode: 'Gateway' | 'Feign' | 'RabbitMQ' | 'Infra' | 'Database';
  details: string;
  visibleWhen: string;
}

interface CommunicationProbe {
  id: string;
  title: string;
  accent: 'blue' | 'orange' | 'green' | 'teal' | 'gold';
  chain: string;
  description: string;
  actionLabel: string;
}

interface RabbitTraceEvent {
  direction: string;
  queue: string;
  service: string;
  message: string;
  timestamp: string;
}

interface RabbitTraceGroup {
  label: string;
  service: string;
  queue: string;
  events: RabbitTraceEvent[];
}

@Component({
  selector: 'app-communications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './communications.component.html',
  styleUrl: './communications.component.css'
})
export class CommunicationsComponent implements OnInit, OnDestroy {
  readonly traces$ = this.trace.entries$;

  readonly flows: CommunicationFlow[] = [
    {
      source: 'Front',
      target: 'API Gateway',
      mode: 'Gateway',
      details: 'The main Angular portal sends requests to the unified gateway on port 8091.',
      visibleWhen: 'Each page load from Users, Skills, Projects, Formations or Evaluations.'
    },
    {
      source: 'API Gateway',
      target: 'user-service',
      mode: 'Gateway',
      details: 'Gateway routes `/api/users`, `/api/auth` and `/api/health` directly to the Django user-service.',
      visibleWhen: 'Login, user list and user health checks.'
    },
    {
      source: 'API Gateway',
      target: 'skills-service',
      mode: 'Gateway',
      details: 'Gateway routes `/skills/**` to the skills microservice.',
      visibleWhen: 'Loading or editing skills from the front.'
    },
    {
      source: 'API Gateway',
      target: 'service-projet',
      mode: 'Gateway',
      details: 'Gateway routes `/api/projets/**` to the project microservice.',
      visibleWhen: 'Loading or editing projects.'
    },
    {
      source: 'service-projet',
      target: 'evaluation-service',
      mode: 'Feign',
      details: 'Project service can fetch project reviews through OpenFeign.',
      visibleWhen: 'The `project-with-reviews` scenario from this page.'
    },
    {
      source: 'API Gateway',
      target: 'gestion-formation',
      mode: 'Gateway',
      details: 'Gateway routes `/api/formations/**` to the formation microservice.',
      visibleWhen: 'Loading formations or stats.'
    },
    {
      source: 'gestion-formation',
      target: 'evaluation-service',
      mode: 'Feign',
      details: 'Formation service can enrich a formation with reviews from evaluation-service.',
      visibleWhen: 'The `formation-with-reviews` scenario from this page.'
    },
    {
      source: 'condidature-service',
      target: 'service-projet',
      mode: 'Feign',
      details: 'Condidature service checks project existence and reads project details through Feign.',
      visibleWhen: 'Condidature flows on the backend.'
    },
    {
      source: 'messagerie-service',
      target: 'user-service',
      mode: 'Feign',
      details: 'Messagerie service reads users through the direct Django URL configured in Docker.',
      visibleWhen: 'Message flows that need sender or receiver user details.'
    },
    {
      source: 'service-projet / evaluation / skills / formation / condidature / messagerie',
      target: 'RabbitMQ',
      mode: 'RabbitMQ',
      details: 'Several asynchronous events move through RabbitMQ for decoupled backend communication.',
      visibleWhen: 'Event-driven actions on the backend.'
    },
    {
      source: 'Spring services',
      target: 'Eureka + Config Server',
      mode: 'Infra',
      details: 'The Spring microservices register in Eureka and can use the Config Server if enabled.',
      visibleWhen: 'Service startup and discovery.'
    },
    {
      source: 'Microservices',
      target: 'MySQL / PostgreSQL',
      mode: 'Database',
      details: 'Most services use MySQL, while the Django user-service uses PostgreSQL.',
      visibleWhen: 'Any CRUD request handled by the backend.'
    }
  ];

  readonly probes: CommunicationProbe[] = [
    {
      id: 'user-health',
      title: 'User Health',
      accent: 'blue',
      chain: 'Front -> API Gateway -> user-service',
      description: 'Quick proof that the gateway reaches the Django service.',
      actionLabel: 'Ping health'
    },
    {
      id: 'users',
      title: 'Users',
      accent: 'blue',
      chain: 'Front -> API Gateway -> user-service',
      description: 'Load the user directory through the common portal route.',
      actionLabel: 'Load users'
    },
    {
      id: 'skills',
      title: 'Skills',
      accent: 'orange',
      chain: 'Front -> API Gateway -> skills-service',
      description: 'Load the skills list from the gateway.',
      actionLabel: 'Load skills'
    },
    {
      id: 'projects',
      title: 'Projects',
      accent: 'green',
      chain: 'Front -> API Gateway -> service-projet',
      description: 'Load the project list through the integrated front.',
      actionLabel: 'Load projects'
    },
    {
      id: 'formations',
      title: 'Formations',
      accent: 'teal',
      chain: 'Front -> API Gateway -> gestion-formation',
      description: 'Load formations and verify the training route.',
      actionLabel: 'Load formations'
    },
    {
      id: 'evaluations',
      title: 'Evaluations',
      accent: 'gold',
      chain: 'Front -> API Gateway -> evaluation-service',
      description: 'Load evaluations from the gateway.',
      actionLabel: 'Load evaluations'
    },
    {
      id: 'condidatures',
      title: 'Condidatures',
      accent: 'green',
      chain: 'Front -> API Gateway -> condidature-service',
      description: 'Check the candidature route exposed by the gateway.',
      actionLabel: 'Load condidatures'
    },
    {
      id: 'messagerie',
      title: 'Messagerie',
      accent: 'gold',
      chain: 'Front -> API Gateway -> messagerie-service',
      description: 'Check the messaging route exposed by the gateway.',
      actionLabel: 'Load messages'
    }
  ];

  projectChainId = 1;
  formationChainId = 1;
  projectCount = 0;
  formationCount = 0;
  availableProjectIds: number[] = [];
  availableFormationIds: number[] = [];
  rabbitGroups: RabbitTraceGroup[] = [];
  isRefreshingSources = false;
  isPreparingDemoData = false;
  isRefreshingRabbit = false;
  runningProbeId = '';
  infoMessage = 'Trigger a scenario and watch the communication log fill in live from the front.';
  errorMessage = '';
  rabbitInfoMessage = 'Create a review from Evaluations to trigger RabbitMQ, then watch the events appear here.';
  highlightedChain = 'Front -> API Gateway';
  private rabbitPollingSubscription?: Subscription;

  constructor(
    private readonly http: HttpClient,
    private readonly trace: CommunicationTraceService,
    private readonly usersService: UsersService,
    private readonly skillsService: SkillsService,
    private readonly projectsService: ProjectsService,
    private readonly formationsService: FormationsService,
    private readonly reviewsService: ReviewsService
  ) {}

  ngOnInit(): void {
    this.refreshDemoSources();
    this.refreshRabbitMonitor();
    this.rabbitPollingSubscription = interval(3000).subscribe(() => {
      this.refreshRabbitMonitor(false);
    });
  }

  ngOnDestroy(): void {
    this.rabbitPollingSubscription?.unsubscribe();
  }

  get gatewayBaseUrl(): string {
    return environment.gatewayBaseUrl;
  }

  get projectIdsLabel(): string {
    return this.availableProjectIds.length ? this.availableProjectIds.join(', ') : 'none';
  }

  get formationIdsLabel(): string {
    return this.availableFormationIds.length ? this.availableFormationIds.join(', ') : 'none';
  }

  clearLog(): void {
    this.trace.clear();
    this.errorMessage = '';
    this.infoMessage = 'The live communication log is now empty.';
  }

  refreshRabbitMonitor(showStatus = true): void {
    this.isRefreshingRabbit = true;

    this.fetchRabbitGroups$()
      .pipe(finalize(() => {
        this.isRefreshingRabbit = false;
      }))
      .subscribe({
        next: (groups) => {
          this.rabbitGroups = groups;

          if (showStatus) {
            this.rabbitInfoMessage = this.buildRabbitInfoMessage(groups);
          }
        },
        error: () => {
          if (showStatus) {
            this.rabbitInfoMessage = 'RabbitMQ monitor is not available yet. Check the evaluation, formation and skills services.';
          }
        }
      });
  }

  isRunning(id: string): boolean {
    return this.runningProbeId === id;
  }

  trackRabbitEvent(_index: number, event: RabbitTraceEvent): string {
    return `${event.service}-${event.queue}-${event.timestamp}-${event.message}`;
  }

  refreshDemoSources(): void {
    this.isRefreshingSources = true;
    this.errorMessage = '';

    this.fetchDemoSources$()
      .pipe(finalize(() => {
        this.isRefreshingSources = false;
      }))
      .subscribe({
        next: ({ projects, formations }) => {
          this.syncChainIds(projects, formations);
          this.infoMessage = this.buildAvailabilityMessage();
        },
        error: () => {
          this.errorMessage = 'Unable to read the current project and formation datasets from the gateway.';
        }
      });
  }

  prepareDemoData(): void {
    if (this.isPreparingDemoData) {
      return;
    }

    this.isPreparingDemoData = true;
    this.errorMessage = '';
    this.infoMessage = 'Preparing demo data for the chained communication scenarios...';

    this.fetchDemoSources$()
      .pipe(
        switchMap(({ projects, formations }) => {
          const creations: Observable<unknown>[] = [];

          if (!projects.length) {
            creations.push(this.projectsService.create(this.buildDemoProject()));
          }

          if (!formations.length) {
            creations.push(this.formationsService.create(this.buildDemoFormation()));
          }

          if (!creations.length) {
            return this.fetchDemoSources$();
          }

          return forkJoin(creations).pipe(
            switchMap(() => this.fetchDemoSources$())
          );
        }),
        finalize(() => {
          this.isPreparingDemoData = false;
        })
      )
      .subscribe({
        next: ({ projects, formations }) => {
          this.syncChainIds(projects, formations);
          this.infoMessage = `Demo data is ready. Use project #${this.projectChainId} and formation #${this.formationChainId} to show the chained communication.`;
        },
        error: (error) => {
          this.errorMessage = this.extractErrorMessage(
            error,
            'Unable to create the demo data. Check the backend logs for project and formation services.'
          );
        }
      });
  }

  runProbe(id: string): void {
    switch (id) {
      case 'user-health':
        this.runRequest(
          id,
          'Front -> API Gateway -> user-service',
          this.http.get(environment.usersHealthUrl),
          'User health route responded through the gateway.',
          'Unable to reach the user health route through the gateway.'
        );
        break;
      case 'users':
        this.runRequest(
          id,
          'Front -> API Gateway -> user-service',
          this.usersService.getAll(),
          'Users loaded through the gateway.',
          'Unable to load users through the gateway.'
        );
        break;
      case 'skills':
        this.runRequest(
          id,
          'Front -> API Gateway -> skills-service',
          this.skillsService.getAll(),
          'Skills loaded through the gateway.',
          'Unable to load skills through the gateway.'
        );
        break;
      case 'projects':
        this.runRequest(
          id,
          'Front -> API Gateway -> service-projet',
          this.projectsService.getAll(),
          'Projects loaded through the gateway.',
          'Unable to load projects through the gateway.'
        );
        break;
      case 'formations':
        this.runRequest(
          id,
          'Front -> API Gateway -> gestion-formation',
          this.formationsService.getAll(),
          'Formations loaded through the gateway.',
          'Unable to load formations through the gateway.'
        );
        break;
      case 'evaluations':
        this.runRequest(
          id,
          'Front -> API Gateway -> evaluation-service',
          this.reviewsService.getAll(),
          'Evaluations loaded through the gateway.',
          'Unable to load evaluations through the gateway.'
        );
        break;
      case 'condidatures':
        this.runRequest(
          id,
          'Front -> API Gateway -> condidature-service',
          this.http.get(`${environment.gatewayBaseUrl}/api/condidatures`),
          'Condidature route answered through the gateway.',
          'Unable to reach condidature-service through the gateway.'
        );
        break;
      case 'messagerie':
        this.runRequest(
          id,
          'Front -> API Gateway -> messagerie-service',
          this.http.get(`${environment.gatewayBaseUrl}/api/messageries`),
          'Messagerie route answered through the gateway.',
          'Unable to reach messagerie-service through the gateway.'
        );
        break;
      case 'project-review-chain':
        if (!this.ensureAvailableResource('project', this.normalizeId(this.projectChainId), this.availableProjectIds)) {
          return;
        }

        this.runRequest(
          id,
          'Front -> API Gateway -> service-projet -> evaluation-service',
          this.http.get(`${environment.projectsApiUrl}/projet-with-reviews/${this.normalizeId(this.projectChainId)}`),
          `Project review chain triggered with project #${this.normalizeId(this.projectChainId)}.`,
          `Unable to trigger the project -> evaluation chain. Verify that project #${this.normalizeId(this.projectChainId)} exists and that evaluation-service is up.`
        );
        break;
      case 'formation-review-chain':
        if (!this.ensureAvailableResource('formation', this.normalizeId(this.formationChainId), this.availableFormationIds)) {
          return;
        }

        this.runRequest(
          id,
          'Front -> API Gateway -> gestion-formation -> evaluation-service',
          this.http.get(`${environment.formationsApiUrl}/${this.normalizeId(this.formationChainId)}/with-reviews`),
          `Formation review chain triggered with formation #${this.normalizeId(this.formationChainId)}.`,
          `Unable to trigger the formation -> evaluation chain. Verify that formation #${this.normalizeId(this.formationChainId)} exists.`
        );
        break;
      default:
        break;
    }
  }

  private fetchDemoSources$(): Observable<{ projects: Project[]; formations: Formation[] }> {
    return forkJoin({
      projects: this.projectsService.getAll().pipe(
        catchError(() => of([] as Project[]))
      ),
      formations: this.formationsService.getAll().pipe(
        catchError(() => of([] as Formation[]))
      )
    });
  }

  private fetchRabbitGroups$(): Observable<RabbitTraceGroup[]> {
    return forkJoin({
      evaluationEvents: this.http.get<RabbitTraceEvent[]>(`${environment.evaluationsApiUrl}/debug/rabbit-events`).pipe(
        catchError(() => of([] as RabbitTraceEvent[]))
      ),
      formationEvents: this.http.get<RabbitTraceEvent[]>(`${environment.formationsApiUrl}/debug/rabbit-events`).pipe(
        catchError(() => of([] as RabbitTraceEvent[]))
      ),
      skillsEvents: this.http.get<RabbitTraceEvent[]>(`${environment.skillsApiUrl}/debug/rabbit-events`).pipe(
        catchError(() => of([] as RabbitTraceEvent[]))
      )
    }).pipe(
      switchMap(({ evaluationEvents, formationEvents, skillsEvents }) => of([
        {
          label: 'Evaluation producer',
          service: 'evaluation-service',
          queue: 'reviewQueue + evaluationToSkillsQueue',
          events: this.sortRabbitEvents(evaluationEvents)
        },
        {
          label: 'Formation consumer',
          service: 'gestion-formation',
          queue: 'reviewQueue',
          events: this.sortRabbitEvents(formationEvents)
        },
        {
          label: 'Skills consumer',
          service: 'skills-service',
          queue: 'evaluationToSkillsQueue',
          events: this.sortRabbitEvents(skillsEvents)
        }
      ]))
    );
  }

  private sortRabbitEvents(events: RabbitTraceEvent[]): RabbitTraceEvent[] {
    return [...events].sort((left, right) =>
      new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime()
    );
  }

  private buildRabbitInfoMessage(groups: RabbitTraceGroup[]): string {
    const totalEvents = groups.reduce((total, group) => total + group.events.length, 0);

    if (!totalEvents) {
      return 'No RabbitMQ event captured yet. Create a review from Evaluations to trigger the async flow.';
    }

    return `${totalEvents} RabbitMQ event${totalEvents === 1 ? '' : 's'} captured across evaluation, formation and skills services.`;
  }

  private syncChainIds(projects: Project[], formations: Formation[]): void {
    this.availableProjectIds = projects
      .map((project) => project.id)
      .filter((id): id is number => typeof id === 'number');
    this.availableFormationIds = formations
      .map((formation) => formation.id)
      .filter((id): id is number => typeof id === 'number');

    this.projectCount = this.availableProjectIds.length;
    this.formationCount = this.availableFormationIds.length;

    if (this.availableProjectIds.length) {
      this.projectChainId = this.availableProjectIds[0];
    }

    if (this.availableFormationIds.length) {
      this.formationChainId = this.availableFormationIds[0];
    }
  }

  private buildAvailabilityMessage(): string {
    if (!this.projectCount && !this.formationCount) {
      return 'No projects or formations exist yet. Click "Prepare demo data" for a clean communication demo.';
    }

    if (!this.projectCount) {
      return `Projects are missing. Click "Prepare demo data" or use formation #${this.formationChainId} for the formation -> evaluation demo.`;
    }

    if (!this.formationCount) {
      return `Formations are missing. Click "Prepare demo data" or use project #${this.projectChainId} for the project -> evaluation demo.`;
    }

    return `Demo sources detected. Recommended IDs: project #${this.projectChainId}, formation #${this.formationChainId}.`;
  }

  private ensureAvailableResource(resourceLabel: 'project' | 'formation', id: number, knownIds: number[]): boolean {
    this.errorMessage = '';

    if (!knownIds.length) {
      this.infoMessage = '';
      this.errorMessage = `No ${resourceLabel} exists yet for the chained demo. Click "Prepare demo data" first.`;
      return false;
    }

    if (!knownIds.includes(id)) {
      this.infoMessage = '';
      this.errorMessage = `The selected ${resourceLabel} #${id} does not exist. Available IDs: ${knownIds.join(', ')}.`;
      return false;
    }

    return true;
  }

  private buildDemoProject(): Project {
    const demoDate = new Date();
    demoDate.setDate(demoDate.getDate() + 7);

    return {
      title: 'Docker Demo Project',
      description: 'Project prepared from the communication page to demonstrate the gateway and project microservice.',
      date: demoDate.toISOString().slice(0, 10),
      domaine: 'WEB'
    };
  }

  private buildDemoFormation(): Formation {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 3);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 14);

    return {
      titre: 'Docker Demo Formation',
      description: 'Formation prepared from the communication page to demonstrate the gateway and formation microservice.',
      dateDebut: startDate.toISOString().slice(0, 10),
      dateFin: endDate.toISOString().slice(0, 10),
      statut: 'PLANIFIE',
      avancement: 20
    };
  }

  private runRequest<T>(
    probeId: string,
    chain: string,
    request$: Observable<T>,
    successMessage: string,
    fallbackErrorMessage: string
  ): void {
    this.runningProbeId = probeId;
    this.highlightedChain = chain;
    this.errorMessage = '';
    this.infoMessage = `Running ${chain}...`;

    request$
      .pipe(finalize(() => {
        this.runningProbeId = '';
      }))
      .subscribe({
        next: () => {
          this.infoMessage = successMessage;
        },
        error: (error) => {
          this.errorMessage = this.extractErrorMessage(error, fallbackErrorMessage);
        }
      });
  }

  private extractErrorMessage(error: unknown, fallback: string): string {
    if (!error || typeof error !== 'object') {
      return fallback;
    }

    const maybeError = error as {
      message?: string;
      status?: number;
      error?: { detail?: string; message?: string } | string;
    };

    if (typeof maybeError.error === 'string' && maybeError.error.trim()) {
      return maybeError.error;
    }

    if (typeof maybeError.error === 'object' && maybeError.error) {
      if (typeof maybeError.error.detail === 'string' && maybeError.error.detail.trim()) {
        return maybeError.error.detail;
      }

      if (typeof maybeError.error.message === 'string' && maybeError.error.message.trim()) {
        return maybeError.error.message;
      }
    }

    if (typeof maybeError.message === 'string' && maybeError.message.trim()) {
      return maybeError.message;
    }

    if (typeof maybeError.status === 'number' && maybeError.status > 0) {
      return `${fallback} HTTP ${maybeError.status}.`;
    }

    return fallback;
  }

  private normalizeId(value: number): number {
    return Math.max(1, Number(value) || 1);
  }
}
