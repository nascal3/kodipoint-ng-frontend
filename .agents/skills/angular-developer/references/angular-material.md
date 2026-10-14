# Angular Material v22 Guidelines & Component Implementation

Angular Material v22 delivers components styled with Material Design 3 (M3) specifications, built natively for standalone components, Angular Signals, and modern Angular Forms.

---

## 1. Core Architecture & Best Practices

1. **Material Design 3 (M3) by Default**:
   - Utilize Material 3 CSS variables (`--mat-sys-*` tokens) for consistent color, surface, typography, and elevation styling.
   - Never hardcode color hex codes or arbitrary borders when system tokens (`--mat-sys-outline`, `--mat-sys-surface-container`, `--mat-sys-primary`) are available.

2. **External Templates & Styles**:
   - Always use `templateUrl` and `styleUrl`/`styleUrls` for external HTML and SCSS files.
   - Use inline `template` and `styles` only for very small, simple components.

3. **Standalone Component Imports**:
   - Import standalone Angular Material components or modules directly in component `imports: [...]`.
   - Prefer granular imports (`MatButton`, `MatIcon`, `MatCard`, `MatFormField`, `MatInput`) or component modules (`MatTableModule`, `MatDialogModule`) depending on component complexity.

4. **Reactivity & Change Detection**:
   - Always enforce `changeDetection: ChangeDetectionStrategy.OnPush` on all components using Angular Material.
   - Bind component state using Angular Signals (`signal()`, `computed()`, `model()`, `input()`, `output()`).

5. **Modern Signal Forms Integration**:
   - In Angular v22, connect Material form controls directly to Signal Forms using `[formField]="myForm.field"` and `FormField` from `@angular/forms/signals`.
   - Place `<mat-error>` inside `<mat-form-field>` to display validation errors dynamically.

6. **Accessibility (a11y)**:
   - Provide `<mat-label>` for all form fields, or supply `aria-label` / `aria-labelledby` when visible labels are omitted.
   - Always specify `aria-label` for icon-only buttons (`button[mat-icon-button]`, `button[mat-fab]`).
   - Use standard `<mat-icon>` ligatures or font symbols configured in `index.html` (e.g. `Material Symbols Outlined`).

7. **Styling & Overrides (Zero `::ng-deep`)**:
   - **Never use `::ng-deep`**.
   - Customize appearance through Material 3 Design Tokens, CSS Custom Properties (`--mat-form-field-*`, `--mat-card-*`, `--mat-sys-*`), or Sass mixins (`@include mat.theme-overrides(...)`).

8. **Component Test Harnesses**:
   - Test Material components using official CDK/Material Harnesses (`MatButtonHarness`, `MatInputHarness`, `MatTableHarness`, `MatDialogHarness`) for reliable, selector-independent tests.

---

## 2. Theming & Material 3 System Tokens

### Theme Definition (`src/material-theme.scss`)

Angular Material v22 uses Sass mixins to emit M3 CSS custom properties:

```scss
@use '@angular/material' as mat;

html {
  height: 100%;
  @include mat.theme((
    color: (
      primary: mat.$magenta-palette,
      tertiary: mat.$violet-palette,
    ),
    typography: Roboto,
    density: 0,
  ));
}

body {
  color-scheme: light;
  background-color: var(--mat-sys-surface);
  color: var(--mat-sys-on-surface);
  font: var(--mat-sys-body-medium);
  margin: 0;
  height: 100%;
}
```

### Essential System Design Tokens

| Token | Description / Purpose | Example Usage |
| :--- | :--- | :--- |
| `var(--mat-sys-surface)` | Base background color of the UI | `background: var(--mat-sys-surface);` |
| `var(--mat-sys-surface-container)` | Raised container background (cards, sheets) | `background: var(--mat-sys-surface-container);` |
| `var(--mat-sys-on-surface)` | Primary readable text on surface | `color: var(--mat-sys-on-surface);` |
| `var(--mat-sys-on-surface-variant)` | Subdued / secondary text | `color: var(--mat-sys-on-surface-variant);` |
| `var(--mat-sys-primary)` | Main brand accent color | `color: var(--mat-sys-primary);` |
| `var(--mat-sys-on-primary)` | Contrast text on primary elements | `color: var(--mat-sys-on-primary);` |
| `var(--mat-sys-primary-container)` | Low-emphasis primary background fill | `background: var(--mat-sys-primary-container);` |
| `var(--mat-sys-outline)` | Standard border / divider line | `border: 1px solid var(--mat-sys-outline);` |
| `var(--mat-sys-outline-variant)` | Subtle / soft border line | `border: 1px solid var(--mat-sys-outline-variant);` |
| `var(--mat-sys-error)` | Error indicator color | `color: var(--mat-sys-error);` |
| `var(--mat-sys-body-medium)` | Default body typography shorthand | `font: var(--mat-sys-body-medium);` |
| `var(--mat-sys-title-medium)` | Card / section title typography | `font: var(--mat-sys-title-medium);` |

