import type { Routes } from '@angular/router';

import { authGuard, invitadoGuard, rolGuard } from './auth/auth-guard';
import { RolesEnum } from './auth/roles-enum';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Ingresar - Clínica Médica AM',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./auth/login/login').then((m) => m.Login),
  },

  {
    path: 'medico',
    canActivate: [authGuard, rolGuard(RolesEnum.MEDICO)],
    children: [
      {
        path: 'agenda',
        title: 'Mi agenda - Clínica Médica AM',
        loadComponent: () => import('./reservas/listado/reservas-listado').then((m) => m.ReservasListado),
      },
      { path: '', redirectTo: 'agenda', pathMatch: 'full' },
    ],
  },

  {
    path: 'sin-permisos',
    title: 'Sin permisos',
    loadComponent: () =>
      import('./errores/sin-permisos').then((m) => m.SinPermisos),
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: '**',
    title: 'Página no encontrada',
    loadComponent: () =>
      import('./errores/no-encontrado').then((m) => m.NoEncontrado),
  },
];
