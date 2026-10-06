import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { AuthStore } from './auth/auth-store';
import { RolesEnum } from './auth/roles-enum';

interface EntradaMenu {
  ruta: string;
  texto: string;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  providers: [MessageService],
})
export class App {
  private readonly authStore: AuthStore = inject(AuthStore);

  protected readonly estaAutenticado = this.authStore.estaAutenticado;
  protected readonly usuario = this.authStore.usuario;
  protected readonly rol = this.authStore.rol;

  protected readonly menuAbierto = signal(false);

  protected readonly entradas = computed<EntradaMenu[]>(() => {
    switch (this.rol()) {
      case RolesEnum.MEDICO:
        return [{ ruta: '/medico/agenda', texto: 'Agenda del día' }];

      default:
        return [];
    }
  });

  protected readonly iniciales = computed(() => {
    const u = this.usuario();
    if (!u) return '';
    return (u.nombres.charAt(0) + u.apellidos.charAt(0)).toUpperCase();
  });

  protected readonly rolLegible = computed(() => {
    const rol = this.rol();
    if (!rol) return '';
    const nombres: Record<string, string> = {
      MEDICO: 'Profesional',
      PACIENTE: 'Paciente',
      ADMINISTRADOR: 'Administración',
    };
    return nombres[rol] ?? rol;
  });

  protected alternarMenu(): void {
    this.menuAbierto.update((abierto) => !abierto);
  }

  protected cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  protected cerrarSesion(): void {
    this.authStore.cerrarSesion();
  }
}
