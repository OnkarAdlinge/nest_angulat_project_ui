import { Routes } from '@angular/router';
import { LoginLayout } from './layouts/login-layout/login-layout';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    component: LoginLayout,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/auth/login/login').then((m) => m.Login),
      },
      { path: 'login', redirectTo: '', pathMatch: 'full' },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./pages/auth/forgot-password/forgot-password').then((m) => m.ForgotPassword),
      },
    ],
  },
  {
    path: 'main',
    loadComponent: () => import('./layouts/main-layout/main-layout').then((m) => m.MainLayout),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
      },
      { path: 'dashboard', redirectTo: '/dashboard', pathMatch: 'full' },
    ],
  },

  {
    path: '**',
    loadComponent: () => import('./shared/components/notfound/notfound').then((m) => m.Notfound),
  },
];
