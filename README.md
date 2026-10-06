# Sistema de turnos para clínica médica

Aplicación web para gestionar los turnos de una clínica médica: los pacientes
reservan y cancelan sus turnos, los médicos consultan su agenda y marcan la
asistencia, y la administración gestiona los turnos de toda la clínica y el
valor de cada consulta.

---

## Contexto académico

| | |
|---|---|
| **Institución** | Facultad de Ciencias de la Administración · UNER |
| **Carrera** | Tecnicatura Universitaria en Desarrollo Web |
| **Materia** | Desarrollo de Aplicaciones Web |
| **Período** | 2026 · 2º cuatrimestre |
| **Trabajo** | Trabajo Final Integrador (grupal) |

---

## Integrantes

Ordenados alfabéticamente por apellido.

| Apellido y nombre |
|---|
| Beltramone, Elisa |
| Guardia, Claudia |
| Roman, Gabriel Osvaldo |
| Romero Degreef, Fabián Agustín |
| Trentino, Juan Paulo |
| Zazzarini, Hernán Alberto |

---

## Tecnologías

| Qué | Con qué |
|---|---|
| Backend | NestJS + TypeORM |
| Base de datos | PostgreSQL |
| Frontend | Angular 21 + PrimeNG 21 |
| Servidor web | nginx |
| Gestión de procesos | PM2 |

---

## Puesta en marcha

### 1. Base de datos

En pgAdmin: crear la base `clinica_turnos`, click derecho sobre ella →
**Query Tool**, pegar el script y ejecutar con F5.

El script borra y vuelve a crear las tablas, así que se puede ejecutar
cuantas veces haga falta. Las fechas de los turnos son relativas al día
actual.

