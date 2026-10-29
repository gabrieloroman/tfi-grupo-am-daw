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

  // --- RUTAS DEL ADMINISTRADOR ---
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
      {
        path: 'turnos',
        title: 'Listado de turnos - Administrador',
        loadComponent: () =>
          import('./reservas/listado/admin-listado') // <- OJO: Verificá que el archivo esté en esta ruta
            .then((m) => m.ListadoAdmin),
      },
      { path: '', redirectTo: 'turnos', pathMatch: 'full' }, // Ahora entra directo al listado
      {
        path: 'valor-consulta',
        title: 'Valores de consulta - Administrador',
        loadComponent: () =>
          import('./reservas/valor-consulta/valor-consulta')
            .then((m) => m.ValorConsulta),
      },
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