---

## 3. Component Implementation Patterns

### 3.1 Buttons & Indicators

Angular Material provides semantic button variants matching M3 specifications:

- `button[mat-flat-button]` — Primary filled button for primary actions
- `button[mat-stroked-button]` — Outlined button for secondary actions
- `button[mat-button]` — Text button for low-emphasis actions
- `button[mat-icon-button]` — Circular button for single icon actions (always add `aria-label`)
- `button[mat-fab]` / `button[mat-mini-fab]` — Floating action button
- `<mat-icon>` — Material icon / symbol
- `<mat-progress-spinner>` / `<mat-progress-bar>` — Loading states

```ts
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-action-bar',
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './action-bar.component.html',
  styleUrl: './action-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionBar {
  protected readonly isLoading = signal(false);

  save(): void {
    this.isLoading.set(true);
    // Logic here
  }

  cancel(): void {}
  openSettings(): void {}
}
```

**action-bar.component.html:**
```html
<div class="actions">
  <button mat-flat-button (click)="save()" [disabled]="isLoading()">
    @if (isLoading()) {
      <mat-spinner diameter="18" />
    } @else {
      <mat-icon>save</mat-icon>
    }
    Save Changes
  </button>

  <button mat-stroked-button (click)="cancel()">
    Cancel
  </button>

  <button mat-icon-button aria-label="Open settings" (click)="openSettings()">
    <mat-icon>settings</mat-icon>
  </button>
</div>
```

**action-bar.component.scss:**
```scss
.actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
```

---

### 3.2 Form Controls & Signal Forms (Angular v22)

Angular v22 Signal Forms work seamlessly with Angular Material form controls.

```ts
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormField, form, required, email, minLength } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface ProfileData {
  fullName: string;
  emailAddress: string;
  role: string;
  subscribeNewsletter: boolean;
}

@Component({
  selector: 'app-user-profile-form',
  imports: [
    FormField,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './user-profile-form.component.html',
  styleUrl: './user-profile-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfileForm {
  protected readonly availableRoles = signal([
    { id: 'admin', label: 'Administrator' },
    { id: 'editor', label: 'Editor' },
    { id: 'viewer', label: 'Viewer' },
  ]);

  protected readonly profileModel = signal<ProfileData>({
    fullName: '',
    emailAddress: '',
    role: 'viewer',
    subscribeNewsletter: false,
  });

  protected readonly profileForm = form(this.profileModel, (schema) => {
    required(schema.fullName, { message: 'Full name is required' });
    minLength(schema.fullName, 2, { message: 'Minimum 2 characters required' });
    required(schema.emailAddress, { message: 'Email address is required' });
    email(schema.emailAddress, { message: 'Please enter a valid email address' });
    required(schema.role, { message: 'Role selection is required' });
  });

  onSubmit(event: Event): void {
    event.preventDefault();
    if (this.profileForm().valid()) {
      const payload = this.profileModel();
      console.log('Submitted payload:', payload);
    }
  }
}
```

