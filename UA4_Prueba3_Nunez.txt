===== PÁGINA 1 =====
Informe Técnico
Planificación de API con MongoDB para
análisis de comportamiento de usuarios.


NOMBRE: Aaron Nuñez Torres
CARRERA: Plan Especial de Titulación Ingeniería en Informática
ASIGNATURA: Bases de Datos No Estructuradas
PROFESOR: Juan Pablo Díaz Saba
FECHA:04/05/2026

Ingeniería en
Informática
Online

===== PÁGINA 2 =====
2


Contenido
Planificación de API con MongoDB para análisis de comportamiento de usuarios. ................ 1
Introducción ....................................................................................................................... 4
Problemática (visión Product Owner) .................................................................................. 5
Solución propuesta ............................................................................................................ 6
Alcance del proyecto .......................................................................................................... 7
Alcance MVP funcional ................................................................................................ 7
Fuera del MVP funcional .............................................................................................. 8
Elementos técnicos planificados para la evolución ....................................................... 8
Metodología MoSCoW y MVP .............................................................................................. 9
Stack tecnológico ............................................................................................................. 10
Comparativa de stack tecnológico: ............................................................................ 10
Infraestructura de hosting propuesta ................................................................................. 12
Infraestructura para MVP ............................................................................................... 12
Infraestructura para producto final ................................................................................ 13
Comparación entre MVP y producto final ....................................................................... 14
Justificación multidimensional ...................................................................................... 15
Decisión ....................................................................................................................... 15
Diagrama de infraestructura .......................................................................................... 16
Riesgos y mitigaciones .................................................................................................. 16
Modelo de datos MongoDB ............................................................................................... 17
Documentos JSON ........................................................................................................ 18
•
Documento de colección usuarios ..................................................................... 18
•
Documento de colección aplicaciones .............................................................. 18
•
Documento de colección sesiones .................................................................... 19
•
Documento de colección eventos ...................................................................... 19
Decisiones de modelado: embebido o referenciado. ...................................................... 20
Cardinalidad ................................................................................................................. 20
Patrones de diseño MongoDB ........................................................................................ 21
•
Attribute Pattern ................................................................................................ 21
•
Extended Reference Pattern .............................................................................. 21

===== PÁGINA 3 =====
3

•
Bucket Pattern .................................................................................................. 22
Índices Propuestos ....................................................................................................... 23
Justificación Técnica ..................................................................................................... 24
Diagrama del Modelo .................................................................................................... 25
Consultas necesarias documentadas ............................................................................... 26
Consultas del MVP funcional ......................................................................................... 27
•
Registrar un evento ............................................................................................ 27
•
Obtener un evento por ID ................................................................................... 28
•
Listar eventos con filtros dinámicos ................................................................... 29
•
Actualizar metadata de un evento ...................................................................... 30
•
Eliminar un evento ............................................................................................. 30
•
Consultas complementarias.............................................................................. 31
•
Consultas analíticas para producto final ............................................................ 33
•
Relaciones entre consultas e índices ................................................................. 35
Justificación Técnica ..................................................................................................... 36
Arquitectura de la API ....................................................................................................... 37
Arquitectura MVP ....................................................................................................... 37
Arquitectura objetivo / producto final ............................................................................. 37
Diagrama de arquitectura .................................................... ¡Error! Marcador no definido.
Flujo de datos ............................................................................................................... 38
Contrato de endpoints REST .......................................................................................... 39
Documentación con Swagger/OpenAPI 3 ....................................................................... 43
Observabilidad con OpenTelemetry ............................................................................... 43
Estrategia de pruebas y cobertura .................................................................................. 44
Integración CI/CD ......................................................................................................... 45
Justificación técnica de la arquitectura .......................................................................... 45
Conclusión ....................................................................................................................... 46
Referencias ...................................................................................................................... 47

===== PÁGINA 4 =====
4

Introducción
En el contexto actual de transformación digital, las organizaciones dependen cada vez más de
aplicaciones web y móviles para interactuar con sus usuarios. Sin embargo, muchas de estas
plataformas carecen de mecanismos propios para analizar el comportamiento real de quienes
las utilizan.
El presente informe tiene como propósito planificar el desarrollo de una API orientada al
registro y análisis de eventos de usuario, utilizando MongoDB como motor de persistencia. Se
busca diseñar una solución que permita capturar datos relevantes de interacción, facilitando
la toma de decisiones basada en evidencia.
El alcance de este informe se centra en la definición del problema, la propuesta de solución,
el diseño técnico y la arquitectura del sistema, sin contemplar la implementación práctica. La
metodología utilizada considera un enfoque incremental, comenzando con un MVP y
evolucionando hacia un sistema escalable.

===== PÁGINA 5 =====
5

Problemática (visión Product Owner)

Actualmente, las aplicaciones digitales generan una gran cantidad de interacciones (clicks,
navegación, uso de funcionalidades), pero esta información no siempre es registrada ni
analizada de manera efectiva.
Desde la perspectiva del negocio, esto genera una serie de dificultades. Las organizaciones no
logran identificar qué funcionalidades son más utilizadas, ni detectar en qué etapas los
usuarios abandonan procesos importantes como compras o reservas. Además, la falta de
información impide optimizar la experiencia de usuario y limita la toma de decisiones
estratégicas.
Por ejemplo, si una plataforma no registra eventos de abandono en un proceso de compra o
reserva, el equipo no puede identificar si el problema ocurre en el formulario, en el método de
pago o en la navegación. Esto puede provocar decisiones basadas en suposiciones, pérdida
de usuarios activos y menor conversión.
Otro problema relevante es la dependencia de herramientas externas, lo que implica pérdida
de control sobre los datos y limitaciones en la personalización del análisis.
El impacto en el negocio se traduce en una baja conversión, pérdida de oportunidades de
mejora y dificultades para adaptar el sistema a las necesidades reales de los usuarios.
Frente a este escenario, surge la oportunidad de implementar una solución propia que permita
capturar, almacenar y analizar el comportamiento de los usuarios, generando valor
estratégico para la organización.
Dolor detectado
Impacto en el negocio
Oportunidad
No se sabe qué funciones
usan los usuarios
Se invierte tiempo en
mejoras poco relevantes
Priorizar desarrollo con
datos
No se detectan abandonos
Baja conversión
Optimizar pantallas críticas
Dependencia de
herramientas externas
Menor control de datos
Crear solución propia
flexible

Por lo tanto, el problema principal no corresponde únicamente a una carencia técnica, sino a
una falta de visibilidad para la toma de decisiones. Al no contar con datos propios sobre las
interacciones de los usuarios, el Product Owner y el equipo de desarrollo tienen menos
capacidad para priorizar mejoras, detectar puntos de abandono y validar si las
funcionalidades implementadas realmente generan valor.

===== PÁGINA 6 =====
6

Solución propuesta

Se propone el desarrollo de una API REST que permita registrar eventos generados por los
usuarios dentro de una aplicación y almacenarlos en MongoDB.
La API será capaz de capturar acciones como clicks, navegación entre pantallas y uso de
funcionalidades específicas. Estos eventos serán almacenados en una base de datos flexible,
permitiendo su posterior análisis.
Esta solución está orientada a administradores, Product Owners, desarrolladores y analistas
de datos, quienes podrán utilizar la información para comprender el comportamiento de los
usuarios y mejorar la plataforma.
La planificación de esta API permitirá sentar las bases para detectar problemas de experiencia
de usuario, optimizar funcionalidades y apoyar la toma de decisiones basadas en datos reales.
En una primera etapa, la solución se enfocará en registrar y consultar eventos básicos.
Posteriormente, podrá evolucionar hacia capacidades más avanzadas de métricas,
documentación técnica, observabilidad y automatización del ciclo de despliegue.

