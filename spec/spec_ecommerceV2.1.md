# Especificación Técnica V2.1 — Internacionalización y API WhatsApp

**Documento de Planificación Arquitectónica**
*Destino:* E-commerce Premium (Next.js 16.2 App Router, Auth.js)

Este documento traza la ruta arquitectónica requerida para ejecutar los gaps `G-09` (i18n) y `G-16/17` (WhatsApp Programático). Ambas son alteraciones críticas al código base y requieren un flujo meticuloso para no romper la versión 2.0 existente en producción.

---

## 1. Migración i18n (Multi-Idioma) con `next-intl`

Dado que el proyecto utiliza el App Router puro de Next.js, la estrategia de ruteo base se transformará para envolver todas las vistas en carpetas de segmento de idioma (`/[locale]`).

### Componentes y Configuración a implementar:
1. **Librería Core:** Instalación de `next-intl`. Es la opción más robusta para React Server Components.
2. **Archivos de Diccionario:** Creación de `/messages/es.json` y `/messages/en.json`. Toda la aplicación deberá referenciar estos diccionarios en vez de usar literales "quemados".
3. **Middleware de Ruteo:**
   * Creación de `src/middleware.ts` configurado para redigir tráfico entrante sin idioma (`/productos`) al idioma negociado por cabeceras HTTP (`/es/productos`).
4. **Refactorización de Capa `(public)` y `admin`:**
   * Movimiento de todo el contenido de `src/app` actual hacia `src/app/[locale]`.
   * Parcheo de todas las etiquetas `<Link href="...">` para asegurar que respetan parámetros del *locale* con un Wrapper personalizado interactivo de next-intl.
5. **Selector Visual:**
   * Nuevo componente de UI (`LanguageSelector`) integrado en la barra de navegación pública y en el Sidebar Administrativo para alternar la cookie de preferencia.

---

## 2. API WhatsApp Cloud (Auth OTP y Notificaciones)

Para eludir las demoras y correos spam, el sistema pasará a un inicio de sesión sin contraseñas usando un Pin Dinámico Temporario (OTP) que ingresa directamente al número del cliente por WhatsApp, junto con envíos de facturas post-compra.

### Requisitos Funcionales Previos (Responsabilidad del Dueño):
- [ ] Aplicación aprobada en **Meta for Developers**.
- [ ] Número comercial verificado ligado a WhatsApp Business API.
- [ ] Plantillas (Templates) de WhatsApp aprobadas por Meta para el envío del código numérico: Ej. *"Tu código de acceso seguro para MiTienda es: {{1}}"*.

### Intervenciones a Nivel Código (Responsabilidad de IA):
1. **Schema Prisma:**
   * Adición del campo `phoneVerified Boolean @default(false)` en el modelo `Customer`.
   * Adición de la tabla `OTPToken` asociando un número telefónico, un pin hasheado (bcrypt) y una fecha `expires`.
2. **EndPoints REST Propios:**
   * `POST /api/whatsapp/send-otp`: Comprueba si el usuario existe, genera y guarda un PIN criptográfico temporal, y hace un `fetch` hacia Meta Graph API.
   * `POST /api/whatsapp/verify-otp`: Convalida la vigencia del token y certifica la autorización del dispositivo móvil.
3. **Adaptación Auth.js:**
   * Inyectar un nuevo `CredentialsProvider(id: "whatsapp")` en el archivo `auth.ts` configurado para atrapar la señal y validar el PIN ingresado con el registrado en `OTPToken`.
4. **Webhooks Meta:**
   * Exponer la ruta `/api/webhooks/whatsapp` programada para retornar el "Challenge String" requerido en el proceso de encendido de Meta, y capturar acuses de recibo silenciosos (doble check azul).

---

## ⚠️ Flujo de Ejecución (User Review Required)

> [!CAUTION]
> ### Riesgo Arquitectónico
> El traslado de la carpeta `src/app` entera a `src/app/[locale]` causará un redibujado de la historia de los commits y requerirá testear todos los Client Components. Adicionalmente, implementar WhatsApp sin credenciales Graph verdaderas levantará errores HTTP 400.

**Orden de Ejecución Propuesto:**
1. Empezaremos refactorizando **i18n** (Instalar dependencias, ajustar middleware y trasladar rutas a `/[locale]`).
2. Luego nos abocaremos a purgar archivos para introducir `<useTranslations()>` al inglés.
3. Finalmente intervendremos Prisma y Auth.js para la validación OTP vía Meta.

¿Aceptas formalmente el inicio de reestructuración de código en el sistema productivo?