**user-profile-form.component.html:**
```html
<form (submit)="onSubmit($event)" class="profile-form">
  <mat-form-field appearance="outline">
    <mat-label>Full Name</mat-label>
    <input matInput [formField]="profileForm.fullName" placeholder="Jane Doe" />
    <mat-icon matSuffix>person</mat-icon>
    @if (profileForm.fullName().errors(); as errors) {
      <mat-error>{{ errors[0]?.message }}</mat-error>
    }
  </mat-form-field>

  <mat-form-field appearance="outline">
    <mat-label>Email Address</mat-label>
    <input matInput type="email" [formField]="profileForm.emailAddress" placeholder="jane@example.com" />
    <mat-icon matSuffix>email</mat-icon>
    @if (profileForm.emailAddress().errors(); as errors) {
      <mat-error>{{ errors[0]?.message }}</mat-error>
    }
  </mat-form-field>

  <mat-form-field appearance="outline">
    <mat-label>Role</mat-label>
    <mat-select [formField]="profileForm.role">
      @for (role of availableRoles(); track role.id) {
        <mat-option [value]="role.id">{{ role.label }}</mat-option>
      }
    </mat-select>
    @if (profileForm.role().errors(); as errors) {
      <mat-error>{{ errors[0]?.message }}</mat-error>
    }
  </mat-form-field>

  <div class="checkbox-row">
    <mat-checkbox [formField]="profileForm.subscribeNewsletter">
      Receive product updates and newsletters
    </mat-checkbox>
  </div>

  <div class="form-actions">
    <button mat-flat-button type="submit" [disabled]="profileForm().invalid()">
      Submit Profile
    </button>
  </div>
</form>
```

**user-profile-form.component.scss:**
```scss
.profile-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 480px;
  padding: 24px;
  background-color: var(--mat-sys-surface-container);
  border-radius: 12px;
  border: 1px solid var(--mat-sys-outline-variant);
}
.checkbox-row {
  margin-bottom: 8px;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
}
```

---

### 3.3 Cards & Content Presentation

Material 3 Cards provide elevated, filled, or outlined container patterns.

```ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-item-card',
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  templateUrl: './item-card.component.html',
  styleUrl: './item-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemCard {
  readonly title = input.required<string>();
  readonly category = input<string>('General');
  readonly description = input<string>('');
  readonly tags = input<string[]>([]);
}
```

**item-card.component.html:**
```html
<mat-card appearance="outlined" class="item-card">
  <mat-card-header>
    <mat-icon mat-card-avatar>inventory_2</mat-icon>
    <mat-card-title>{{ title() }}</mat-card-title>
    <mat-card-subtitle>{{ category() }}</mat-card-subtitle>
  </mat-card-header>

  <mat-card-content>
    <p>{{ description() }}</p>
    <mat-chip-set aria-label="Tags">
      @for (tag of tags(); track tag) {
        <mat-chip>{{ tag }}</mat-chip>
      }
    </mat-chip-set>
  </mat-card-content>

  <mat-card-actions align="end">
    <button mat-button>Details</button>
    <button mat-flat-button>Action</button>
  </mat-card-actions>
</mat-card>
```

**item-card.component.scss:**
```scss
.item-card {
  background-color: var(--mat-sys-surface-container);
  border-color: var(--mat-sys-outline-variant);
  border-radius: 16px;
}
mat-card-content {
  margin-top: 12px;
  color: var(--mat-sys-on-surface-variant);
}
```

---

### 3.4 Data Table with Signals, Sorting, and Pagination (`MatTable`)

Use signals to provide reactive data sets to `<table mat-table>`:

```ts
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
  viewChild,
} from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-users-table',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './users-table.component.html',
  styleUrl: './users-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersTable {
  readonly paginator = viewChild(MatPaginator);
  readonly sort = viewChild(MatSort);

  readonly displayedColumns: string[] = ['id', 'name', 'email', 'status'];

  protected readonly rawData = signal<UserRecord[]>([
    { id: '1', name: 'Alice Walker', email: 'alice@example.com', status: 'Active' },
    { id: '2', name: 'Bob Roberts', email: 'bob@example.com', status: 'Inactive' },
    { id: '3', name: 'Charlie Kim', email: 'charlie@example.com', status: 'Active' },
  ]);

  protected readonly dataSource = computed(() => {
    const ds = new MatTableDataSource(this.rawData());
    const paginatorRef = this.paginator();
    const sortRef = this.sort();
    if (paginatorRef) ds.paginator = paginatorRef;
    if (sortRef) ds.sort = sortRef;
    return ds;
  });

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    const ds = this.dataSource();
    ds.filter = filterValue.trim().toLowerCase();
  }
}
```