===== PÁGINA 7 =====
7

Alcance del proyecto
El proyecto contempla el desarrollo de una API básica funcional junto con la estructura de
almacenamiento en MongoDB.
Dentro del alcance se incluye el registro de eventos, la consulta de datos y la posibilidad de
analizar información básica de comportamiento. También se considera una estructura flexible
que permita adaptarse a distintos tipos de eventos mediante el uso de metadata.
Por otro lado, no se incluye el desarrollo de inteligencia artificial, dashboards avanzados ni
procesamiento en tiempo real complejo, ya que estos elementos exceden el alcance del
proyecto en esta etapa.
Se asume que la aplicación cliente enviará correctamente los eventos y que el volumen de
datos crecerá de manera progresiva. Asimismo, se considera como restricción principal el uso
de recursos limitados, al tratarse de un proyecto académico.
Los principales stakeholders son los administradores del sistema, el equipo de desarrollo, el
Product Owner y los usuarios finales de forma indirecta.
1. Registrar evento de usuario.
2. Consultar eventos por usuario.
3. Filtrar eventos por fecha.
4. Filtrar eventos por tipo.
5. Obtener métricas básicas de comportamiento.
6. Exportar datos en etapa futura.
7. Monitorear errores y uso de la API.
Alcance MVP funcional

El MVP funcional contempla únicamente las capacidades mínimas necesarias para validar la
solución desde el punto de vista del negocio. Estas capacidades permiten registrar eventos,
almacenarlos en MongoDB y consultarlos mediante endpoints básicos.
Entra en el MVP funcional
Justificación
API REST para registrar eventos
Es la función central del sistema
MongoDB como persistencia
Permite almacenar eventos flexibles
Consulta de eventos por usuario
Permite analizar comportamiento individual
Consulta de eventos por fecha
Permite revisar actividad por periodo
Identificación de usuario y sesión
Permite asociar eventos a un origen

===== PÁGINA 8 =====
8

Fuera del MVP funcional

No entra en el MVP funcional
Motivo
Dashboards avanzados
Requieren una capa visual adicional
Machine learning
Excede el alcance académico
Procesamiento en tiempo real complejo
Requiere infraestructura especializada
Despliegue productivo obligatorio
El informe es de planificación
App cliente completa
El foco es la API y la base de datos

Elementos técnicos planificados para la evolución

Elemento técnico
Etapa sugerida
Justificación
Swagger/OpenAPI
Producto final / arquitectura
objetivo
Documenta contratos de API
OpenTelemetry
Producto final / operación
Permite trazas, métricas y logs
GitHub Actions
Producto
final
/
automatización
Automatiza pruebas y despliegue
Testing con cobertura
80%
Estrategia de calidad
Asegura confiabilidad antes de
producción
Métricas agrupadas
Should / producto final
Mejora el análisis para el Product
Owner

De esta forma, el alcance diferencia entre las funcionalidades mínimas del MVP y los
elementos técnicos de calidad que se planifican para una etapa posterior. Esta separación
evita sobredimensionar el MVP y mantiene una evolución coherente hacia un producto final
más robusto.

===== PÁGINA 9 =====
9

Metodología MoSCoW y MVP
Para la priorización de requerimientos se utilizó la metodología MoSCoW, la cual permite
clasificar las funcionalidades según su importancia.
Categoría
Requerimiento
Justificación
Must
Registrar eventos de usuario
Es la función central de la API
Must
Guardar eventos en MongoDB
Permite persistencia flexible
Must
Identificar usuario y sesión del
evento
Permite analizar comportamiento por
usuario o sesión
Must
Consultar eventos por usuario
Permite análisis individual
Must
Consultar eventos por fecha
Permite analizar periodos
Should
Filtrar eventos por tipo
Mejora la segmentación del análisis
Should
Obtener
métricas
agrupadas
básicas
Apoya decisiones del Product Owner, pero
no es indispensable para validar el MVP
Could
Exportar CSV/JSON
Facilita integración externa
Could
Dashboard básico
Mejora visualización, pero no es crítico
Won’t
Machine learning
Excede el alcance actual
Won’t
Procesamiento en tiempo real
avanzado
Requiere infraestructura más compleja

El MVP se deriva exclusivamente de los requerimientos Must. Por lo tanto, considera una API
funcional capaz de registrar eventos, almacenarlos en MongoDB, identificar al usuario o
sesión que los genera y permitir consultas básicas por usuario y fecha. Las métricas
agrupadas, exportaciones, dashboards, observabilidad avanzada y automatización CI/CD se
consideran elementos de evolución o producto final, no parte obligatoria del MVP funcional.

===== PÁGINA 10 =====
10

Stack tecnológico
El desarrollo del sistema se plantea en dos etapas: un MVP y un producto final escalable.
Para el MVP, se selecciona Node.js con Express.js, debido a su capacidad para manejar
múltiples solicitudes concurrentes de manera eficiente, lo que resulta ideal para un sistema
orientado al registro de eventos. Además, su ecosistema es amplio, cuenta con gran
comunidad y soporte para librerías relacionadas con APIs REST.
MongoDB se selecciona como base de datos debido a su naturaleza flexible, permitiendo
almacenar eventos con estructuras variables sin necesidad de esquemas rígidos. Esto es
especialmente útil al trabajar con metadata dinámica.
Para el producto final, se propone el uso de NestJS como framework principal, ya que ofrece
una arquitectura modular y escalable, facilitando el mantenimiento del sistema a largo plazo.
Además, se incorpora Python con FastAPI para servicios analíticos, aprovechando su fortaleza
en procesamiento de datos.
La elección de estas tecnologías responde a criterios de rendimiento, escalabilidad,
compatibilidad con MongoDB, madurez tecnológica y soporte de herramientas de
observabilidad como OpenTelemetry.
Comparativa de stack tecnológico:
Stack para MVP
Tecnología
Uso
Justificación
Node.js
Backend MVP
Buen rendimiento para operaciones I/O y
registro de eventos
Express.js
Framework API REST Simple, rápido y adecuado para prototipo
funcional
MongoDB
Base
de
datos
documental
Flexible
para
eventos
con
metadata
variable
Driver oficial MongoDB
para Node.js
Conexión
con
la
base de datos
Permite usar operaciones nativas como
insertOne, find, updateOne y aggregate

===== PÁGINA 11 =====
11

Stack para producto final o evolución:
Tecnología
Uso
Justificación
NestJS
Backend escalable
Modularidad, mantenibilidad y estructura
por capas
FastAPI
Servicios
analíticos
futuros
Apoyo a procesamiento y análisis de datos
OpenTelemetry
Observabilidad
Permite trazas, métricas y logs en etapa
operativa
Swagger/OpenAPI Documentación técnica
Define contratos de API para integración
GitHub Actions
Automatización CI/CD
Automatiza pruebas y despliegues futuros

Tabla de descartes:
Alternativa descartada
Motivo
PHP + Laravel
Menos orientado a ingestión masiva de eventos en tiempo real
MySQL/PostgreSQL
Requieren esquemas más rígidos para metadata variable
Django
Más pesado para un MVP de API simple
Firebase
Rápido, pero con menos control sobre consultas analíticas
personalizadas

