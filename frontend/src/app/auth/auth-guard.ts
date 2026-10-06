import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';

import { AuthStore } from './auth-store';
import { RolesEnum } from './roles-enum';

export const authGuard: CanActivateFn = () => {
  const authStore: AuthStore = inject(AuthStore);
  const router: Router = inject(Router);

  if (authStore.estaAutenticado()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

export const rolGuard = (...rolesPermitidos: RolesEnum[]): CanActivateFn => {
  return () => {
    const authStore: AuthStore = inject(AuthStore);
    const router: Router = inject(Router);
    const rol = authStore.rol();

    if (rol && rolesPermitidos.includes(rol)) {
      return true;
    }

    return router.createUrlTree(['/sin-permisos']);
  };
};

export const invitadoGuard: CanActivateFn = () => {
  const authStore: AuthStore = inject(AuthStore);
  const router: Router = inject(Router);
  const rol = authStore.rol();

  if (!rol) {
    return true;
  }

  return router.createUrlTree([authStore.rutaInicial(rol)]);
};