```sql
DROP TABLE IF EXISTS reservas, medicos, usuarios CASCADE;
DROP TYPE IF EXISTS estados_reservas, roles_usuarios, estados_usuarios;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE estados_usuarios AS ENUM ('ACTIVO', 'BAJA');
CREATE TYPE roles_usuarios AS ENUM ('MEDICO', 'PACIENTE', 'ADMINISTRADOR');
CREATE TYPE estados_reservas AS ENUM ('ACTIVO', 'ATENDIDO', 'AUSENTE', 'CANCELADO');

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    documento TEXT NOT NULL UNIQUE,
    apellidos TEXT NOT NULL,
    nombres TEXT NOT NULL,
    email TEXT NOT NULL,
    clave TEXT NOT NULL,
    estado estados_usuarios NOT NULL,
    rol roles_usuarios NOT NULL
);

CREATE TABLE medicos (
    id SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL REFERENCES usuarios (id),
    matricula INT NOT NULL,
    valor_consulta INT NOT NULL
);

CREATE TABLE reservas (
    id SERIAL PRIMARY KEY,
    id_medico INT NOT NULL REFERENCES medicos (id),
    id_paciente INT NOT NULL REFERENCES usuarios (id),
    fecha_hora TIMESTAMP NOT NULL,
    estado estados_reservas NOT NULL,
    valor_consulta INT NOT NULL
);

INSERT INTO usuarios (documento, apellidos, nombres, email, clave, estado, rol) VALUES
    ('11111111', 'Administrador', 'Sistema', 'admin@clinica.com', crypt('admin123', gen_salt('bf', 10)), 'ACTIVO', 'ADMINISTRADOR'),
    ('22222222', 'Garcia', 'Juan', 'jgarcia@clinica.com', crypt('medico123', gen_salt('bf', 10)), 'ACTIVO', 'MEDICO'),
    ('44444444', 'Perez', 'Rosa', 'rperez@clinica.com', crypt('medico123', gen_salt('bf', 10)), 'ACTIVO', 'MEDICO'),
    ('77777777', 'Fernandez', 'Luis', 'lfernandez@clinica.com', crypt('medico123', gen_salt('bf', 10)), 'ACTIVO', 'MEDICO'),
    ('88888888', 'Romero', 'Ana', 'aromero@clinica.com', crypt('medico123', gen_salt('bf', 10)), 'ACTIVO', 'MEDICO'),
    ('33333333', 'Lopez', 'Maria', 'mlopez@gmail.com', crypt('paciente123', gen_salt('bf', 10)), 'ACTIVO', 'PACIENTE'),
    ('55555555', 'Sosa', 'Carlos', 'csosa@gmail.com', crypt('paciente123', gen_salt('bf', 10)), 'ACTIVO', 'PACIENTE'),
    ('10101010', 'Gomez', 'Laura', 'lgomez@gmail.com', crypt('paciente123', gen_salt('bf', 10)), 'ACTIVO', 'PACIENTE'),
    ('20202020', 'Diaz', 'Martin', 'mdiaz@gmail.com', crypt('paciente123', gen_salt('bf', 10)), 'ACTIVO', 'PACIENTE'),
    ('30303030', 'Torres', 'Sofia', 'storres@gmail.com', crypt('paciente123', gen_salt('bf', 10)), 'ACTIVO', 'PACIENTE'),
    ('40404040', 'Ruiz', 'Pedro', 'pruiz@gmail.com', crypt('paciente123', gen_salt('bf', 10)), 'ACTIVO', 'PACIENTE'),
    ('66666666', 'Inactivo', 'Usuario', 'inactivo@gmail.com', crypt('paciente123', gen_salt('bf', 10)), 'BAJA', 'PACIENTE');

INSERT INTO medicos (id_usuario, matricula, valor_consulta)
SELECT id, v.matricula, v.valor
FROM (VALUES
    ('22222222', 12345, 25000),
    ('44444444', 67890, 30000),
    ('77777777', 24680, 28000),
    ('88888888', 13579, 27000)
) AS v(documento, matricula, valor)
JOIN usuarios ON usuarios.documento = v.documento;

INSERT INTO reservas (id_medico, id_paciente, fecha_hora, estado, valor_consulta)
SELECT m.id, p.id, CURRENT_DATE + t.dias * INTERVAL '1 day' + t.hora, t.estado::estados_reservas, t.valor
FROM (VALUES
    ('22222222', '33333333',  0, TIME '09:00', 'ACTIVO',    25000),
    ('22222222', '55555555',  0, TIME '10:00', 'ACTIVO',    25000),
    ('22222222', '10101010',  0, TIME '11:00', 'ACTIVO',    25000),
    ('22222222', '20202020',  0, TIME '14:00', 'ACTIVO',    25000),
    ('22222222', '30303030',  1, TIME '09:00', 'ACTIVO',    25000),
    ('22222222', '33333333',  1, TIME '10:00', 'ACTIVO',    25000),
    ('22222222', '40404040',  3, TIME '10:00', 'ACTIVO',    25000),
    ('22222222', '55555555', -1, TIME '09:00', 'AUSENTE',   22000),
    ('22222222', '33333333', -5, TIME '08:00', 'ATENDIDO',  22000),
    ('44444444', '55555555',  0, TIME '09:00', 'ACTIVO',    30000),
    ('44444444', '10101010',  0, TIME '10:00', 'ACTIVO',    30000),
    ('44444444', '33333333',  0, TIME '15:00', 'ACTIVO',    30000),
    ('44444444', '20202020',  1, TIME '14:00', 'ACTIVO',    30000),
    ('44444444', '30303030',  3, TIME '09:00', 'CANCELADO', 30000),
    ('44444444', '40404040', -2, TIME '11:00', 'ATENDIDO',  28000),
    ('77777777', '20202020',  0, TIME '08:00', 'ACTIVO',    28000),
    ('77777777', '30303030',  0, TIME '12:00', 'ACTIVO',    28000),
    ('77777777', '40404040',  1, TIME '11:00', 'ACTIVO',    28000),
    ('77777777', '10101010',  2, TIME '15:00', 'ACTIVO',    28000),
    ('88888888', '40404040',  0, TIME '13:00', 'ACTIVO',    27000),
    ('88888888', '33333333',  1, TIME '08:00', 'ACTIVO',    27000),
    ('88888888', '55555555',  5, TIME '10:00', 'ACTIVO',    27000)
) AS t(doc_medico, doc_paciente, dias, hora, estado, valor)
JOIN usuarios um ON um.documento = t.doc_medico
JOIN medicos m ON m.id_usuario = um.id
JOIN usuarios p ON p.documento = t.doc_paciente;
```

### 2. Variables de entorno

Crear `backend/.env` (no se versiona):

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=la_clave_de_tu_postgres
DB_NAME=clinica_turnos
DB_LOGGING=true
JWT_SECRET=cualquier_texto_largo
SWAGGER_HABILITADO=true
```

### 3. Backend

```bash
cd backend
npm install
npm run start:dev
```

Queda en `http://localhost:3000`. Swagger en `http://localhost:3000/api`.

### 4. Frontend

```bash
cd frontend
npm install
npm start
```

Queda en `http://localhost:4200`. Los pedidos a `/api` se redirigen al
backend mediante `proxy.conf.json`, así que en el código de Angular las
rutas son siempre relativas.

### 5. Credenciales de prueba

Las carga el script de la sección 1. El login es por documento.

| Documento | Clave | Rol |
|-----------|-------|-----|
| 11111111 | admin123 | Administrador |
| 22222222 | medico123 | Médico (Garcia) |
| 44444444 | medico123 | Médico (Perez) |
| 77777777 | medico123 | Médico (Fernandez) |
| 88888888 | medico123 | Médico (Romero) |
| 33333333 | paciente123 | Paciente (Lopez) |
| 55555555 | paciente123 | Paciente (Sosa) |
| 10101010 | paciente123 | Paciente (Gomez) |
| 20202020 | paciente123 | Paciente (Diaz) |
| 30303030 | paciente123 | Paciente (Torres) |
| 40404040 | paciente123 | Paciente (Ruiz) |
| 66666666 | paciente123 | Paciente dado de baja — no debe poder entrar |