Para mantener coherencia con el alcance, el stack del MVP se limita a las tecnologías
necesarias para construir y validar la API básica. Las herramientas como OpenTelemetry,
Swagger/OpenAPI y GitHub Actions se consideran parte de la arquitectura objetivo y del
producto final, ya que aportan documentación, observabilidad y automatización, pero no son
funcionalidades requeridas para validar el MVP.

===== PÁGINA 12 =====
12

Infraestructura de hosting propuesta
La infraestructura de hosting se plantea en dos etapas: una primera etapa correspondiente al
MVP, enfocada en validar la solución con bajo costo y rápida puesta en marcha; y una segunda
etapa correspondiente al producto final, orientada a escalabilidad, alta disponibilidad,
seguridad y operación continua.
Esta separación permite evitar una inversión inicial elevada, manteniendo una arquitectura
simple durante la validación del proyecto, pero dejando definida una ruta clara de crecimiento
hacia un entorno productivo más robusto.
Infraestructura para MVP
Para la etapa MVP se propone desplegar la API REST en una plataforma PaaS como Render o
Railway. Estas plataformas permiten publicar aplicaciones Node.js de forma rápida, sin
necesidad de administrar directamente servidores, sistemas operativos, balanceadores de
carga o configuraciones complejas de red.
La base de datos se alojará en MongoDB Atlas, utilizando inicialmente un clúster gratuito o de
bajo costo. Esta decisión permite contar con una base de datos gestionada, respaldos
básicos, monitoreo inicial y conexión segura mediante URI, reduciendo el esfuerzo operativo
del equipo.
El objetivo principal de esta etapa es validar que la API pueda registrar, almacenar y consultar
eventos de comportamiento de usuario sin incurrir en costos elevados ni complejidad
innecesaria.
Componente
Tecnología
propuesta
Modelo
Justificación
API REST
Render o Railway
PaaS
Permite despliegue rápido, bajo
costo y mínima administración
Base de datos
MongoDB Atlas
Free/Básico
DBaaS
Reduce tareas de administración
y entrega una base gestionada
Repositorio
GitHub
SaaS
Facilita control de versiones del
código
Variables de
entorno
Configuración del
PaaS
Gestionado
Protege credenciales de conexión
Logs básicos
Logs de
Render/Railway +
Atlas Monitoring
Gestionado
Permite revisar errores iniciales
sin observabilidad avanzada
En el MVP se utilizarán únicamente mecanismos simples de operación, como logs básicos de
la plataforma y monitoreo inicial de MongoDB Atlas. En cambio, para el producto final se
considera
una
infraestructura
más
completa,
incorporando
observabilidad
con

===== PÁGINA 13 =====
13

OpenTelemetry, documentación formal con Swagger/OpenAPI y automatización mediante
CI/CD.
Infraestructura para producto final

Para el producto final se propone una arquitectura basada en contenedores Docker
desplegados en una plataforma cloud como AWS, Azure o Google Cloud. El uso de
contenedores permite empaquetar la API junto con sus dependencias, facilitando despliegues
consistentes entre ambientes de desarrollo, pruebas y producción.
En esta etapa, la API puede ejecutarse en un servicio administrado de contenedores como
AWS ECS, Azure Container Apps o Google Cloud Run. Estas alternativas permiten escalar
horizontalmente la aplicación según la demanda, distribuir la carga de trabajo y mejorar la
disponibilidad del sistema.
MongoDB se mantendría en MongoDB Atlas, pero utilizando un clúster dedicado con
replicación. Esta configuración permite mejorar la disponibilidad, el rendimiento y la
tolerancia a fallos. En caso de crecimiento mayor, se podría evaluar el uso de sharding para
distribuir grandes volúmenes de eventos.

Componente
Tecnología propuesta
Modelo
Justificación
API REST
Docker + AWS ECS / Azure
Container Apps / Cloud
Run
Contenedores
administrados
Permite
escalar
horizontalmente y facilitar
despliegues
Base de datos
MongoDB
Atlas
Cluster
dedicado
DBaaS
Alta
disponibilidad,
monitoreo,
backups
y
replicación
Balanceo
de
carga
Load Balancer cloud
PaaS/IaaS
gestionado
Distribuye tráfico entre
instancias
Seguridad
HTTPS,
variables
de
entorno,
firewall/IP
allowlist
Gestionado
Protege comunicación y
acceso a datos
Observabilidad
OpenTelemetry
+
Grafana/Tempo/Jaeger
Observabilidad Permite trazas, métricas y
logs centralizados
CI/CD
GitHub Actions
SaaS
Automatiza
pruebas
y
despliegues

===== PÁGINA 14 =====
14

Comparación entre MVP y producto final

Tabla comparativa entre MVP y producto final
Criterio
MVP
Producto final
Objetivo
Validar
la
solución
rápidamente
Operar de forma estable y escalable
Hosting API
Render/Railway
AWS ECS, Azure Container Apps o Cloud
Run
Base de datos
MongoDB
Atlas
gratuito/básico
MongoDB Atlas dedicado con réplica
Costo
Bajo o gratuito
Variable
según
tráfico
y
almacenamiento
Escalabilidad
Limitada
Escalamiento horizontal
Disponibilidad
Dependiente
del
plan
gratuito/básico
Mayor disponibilidad mediante réplicas
y balanceador
Operación
Simple, poca administración
Requiere monitoreo, alertas y CI/CD
Seguridad
HTTPS básico y variables de
entorno
HTTPS, secretos, firewall, roles e IP
allowlist
Uso
recomendado
Pruebas
académicas
y
validación
Producción real

===== PÁGINA 15 =====
15

Justificación multidimensional

Dimensión
Justificación
Costos
En el MVP se priorizan servicios gratuitos o de bajo costo, evitando
infraestructura sobredimensionada. En el producto final, el costo
aumenta
proporcionalmente
al
tráfico,
almacenamiento
y
disponibilidad requerida.
SLA
En MVP se acepta menor nivel de disponibilidad. En producto final se
recomienda usar servicios cloud administrados y MongoDB Atlas
dedicado para acceder a mejores niveles de disponibilidad.
Ubicación
geográfica
Se debe seleccionar una región cercana a los usuarios principales,
idealmente Sudamérica o una región con baja latencia hacia Chile.
Escalabilidad
La API puede escalar horizontalmente mediante contenedores.
MongoDB Atlas permite aumentar recursos, réplicas y eventualmente
aplicar sharding.
Cumplimiento y
seguridad
Se consideran buenas prácticas como HTTPS, control de acceso,
variables de entorno, roles mínimos, conexión segura a MongoDB y
restricción de IPs.
Operabilidad
El uso de PaaS, DBaaS y CI/CD reduce la carga operativa.
OpenTelemetry permite observar errores, latencias y comportamiento
del sistema.

Decisión
Para el MVP se recomienda utilizar Render para alojar la API REST y MongoDB Atlas en su plan
gratuito o básico como base de datos. Esta combinación permite validar la solución
rápidamente, mantener bajo el costo inicial y reducir la complejidad de administración.
Para el producto final se recomienda utilizar AWS ECS con Docker para la API y MongoDB Atlas
dedicado para la base de datos.

===== PÁGINA 16 =====
16

Diagrama de infraestructura
Arquitectura de infraestructura propuesta para MVP y evolución a producto final.

Las figuras muestran los flujos generales de la infraestructura MVP propuesta como para la del
producto final. La aplicación cliente se comunica con la API mediante HTTPS. La API registra y
consulta eventos en MongoDB Atlas. En el caso del producto final,  Swagger permite
documentar los endpoints, mientras que OpenTelemetry envía trazas y métricas hacia
herramientas de monitoreo.
Riesgos y mitigaciones

