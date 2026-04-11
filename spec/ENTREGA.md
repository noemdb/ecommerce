# Entrega de Proyecto — Ecommerce Premium v2.0

Este documento contiene las instrucciones finales para el paso a Producción de la plataforma, completando la **Fase 5** según el `spec_ecommerceV2.0.md`.

## 1. Credenciales de Acceso Base (Seed)

Al ejecutar el seeder (`npm run db:seed`), se creará automáticamente la cuenta de Administrador principal.

*   **URL de Acceso Admin:** `https://tudominio.com/admin/login`
*   **Email:** `admin@mitienda.com`
*   **Contraseña:** `Admin123!`
*   **Rol:** `ADMIN`

> [!CAUTION]
> Es vital acceder al panel de `/admin/usuarios` inmediatamente luego del despliegue exitoso para cambiar esta contraseña por una más segura.

## 2. Puesta en Producción (Vercel + Neon.tech)

El código fuente ya está optimizado para su compilación en Vercel y el modelo de BD para Neon Serverless.  Debes cumplir con este check-list de variables de entorno en la página de **Settings > Environment Variables** de tu proyecto en Vercel:

### 2.1 Base de Datos (Neon)
*   **`DATABASE_URL`**: Asegúrate de añadir el parámetro `?sslmode=require` al final de la cadena de conexión de Neon.

### 2.2 Autenticación (Auth.js)
*   **`AUTH_SECRET`**: Genera un string seguro a través de tu terminal ejecutando `openssl rand -base64 32` y pégalo aquí. Es imperativo para firmar los JWT.
*   **`AUTH_URL`**: Debe coincidir con la URL en Vercel (ej: `https://midominio.com`).
*   **`UPSTASH_REDIS_REST_URL`** y **`UPSTASH_REDIS_REST_TOKEN`**: Crea una BD serverless gratuita en Upstash y copia estos valores para activar la protección *Rate Limiter* implementada.

### 2.3 Subida de Imágenes (UploadThing)
*   **`UPLOADTHING_SECRET`** y **`UPLOADTHING_APP_ID`**: Valores extraídos de tu dashboard de UploadThing.

### 2.4 Correo Transaccional (Resend)
*   **`RESEND_API_KEY`**: Crea tu llave de API.
*   **`EMAIL_FROM`**: Tu email de dominio verificado (ej: `Mi Tienda <noreply@midominio.com>`).
*   **`EMAIL_ADMIN`**: Email al cual le llegarán notificaciones de nuevas órdenes.

---

## 3. Comandos de Despliegue de DB

Dado que Vercel no corre las migraciones por defecto, tras conectar tu repositorio de GitHub, la estructura de la base de datos debe ser propagada explícitamente a Producción:

1. Ve a tu entorno de terminal local.
2. Asegúrate de tener la variable `DATABASE_URL` conectada al entorno "Producción" de Neon.tech.
3. Ejecuta la migración estructural:
   ```bash
   npx prisma migrate deploy
   ```
4. Ejecuta el archivo que puebla las tablas estáticas (proveedores, super-administrador, productos estáticos):
   ```bash
   npm run db:seed
   ```
   > [!TIP]
   > No uses `prisma db push` en producción ya que podría destruir datos existentes. Usa siempre `migrate deploy`.

## 4. Auditoría de Accesibilidad (A11y)
Se ha configurado la capacidad de *Reduced Motion* (`prefers-reduced-motion`) en los apartados vitales con alto movimiento del cliente (p. ej. Hero Banner animado). Estas configuraciones deshabilitan partículas y escalados profundos dependiendo de lo que dicte el SO (Mac/Windows) del cliente, garantizando una UX libre de contratiempos.
