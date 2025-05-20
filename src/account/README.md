# Configuración de OAuth para SimpsonsTrivia

Este documento explica cómo configurar la autenticación OAuth con Google y GitHub para el proyecto SimpsonsTrivia.

## Requisitos Previos

Para implementar la autenticación OAuth, necesitas:

1. Un proyecto en la consola de desarrolladores de Google
2. Una aplicación OAuth en GitHub
3. Cuenta en Supabase (ya configurada en el proyecto)

## Configuración de Proveedores OAuth en Supabase

1. Accede a tu proyecto en [Supabase](https://supabase.com)
2. Ve a **Authentication** → **Providers**
3. Habilita los proveedores que deseas utilizar (Google y GitHub)
4. Para cada proveedor, deberás proporcionar la información de tu aplicación OAuth

## Configuración de Google OAuth

1. Ve a la [Consola de Desarrolladores de Google](https://console.developers.google.com/)
2. Crea un nuevo proyecto o usa uno existente
3. Configura la pantalla de consentimiento de OAuth
4. Ve a **Credentials** y crea un **OAuth client ID**
5. Tipo de aplicación: **Web application**
6. Añade URLs autorizadas de redireccionamiento: 
   - `http://localhost:3000/api/v1/oauth/callback` (desarrollo)
   - `https://tu-dominio.com/api/v1/oauth/callback` (producción)
7. Copia el **Client ID** y **Client Secret**

## Configuración de GitHub OAuth

1. Ve a la sección [OAuth Apps](https://github.com/settings/developers) en tu cuenta de GitHub
2. Haz clic en **New OAuth App**
3. Complete el formulario:
   - **Application name**: SimpsonsTrivia
   - **Homepage URL**: URL de tu aplicación (p.ej. `http://localhost:3000` o `https://tu-dominio.com`)
   - **Authorization callback URL**: `http://localhost:3000/api/v1/oauth/callback` (desarrollo) o `https://tu-dominio.com/api/v1/oauth/callback` (producción)
4. Registra la aplicación y anota el **Client ID** y **Client Secret**

## Configuración en Supabase

1. En Supabase, bajo Authentication → Providers:
2. **Google**:
   - Habilita el proveedor
   - Ingresa el **Client ID** y **Client Secret**
   - Guarda los cambios
3. **GitHub**:
   - Habilita el proveedor
   - Ingresa el **Client ID** y **Client Secret**
   - Guarda los cambios

## Variables de Entorno

Configura las siguientes variables de entorno en tu archivo `.env`:

```
# Supabase (ya configuradas en el proyecto)
SUPABASE_URL=tu-url-de-supabase
SUPABASE_ANON_KEY=tu-clave-anonima-de-supabase
SERVICE_ROLE_KEY=tu-clave-de-rol-de-servicio

# OAuth Google
OAUTH_GOOGLE_CLIENT_ID=tu-client-id-de-google
OAUTH_GOOGLE_CLIENT_SECRET=tu-client-secret-de-google

# OAuth GitHub
OAUTH_GITHUB_CLIENT_ID=tu-client-id-de-github
OAUTH_GITHUB_CLIENT_SECRET=tu-client-secret-de-github
```

## Verificación

Para verificar que la configuración funciona correctamente:

1. Inicia la aplicación
2. Ve a la página de inicio de sesión
3. Haz clic en los botones de "Continuar con Google" o "Continuar con GitHub"
4. Deberías ser redirigido al proveedor para autenticación
5. Después de autenticar, deberías ser redirigido de vuelta a la aplicación

## Solución de Problemas

Si encuentras problemas con la autenticación OAuth:

- Verifica que las URLs de redirección coincidan exactamente en la configuración de los proveedores y en Supabase
- Asegúrate de que las claves de cliente (Client ID y Client Secret) estén correctamente configuradas
- Revisa los registros del servidor para ver mensajes de error detallados
- Verifica que tu aplicación esté utilizando HTTPS si estás en producción 