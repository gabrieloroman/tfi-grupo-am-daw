import { computed, inject, Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";
import { RolesEnum } from "./roles-enum";
import type { UsuarioSesionDTO } from "./usuario-sesion-dto";

@Injectable({
    providedIn: "root"
})
export class AuthStore {

    private readonly router: Router = inject(Router);

    private readonly token = signal<string | null>(sessionStorage.getItem("accessToken"));

    readonly usuario = computed<UsuarioSesionDTO | null>(() => this.leerUsuario(this.token()));

    readonly estaAutenticado = computed<boolean>(() => this.usuario() !== null);

    readonly rol = computed<RolesEnum | null>(() => this.usuario()?.rol ?? null);

    guardarToken(token: string): void {
        sessionStorage.setItem("accessToken", token);
        this.token.set(token);
    }

    obtenerToken(): string | null {
        return sessionStorage.getItem("accessToken");
    }

    cerrarSesion(): void {
        sessionStorage.removeItem("accessToken");
        this.token.set(null);
        this.router.navigateByUrl("/login");
    }

    rutaInicial(rol: RolesEnum): string {
        const rutas: Record<RolesEnum, string> = {
            [RolesEnum.MEDICO]: "/medico/agenda",
            [RolesEnum.PACIENTE]: "/paciente/mis-turnos",
            [RolesEnum.ADMINISTRADOR]: "/admin/turnos",
        };
        return rutas[rol];
    }

    private leerUsuario(token: string | null): UsuarioSesionDTO | null {
        if (!token) {
            return null;
        }

        try {
            const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
            const bytes = Uint8Array.from(atob(base64), (caracter) => caracter.charCodeAt(0));
            const payload = JSON.parse(new TextDecoder().decode(bytes));

            if (payload.exp && payload.exp * 1000 < Date.now()) {
                return null;
            }

            return {
                id: payload.sub,
                documento: payload.documento,
                nombres: payload.nombres,
                apellidos: payload.apellidos,
                rol: payload.rol,
            };
        } catch {
            return null;
        }
    }

}