**users-table.component.html:**
```html
<div class="table-container">
  <div class="table-header">
    <mat-form-field appearance="outline" class="filter-field">
      <mat-label>Filter users</mat-label>
      <input matInput (input)="applyFilter($event)" placeholder="Search by name, email..." />
      <mat-icon matSuffix>search</mat-icon>
    </mat-form-field>
  </div>

  <table mat-table [dataSource]="dataSource()" matSort class="mat-elevation-z1">
    <!-- ID Column -->
    <ng-container matColumnDef="id">
      <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
      <td mat-cell *matCellDef="let user">{{ user.id }}</td>
    </ng-container>

    <!-- Name Column -->
    <ng-container matColumnDef="name">
      <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
      <td mat-cell *matCellDef="let user">{{ user.name }}</td>
    </ng-container>

    <!-- Email Column -->
    <ng-container matColumnDef="email">
      <th mat-header-cell *matHeaderCellDef mat-sort-header>Email</th>
      <td mat-cell *matCellDef="let user">{{ user.email }}</td>
    </ng-container>

    <!-- Status Column -->
    <ng-container matColumnDef="status">
      <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
      <td mat-cell *matCellDef="let user">
        <span class="status-badge" [class.active]="user.status === 'Active'">
          {{ user.status }}
        </span>
      </td>
    </ng-container>

    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
    <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>

    <tr class="mat-row" *matNoDataRow>
      <td class="mat-cell empty-cell" [attr.colspan]="displayedColumns.length">
        No matching users found.
      </td>
    </tr>
  </table>

  <mat-paginator [pageSizeOptions]="[5, 10, 25]" pageSize="10" showFirstLastButtons />
</div>
```

**users-table.component.scss:**
```scss
.table-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--mat-sys-surface);
  border-radius: 12px;
  overflow: hidden;
}
.filter-field {
  max-width: 320px;
}
.status-badge {
  padding: 4px 8px;
  border-radius: 9999px;
  font-size: 12px;
  background-color: var(--mat-sys-surface-variant);
  color: var(--mat-sys-on-surface-variant);
}
.status-badge.active {
  background-color: var(--mat-sys-primary-container);
  color: var(--mat-sys-on-primary-container);
}
.empty-cell {
  padding: 24px;
  text-align: center;
  color: var(--mat-sys-on-surface-variant);
}
```

---

### 3.5 Dialogs & Modals (`MatDialog`)

Open modals using `inject(MatDialog)`, passing typed configuration and receiving result promises/observables.

#### Dialog Definition Component:
```ts
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [MatDialogModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">
        {{ data.cancelText ?? 'Cancel' }}
      </button>
      <button mat-flat-button color="warn" (click)="onConfirm()">
        {{ data.confirmText ?? 'Confirm' }}
      </button>
    </mat-dialog-actions>
  `,
})
export class ConfirmDialog {
  protected readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ConfirmDialog>);

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
```

#### Opening the Dialog:
```ts
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmDialog } from './confirm-dialog';

