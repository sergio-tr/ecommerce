# Estado decisional de CommerceCore (corte 2026-10-13)

**Distinción:** una propuesta no equivale a ratificación; una política aceptada no cierra el hallazgo original; todos los experimentos están planificados y sin verificación. Matriz posterior al histórico de 181.

| Identificador | Estado | Resumen |
|---|---|---|
| D-01 | ACCEPTED | Reserva 15 minutos para iniciar checkout; protección durable antes de Stripe; Commit tras cobro verificado; liberar por prueba negativa segura |
| D-02 | ACCEPTED | Session Stripe configurable/versionada con expires_at real; sin recuperación automática inicial |
| D-03 | ACCEPTED | Stripe Checkout hosted tarjetas y 3DS; sin pagos diferidos |
| D-04 | ACCEPTED | Cobro crea obligación; recuperación o refund completo si imposible cumplir sin entrega parcial |
| D-05 | ACCEPTED | Inbox verificado; Outbox local atómico; intentos externos previos y saga recuperable sin Kafka M04 |
| D-06 | ACCEPTED | PaymentAttempts comerciales secuenciales limitados y exclusividad cobrable |
| D-07 | ACCEPTED | Cancelación expresa autorizada; expiración Session open y conciliación antes liberación |
| D-01-SM | PROPOSED — SELECTED | Reservation RESERVED/PAYMENT_PROTECTED/COMMITTED/RELEASED |
| D-02-P01 | PROPOSED — SELECTED | 35 minutos duración candidata |
| D-03-WALLET | DEFERRED | Wallets Apple Pay/Google Pay después |
| D-03-LINK | PENDING | Stripe Link |
| D-03-CONFIG | PENDING | Restricción métodos efectiva |
| D-03-CAPTURE | PENDING | Modo de captura; alias de auditoría no ratificado |
| D-04-EXCL | ACCEPTED | Exclusión fulfillment/refund incompatibles |
| D-04-SM | PROPOSED — SELECTED | FSM resolución |
| D-04-P01 | PENDING | Plazos reparación |
| D-04-CONNECT | PENDING | Refunds Connect |
| D-05-INBOX | ACCEPTED | Webhook verificado persist-before-2xx |
| D-05-OUTBOX | ACCEPTED | Trabajo saliente atómico local |
| D-05-RECOVERY | ACCEPTED | Saga durable recuperable |
| D-05-IMPL | PROPOSED — SELECTED | Materialización Inbox/Outbox/polling |
| D-05-CONCURRENCY | PENDING | Leases/fencing físicos |
| D-05-MONGO | PENDING | Transacciones/write concern/journal/commit ambiguo |
| D-05-OPS | PENDING | Polling/reintentos/alertas |
| D-06-EXCL | ACCEPTED | Una oportunidad cobrable simultánea por obligación |
| D-06-P01 | PROPOSED — SELECTED | Dos sesiones máximo candidato |
| D-06-SM | PROPOSED — SELECTED | FSM secuencial |
| D-06-OPS | PENDING | Antifraude/limitación |
| D-06-RETRY-WINDOW | PENDING | Ventana nuevo intento |
| D-06-INTENT | PENDING | Correlación entre checkouts |
| D-07-EXCL | ACCEPTED | Cancelación bloquea nueva admisión incompatible |
| D-07-SM | PROPOSED — SELECTED | FSM cancelación |
| D-07-CONCURRENCY | PENDING | Carreras cancelación/despacho |
| D-07-AUTH | PENDING | Cancelación checkout invitado |
| D-07-OPS | PENDING | Intervalos/reintentos/escalado |
| AUD-P0-01-DIR | ACCEPTED | Admisión versionada, cierre durable, liberación condicional |
| AUD-P0-01-DISPATCH-POLICY | ACCEPTED | Despacho habilitado potencialmente ejecutable hasta cierre acreditado |
| AUD-P0-01-DISPATCH-NEUTRALIZATION | PENDING / BLOCKING | Neutralizar POST Stripe tardíos |
| AUD-P0-01-DISPATCH-PROVIDER-WINDOW | PENDING | expires_at absoluto solo hipótesis |
| AUD-P0-01-PROTOCOL | PROPOSED — SELECTED | Protocolo intercontexto |
| AUD-P0-02-RECOVERY-POLICY | ACCEPTED | Reconciliación multicapa; no inferir ausencia de búsqueda negativa |
| AUD-P0-02-PROTOCOL | PROPOSED — SELECTED | Flujo concreto recuperación |
| AUD-P0-02-PROVIDER-PROOF | PENDING / BLOCKING | Prueba proveedor Session ID desconocido |
| AUD-P0-02-OPS | PENDING | Operación/escalado |
| AUD-P0-03-OBLIGATION-POLICY | ACCEPTED | Order durable previo; distinción prestación exigible |
| AUD-P0-03-PROPAGATION | ACCEPTED | Pagos y propagación atómica local, recepción idempotente |
| AUD-P0-03-CONTRACT | PROPOSED — SELECTED | Contrato semántico conceptual |
| AUD-P0-03-SM | PROPOSED — SELECTED | FSM obligación |
| AUD-P0-03-IMPL | PENDING | Persistencia/transporte |
| AUD-P0-03-CAPTURE | PENDING | Autorizado vs captured |
| AUD-P0-04-EXCLUSION-POLICY | ACCEPTED | Una resolución comercial incompatible a la vez |
| AUD-P0-04-EFFECT-HANDOFF | PROPOSED — SELECTED | Despacho controlado de efectos |
| AUD-P0-04-QUIESCENCE | PENDING / BLOCKING | Neutralización efectos de entrega/refund |
| AUD-P0-04-SM | PROPOSED — SELECTED | FSM reparación |
| AUD-P0-04-IMPL | PENDING | Materialización |
| AUD-P1-01-FSM-POLICY | ACCEPTED | FSM de cuatro estados como candidata; StockPool aún sin modelo atómico |
| AUD-P1-02-OWNERSHIP-POLICY | ACCEPTED | Autoridades por bounded context |
| AUD-P1-02-COORDINATION-POLICY | ACCEPTED | CheckoutProcess saga durable no fuente financiera |
| AUD-P1-02-FSM-MIN | PENDING | No existe FSM mínima seleccionada |
| AUD-P1-02-CONTRACT | PROPOSED — SELECTED | Contrato conceptual de coordinación |
| AUD-P1-02-IMPL | PENDING | Persistencia efectiva |
| AUD-P1-03-WINDOW-POLICY | PROPOSED — NOT RATIFIED | Doble límite comercial, NO ratificado |
| AUD-P1-03-SAFE-RETENTION | PROPOSED — NOT RATIFIED | Retención segura propuesta, NO ratificada independientemente |
| AUD-P1-03-WINDOW-VALUES | PENDING | Valores ventanas |
| AUD-P1-03-PROTOCOL | PROPOSED — NOT RATIFIED | Protocolo doble ventana, NO ratificado |
| AUD-P1-03-OPS | PENDING | Operación límites |
| AUD-P0-01 | OPEN / BLOCKING | Exclusión financiera y liberación |
| AUD-P0-02 | OPEN / BLOCKING | Recuperación externa sin Session ID |
| AUD-P0-03 | OPEN / BLOCKING | Obligación cobrada vs Ordering caído |
| AUD-P0-04 | OPEN / BLOCKING | Fulfillment y refund ya en vuelo |
| AUD-P1-01 | OPEN | Reservation R1 vs D-01-SM |
| AUD-P1-02 | OPEN | Autoridad Order/CheckoutProcess/Payments |
| AUD-P1-03 | OPEN / NOT RATIFIED | Ventanas comerciales pendiente ratificación |
| AUD-P1-04 | OPEN | Stripe Connect/captura/config métodos |
| AUD-P1-05 | OPEN | Atomicidad física Mongo |
| AUD-P1-06 | OPEN | Protección y entrega multilínea |
| AUD-P2-01 | OPEN | Glosario |
| AUD-P2-02 | OPEN | 35 minutos y 2 sesiones sin probar |
| AUD-P2-03 | OPEN | Trazabilidad pruebas dispersa |

AUD-P1-03 fue presentado al usuario pero no ratificado. AUD-P1-02-FSM-MIN es PENDING, expresamente corregido por el usuario.
