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

     // (hz) Rutas del paciente: solo entran usuarios con rol PACIENTE
  {
    path: 'paciente',
    canActivate: [authGuard, rolGuard(RolesEnum.PACIENTE)],
    children: [
      {
        path: 'mis-turnos',
        title: 'Mis turnos - Clínica Médica AM',
        loadComponent: () => import('./reservas/mis-turnos/mis-turnos').then((m) => m.MisTurnos),
      },
      {
        path: 'reservar',
        title: 'Reservar turno - Clínica Médica AM',
        loadComponent: () => import('./reservas/reservar-turno/reservar-turno').then((m) => m.ReservarTurno),
      },
      { path: '', redirectTo: 'mis-turnos', pathMatch: 'full' },
    ],
  },
   {
  path: 'admin',
  canActivate: [authGuard, rolGuard(RolesEnum.ADMINISTRADOR)],
  children: [
    {
      path: 'reservar',
      title: 'Reservar turno - Administrador',
      loadComponent: () =>
        import('./reservas/reservar-turno/reservar-turno')
          .then((m) => m.ReservarTurno),
    },
    { path: '', redirectTo: 'reservar', pathMatch: 'full' },
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