Riesgo
Impacto
Mitigación
Límite
del
plan
gratuito
La API podría quedar limitada
en pruebas
Usar plan básico si aumenta el
volumen
Alta
cantidad
de
eventos
Aumento
de
latencia
o
almacenamiento
Crear
índices,
agregaciones
y
evaluar sharding
Caída del servicio
PaaS
Indisponibilidad temporal
Migrar
a
contenedores
administrados en producto final
Exposición
de
credenciales
Riesgo de seguridad
Usar variables de entorno y secretos
Latencia por región
lejana
Respuestas más lentas
Elegir región cercana a Chile o
usuarios principales

===== PÁGINA 17 =====
17

Modelo de datos MongoDB
El modelo de datos se diseña bajo un enfoque documental, aprovechando la flexibilidad de
MongoDB para almacenar eventos de comportamiento de usuarios con estructuras variables.
La colección principal del sistema corresponde a eventos, ya que representa el núcleo
funcional de la API: registrar acciones realizadas por los usuarios dentro de una aplicación.
A diferencia de una base de datos relacional tradicional, el modelo documental permite
almacenar información adicional dentro de un objeto metadata, el cual puede variar según el
tipo de evento registrado. Por ejemplo, un evento de tipo click puede almacenar el botón
presionado, mientras que un evento de navegación puede almacenar la pantalla de origen y
destino.
El diseño propuesto considera un modelo híbrido, utilizando referencias para entidades
principales como usuarios y aplicaciones, y datos embebidos para información flexible y
contextual del evento.
Colección
Propósito
Tipo
de
información
almacenada
usuarios
Identificar a los usuarios que generan
eventos
Datos básicos del usuario
aplicaciones Registrar la aplicación o sistema desde
donde se generan eventos
Nombre
de
app,
ambiente,
versión
eventos
Almacenar las acciones realizadas por
los usuarios
Tipo de evento, pantalla, fecha,
metadata
sesiones
Agrupar eventos ocurridos dentro de
una misma sesión
Usuario, fecha de inicio, fecha de
cierre, dispositivo

La colección eventos es la colección central del modelo, debido a que almacena las
interacciones capturadas por la API. Las colecciones usuarios, aplicaciones y sesiones
complementan el análisis, permitiendo identificar quién generó el evento, desde qué
aplicación y dentro de qué sesión ocurrió.

===== PÁGINA 18 =====
18

Documentos JSON
• Documento de colección usuarios

• Documento de colección aplicaciones


{
  "_id": "usr_001",
  "nombre": "Usuario Demo",
  "email": "usuario.demo@correo.cl",
  "rol": "cliente",
  "estado": "activo",
  "fecha_registro": "2026-04-01T09:00:00Z"
}
{
  "_id": "app_001",
  "nombre": "Plataforma Web Comercial",
  "ambiente": "produccion",
  "version": "1.0.0",
  "estado": "activa"
}

===== PÁGINA 19 =====
19

• Documento de colección sesiones

• Documento de colección eventos

{
  "_id": "ses_001",
  "usuario_id": "usr_001",
  "aplicacion_id": "app_001",
  "fecha_inicio": "2026-04-20T10:00:00Z",
  "fecha_fin": "2026-04-20T10:35:00Z",
  "dispositivo": {
    "tipo": "mobile",
    "sistema_operativo": "Android",
    "navegador": "Chrome"
  }
}
{
  "_id": "evt_001",
  "usuario_id": "usr_001",
  "sesion_id": "ses_001",
  "aplicacion_id": "app_001",
  "tipo_evento": "click",
  "pantalla": "home",
  "fecha_evento": "2026-04-20T10:05:00Z",
  "metadata": {
    "boton": "reservar",
    "componente": "banner_principal",
    "dispositivo": "mobile",
    "navegador": "Chrome"
  }
}

===== PÁGINA 20 =====
20

Decisiones de modelado: embebido o referenciado.

Elemento
Decisión
Justificación
Usuario
en
evento
Referenciado
mediante
usuario_id
Evita duplicar datos personales en cada
evento
Aplicación
en
evento
Referenciada
mediante
aplicacion_id
Permite analizar eventos por sistema o
ambiente
Sesión en evento
Referenciada
mediante
sesion_id
Permite agrupar múltiples eventos de una
misma navegación
Metadata
del
evento
Embebida
Varía según tipo de evento y se consulta
junto al evento
Dispositivo
en
sesión
Embebido
Es información contextual propia de la
sesión

Se utiliza referenciación para usuarios, aplicaciones y sesiones, ya que son entidades
reutilizables y pueden relacionarse con múltiples eventos. Esto evita duplicar información
estable en cada documento de evento.
Por otro lado, se utiliza información embebida en campos como metadata y dispositivo, ya que
corresponden a datos contextuales que se consultan directamente junto al documento
principal. Esta decisión mejora la lectura de eventos individuales y permite flexibilidad para
distintos tipos de interacciones.
Cardinalidad
Relación
Cardinalidad Explicación
Usuario → Eventos
1:N
Un usuario puede generar muchos eventos
Usuario → Sesiones
1:N
Un usuario puede iniciar múltiples sesiones
Sesión → Eventos
1:N
Una sesión puede contener muchos eventos
Aplicación → Eventos
1:N
Una aplicación puede recibir muchos eventos
Aplicación → Sesiones
1:N
Una aplicación puede tener muchas sesiones

La relación principal del modelo corresponde a usuario-eventos, ya que un usuario puede
generar múltiples interacciones dentro del sistema. También se considera la relación sesión-
eventos, porque una sesión agrupa diferentes acciones realizadas durante un periodo de
navegación.

===== PÁGINA 21 =====
21

Patrones de diseño MongoDB
• Attribute Pattern
Se aplica el Attribute Pattern en el campo metadata de la colección eventos. Este patrón
permite almacenar atributos dinámicos que pueden variar según el tipo de evento. Por
ejemplo, un evento de tipo click puede registrar el botón presionado, mientras que un evento
de navegación puede registrar pantalla_origen y pantalla_destino.


• Extended Reference Pattern
Se aplica el Extended Reference Pattern al almacenar identificadores como usuario_id,
sesion_id y aplicacion_id dentro de la colección eventos. Esto permite mantener una
referencia hacia las colecciones principales sin duplicar completamente sus datos.
En el modelo base se utiliza referencia simple mediante usuario_id. Sin embargo, como
evolución futura se puede aplicar Extended Reference incorporando datos mínimos del
usuario, como el rol, para evitar consultas adicionales cuando se requiera segmentar eventos.


{
  "tipo_evento": "navegacion",
  "metadata": {
    "pantalla_origen": "home",
    "pantalla_destino": "detalle_producto"
  }
}
{
  "usuario": {
    "usuario_id": "usr_001",
    "rol": "cliente"
  },
  "tipo_evento": "click",
  "pantalla": "home"
}

===== PÁGINA 22 =====
22

• Bucket Pattern
El Bucket Pattern no forma parte del MVP, pero se considera como una alternativa futura para
escenarios de alto volumen.


{
  "_id": "bucket_usr_001_2026_04_20",
  "usuario_id": "usr_001",
  "fecha": "2026-04-20",
  "eventos": [
    {
      "tipo_evento": "click",
      "pantalla": "home",
      "hora": "10:05:00",
      "metadata": {
        "boton": "reservar"
      }
    },
    {
      "tipo_evento": "navegacion",
      "pantalla": "detalle",
      "hora": "10:07:00",
      "metadata": {
        "pantalla_origen": "home"
      }
    }
  ]
}

