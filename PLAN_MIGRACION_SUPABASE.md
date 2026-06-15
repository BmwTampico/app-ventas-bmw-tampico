# 🗺️ Plan de migración — App de Ventas BMW a Supabase

Objetivo: pasar la app de ventas de `localStorage` (datos solo en cada navegador) a un
backend en la nube con **base de datos central, autenticación real, respaldos y seguridad
desde el día uno**, aplicando todo lo aprendido en el portal de vacaciones.

Principios que seguimos desde el inicio (lecciones del portal):
- Usar **publishable key** (nunca llaves legacy ni service_role en el navegador).
- **RLS activado desde el principio** en todas las tablas.
- Operaciones privilegiadas (crear/borrar usuarios) en **Edge Functions**.
- Hospedaje en **Vercel** con HTTPS.

---

## Mapeo de datos: de localStorage → Supabase

| Hoy (localStorage) | Mañana (Supabase) |
|---|---|
| `ap_clients` | tabla **`clients`** |
| `ap_users` | **Supabase Auth** + tabla **`profiles`** (nombre, rol, foto) |
| `ap_activity_log` | tabla **`activity_log`** |
| `ap_printed_{id}` / `ap_hidden_{id}` | columnas `jsonb` en `clients` (o tabla `client_doc_state`) |
| `ap_docs_count` | se calcula al vuelo (no se almacena) |
| `ap_theme` / `ap_session` | se quedan en el navegador (preferencia local / sesión la maneja Supabase Auth) |
| Fotos de perfil (base64) | **Supabase Storage** (bucket `avatars`) |

> Nota: los documentos se generan al vuelo desde los datos del cliente (no son archivos
> guardados), así que **no** necesitamos almacenamiento de documentos — solo el estado de
> "impreso/oculto".

---

## FASE 0 — Decisiones y preparación (antes de tocar código)

**Decisiones tomadas (2026-06-15):**
- ✅ **Decisión A:** Proyecto Supabase **nuevo y dedicado** para ventas.
- ✅ **Decisión B:** **Empezar de cero** (se omite la Fase 6 de migración de datos).
- ✅ **Decisión C:** **Incluir** restricción por IP de la agencia (Fase 7).
      ⚠️ Nota: el bloqueo por IP en Vercel suele requerir plan Pro; si no, hay
      alternativas (a nivel app o de red). Se evalúa en la Fase 7.

- [ ] Tú creas el proyecto nuevo en Supabase y me pasas la **URL** y la **publishable key**.

## FASE 1 — Cimientos del backend (Supabase)

- [ ] Diseñar el **esquema SQL** de `clients` (mapeando todos los campos actuales: persona
      física/moral, vehículo, entrega, finanzas, etc.) + `profiles` + `activity_log`.
- [ ] Crear las tablas (yo te doy el SQL; tú lo corres en el SQL Editor).
- [ ] **Activar RLS y políticas desde el inicio:**
  - `clients`: vendedor ve/edita **solo los suyos**; admin/gerente ven **todos**.
  - `profiles`: leer todos (autenticado); escribir solo admins.
  - `activity_log`: insertar autenticado; leer solo admin/gerente.
- [ ] Crear bucket de Storage `avatars` con sus políticas.
- [ ] Crear el **primer usuario admin** en Supabase Auth.

## FASE 2 — Capa de datos en la app (el cambio más grande)

- [ ] Agregar el cliente `supabase-js` al HTML.
- [ ] Reescribir el objeto `DB` para hablar con Supabase de forma **asíncrona**
      (`async/await`) en vez de `localStorage` síncrono.
- [ ] Adaptar las funciones que leen/escriben clientes, usuarios y log.
- [ ] **Riesgo principal:** hoy todo es síncrono; pasar a asíncrono toca varias funciones.
      Se hace por partes, probando cada vista (dashboard, mis clientes, detalle, etc.).

## FASE 3 — Autenticación real

- [ ] Reemplazar el login casero por **Supabase Auth** (contraseñas cifradas).
- [ ] Manejo de sesión (auto-login si hay sesión activa).
- [ ] Flujo de **recuperación de contraseña** (correo).

## FASE 4 — Operaciones privilegiadas (Edge Function)

- [ ] Crear Edge Function `admin-users` (como en vacaciones): crear/eliminar usuarios y
      restablecer contraseñas, validando rol del solicitante en el servidor.
- [ ] Conectar la gestión de usuarios de la app a esa función.

## FASE 5 — Fotos de perfil (Storage)

- [ ] Mover la subida de fotos de perfil de base64/localStorage a Supabase Storage.

## FASE 6 — (Opcional) Migrar datos existentes

- [ ] Si hay que conservar datos actuales: exportar de localStorage e importar a Supabase.
      (Se omite si empezamos de cero.)

## FASE 7 — Despliegue

- [ ] Subir a **Vercel** con HTTPS (repo en GitHub, como el portal de vacaciones).
- [ ] (Opcional) Restricción por **IP de la agencia**.

## FASE 8 — Verificación de seguridad y cierre

- [ ] Pruebas de extremo a extremo: login, alta/edición de clientes por rol, generación de
      documentos, gestión de usuarios.
- [ ] Pruebas de seguridad desde afuera (como hicimos en vacaciones): confirmar que el
      acceso anónimo está bloqueado y que cada rol solo ve lo que debe.

---

## Reparto del trabajo

- **Yo:** todo el código (SQL, app, Edge Functions), instrucciones paso a paso, y las
  pruebas de seguridad desde afuera.
- **Tú:** crear el proyecto Supabase, correr el SQL en el panel, desplegar Edge Functions
  y conectar Vercel (te guío en cada clic). Yo no puedo crear cuentas ni desplegar por ti.

## Orden sugerido de ejecución

Fase 0 → 1 → 2 → 3 → 4 → 5 → 7 → 8. (La Fase 6 solo si conservamos datos.)
Cada fase se prueba antes de pasar a la siguiente, igual que hicimos con la seguridad del
portal de vacaciones.
