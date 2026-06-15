// ════════════════════════════════════════════════════════════════════
//  Edge Function: admin-users  (App de Ventas BMW)
//  ────────────────────────────────────────────────────────────────────
//  Operaciones privilegiadas de cuentas (crear / restablecer contraseña /
//  eliminar) ejecutadas en el servidor, donde la service_role key vive como
//  variable de entorno y nunca llega al navegador.
//
//  Seguridad:
//   1. La plataforma exige un JWT válido (verify_jwt activado).
//   2. Identificamos a quien llama por su token y consultamos su rol en
//      la tabla `profiles`.
//   3. Solo se permite si es administrador o gerente.
// ════════════════════════════════════════════════════════════════════
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'No autorizado' }, 401)

    const SUPA_URL = Deno.env.get('SUPABASE_URL')!
    const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Cliente que actúa "como" quien llama, para identificarlo.
    const userClient = createClient(SUPA_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user }, error: uErr } = await userClient.auth.getUser()
    if (uErr || !user) return json({ error: 'Sesión inválida' }, 401)

    // Cliente con privilegios de administración (service_role).
    const admin = createClient(SUPA_URL, SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Verifica el rol del solicitante.
    const { data: profile, error: pErr } = await admin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    if (pErr || !profile) return json({ error: 'Perfil no encontrado' }, 403)
    if (profile.role !== 'administrador' && profile.role !== 'gerente') {
      return json({ error: 'No tienes permisos para gestionar usuarios' }, 403)
    }

    const { action, email, password } = await req.json()

    if (action === 'create') {
      if (!email || !password) return json({ error: 'Faltan datos (correo/contraseña)' }, 400)
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })
      if (error) return json({ error: error.message }, 400)
      return json({ ok: true, authUserId: data.user?.id })
    }

    if (action === 'resetPassword') {
      if (!email || !password) return json({ error: 'Faltan datos (correo/contraseña)' }, 400)
      const target = await findAuthUserByEmail(admin, email)
      if (!target) return json({ error: 'Cuenta de acceso no encontrada' }, 404)
      const { error } = await admin.auth.admin.updateUserById(target.id, { password })
      if (error) return json({ error: error.message }, 400)
      return json({ ok: true })
    }

    if (action === 'delete') {
      if (!email) return json({ error: 'Falta el correo' }, 400)
      const target = await findAuthUserByEmail(admin, email)
      if (target) await admin.auth.admin.deleteUser(target.id)
      return json({ ok: true })
    }

    return json({ error: 'Acción no reconocida' }, 400)
  } catch (e) {
    return json({ error: String((e as Error)?.message || e) }, 500)
  }
})

async function findAuthUserByEmail(admin: ReturnType<typeof createClient>, email: string) {
  let page = 1
  const perPage = 1000
  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
    if (error) return null
    const found = data.users.find((u) => u.email === email)
    if (found) return found
    if (data.users.length < perPage) break
    page++
  }
  return null
}