===== PÁGINA 23 =====
23

Índices Propuestos
Los índices se definen considerando las consultas más frecuentes de la API, especialmente
búsquedas por usuario, tipo de evento, sesión, aplicación y rango de fechas. Esto permite
reducir el tiempo de respuesta en consultas analíticas básicas y mejorar el rendimiento
general del sistema.
Índice
Colección Objetivo
{ usuario_id: 1, fecha_evento: -
1 }
eventos
Consultar eventos de un usuario ordenados
por fecha
{ tipo_evento: 1, fecha_evento:
-1 }
eventos
Filtrar eventos por tipo y periodo
{ sesion_id: 1 }
eventos
Agrupar eventos de una misma sesión
{
aplicacion_id:
1,
fecha_evento: -1 }
eventos
Analizar eventos por aplicación
{ "metadata.dispositivo": 1 }
eventos
Filtrar comportamiento por dispositivo
{ email: 1 }
usuarios
Evitar duplicidad de usuarios


db.eventos.createIndex({ usuario_id: 1, fecha_evento: -1 })
db.eventos.createIndex({ tipo_evento: 1, fecha_evento: -1 })
db.eventos.createIndex({ sesion_id: 1 })
db.eventos.createIndex({ aplicacion_id: 1, fecha_evento: -1 })
db.eventos.createIndex({ "metadata.dispositivo": 1 })
db.usuarios.createIndex({ email: 1 }, { unique: true })

===== PÁGINA 24 =====
24

Justificación Técnica
Desde el punto de vista técnico, el modelo documental permite registrar eventos con
estructuras flexibles sin modificar constantemente el esquema de la base de datos. Esto es
importante porque los eventos pueden cambiar según la funcionalidad analizada. Por
ejemplo, un evento de clic no requiere los mismos atributos que un evento de búsqueda o
navegación.
El uso de referencias evita duplicar información de usuarios y aplicaciones en cada evento,
reduciendo inconsistencias y permitiendo mantener datos principales en colecciones
separadas. Al mismo tiempo, el uso de metadata embebida mejora la lectura directa de los
eventos, ya que la información contextual se encuentra dentro del mismo documento.
Desde el punto de vista del negocio, este modelo permite responder preguntas relevantes para
el Product Owner, tales como: qué funcionalidades son más utilizadas, en qué pantallas se
concentran más interacciones, qué usuarios presentan mayor actividad y en qué momentos
se producen más eventos. Esta información puede apoyar decisiones de mejora de
experiencia de usuario, priorización de funcionalidades y optimización de procesos digitales.
Como trade-off, el uso de referencias reduce la duplicación de información de usuarios y
aplicaciones, pero puede requerir consultas adicionales si se necesitan datos completos de
esas entidades. Por otro lado, la metadata embebida mejora la lectura directa del evento,
aunque permite estructuras variables entre documentos. Esta decisión se considera
adecuada porque el objetivo principal del sistema es registrar eventos flexibles y consultarlos
rápidamente para análisis posterior.
Pregunta de negocio
Datos utilizados
Consulta asociada
¿Qué funciones se usan
más?
tipo_evento, metadata.boton
Agrupación por tipo o
botón
¿Dónde
abandonan
los
usuarios?
pantalla,
fecha_evento,
sesion_id
Análisis
por
sesión
y
pantalla
¿Qué
usuarios
son
más
activos?
usuario_id, fecha_evento
Conteo de eventos por
usuario
¿Qué dispositivos se usan
más?
metadata.dispositivo
Agrupación
por
dispositivo
¿En qué fechas hay más
actividad?
fecha_evento
Agrupación por día o mes

Aunque el MVP funcional se enfoca en el registro y consulta básica de eventos, el modelo de
datos se diseña con una estructura flexible para permitir análisis posteriores. Por esta razón,
campos como tipo_evento, pantalla, fecha_evento, usuario_id, sesion_id y metadata permiten
evolucionar hacia métricas agrupadas sin rediseñar completamente la base de datos.

===== PÁGINA 25 =====
25

Diagrama del Modelo


Modelo documental propuesto para la API de análisis de comportamiento de usuarios.
El diagrama representa las colecciones principales del modelo MongoDB. La colección
eventos se relaciona con usuarios, sesiones y aplicaciones mediante referencias. La metadata
del evento se mantiene embebida dentro del documento para permitir flexibilidad según el tipo
de interacción registrada.

===== PÁGINA 26 =====
26

Consultas necesarias documentadas
Las consultas definidas para la API tienen como objetivo permitir el registro, búsqueda, filtrado
y análisis básico de eventos de comportamiento de usuarios. Estas consultas se diseñan
considerando los casos de uso principales del sistema, el modelo documental definido
previamente
y
los
índices
propuestos
para
optimizar
el
rendimiento.

El diseño de las consultas busca cubrir operaciones CRUD básicas, búsquedas por usuario,
filtros por fecha, tipo de evento, sesión y aplicación, además de agregaciones para generar
métricas útiles para el Product Owner y el equipo de desarrollo.


Endpoint
Operación API
Operación MongoDB
Filtro
Proyección
Índice aprovechado
POST /api/eventos
Crear evento
insertOne()
No aplica
No aplica
No aplica
GET /api/eventos
Listar eventos
find()
Filtros dinámicos
Campos principales
Según filtro aplicado
GET /api/eventos/:id
Obtener evento por ID findOne()
_id
Documento completo
_id
GET /api/eventos/usuario/:usuario_id
Buscar por usuario
find()
usuario_id
tipo_evento, pantalla, fecha_evento, metadata
{ usuario_id: 1, fecha_evento: -1 }
GET /api/eventos/sesion/:sesion_id
Buscar por sesión
find()
sesion_id
tipo_evento, pantalla, fecha_evento, metadata
{ sesion_id: 1 }
GET /api/eventos?tipo=click
Filtrar por tipo
find()
tipo_evento
usuario_id, pantalla, fecha_evento
{ tipo_evento: 1, fecha_evento: -1 }
GET /api/eventos?desde=&hasta=
Filtrar por fecha
find()
fecha_evento
Campos principales
{ fecha_evento: -1 }
GET /api/metricas/eventos-por-tipo
Métrica por tipo
aggregate()
Opcional por fecha Agrupación
{ tipo_evento: 1, fecha_evento: -1 }
GET /api/metricas/eventos-por-pantalla Métrica por pantalla
aggregate()
Opcional por fecha Agrupación
{ pantalla: 1 }
GET /api/metricas/usuarios-activos
Usuarios más activos aggregate()
Fecha opcional
Agrupación por usuario
{ usuario_id: 1, fecha_evento: -1 }
DELETE /api/eventos/:id
Eliminar evento
deleteOne()
_id
No aplica
_id

===== PÁGINA 27 =====
27

Consultas del MVP funcional
• Registrar un evento
Esta consulta permite registrar la interacción generada por un usuario. Es la operación central
del sistema, ya que sin el registro de eventos no sería posible analizar el comportamiento
posterior.
-
Endpoint: POST /api/eventos
-
Consulta MongoDB:


db.eventos.insertOne({
  usuario_id: "usr_001",
  sesion_id: "ses_001",
  aplicacion_id: "app_001",
  tipo_evento: "click",
  pantalla: "home",
  fecha_evento: ISODate("2026-04-20T10:05:00Z"),
  metadata: {
    boton: "reservar",
    componente: "banner_principal",
    dispositivo: "mobile",
    navegador: "Chrome"
  }
})

