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
  { path: '**', redirectTo: '' }
];
