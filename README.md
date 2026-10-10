# Sistema de Gestión de Soporte TI — Demo pública

Versión demostrativa y completamente ficticia de una plataforma de gestión de soporte operativo.

## Datos de acceso

- Observador: `demo@demo.example.com`
- Técnico: `tecnico@demo.example.com`
- Contraseña: `Demo2026!`

Todos los nombres, correos, centros, identificadores y casos son sintéticos. No se incluyen datos ni historial Git del sistema operativo original.

## Funcionalidades

- Dashboard con métricas y explorador configurable.
- Gestión y filtros de incidencias.
- Roles de observador, técnico y administrador.
- Directorios de centros y personal operativo.
- Sugerencias de casos similares.
- Guías internas, exportación Excel y bitácora.

## Laboratorio de portafolio

Después de iniciar sesión, abre **Laboratorio demo** en el menú (`/showcase`). Incluye filtros y KPI de entregas ficticias, importación de CSV de muestra con validación y deduplicación, y una bandeja de mensajes con asociación y descarte simulados.

El laboratorio se ejecuta en memoria del navegador y se reinicia al recargar. No conecta a Teams ni Drivin y no sustituye los módulos completos del sistema original. El núcleo de soporte sí utiliza el backend y la base de datos de esta demo. Todas las muestras son sintéticas.

## Restauración en otro equipo

Clona este repositorio. Instala PHP compatible con `composer.json`, Composer, Node.js y npm. Ejecuta `composer setup`, configura una base local vacía en `.env`, ejecuta `php artisan migrate --seed` y después `composer dev`. No uses bases, archivos ni credenciales del entorno de trabajo.

## Desarrollo local

Ejecuta `composer setup` y luego `composer dev`.