===== PÁGINA 28 =====
28

• Obtener un evento por ID
-
Endpoint: GET /api/eventos/:id
-
Consulta MongoDB:

-
Índice aprovechado: Índice automático por _id.


db.eventos.findOne(
  { _id: "evt_001" },
  {
    usuario_id: 1,
    sesion_id: 1,
    aplicacion_id: 1,
    tipo_evento: 1,
    pantalla: 1,
    fecha_evento: 1,
    metadata: 1
  }
)

===== PÁGINA 29 =====
29

• Listar eventos con filtros dinámicos
Esta consulta permite combinar filtros frecuentes de análisis, como usuario, tipo de evento y
rango de fechas. Es útil para revisar el comportamiento específico de un usuario en un periodo
determinado.
-
Endpoint: GET /api/eventos?usuario_id=usr_001&tipo_evento=click&desde=2026-04-
01&hasta=2026-04-30
-
Consulta MongoDB:

-
Índice aprovechado: db.eventos.createIndex({ usuario_id: 1, tipo_evento: 1,
fecha_evento: -1 })


db.eventos.find(
  {
    usuario_id: "usr_001",
    tipo_evento: "click",
    fecha_evento: {
      $gte: ISODate("2026-04-01T00:00:00Z"),
      $lte: ISODate("2026-04-30T23:59:59Z")
    }
  },
  {
    usuario_id: 1,
    tipo_evento: 1,
    pantalla: 1,
    fecha_evento: 1,
    metadata: 1
  }
).sort({ fecha_evento: -1 })

===== PÁGINA 30 =====
30

• Actualizar metadata de un evento
Esta operación permite corregir o complementar información contextual de un evento, sin
reemplazar completamente el documento.
-
Endpoint: PATCH /api/eventos/:id
-
Consulta MongoDB:

-
Índice aprovechado: índice automático por _id.
• Eliminar un evento
Esta consulta se considera para casos administrativos, corrección de datos de prueba o
eliminación de registros no válidos. En un entorno productivo podría reemplazarse por
eliminación lógica mediante un campo estado.
-
Endpoint: DELETE /api/eventos/:id
-
Consulta MongoDB:


db.eventos.updateOne(
  { _id: "evt_001" },
  {
    $set: {
      "metadata.componente": "boton_reserva_home",
      "metadata.actualizado_en": ISODate("2026-04-20T11:00:00Z")
    }
  }
)
db.eventos.deleteOne({
  _id: "evt_001"
})

===== PÁGINA 31 =====
31

• Consultas complementarias
Consulta por usuario:
-
Endpoint: GET /api/eventos/usuario/usr_001
-
Consulta MongoDB:

-
Índice: { usuario_id: 1, fecha_evento: -1 }
Consulta por sesión:
-
Endpoint: GET /api/eventos/sesion/ses_001
-
Consulta MongoDB:

-
Índice: { sesion_id: 1 }


db.eventos.find(
  { usuario_id: "usr_001" },
  {
    tipo_evento: 1,
    pantalla: 1,
    fecha_evento: 1,
    metadata: 1
  }
).sort({ fecha_evento: -1 })
db.eventos.find(
  { sesion_id: "ses_001" },
  {
    tipo_evento: 1,
    pantalla: 1,
    fecha_evento: 1,
    metadata: 1
  }
).sort({ fecha_evento: 1 })

===== PÁGINA 32 =====
32

Consulta por tipo de evento:
-
Endpoint: GET /api/eventos?tipo_evento=click
-
Consulta MongoDB:

-
Índice: { tipo_evento: 1, fecha_evento: -1 }
Consulta por rango de fechas:
-
Endpoint: GET /api/eventos?desde=2026-04-01&hasta=2026-04-30
-
Consulta MongoDB:

-
Índice: { fecha_evento: -1 }


db.eventos.find(
  { tipo_evento: "click" },
  {
    usuario_id: 1,
    pantalla: 1,
    fecha_evento: 1,
    metadata: 1
  }
).sort({ fecha_evento: -1 })
db.eventos.find(
  {
    fecha_evento: {
      $gte: ISODate("2026-04-01T00:00:00Z"),
      $lte: ISODate("2026-04-30T23:59:59Z")
    }
  },
  {
    usuario_id: 1,
    tipo_evento: 1,
    pantalla: 1,
    fecha_evento: 1
  }
).sort({ fecha_evento: -1 })

===== PÁGINA 33 =====
33

• Consultas analíticas para producto final
Las siguientes consultas analíticas no forman parte del MVP funcional obligatorio, pero se
documentan como parte de la planificación técnica del producto final. Su objetivo es
demostrar cómo el modelo de datos puede evolucionar para responder preguntas de negocio
mediante agregaciones de MongoDB.
Conteo de eventos por tipo:
Permite identificar qué tipo de interacción ocurre con mayor frecuencia, por ejemplo
clicks, navegación, búsquedas o errores.
-
Endpoint: GET /api/metricas/eventos-por-tipo
-
Consulta MongoDB:

Eventos por pantalla:
Permite identificar las pantallas con mayor actividad, apoyando decisiones de rediseño o
mejora de experiencia de usuario.
-
Endpoint: GET /api/metricas/eventos-por-pantalla
-
Consulta MongoDB:
db.eventos.aggregate([
  {
    $group: {
      _id: "$tipo_evento",
      total_eventos: { $sum: 1 }
    }
  },
  {
    $sort: { total_eventos: -1 }
  }
])

===== PÁGINA 34 =====
34


Usuarios más activos:
Permite identificar usuarios con mayor interacción dentro del sistema y analizar
patrones de uso.
-
Endpoint: GET /api/metricas/usuarios-activos
-
Consulta MongoDB:

db.eventos.aggregate([
  {
    $group: {
      _id: "$pantalla",
      total_eventos: { $sum: 1 }
    }
  },
  {
    $sort: { total_eventos: -1 }
  }
])
db.eventos.aggregate([
  {
    $group: {
      _id: "$usuario_id",
      total_eventos: { $sum: 1 },
      ultima_actividad: { $max: "$fecha_evento" }
    }
  },
  {
    $sort: { total_eventos: -1 }
  },
  {
    $limit: 10
  }
])

===== PÁGINA 35 =====
35

Flujo de navegación por sesión:
Permite reconstruir el recorrido de un usuario durante una sesión, identificando
pantallas visitadas, acciones realizadas y posibles puntos de abandono.
-
Endpoint: GET /api/metricas/flujo-sesion/:sesion_id
-
Consulta MongoDB:

• Relaciones entre consultas e índices
La selección de índices se realiza en función de las consultas más frecuentes de la API. En
especial, se priorizan los campos usuario_id, sesion_id, tipo_evento, aplicacion_id y
fecha_evento, ya que estos permiten responder preguntas relevantes para el negocio y
mantener tiempos de respuesta aceptables en consultas analíticas básicas.
Consulta
Índice recomendado
Motivo
Eventos por
usuario
{ usuario_id: 1, fecha_evento: -1 }
Optimiza
búsqueda
y
ordenamiento por fecha
Eventos por
sesión
{ sesion_id: 1 }
Permite reconstruir el flujo de
navegación
Eventos por tipo
{ tipo_evento: 1, fecha_evento: -1 }
Mejora filtros por interacción
Eventos por
aplicación
{ aplicacion_id: 1, fecha_evento: -1
}
Permite análisis por sistema o
ambiente
Eventos por
dispositivo
{ "metadata.dispositivo": 1 }
Permite
segmentar
comportamiento por dispositivo
Filtros
combinados
{ usuario_id: 1, tipo_evento: 1,
fecha_evento: -1 }
Optimiza consultas con múltiples
condiciones