@Component({
  selector: 'app-dialog-trigger',
  imports: [MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button mat-flat-button (click)="openConfirmation()">
      Delete Account
    </button>
  `,
})
export class DialogTrigger {
  private readonly dialog = inject(MatDialog);

  openConfirmation(): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Delete Account',
        message: 'Are you sure you want to delete this account? This action cannot be undone.',
        confirmText: 'Delete Forever',
      },
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        console.log('Account deleted');
      }
    });
  }
}
```

---

### 3.6 Notifications (`MatSnackBar`)

Trigger feedback toasts using `MatSnackBar`:

```ts
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-notification-demo',
  imports: [MatSnackBarModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button mat-stroked-button (click)="showToast()">Show Notification</button>
  `,
})
export class NotificationDemo {
  private readonly snackBar = inject(MatSnackBar);

  showToast(): void {
    this.snackBar.open('Changes saved successfully!', 'Dismiss', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
    });
  }
}
```

---

### 3.7 Layouts: Toolbar, Sidenav & Responsive Menus

```ts
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayout {
  protected readonly sidenavOpen = signal(true);
}
```

**main-layout.component.html:**
```html
<div class="layout-container">
  <mat-toolbar class="app-toolbar">
    <button
      mat-icon-button
      aria-label="Toggle navigation drawer"
      (click)="sidenavOpen.set(!sidenavOpen())"
    >
      <mat-icon>menu</mat-icon>
    </button>
    <span class="app-title">KodiPoint</span>
    <span class="spacer"></span>

    <button mat-icon-button [matMenuTriggerFor]="userMenu" aria-label="User account menu">
      <mat-icon>account_circle</mat-icon>
    </button>
    <mat-menu #userMenu="matMenu">
      <button mat-menu-item>
        <mat-icon>person</mat-icon>
        <span>Profile</span>
      </button>
      <button mat-menu-item>
        <mat-icon>logout</mat-icon>
        <span>Sign Out</span>
      </button>
    </mat-menu>
  </mat-toolbar>

  <mat-sidenav-container class="sidenav-container">
    <mat-sidenav [opened]="sidenavOpen()" mode="side" class="app-sidenav">
      <mat-nav-list>
        <a mat-list-item routerLink="/dashboard">
          <mat-icon matListItemIcon>dashboard</mat-icon>
          <span matListItemTitle>Dashboard</span>
        </a>
        <a mat-list-item routerLink="/users">
          <mat-icon matListItemIcon>people</mat-icon>
          <span matListItemTitle>Users</span>
        </a>
        <a mat-list-item routerLink="/settings">
          <mat-icon matListItemIcon>settings</mat-icon>
          <span matListItemTitle>Settings</span>
        </a>
      </mat-nav-list>
    </mat-sidenav>

    <mat-sidenav-content class="main-content">
      <router-outlet />
    </mat-sidenav-content>
  </mat-sidenav-container>
</div>
```

**main-layout.component.scss:**
```scss
.layout-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.app-toolbar {
  background-color: var(--mat-sys-surface-container);
  color: var(--mat-sys-on-surface);
  border-bottom: 1px solid var(--mat-sys-outline-variant);
}
.app-title {
  margin-left: 8px;
  font-weight: 500;
}
.spacer {
  flex: 1 1 auto;
}
.sidenav-container {
  flex: 1;
}
.app-sidenav {
  width: 240px;
  background-color: var(--mat-sys-surface);
  border-right: 1px solid var(--mat-sys-outline-variant);
}
.main-content {
  padding: 24px;
  background-color: var(--mat-sys-surface);
}
```

---

## 4. Testing with Angular Material Component Harnesses

Angular Material harnesses provide strongly typed APIs to interact with Material components in unit tests without querying internal DOM nodes.

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HarnessLoader } from '@angular/cdk/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatInputHarness } from '@angular/material/input/testing';
import { UserProfileForm } from './user-profile-form';

describe('UserProfileForm with Material Harnesses', () => {
  let fixture: ComponentFixture<UserProfileForm>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserProfileForm],
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfileForm);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should interact with name input and submit button harness', async () => {
    const nameInput = await loader.getHarness(
      MatInputHarness.with({ placeholder: 'Jane Doe' })
    );
    await nameInput.setValue('John Smith');
    expect(await nameInput.getValue()).toBe('John Smith');

    const submitBtn = await loader.getHarness(
      MatButtonHarness.with({ text: 'Submit Profile' })
    );
    expect(await submitBtn.isDisabled()).toBe(true); // Still invalid until other fields filled
  });
});
```

---

## 5. Quick Reference: Angular Material v22 Dos and Don'ts

| Do | Don't |
| :--- | :--- |
| Use `templateUrl` and `styleUrl`/`styleUrls` for external HTML and SCSS files by default. | Don't use inline `template` and `styles` except for very small, simple components. |
| Use `[formField]="myForm.fieldName"` with `@angular/forms/signals` for v22 forms. | Don't mix deprecated legacy forms without purpose. |
| Use Material 3 CSS variables (`--mat-sys-*`) for styling and backgrounds. | Don't use hardcoded colors or pixel values that break themes. |
| Always set `changeDetection: ChangeDetectionStrategy.OnPush`. | Don't leave default change detection on Material components. |
| Add explicit `aria-label` to icon buttons and headless triggers. | Don't create unlabelled interactive icons. |
| Test components using `@angular/material/*/testing` Harnesses. | Don't query private internal Material classes like `.mat-mdc-*` in tests. |
| Style custom components with tokens and scoped CSS classes. | Never use `::ng-deep` to pierce encapsulation. |
