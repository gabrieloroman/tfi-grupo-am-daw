import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { definePreset } from '@primeuix/themes';
import Nora from '@primeuix/themes/nora';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import { authInterceptor } from './auth/auth-interceptor';

const TemaClinica = definePreset(Nora, {
  semantic: {
    primary: {
      50: '#f0f7f8',
      100: '#d6e9ec',
      200: '#aed3d9',
      300: '#7fb7c1',
      400: '#4f96a4',
      500: '#18697a',
      600: '#145a69',
      700: '#114b57',
      800: '#0e3c46',
      900: '#0b2f37',
      950: '#071e23',
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    provideRouter(routes, withComponentInputBinding()),

    provideHttpClient(withInterceptors([authInterceptor])),

    providePrimeNG({
      theme: {
        preset: TemaClinica,
        options: {
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng',
          },
        },
      },
    }),
  ],
};
