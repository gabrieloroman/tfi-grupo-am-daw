import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';

import { AuthStore } from '../auth-store';
import { LoginApiClient } from './login-api-client';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, InputText, Password, Button],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly messageService: MessageService = inject(MessageService);
  private readonly loginApiClient: LoginApiClient = inject(LoginApiClient);
  private readonly authStore: AuthStore = inject(AuthStore);
  private readonly router: Router = inject(Router);

  protected readonly enviando = signal(false);

  protected readonly formulario = new FormGroup({
    documento: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(7)],
    }),
    clave: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  protected get documento() {
    return this.formulario.controls.documento;
  }

  protected get clave() {
    return this.formulario.controls.clave;
  }

  protected iniciarSesion(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Es necesario completar todos los campos del formulario para avanzar',
      });
      return;
    }

    this.enviando.set(true);

    const { documento, clave } = this.formulario.getRawValue();

    this.loginApiClient.iniciarSesion(documento, clave).subscribe({
      next: (res) => {
        this.authStore.guardarToken(res.accessToken);
        const rol = this.authStore.rol();
        void this.router.navigateByUrl(rol ? this.authStore.rutaInicial(rol) : '/login');
      },
      error: () => {
        this.enviando.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Ha ocurrido un error al iniciar sesión. Verifique las credenciales ingresadas',
        });
      },
    });
  }
}