db.eventos.find(
  { sesion_id: "ses_001" },
  {
    pantalla: 1,
    tipo_evento: 1,
    fecha_evento: 1,
    metadata: 1
  }
).sort({ fecha_evento: 1 })

===== PÁGINA 36 =====
36

Justificación Técnica

Desde el punto de vista técnico, las consultas se diseñan para aprovechar los índices
definidos en el modelo de datos, evitando búsquedas completas innecesarias sobre la
colección eventos. Esto es relevante porque la cantidad de eventos puede crecer rápidamente
a medida que aumenta el número de usuarios y sesiones.
Las operaciones CRUD permiten administrar los datos principales del sistema, mientras que
las consultas avanzadas mediante agregaciones permiten transformar eventos individuales en
métricas útiles para la toma de decisiones.
Desde el punto de vista del negocio, estas consultas permiten responder preguntas como: qué
funcionalidades se usan con mayor frecuencia, qué pantallas concentran más actividad, qué
usuarios interactúan más con la plataforma, qué dispositivos predominan y cómo evoluciona
el uso de la aplicación en el tiempo.
Por esta razón, las consultas no solo cumplen una función técnica, sino que también entregan
información útil para Product Owners, analistas y equipos de desarrollo.

===== PÁGINA 37 =====
37

Arquitectura de la API
La API se diseña bajo una arquitectura REST por capas, con separación entre la entrada de
solicitudes HTTP, la lógica de negocio, el acceso a datos y los servicios transversales de
documentación, observabilidad y pruebas. Esta estructura permite mantener un sistema
ordenado, mantenible y preparado para crecer desde un MVP hacia un producto final
escalable.

El cliente, ya sea una aplicación web o móvil, envía eventos de comportamiento hacia la API
mediante solicitudes HTTPS. La API valida los datos recibidos, procesa la solicitud, registra la
información en MongoDB y entrega una respuesta estandarizada. Para el MVP funcional, la
arquitectura se concentra en la recepción, validación, almacenamiento y consulta básica de
eventos. Como parte de la arquitectura objetivo del producto final, se planifica incorporar
documentación mediante Swagger/OpenAPI 3, observabilidad con OpenTelemetry y una
estrategia de pruebas automatizadas con cobertura mínima del 80%.
Arquitectura MVP

Capa
Componente
Responsabilidad
Cliente
Web/Móvil
Envía eventos hacia la API
API REST
Controladores
Reciben solicitudes HTTP
Lógica de negocio Servicios
Validan y procesan eventos
Acceso a datos
Repositorios/DAO
Ejecutan operaciones en MongoDB
Base de datos
MongoDB Atlas
Almacena
eventos,
usuarios,
sesiones
y
aplicaciones

Arquitectura objetivo / producto final

Componente
Propósito
Swagger/OpenAPI 3
Documentar contratos de API
OpenTelemetry
Capturar trazas, métricas y logs
GitHub Actions
Automatizar pruebas y despliegues
Jest + Supertest
Validar lógica y endpoints
Coverage 80%
Definir umbral mínimo de calidad
Grafana/Jaeger/Tempo
Visualizar observabilidad

===== PÁGINA 38 =====
38


La separación por capas evita que los controladores contengan lógica excesiva. Los
controladores se enfocan en recibir solicitudes y devolver respuestas, mientras que los
servicios procesan reglas de negocio y los repositorios se encargan de interactuar con
MongoDB. Esta estructura mejora la mantenibilidad y facilita las pruebas unitarias e
integración.
Flujo de datos
El flujo principal del sistema ocurre cuando una aplicación cliente registra un evento de
comportamiento de usuario.
1. El usuario realiza una acción dentro de la aplicación, por ejemplo un clic en el botón
“Reservar”.
2. La aplicación cliente genera un objeto JSON con la información del evento.
3. El cliente envía una solicitud POST /api/eventos mediante HTTPS.
4. El controlador de eventos recibe la solicitud.
5. La API valida los campos obligatorios, como usuario_id, tipo_evento, pantalla y
fecha_evento.
6. El servicio de eventos procesa la información y normaliza la metadata.
7. El repositorio ejecuta la operación insertOne en MongoDB.
8. MongoDB almacena el documento en la colección eventos.
9. La API devuelve una respuesta 201 Created con el identificador del evento registrado.
10. En el MVP, la plataforma registra logs básicos de la solicitud. En el producto final,
OpenTelemetry podrá registrar la traza, duración de la solicitud, estado HTTP y
posibles errores.
Para consultas básicas del MVP, el flujo es similar, pero el repositorio ejecuta operaciones
find sobre MongoDB. En la evolución del producto final, las métricas podrán generarse
mediante operaciones aggregate.

===== PÁGINA 39 =====
39

Contrato de endpoints REST

Método
Ruta
Descripción
Código
exitoso
POST
/api/eventos
Registra un evento
201
GET
/api/eventos
Lista eventos con filtros
200
GET
/api/eventos/:id
Obtiene detalle de evento
200
GET
/api/eventos/usuario/:usuario_id
Lista eventos de un usuario
200
GET
/api/eventos/sesion/:sesion_id
Lista eventos de una sesión
200
PATCH
/api/eventos/:id
Actualiza metadata de evento
200
DELETE
/api/eventos/:id
Elimina evento de prueba
200
GET
/api/metricas/eventos-por-tipo
Agrupa eventos por tipo
200
GET
/api/metricas/eventos-por-pantalla
Agrupa eventos por pantalla
200
GET
/api/metricas/actividad-diaria
Muestra eventos por día
200
GET
/api/health
Verifica estado de API
200

===== PÁGINA 40 =====
40

• Contrato: POST /api/eventos
Request:

Response 201:

Errores posibles:
Código
Motivo
Respuesta esperada
400
Campos obligatorios faltantes
"Faltan campos requeridos"
401
Token inválido o ausente
"No autorizado"
422
Formato de fecha inválido
"Formato de fecha no válido"
500
Error interno
"Error interno del servidor"


{
"usuario_id": "usr_001",
"sesion_id": "ses_001",
"aplicacion_id": "app_001",
"tipo_evento": "click",
"pantalla": "home",
"fecha_evento": "2026-04-20T10:05:00Z",
"metadata": {
"boton": "reservar",
"componente": "banner_principal",
"dispositivo": "mobile",
"navegador": "Chrome"
}
}
{
  "mensaje": "Evento registrado correctamente",
  "evento_id": "evt_001",
  "estado": "creado"
}

===== PÁGINA 41 =====
41

• Contrato: GET /api/metricas/eventos-por-tipo
GET: GET /api/metricas/eventos-por-tipo?desde=2026-04-01&hasta=2026-04-30
Response 200:

Errores posibles:
Código
Motivo
400
Rango de fechas inválido
401
No autorizado
500
Error interno


{
  "periodo": {
    "desde": "2026-04-01",
    "hasta": "2026-04-30"
  },
  "metricas": [
    {
      "tipo_evento": "click",
      "total_eventos": 120
    },
    {
      "tipo_evento": "navegacion",
      "total_eventos": 85
    }
  ]
}

===== PÁGINA 42 =====
42

• Contrato: GET /api/eventos
GET /api/eventos?usuario_id=usr_001&desde=2026-04-01&hasta=2026-04-30
Response 200:

Errores posibles:
Código
Motivo
400
Rango de fechas inválido
401
No autorizado
500
Error interno


