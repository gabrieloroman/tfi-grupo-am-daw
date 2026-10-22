# Checklist de pruebas entre roles

Lista para correr a mano cada vez que algo entra a `develop`, y antes de grabar
el video. Cada caso sale de la consigna o de la rúbrica.

Cómo usarla:

- Antes de empezar, volver a ejecutar el script SQL del README para partir de
  los datos de prueba (los turnos son relativos al día actual).
- Credenciales: tabla "Credenciales de prueba" del README.
- Los casos marcados **(API)** se prueban desde Swagger (`/api`), con el botón
  *Authorize* y el token que devuelve `POST /api/v1/auth`.
- Los casos marcados **(pendiente)** dependen de partes que todavía no están
  en `develop`; se destildan hasta que entren.

Registro de corridas:

| Fecha | Commit de `develop` | Quién | Resultado |
|---|---|---|---|
| | | | |

---

## 1. Inicio de sesión

- [ ] Ingresar con un usuario activo de cada rol lleva a su pantalla inicial
      (médico → agenda, paciente → mis turnos, administrador → turnos).
- [ ] Clave incorrecta muestra error y no ingresa.
- [ ] Documento inexistente muestra error y no ingresa.
- [ ] El usuario dado de baja (`66666666`) no puede ingresar.
- [ ] Formulario vacío muestra el aviso de campos obligatorios.
- [ ] Cerrar sesión vuelve al login; el botón "atrás" del navegador no deja
      volver a una pantalla protegida.
- [ ] Estando logueado, ir a `/login` redirige a la pantalla inicial del rol.

## 2. Acceso por rol

- [ ] Sin sesión, entrar por URL a `/medico/agenda` o `/paciente/mis-turnos`
      redirige al login.
- [ ] Un paciente que entra por URL a `/medico/agenda` ve "Acceso restringido".
- [ ] Un médico que entra por URL a `/paciente/mis-turnos` ve "Acceso restringido".
- [ ] (pendiente) Paciente y médico no pueden entrar a las rutas del administrador.
- [ ] Una URL inexistente muestra la página 404.
- [ ] Cada rol ve en el menú lateral solo sus secciones.
- [ ] **(API)** Cualquier endpoint sin token responde 401.

## 3. Médico

Usuario de prueba: `22222222` (Garcia), que tiene turnos hoy, mañana y días pasados.

- [ ] La agenda abre en la fecha de hoy y muestra solo los turnos de ese médico.
- [ ] Cambiar la fecha recarga los turnos de ese día.
- [ ] Un día sin turnos muestra el mensaje de agenda vacía.
- [ ] Marcar un turno de hoy como **atendido** pide confirmación y cambia el estado.
- [ ] Marcar un turno de hoy como **ausente** pide confirmación y cambia el estado.
- [ ] En un día futuro no aparecen los botones de asistencia.
- [ ] Un turno ya atendido, ausente o cancelado no se puede volver a marcar.
- [ ] **(API)** `GET /reservas` sin `fecha` como médico responde 400.
- [ ] **(API)** `PUT /reservas/:id` sobre un turno de otro médico responde 403.

## 4. Paciente

Usuario de prueba: `33333333` (Lopez).

Reservar:

- [ ] Se listan los médicos activos con su valor de consulta.
- [ ] Al elegir médico y fecha, solo aparecen horarios libres entre 8 y 15 hs.
- [ ] Un horario ya reservado por otro paciente no aparece como libre.
- [ ] No se ofrecen horarios de hoy que ya pasaron.
- [ ] Una fecha a más de 30 días no ofrece horarios.
- [ ] Al reservar, el turno aparece en "Mis turnos" con estado Vigente y el
      valor de consulta actual del médico.

Listar y cancelar:

- [ ] "Mis turnos" muestra solo los turnos del paciente logueado.
- [ ] Un turno de mañana o posterior se puede cancelar (pide confirmación).
- [ ] Un turno de hoy no muestra el botón de cancelar.
- [ ] Un turno cancelado libera el horario: vuelve a aparecer como disponible.

Por API, para cubrir lo que la pantalla no deja hacer:

- [ ] **(API)** `POST /reservas` en un horario ocupado responde 409.
- [ ] **(API)** `POST /reservas` a las 16:00, a las 7:00 o a las 10:30 responde 400.
- [ ] **(API)** `POST /reservas` en una fecha pasada o a más de 30 días responde 400.
- [ ] **(API)** `POST /reservas` con `idPaciente` de otra persona reserva igual
      a nombre del paciente logueado (se toma del token).
- [ ] **(API)** Cancelar un turno de hoy responde 400.
- [ ] **(API)** Cancelar un turno de otro paciente responde 403.
- [ ] **(API)** Un paciente que intenta marcar un turno como ATENDIDO responde 403.

## 5. Administrador (pendiente)

Usuario de prueba: `11111111`.

- [ ] Reservar un turno eligiendo médico, paciente, fecha y hora.
- [ ] Las mismas reglas que el paciente: 8 a 16 hs, horario ocupado, 30 días.
- [ ] Listar los turnos reservados de todos los médicos.
- [ ] Cancelar un turno de hoy cuya hora todavía no llegó.
- [ ] No poder cancelar un turno que ya empezó.
- [ ] Modificar el valor de consulta de un médico.
- [ ] Los turnos reservados antes del cambio conservan el valor viejo
      (valor congelado); los nuevos usan el valor nuevo.
- [ ] **(API)** Un paciente o un médico que llama a
      `PUT /medicos/:id/valor-consulta` recibe 403.

## 6. Rúbrica

- [ ] **DTOs:** enviar un campo de más o con tipo incorrecto a cualquier
      endpoint responde 400 con el mensaje de validación.
- [ ] **Entorno:** el backend toma puerto, base y JWT de `backend/.env`;
      el frontend llama siempre a rutas relativas `/api/...` (proxy en desarrollo).
- [ ] **Swagger:** `/api` muestra todos los endpoints, incluidos los del administrador.
- [ ] **Compodoc backend:** `npm run compodoc` en `backend/` levanta la
      documentación en `http://localhost:8081`.
- [ ] **Compodoc frontend:** `npm run compodoc` en `frontend/` levanta la
      documentación en `http://localhost:8082`.
- [ ] (pendiente) **PM2:** el backend corre con PM2 y `pm2 list` lo muestra en línea.
- [ ] (pendiente) **nginx:** la aplicación compilada se abre desde nginx y
      `/api` llega al backend.
