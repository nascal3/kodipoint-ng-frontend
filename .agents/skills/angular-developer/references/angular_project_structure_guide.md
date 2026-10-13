# KodiPoint Web Application — Development Skills & Architecture Guidelines

This file serves as the definitive reference guide for AI Agents generating, modifying, or refactoring code within the **KodiPoint Web Application** (Angular 22+ enterprise real estate management platform).

---

## 1. Project Overview & Architectural Standards

* **Framework:** Angular 22+
* **State Management:** Angular Signals & RxJS for side-effects
* **Component Model:** Standalone Components ONLY (`standalone: true` mandatory)
* **Change Detection:** Zoneless / Signal-based strategy
* **UI Library:** Angular Material V22 + Custom SCSS/Tailwind Utility Styling
* **Architecture Pattern:** Feature-driven, Domain-Centric Clean Architecture

---

## 2. Directory Structure Map

Agents **must** place files strictly within this directory structure:

```text
src/
├── app/
│   ├── core/                          # Singleton infrastructure (loaded ONCE)
│   │   ├── guards/                    # Auth, Role, Route protection
│   │   ├── interceptors/              # Token injection, Error handling
│   │   ├── services/                  # Global singletons (Auth, AppState, Theme)
│   │   └── models/                    # Shared TypeScript domain interfaces
│   │
│   ├── shared/                        # Reusable, stateless UI primitives
│   │   ├── components/                # Pure components (badge, card, table, dialog)
│   │   ├── directives/                # Custom structural/attribute directives
│   │   ├── pipes/                     # Formatters (Currency KES, Date, Reference)
│   │   ├── utils/                     # Pure functions & helpers
│   │   └── material.imports.ts        # Centralized Angular Material imports
│   │
│   ├── layout/                        # Frame & Layout Shell
│   │   ├── components/
│   │   │   ├── sidebar/               # Left navigation menu (MatSidenav)
│   │   │   ├── header/                # Top bar with Breadcrumbs & Profile (MatToolbar)
│   │   │   └── shell/                 # Shell container with <router-outlet>
│   │
│   ├── features/                      # Lazy-loaded feature modules
│   │   ├── dashboard/                 # Overview KPIs, Financial Bar Chart, Recent Settlements
│   │   ├── properties/                # Property & Unit management
│   │   ├── tenants/                   # Tenant directory & lease profiles
│   │   ├── invoices/                  # Billing, Invoices & Statements
│   │   ├── payments/                  # Payment collection & Receipts (M-Pesa, Bank, RTGS)
│   │   ├── analytics/                 # Reports & Financial Performance
│   │   └── support/                   # Support Tickets
│   │
│   ├── app.component.ts               # Root shell wrapper
│   ├── app.config.ts                  # Application providers configuration
│   └── app.routes.ts                  # Main routing configuration
│
├── assets/                            # Static media, icons, i18n JSONs
└── styles/                            # Theme config, global styling, M3 color palettes
    ├── _variables.scss
    ├── theme.scss                     # Material Theme Configuration
    └── styles.scss                    # Main global style entry point
```

---

## 3. Code Generation Rules for AI Agents

### A. Component Authoring Standards
1. **Always Standalone:** Every `@Component` must be standalone. Do not create or reference `NgModule` files.
2. **Signal Inputs & Outputs:**
   * Use `input()`, `input.required()`, and `output()` signals for component communication instead of legacy `@Input()` and `@Output()` decorators.
3. **Signal State:**
   * Component state **must** use `signal()`, `computed()`, and `linkedSignal()`. Avoid unnecessary local mutable variables.
4. **OnPush Change Detection:**
   * Set `changeDetection: ChangeDetectionStrategy.OnPush` on all components.

```typescript
// ✅ PREFERRED COMPONENT STYLE
import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [],
  template: `<span [class]="badgeClass()">{{ text() }}</span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  readonly text = input.required<string>();
  readonly status = input<'fully-paid' | 'partially-paid' | 'overdue'>('fully-paid');

  readonly badgeClass = computed(() => `badge badge--${this.status()}`);
}
```

---

### B. Angular Material & UI Integration Rules
1. **Material Import Standard:**
   * When creating shared components, import specific Angular Material primitives or reference `MATERIAL_MODULES` from `src/app/shared/material.imports.ts`.
2. **Domain-Specific Visual Tokens:**
   * **Currencies:** Always format financial figures using standard `KES` formatters (e.g., `KES 1,420,000` or `KES 14.82M`).
   * **Payment Status Badges:**
     * `Fully Paid` $\rightarrow$ Green badge (`#E6F4EA` / `#137333`)
     * `Partially Paid` $\rightarrow$ Amber badge (`#FEF7E0` / `#B06000`)
     * `Overdue` $\rightarrow$ Red badge (`#FCE8E6` / `#C5221F`)

---

### C. Services & Data Fetching
1. **Scope:** Feature-specific services must live inside their respective feature folder (`src/app/features/<feature_name>/services/`). Global services belong in `src/app/core/services/`.
2. **HTTP & Signals:** Use `toSignal()` to convert HTTP observables into signals when consuming API data in components.
3. **Inject Function:** Use the `inject()` function instead of constructor injection.

```typescript
// ✅ PREFERRED SERVICE CONSUMPTION STYLE
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  getDashboardMetrics() {
    return this.http.get<DashboardMetrics>('/api/v1/dashboard/metrics');
  }
}
```

---

### D. Routing & Lazy Loading Rules
1. **Feature Lazy Loading:** All feature routes must be lazy-loaded using `loadChildren` or `loadComponent`.
2. **Route Structure:**

```typescript
// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { ShellComponent } from './layout/components/shell/shell.component';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
      },
      {
        path: 'properties',
        loadChildren: () => import('./features/properties/properties.routes').then(m => m.PROPERTIES_ROUTES)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
```

---

## 4. Verification Checklist for Generated Code

When creating or modifying files, ensure:
- [ ] File paths strictly match the directory layout outlined above.
- [ ] No deprecated Angular APIs are used (`@Input`, `@Output`, `NgModules`).
- [ ] Angular Material V22 components are utilized for UI primitives.
- [ ] Standalone components are configured with `ChangeDetectionStrategy.OnPush`.
- [ ] TypeScript types/interfaces exist in `core/models/` or the feature's specific models directory.
