import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-placeholder-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="placeholder">
      <section class="container panel dots">
        <div class="content">
          <a class="brand" routerLink="/">
            <span class="logo" aria-hidden="true"></span>
            <span>FreeLink</span>
          </a>
          <h1>{{ title }}</h1>
          <p>{{ subtitle }}</p>
          <div class="actions">
            <a routerLink="/skills" class="btn primary">Open Skills</a>
            <a routerLink="/" class="btn ghost">Back Home</a>
          </div>
        </div>
      </section>
    </main>
  `,
  styles: [`
    .placeholder {
      min-height: 100vh;
      padding: 42px 0;
      background: linear-gradient(180deg, var(--bg) 0%, var(--bg-2) 100%);
    }

    .panel {
      min-height: calc(100vh - 84px);
      display: grid;
      place-items: center;
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 34px;
      background: linear-gradient(135deg, rgba(47, 128, 237, 0.36), rgba(11, 34, 56, 0.92));
      box-shadow: var(--shadow);
    }

    .content {
      position: relative;
      z-index: 1;
      max-width: 740px;
      padding: 40px;
      text-align: center;
    }

    h1 {
      margin: 34px 0 12px;
      font-size: clamp(42px, 5vw, 70px);
      font-weight: 900;
      letter-spacing: -1.5px;
    }

    p {
      margin: 0 auto 28px;
      color: rgba(255, 255, 255, 0.74);
      font-size: 20px;
      line-height: 1.7;
    }

    .actions {
      display: flex;
      justify-content: center;
      gap: 14px;
      flex-wrap: wrap;
    }
  `]
})
export class PlaceholderPageComponent {
  readonly title: string;
  readonly subtitle: string;

  constructor(private readonly route: ActivatedRoute) {
    this.title = this.route.snapshot.data['title'] as string;
    this.subtitle = this.route.snapshot.data['subtitle'] as string;
  }
}
