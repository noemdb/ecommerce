# Especificación Técnica: Gestión de Base de Datos (Backup & Seeding)

Este documento detalla la funcionalidad de mantenimiento y resguardo de datos del sistema, ubicada en el módulo administrativo (`/admin/backup`).

## 1. Resumen Funcional
El módulo de Gestión de Base de Datos proporciona herramientas críticas para asegurar la continuidad del negocio, facilitar migraciones de datos y permitir la recuperación del sistema ante desastres.

### Objetivos Clave:
- **Respaldo Total**: Exportación de la base de datos completa a un archivo portable.
- **Restauración**: Recuperación del sistema a partir de un backup previo.
- **Inyección de Catálogo**: Carga masiva y actualización de productos y categorías.
- **Limpieza de Sistema**: Retorno a un estado inicial controlado (Estado de Fábrica).

## 2. Arquitectura Técnica

### Tecnologías Utilizadas:
- **Core**: Next.js Server Actions.
- **ORM**: Prisma Client.
- **Base de Datos**: PostgreSQL.
- **Seguridad**: `bcryptjs` para regeneración de credenciales en reseteos.

### Implementación del Lado del Servidor:
La lógica reside en `@/actions/database-manager.ts`. Utiliza operaciones de SQL crudo (`TRUNCATE TABLE ... CASCADE`) para manejar la limpieza profunda de tablas respetando la integridad referencial de PostgreSQL.

## 3. Detalle de Operaciones

### A. Exportación de Datos (`exportDatabase`)
Genera un objeto JSON que consolida los registros de 17 tablas principales:
- **Usuarios y Clientes**: `User`, `Customer`, `OTPToken`, `CustomerAction`.
- **Catálogo**: `Category`, `Supplier`, `Product`, `ProductImage`, `ProductVariant`, `ProductPrompt`.
- **Operaciones**: `Order`, `OrderItem`, `OrderStatusHistory`, `InventoryMovement`.
- **Sistema**: `Review`, `SiteConfig`, `AuditLog`.

**Salida**: Archivo `.json` con estampa de tiempo.

### B. Restauración de Datos (`importDatabase`)
1. **Limpieza**: Ejecuta un `TRUNCATE CASCADE` en todas las tablas mencionadas.
2. **Inserción Secuencial**: Inserta los datos respetando la jerarquía de claves foráneas:
    - *Independientes*: Usuarios, Configuración, Clientes, Categorías, Proveedores.
    - *Dependientes*: Productos, Imágenes, Variantes, Prompts.
    - *Transaccionales*: Órdenes, Ítems, Historial, Movimientos de Inventario, Reseñas.

> [!CAUTION]
> Esta operación es **altamente destructiva** e irreversible. Elimina todos los datos actuales antes de procesar el archivo.

### C. Seeder de Catálogo (`seedCatalogFromJSON`)
Diferente a la restauración completa, esta función se enfoca solo en la "vitrina" del negocio.
- **Lógica**: Utiliza el comando `upsert` de Prisma.
- **Impacto**: Crea productos/categorías nuevos o actualiza los existentes basándose en sus IDs.
- **Tablas Afectadas**: `categories`, `products`, `product_images`.

### D. Reinicio a Estado Inicial (`resetToInitialState`)
1. Realiza una limpieza total de la base de datos vía `TRUNCATE CASCADE`.
2. Crea una cuenta de **Administrador por defecto** (`admin@mitienda.com`).
3. Crea un **Cliente de demostración**.
4. Restaura la **Configuración del Sitio** a sus valores predeterminados (`DEFAULT_SITE_CONFIG`).

## 4. Protocolos de Seguridad

### Restricción de Acceso:
Estas operaciones están estrictamente reservadas para usuarios con el rol `ADMIN`. El acceso a la ruta `/admin/backup` debe estar protegido por middleware de autenticación.

### Confirmación de Usuario:
Dada la naturaleza destructiva de la restauración y el reinicio, la interfaz de usuario DEBE requerir:
- Una confirmación explícita mediante un **Confirmation Dialog**.
- Alertas visuales con código de color rojo/naranja (`Alert` con variantes `destructive`).

## 5. Mantenimiento y Mejores Prácticas
- **Frecuencia de Backup**: Se recomienda una exportación semanal manual o antes de realizar cambios masivos en el catálogo.
- **Validación de Archivos**: Los archivos de importación deben seguir estrictamente el esquema JSON exportado para evitar fallos de integridad durante el proceso de recreación de registros.
