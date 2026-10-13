# M00.1 — Registro de auditoría (13 hallazgos)

**El usuario aceptó la auditoría como registro y plan, no sus soluciones pendientes.** P0-01..04 son bloqueantes; P1-01..02 políticas ratificadas pero hallazgos OPEN; P1-03 propuesta NO ratificada.

| ID | Severidad | Estado | Riesgo y siguiente comprobación |
|---|---|---|---|
| AUD-P0-01 | P0 | OPEN / BLOCKING | Nueva Session vs cancelación vs liberación; neutralizar permiso de POST Stripe viejo; provider-window hipótesis |
| AUD-P0-02 | P0 | OPEN / BLOCKING | Recover Stripe unknown sin Session ID; prueba positiva, no búsquedas negativas; after_expiration.recovery |
| AUD-P0-03 | P0 | OPEN / BLOCKING | Order preexistente, captura vs autorización, Payment→Ordering Outbox/Inbox y Mongo commit |
| AUD-P0-04 | P0 | OPEN / BLOCKING | Fulfillment vs refund ya enviados; quiescence de acceso de clave y CreateRefund |
| AUD-P1-01 | P1 | OPEN | FSM Reservation 4 estados candidata, atomicidad real StockPool |
| AUD-P1-02 | P1 | OPEN | Evitar duplicidad Order/CheckoutProcess/Payment, FSM mínima no seleccionada |
| AUD-P1-03 | P1 | OPEN | Ventanas relativas/globales de nuevas admisiones propuestas sin ratificar |
| AUD-P1-04 | P1 | OPEN | Stripe Connect, métodos permitidos y captura |
| AUD-P1-05 | P1 | OPEN | Garantías Mongo, journaling/write concern/multidocument/commit ambiguo |
| AUD-P1-06 | P1 | OPEN | Protección y fulfillment multilínea sin venta parcial |
| AUD-P2-01 | P2 | OPEN | Glosario PaymentSession/Stripe Session/Attempt |
| AUD-P2-02 | P2 | OPEN | 35 minutos y dos sesiones sin validar |
| AUD-P2-03 | P2 | OPEN | Matriz única ADR/pruebas/evidencias |

## Bloqueos obligatorios
- AUD-P0-01-DISPATCH-NEUTRALIZATION PENDING / BLOCKING.
- AUD-P0-02-PROVIDER-PROOF PENDING / BLOCKING.
- AUD-P0-03 contrato, captura, Mongo y continuación Order/CheckoutProcess.
- AUD-P0-04-QUIESCENCE PENDING / BLOCKING.
- D-05-MONGO, D-05-OPS, D-04-SM, AUD-P1-02-FSM-MIN y otros estados según registry.

## Secuencia aprobada
1 AUD-P0-01 (política ratificada, cierre no).
2 AUD-P0-02 (política ratificada, cierre no).
3 AUD-P0-03 (política ratificada, cierre no).
4 AUD-P0-04 (política ratificada, cierre no).
5 Revisar FSM e invariantes: AUD-P1-01 y AUD-P1-02 política ratificada.
6 AUD-P1-03 es el siguiente hallazgo presentado, **pendiente de ratificación**; luego P1/P2 restantes.
7 Solo después del cierre documental y las dependencias consolidar M00.1-R2 con diferencia R1 conservado/modificado/descartado, PENDING, evidencias.
