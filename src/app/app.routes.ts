import { Routes } from '@angular/router';
import { ShellComponent } from './layout/components/shell/shell.component';
import { authGuard } from './core/guards/auth.guard';
import { publicGuard } from './core/guards/public.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [publicGuard]
  },
  {
    path: 'signup',
    loadComponent: () => import('./features/auth/signup/signup.component').then(m => m.SignupComponent),
    canActivate: [publicGuard]
  },
  {
    path: 'forget-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
  },
  {
    path: 'auth/callback',
    loadComponent: () => import('./features/auth/auth-callback/auth-callback.component').then(m => m.AuthCallbackComponent),
  },
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
        canActivate: [authGuard]
      },
      {
        path: 'properties',
        loadChildren: () => import('./features/properties/properties.routes').then(m => m.PROPERTIES_ROUTES),
        canActivate: [authGuard]
      },
      {
        path: 'tenants',
        loadChildren: () => import('./features/tenants/tenants.routes').then(m => m.TENANTS_ROUTES),
        canActivate: [authGuard]
      },
      {
        path: 'invoice',
        loadChildren: () => import('./features/invoice/invoice.routes').then(m => m.INVOICE_ROUTES),
        canActivate: [authGuard]
      },
      {
        path: 'receipts',
        loadChildren: () => import('./features/receipts/receipts.routes').then(m => m.RECEIPTS_ROUTES),
        canActivate: [authGuard]
      },
      {
        path: 'settings',
        loadChildren: () => import('./features/settings/settings.routes').then(m => m.SETTINGS_ROUTES),
        canActivate: [authGuard]
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];
