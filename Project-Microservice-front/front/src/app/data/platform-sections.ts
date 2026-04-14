import { environment } from '../../environments/environment';

export interface PlatformNavItem {
  label: string;
  route: string;
  exact?: boolean;
}

export interface HomeServiceCard {
  title: string;
  route: string;
  description: string;
  gatewayUrl: string;
  accent: 'blue' | 'orange' | 'green' | 'teal' | 'gold';
  ctaLabel: string;
}

export const PLATFORM_NAV_ITEMS: PlatformNavItem[] = [
  { label: 'Home', route: '/home', exact: true },
  { label: 'Users', route: '/users' },
  { label: 'Skills', route: '/skills' },
  { label: 'Projects', route: '/projects' },
  { label: 'Formations', route: '/formations' },
  { label: 'Evaluations', route: '/evaluations' },
  { label: 'Comms', route: '/communications' }
];

export const HOME_SERVICE_CARDS: HomeServiceCard[] = [
  {
    title: 'User Space',
    route: '/users',
    description: 'Manage sign in, sign up, roles and the freelancer transition from the main portal.',
    gatewayUrl: environment.usersApiUrl,
    accent: 'blue',
    ctaLabel: 'Open User Space'
  },
  {
    title: 'Skills',
    route: '/skills',
    description: 'Open the skills dashboard after the freelancer activation and manage the profile scoring.',
    gatewayUrl: environment.skillsApiUrl,
    accent: 'orange',
    ctaLabel: 'Open Skills'
  },
  {
    title: 'Projects',
    route: '/projects',
    description: 'Create, edit and follow projects directly from the common front without opening a second Angular app.',
    gatewayUrl: environment.projectsApiUrl,
    accent: 'green',
    ctaLabel: 'Open Project Space'
  },
  {
    title: 'Formations',
    route: '/formations',
    description: 'Manage trainings, progress and attached files directly inside the shared portal.',
    gatewayUrl: environment.formationsApiUrl,
    accent: 'teal',
    ctaLabel: 'Open Formation Space'
  },
  {
    title: 'Evaluations',
    route: '/evaluations',
    description: 'Centralize freelancer reviews, statistics and score distribution from the same front.',
    gatewayUrl: environment.evaluationsApiUrl,
    accent: 'gold',
    ctaLabel: 'Open Evaluation Space'
  }
];