{
"total": 1,
"eventos": [
{
"evento_id": "evt_001",
"usuario_id": "usr_001",
"sesion_id": "ses_001",
"tipo_evento": "click",
"pantalla": "home",
"fecha_evento": "2026-04-20T10:05:00Z",
"metadata": {
"boton": "reservar",
"dispositivo": "mobile"
}
}
]
}

===== PÁGINA 43 =====
43

Documentación con Swagger/OpenAPI 3

La API será documentada mediante Swagger/OpenAPI 3, lo que permitirá describir de forma
estandarizada los endpoints, parámetros, esquemas de request y response, códigos de
estado y mecanismos de seguridad. Esta documentación facilitará las pruebas por parte del
equipo de desarrollo, Product Owner y posibles integraciones externas.
Swagger permitirá visualizar cada endpoint disponible, probar solicitudes desde una interfaz
web y mantener una especificación clara del comportamiento esperado de la API.
Elemento documentado
Descripción
Rutas
Endpoints disponibles, por ejemplo /api/eventos
Métodos HTTP
GET, POST, PATCH, DELETE
Parámetros
Query params, path params y body
Esquemas
Evento, Usuario, Sesión, Métrica
Respuestas
Ejemplos de respuestas 200, 201, 400, 401, 500
Seguridad
Autenticación mediante Bearer Token
Tags
Agrupación por Eventos, Métricas, Health

Observabilidad con OpenTelemetry
La observabilidad corresponde a una capacidad planificada para el producto final, no para el
MVP funcional. Su propósito es permitir el seguimiento del comportamiento interno de la API
cuando se encuentre en operación.
Elemento: Trazas
Descripción: Permiten seguir el recorrido de una solicitud desde el controlador hasta el
repositorio y MongoDB.
Ejemplo: duración completa de POST /api/eventos.
Elemento: Métricas
Descripción: Permiten medir cantidad de solicitudes, errores, latencia y eventos registrados.
Ejemplo: total de eventos insertados por minuto.
Elemento: Logs
Descripción: Permiten registrar errores de validación, problemas de conexión y respuestas
inesperadas.
Ejemplo: error al conectar con MongoDB Atlas.

===== PÁGINA 44 =====
44


Estrategia de pruebas y cobertura

La API considera una estrategia de pruebas automatizadas con una cobertura mínima del 80%.
Esta cobertura se medirá sobre líneas, funciones y ramas del código, con el objetivo de
asegurar que la lógica principal del sistema sea validada antes de cualquier despliegue.
Para la etapa de producto final se propone utilizar Jest como herramienta de pruebas unitarias
y Supertest para pruebas de integración sobre endpoints HTTP. Estas pruebas no se
consideran una funcionalidad del MVP, sino una práctica de aseguramiento de calidad
necesaria antes de operar la API en un entorno productivo.

Tipo de prueba
Herramienta
Qué valida
Unitarias
Jest
Servicios, validaciones y funciones internas
Integración
Supertest
Endpoints REST y conexión con MongoDB de
prueba
Contract testing
OpenAPI
Validator
/
Dredd
Cumplimiento del contrato Swagger
Cobertura
Jest Coverage
Mínimo 80% de líneas, funciones y ramas
Seguridad
básica
Tests de autorización
Acceso con y sin token

===== PÁGINA 45 =====
45

Integración CI/CD
La integración CI/CD corresponde a una etapa de industrialización del producto, posterior a la
validación del MVP funcional. La integración continua y despliegue continuo se realizará
mediante GitHub Actions. Cada vez que se realice un push o pull request hacia la rama
principal, el pipeline ejecutará instalación de dependencias, análisis básico, pruebas
unitarias, pruebas de integración, validación de cobertura y, si todo es correcto, el despliegue
hacia el ambiente correspondiente.
El objetivo del pipeline es evitar que código con errores, baja cobertura o contratos de API
inconsistentes llegue a producción.
Etapa CI/CD
Acción
Checkout
Descarga el código del repositorio
Install
Instala dependencias Node.js
Test unitario
Ejecuta pruebas con Jest
Test integración
Ejecuta pruebas con Supertest
Coverage
Valida cobertura mínima del 80%
Contract testing
Valida Swagger/OpenAPI
Deploy
Publica la API en Render o cloud

Justificación técnica de la arquitectura
La arquitectura propuesta permite separar responsabilidades, facilitando el mantenimiento,
las pruebas y el crecimiento del sistema. El uso de una API REST permite una comunicación
estándar entre aplicaciones cliente y el backend, mientras que MongoDB entrega flexibilidad
para almacenar eventos con metadata variable.
La incorporación de Swagger/OpenAPI 3 mejora la documentación y reduce errores de
integración, ya que los contratos quedan definidos antes del desarrollo completo.
OpenTelemetry aporta observabilidad, permitiendo detectar problemas de rendimiento,
errores y comportamiento de la API en tiempo real o mediante análisis posterior.
Finalmente, la estrategia de pruebas con cobertura mínima del 80% y bloqueo en CI/CD
asegura que la API mantenga un nivel aceptable de calidad antes de ser desplegada. Esto
resulta coherente con una solución que busca capturar información relevante para la toma de
decisiones, ya que la confiabilidad de los datos depende también de la estabilidad del sistema
que los registra.

===== PÁGINA 46 =====
46

Conclusión
El presente informe permitió planificar una solución orientada al análisis de comportamiento
de usuarios mediante el uso de una API REST y MongoDB como motor de persistencia. La
propuesta responde a una problemática concreta: la falta de visibilidad sobre las acciones
realizadas por los usuarios dentro de aplicaciones digitales.
A partir del análisis realizado, se definió un MVP funcional acotado, compuesto por el registro
de eventos, almacenamiento en MongoDB, identificación de usuario o sesión y consultas
básicas por usuario y fecha. Esta delimitación permite validar la utilidad de la solución sin
incorporar complejidad innecesaria en la primera etapa.
Además, se proyectó una evolución hacia un producto final más robusto, incorporando
métricas
agrupadas,
documentación
con
Swagger/OpenAPI,
observabilidad
con
OpenTelemetry, pruebas automatizadas, cobertura mínima del 80% y automatización CI/CD.
Estos elementos no forman parte del MVP funcional, sino que corresponden a prácticas
técnicas necesarias para mejorar la calidad, operación y escalabilidad del sistema.
Como limitación principal, el informe se mantiene en una etapa de planificación, por lo que no
se valida empíricamente el rendimiento de la API ni el comportamiento real de MongoDB bajo
altos volúmenes de eventos. Como trabajo futuro, se propone implementar la API, probar el
modelo con datos reales, validar los índices definidos y evaluar estrategias como Bucket
Pattern si el volumen de eventos aumenta considerablemente.

===== PÁGINA 47 =====
47

Referencias
Express.js. (s. f.). Express - Node.js web application framework. https://expressjs.com/
MongoDB.
(s.
f.).
Building
with
patterns:
A
summary.
https://www.mongodb.com/blog/post/building-with-patterns-a-summary
MongoDB. (s. f.). MongoDB Atlas documentation. https://www.mongodb.com/docs/atlas/
MongoDB. (s. f.). MongoDB manual. https://www.mongodb.com/docs/manual/
NestJS. (s. f.). Documentation. https://docs.nestjs.com/
OpenAPI Initiative. (s. f.). OpenAPI Specification. https://spec.openapis.org/oas/latest.html
OpenTelemetry. (s. f.). OpenTelemetry documentation. https://opentelemetry.io/docs/
