# Plan de hitos y criterios de salida

Las fechas no están ratificadas. El maestro R0.10 gobierna selecciones técnicas históricas. Este plan NO autoriza implementación.

## M00 — Diseño y baseline documental
Requisitos, ADR, context map, políticas, contratos, máquinas de estados, riesgos, DoD y experimentos. No ejecutables.
- **M00.1:** reserva/Stripe/obligación/refund, Inbox/Outbox y recuperación. D-01..07 ACCEPTED; cuatro P0 OPEN/BLOCKING; P1/P2 aún en revisión. No generar M00.1-R2 final hasta cierre P0 y contratos mínimos.
- **M00.2:** Inventory StockPool/Reservation, pools compartidos/cuotas, conservación capacidad y asignación exclusiva de DigitalLicense; preparación integral de pedido y frontera de exposición.
- **M00.3:** guest checkout, claim/verificación, expiración, RBAC/ABAC, OIDC, cancelación segura para invitado y cross-tenant.
- **M00.4:** context map transversal y contratos/errores/eventos/versiones para futuras extracciones.

## M01–M09
Según baseline heredada: M01 fundaciones monorepo Nx/pnpm NestJS, Angular shell, CI y Compose; construir solo con futura autorización. Hitos intermedios cubren tenancy, catálogo/precios, vertical transaccional M04 con Stripe test mode+Mongo Inbox/Outbox, Kafka M05 como transporte, compatibilidad SDK/API, extracciones M07, operaciones cloud/Kubernetes y validaciones de independencia. Consultar la sección de roadmap en el documento R0.10 para nombres exactos; esta síntesis no los sustituye.

## Backlog de preparación documental
P0: neutralización dispatch Stripe; recuperación no Session ID; contrato Payment↔Ordering y captura; quiescence Fulfillment/Refund. P1: modelo Reservation y atomicidad StockPool; Order/CheckoutProcess/Payment; ventanas D06 sin ratificar; Connect/captura; persistencia Mongo; all-or-nothing multilínea. P2: glosario, parámetros y matriz de evidencia.

## Gates de cierre
- ADR de alternativas con ratificación expresa y efectos.
- Estados de decisiones/subdecisiones conservados, sin promoción implícita.
- Contratos de autoridad, versiones, idempotencia, errores y recuperación especificados.
- Matriz reproducible de carreras y pruebas TEST_PLANNED, sin afirmar VERIFIED.
- Aislamiento tenant/store/cuenta.
- M00.1-R2 indicará diferencias frente R1 solo donde existe evidencia; R1 no versionada, diff formal no disponible todavía.
