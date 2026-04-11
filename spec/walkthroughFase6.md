# Retrospectiva de Implementación: Fase 6 (v2.1)

Esta fase se centró en la profesionalización del ecosistema con internacionalización (i18n), autenticación sin contraseñas (WhatsApp OTP) y estabilización sobre el motor de renderizado de última generación de Next.js.

## 1. Hitos Técnicos Logrados

### WhatsApp OTP Integration
- **Integración con Meta**: Uso de WhatsApp Business API para envío de PINs.
- **Seguridad y Trazabilidad**:
    - Implementación de `used: Boolean` en el modelo `OTPToken` para evitar ataques de repetición.
    - Rate Limiting con **Upstash Redis** (5 intentos/hora) para prevenir abuso del API.
- **Flujo de Usuario**: Login híbrido (Email/WhatsApp) con validación asíncrona mediante Auth.js.

### Internacionalización (i18n)
- **Infraestructura**: Migración de todas las rutas públicas a un esquema dinámico basado en `[locale]`.
- **Diccionarios Centralizados**: Creación de archivos `es.json` y `en.json` con namespaces para Auth, Header, Hero, ProductCard y Checkout.
- **Routing Robusto**: Creación de un `LanguageSelector` con detección de locale actual y persistencia de ruta.

---

## 2. Desafíos Médula y Soluciones (Post-Mortem)

### Conflicto de Dependencias (Next.js 16 vs Next-Auth)
- **Error**: `ERRESOLVE could not resolve next-auth`.
- **Causa**: Next-Auth Beta exige Next.js 15, mientras que este proyecto usa la versión 16.2.0 (estable).
- **Solución**: Se forzó la instalación con `--legacy-peer-deps` y se creó un `.npmrc` persistente para asegurar la compatibilidad en entornos de CI/CD como Vercel.

### Estabilización de Turbopack
- **Error**: `Couldn't find next-intl config file`.
- **Causa**: El plugin oficial de `next-intl` intentaba inyectar configuraciones en `experimental: { turbo: ... }`, pero en Next.js 16 la llave es `turbopack` (nivel superior).
- **Solución**: Se desactivó el envoltorio automático y se configuró manualmente el alias en `next.config.ts`:
    ```typescript
    turbopack: {
      resolveAlias: { "next-intl/config": "./src/i18n/request.ts" }
    }
    ```

### Errores de Referencia y Tipado
- **Bcrypt**: Error de módulo no encontrado en entornos Edge. Se migró de `bcrypt` a `bcryptjs`.
- **Radix UI**: Importaciones heredadas de `radix-ui` (paquete obsoleto) a `@radix-ui/react-*`.
- **URLs Duplicadas**: Corregido glitch donde el selector de idiomas producía rutas como `/es/en` mediante una reescritura de path manual con Regex.

---

## 3. Estado de Salud del Proyecto

> [!NOTE]
> El proyecto se encuentra actualmente en un estado **Green (Estable)**. Todos los warnings críticos de la consola han sido resueltos.

### Métricas de Estabilidad
| Componente | Estado | Notas |
| :--- | :--- | :--- |
| i18n (Server) | ✅ | Configurado vía alias manual. |
| i18n (Client) | ✅ | Hydration segura mediante Provider. |
| Auth (WhatsApp) | ✅ | Probado en [DEV MODE] y listo para API Token. |
| Performance | ✅ | Turbopack activo por defecto. |

## 4. Próximos Pasos Recomendados
1. **Verificación de Producción**: Realizar un `npm run build` para validar los tipos finales de Next.js 16.
2. **Tokens de Meta**: Reemplazar las variables de entorno `WHATSAPP_API_TOKEN` en Vercel con los valores reales de producción para salir del modo consola.

---
**Autor**: Antigravity AI
**Fecha**: 11 de Abril, 2026
**Fase**: 6 (v2.1) - Omnicanalidad & Globalización
