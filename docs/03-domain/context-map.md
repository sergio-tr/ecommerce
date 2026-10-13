# Visión y bounded contexts de CommerceCore

**CommerceCore** núcleo headless reusable; **CommerceCloud** SaaS/control plane; **eGame** vertical inicial de claves digitales. Prioridades: aprendizaje empresarial de diseño, corrección, DDD, hexagonal, SOLID, Ports/Adapters, contratos antes de implementación, testabilidad, auditoría y extracción futura. Multiempresa: tenants, brands, stores, tiendas con catálogos compartidos o propios; aislamiento en cada autorización de objeto y operación.

| Contexto | Fuente de verdad | Frontera innegociable |
|---|---|---|
| Catalog | Producto, variante, listing y offer | No controla stock ni precio de pedido después de compra |
| Cart | Carrito durable incluido invitado | No cobra, libera ni compromete stock |
| Pricing | Reglas de precio, moneda e impuestos por puerto | El snapshot aceptado e inmutable se conserva en Order |
| Inventory | StockPool, cuota, Reservation, compromiso y liberación | Nunca infiere pago desde navegador/TTL |
| Ordering | Order, snapshot/obligación/resolución y CheckoutProcess saga | No es fuente del dinero ni puede escribir Payment |
| Payments | Payment, PaymentAttempt, Refund, operaciones Stripe, evidence, Inbox/Outbox | No escribe Order ni Inventory ni entrega licencias |
| Fulfillment | DigitalLicense, asignación única, acceso y exposición irreversible | No resuelve refund ni inventa capacidad |
| Identity & Access | Autenticación y políticas autorizativas | Token de Stripe no acredita propiedad del pedido |
| CommerceCloud | Control Plane, tenancy, store policies | No reemplaza reglas transaccionales de CommerceCore |
| BFF/Admin/Storefront | Composición de consultas y UX | Proyecciones stale jamás habilitan efecto irreversible |
| Notifications | Avisos de compra y seguimiento | No incluir licencia en email/log/event |

Reglas: OrderExists no implica fondos capturados ni derecho incondicional a prestación. PaymentAttempt es oportunidad cobrable comercial, no cada retry técnico. CheckoutProcess puede señalar PAYMENT_CONFIRMED solo como hecho Payments incorporado. Refund pending no significa compensación completada. Reservation COMMITTED es capacidad comercial, no licencia asignada ni revelada. Una clave potencialmente expuesta fuera del perímetro es irreversible a efectos de auditoría aunque falte confirmación del comprador.

## Topología y tecnologías históricamente seleccionadas
Core NestJS modular, frontend Angular de referencia y API/SDK headless; monorepo Nx/pnpm y paquetes separados core/cloud/contracts/sdk/frontend. MongoDB como fuente persistente para ecommerce, driver oficial tras repositorios. Workers durable + Inbox/Outbox previos a Kafka; Kafka después como transporte eventual M05. Stripe Checkout hosted con Connect en test mode, versión/terceros seleccionables y puertos agnósticos. Keycloak OIDC/RBAC/ABAC y seguridad por objeto/tenant. Observabilidad OpenTelemetry y Prometheus/Grafana en hitos posteriores; infraestructura Docker Compose/Kubernetes/Terraform por roadmap histórico. Los elementos R0.3-R0.10 son PROPOSED — SELECTED salvo ratificaciones individuales posteriores.

## Flujos base
Quote/snapshot aceptado → Order durable → Reservation en Inventory → PAYMENT_PROTECTED acreditada → PaymentAttempt autorizado con expediente durable → Stripe Checkout → Inbox verificado + conciliación → Payment confirmado → Ordering incorpora y continúa saga → Inventory COMMITTED → Fulfillment asigna licencia exclusiva y habilita acceso controlado → obligación resuelta o rama de reparación D-04.

Fallo: UNKNOWN financiero mantiene stock y exclusión de nuevos cobros; expiración de sesión por sí sola no libera; cancelación expresa inicia barrera durable y reconciliación; imposible fulfillment: reparar primero, no refund si podría existir entrega irreversible; refund confirmado se incorpora sin borrar cobro histórico.

## Extracción sin redefinir invariantes
Monolito modular primero; contratos y ownership privado desde día uno. Extracción progresiva de Catalog, Payments, Inventory, Ordering con métricas antes/después. Nada depende de transacción distribuida Stripe/Mongo; atomicidad solo por dueño, coordinación durable eventualmente consistente, reenvíos idempotentes.
