import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

import { AuthStore } from '../auth/auth-store';

@Component({
  selector: 'app-sin-permisos',
  imports: [ButtonModule],
  template: `
    <div class="contenedor">
      <div class="panel estado-vacio">
        <p class="codigo">403</p>
        <h2 class="titulo-pagina">Acceso restringido</h2>
        <p class="subtitulo-pagina">
          Tu rol no tiene habilitada esta sección. Si crees que es un error,
          consulta con administración.
        </p>
        <p-button label="Volver al inicio" size="small" (onClick)="volver()" />
      </div>
    </div>
  `,
  styles: `
    .codigo {
      font-family: var(--serif);
      font-size: 2.4rem;
      font-weight: 600;
      color: var(--borde);
      margin: 0 0 0.2rem;
      letter-spacing: 0.02em;
    }
  `,
})
export class SinPermisos {
  private readonly authStore: AuthStore = inject(AuthStore);
  private readonly router = inject(Router);

  volver(): void {
    const rol = this.authStore.rol();
    void this.router.navigate([rol ? this.authStore.rutaInicial(rol) : '/login']);
  }
}
