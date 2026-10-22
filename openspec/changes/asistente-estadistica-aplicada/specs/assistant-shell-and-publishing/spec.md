# Spec Delta

## Purpose

Definir la identidad, la navegación, la experiencia de uso y la publicación del asistente para que el docente lo use libremente desde un enlace.

## ADDED Requirements

### Requirement: Identidad del proyecto
El sistema SHALL mostrar un nombre original, los dos integrantes con su carné, la asignatura y la sección, visibles desde la pantalla de inicio y en el pie de toda pantalla.

#### Scenario: Datos de autoría visibles
- **WHEN** se abre la aplicación
- **THEN** se ven Luis Fernando Samayoa Santos (2990-25-21483), Karla Estefani Gonzáles Tista (2990-25-16308), Estadística Aplicada y Sección Única

### Requirement: Navegación por módulos
El sistema SHALL ofrecer acceso a cada módulo, a ejemplos y a prácticas desde un menú persistente, con URL propia por módulo.

#### Scenario: Enlace directo a un módulo
- **WHEN** se abre la URL de un módulo
- **THEN** la aplicación carga ese módulo directamente, también tras recargar la página

### Requirement: Uso sin cuenta ni costo
El sistema SHALL funcionar sin inicio de sesión, sin claves personales y sin servicios de pago.

#### Scenario: Docente sin cuenta
- **WHEN** el docente abre el enlace en un navegador actual
- **THEN** puede usar todas las funciones sin registrarse

### Requirement: Cálculo local y privado
El sistema SHALL ejecutar los cálculos en el navegador y SHALL NOT enviar los datos del usuario a servidores externos.

#### Scenario: Sin llamadas de datos
- **WHEN** el usuario calcula un resultado
- **THEN** no se realiza ninguna petición de red con sus datos

### Requirement: Diseño responsive y accesible
El sistema SHALL usarse sin desplazamiento horizontal desde 375 px de ancho, con contraste de texto mínimo 4.5:1, foco visible y operación con teclado.

#### Scenario: Teléfono
- **WHEN** se abre en un ancho de 375 px
- **THEN** el menú se adapta, los formularios ocupan el ancho y no aparece scroll horizontal

#### Scenario: Teclado
- **WHEN** el usuario navega solo con Tab y Enter
- **THEN** puede alcanzar y accionar todos los controles con foco visible

### Requirement: Publicación estable
El sistema SHALL estar publicado en una URL pública permanente y fiable, accesible hasta terminar la revisión, y las rutas profundas SHALL cargar sin error 404.

#### Scenario: Recarga en ruta profunda
- **WHEN** se recarga la página en la ruta de un módulo
- **THEN** la aplicación se muestra correctamente
