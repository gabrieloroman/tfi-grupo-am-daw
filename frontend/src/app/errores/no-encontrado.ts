import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

import { AuthStore } from '../auth/auth-store';

@Component({
  selector: 'app-no-encontrado',
  imports: [ButtonModule],
  template: `
    <div class="contenedor">
      <div class="panel estado-vacio">
        <p class="codigo">404</p>
        <h2 class="titulo-pagina">Dirección inexistente</h2>
        <p class="subtitulo-pagina">
          La ruta solicitada no corresponde a ninguna sección del sistema.
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
export class NoEncontrado {
  private readonly authStore: AuthStore = inject(AuthStore);
  private readonly router = inject(Router);

  volver(): void {
    const rol = this.authStore.rol();
    void this.router.navigate([rol ? this.authStore.rutaInicial(rol) : '/login']);
  }
}
