# CommerceCore — Recovered Future Experiment Catalog

**148 stable IDs.** All evidence statuses are **TEST_PLANNED**, all execution statuses **NOT_RUN**, and none are VERIFIED. The 38 D05/D06/D07 scenarios are now source-reconciled from the uploaded original review tables and include expected observable outcomes. Other entries are retained from the previous reconstruction and require detailed oracle verification against the source review before implementation. AUD13 belongs to an **unratified** policy option.

| Test ID | Case | Required observable result | Source certainty |
|---|---|---|---|
| D05-T01 | Stripe response is received, process crashes before recording its result | Recover and reconcile the identifiable original external operation | SOURCE_TABLE_TRANSLATED_TO_ENGLISH |
| D05-T02 | Payments captures a successful charge, process stops before Ordering records paid | Ordering eventually applies the payment exactly once | SOURCE_TABLE_TRANSLATED_TO_ENGLISH |
| D05-T03 | The same webhook arrives again or out of order | No illegitimate financial regression or duplicated business effect | SOURCE_TABLE_TRANSLATED_TO_ENGLISH |
| D05-T04 | Two workers claim the same durable operation | One semantic commercial effect | SOURCE_TABLE_TRANSLATED_TO_ENGLISH |
| D05-T05 | MongoDB is unavailable during an externally valid charge | Preserve and recover the commercial obligation after database recovery | SOURCE_TABLE_TRANSLATED_TO_ENGLISH |
| D05-T06 | An internal financial-result message is lost | Detect and execute the pending durable handoff | SOURCE_TABLE_TRANSLATED_TO_ENGLISH |
| D05-T07 | CreateRefund returns an HTTP timeout | Never issue an uncorrelated duplicate refund; reconcile first | SOURCE_TABLE_TRANSLATED_TO_ENGLISH |
| D05-T08 | Stripe event belongs to another account or tenant | Reject attribution and prevent cross-scope mutation | SOURCE_TABLE_TRANSLATED_TO_ENGLISH |
| D05-T09 | MongoDB reports an ambiguous local write result | Re-read/reconcile; timeout is not proof the write failed | SOURCE_TABLE_TRANSLATED_TO_ENGLISH |
| D05-T10 | A process restarts after automatic retries are exhausted | Durable case persists and is escalated, not silently erased | SOURCE_TABLE_TRANSLATED_TO_ENGLISH |
| D06-T01 | Buyer double-clicks Pay concurrently | Only one commercial Session authorized and one logical result | SOURCE_TABLE_TRANSLATED_TO_ENGLISH |
| D06-T02 | Card fails within an existing open Stripe Session | Do not automatically create another commercial PaymentAttempt | SOURCE_TABLE_TRANSLATED_TO_ENGLISH |
| D06-T03 | Session expires and prior negative financial closure is proven | Allow a successor only if protected Reservation and guards remain valid | SOURCE_TABLE_TRANSLATED_TO_ENGLISH |
| D06-T04 | Stripe Session A was created but its response was lost | Investigate A; never create successor B merely due to the timeout | SOURCE_TABLE_TRANSLATED_TO_ENGLISH |
| D06-T05 | Session A is complete but its PaymentIntent is processing | Do not authorize Session B while prior money can settle | SOURCE_TABLE_TRANSLATED_TO_ENGLISH |
| D06-T06 | Late provider webhook contradicts an earlier local closure | Preserve exposure, investigate, avoid duplicate fulfillment | SOURCE_TABLE_TRANSLATED_TO_ENGLISH |
| D06-T07 | Two workers try to create successor Session B | Authorize one generation only | SOURCE_TABLE_TRANSLATED_TO_ENGLISH |
| D06-T08 | Worker crashes after authorizing B and before calling Stripe | Recover the same original external operation identity | SOURCE_TABLE_TRANSLATED_TO_ENGLISH |
| D06-T09 | Original Reservation was already released before requesting B | Reject reuse of released capacity | SOURCE_TABLE_TRANSLATED_TO_ENGLISH |
| D06-T10 | The accepted number-of-attempts limit was reached | Do not create another commercial Session absent new approved policy | SOURCE_TABLE_TRANSLATED_TO_ENGLISH |
| D06-T11 | Offer price changes between Session A and B | Accepted immutable Order snapshot remains unchanged | SOURCE_TABLE_TRANSLATED_TO_ENGLISH |
| D06-T12 | A buyer from another Store attempts to reuse an Attempt | Reject with no cross-store financial effects | SOURCE_TABLE_TRANSLATED_TO_ENGLISH |
| D06-T13 | First payment confirms while a second opportunity is requested | Deny incompatible new Session and preserve the confirmed obligation | SOURCE_TABLE_TRANSLATED_TO_ENGLISH |
| D06-T14 | Prior attempt has an unresolved refund | Do not re-collect the same obligation automatically | SOURCE_TABLE_TRANSLATED_TO_ENGLISH |
| D07-T01 | Authorized express cancellation while Stripe Session is open | Verify provider expiration and release only after safe financial reconciliation | SOURCE_TABLE_TRANSLATED_TO_ENGLISH |
| D07-T02 | Buyer submits duplicate cancellation requests | Only one effective commercial cancellation resolution | SOURCE_TABLE_TRANSLATED_TO_ENGLISH |
| D07-T03 | Cancellation competes with 3D Secure confirmation | Do not release while there is confirmed or unknown money | SOURCE_TABLE_TRANSLATED_TO_ENGLISH |
| D07-T04 | Stripe expiration request response is lost | Reconcile its actual outcome before Inventory release | SOURCE_TABLE_TRANSLATED_TO_ENGLISH |
| D07-T05 | Stripe reports the Session already expired | Reconcile all financial opportunities; this is not automatic safe release | SOURCE_TABLE_TRANSLATED_TO_ENGLISH |
| D07-T06 | Stripe reports Session not eligible for expiration | Inspect completed/processing outcomes and preserve obligation | SOURCE_TABLE_TRANSLATED_TO_ENGLISH |
| D07-T07 | Cancellation occurs while Session creation result is unknown | Do not orphan a collectible Stripe Session | SOURCE_TABLE_TRANSLATED_TO_ENGLISH |
| D07-T08 | Cancellation races with D-06 successor authorization | Exclude incompatible financial admissions conditionally | SOURCE_TABLE_TRANSLATED_TO_ENGLISH |
| D07-T09 | Provider webhooks are duplicated or out of order | No duplicate capacity release or state regression | SOURCE_TABLE_TRANSLATED_TO_ENGLISH |
| D07-T10 | MongoDB or worker crashes after requesting Session expiration | Recover exact operation identity and reconcile after restart | SOURCE_TABLE_TRANSLATED_TO_ENGLISH |
| D07-T11 | Browser arrives via cancel_url or closes a tab without authorization | Do not interpret navigation as commercial/financial cancellation | SOURCE_TABLE_TRANSLATED_TO_ENGLISH |
| D07-T12 | Actor tries to cancel a different Store's checkout | Reject authorization with no cross-store effects | SOURCE_TABLE_TRANSLATED_TO_ENGLISH |
| D07-T13 | Cancellation is requested after capture is confirmed | Preserve the paid Order's commercial obligation | SOURCE_TABLE_TRANSLATED_TO_ENGLISH |
| D07-T14 | An obsolete release command targets a newly legitimate Reservation | Reject stale identity/version and preserve valid capacity | SOURCE_TABLE_TRANSLATED_TO_ENGLISH |
| AUD01-T01 | ProtectReservation contra expiración inicial | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD01-T02 | Autorización antigua rechazada tras barrera | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD01-T03 | Cancelación simultánea con nuevo intento | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD01-T04 | Worker suspendido conserva exposición | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD01-T05 | Session creada después de solicitud de cancelación | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD01-T06 | 3DS confirmado durante expire | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD01-T07 | Liberación duplicada solo una transición | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD01-T08 | Permiso liberación con versión o reserva equivocada | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD01-T09 | Caída tras sello financiero antes de Inventory | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD01-T10 | Dos workers con comando financiero obsoleto | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD01-T11 | Outcome externo desconocido prolongado | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD01-T12 | Separar Payments y mantener invariantes | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD01-DT01 | Worker suspendido antes de habilitar despacho | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD01-DT02 | Worker suspendido después habilitar pero antes POST | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD01-DT03 | Lease caduco y worker revivido | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD01-DT04 | POST llega a Stripe sin respuesta | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD01-DT05 | Proceso termina tras enviar POST | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD01-DT06 | POST repetido tras posible purga de 24h de key | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD01-DT07 | Session expirada y POST viejo crea otra | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD01-DT08 | Cancelación contra habilitación de despacho | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD01-DT09 | Stripe outage con operación UNKNOWN | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD01-DT10 | Hipótesis límite expires_at inmutable test mode | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD02-T01 | POST crea Session y respuesta perdida | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD02-T02 | Repetición con key original conservada | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD02-T03 | POST original no ejecutado y repetición que puede crear | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD02-T04 | 500 guardado bajo clave idempotente | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD02-T05 | Session sin PaymentIntent conocido | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD02-T06 | List Sessions por intervalo y correlación | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD02-T07 | Search PaymentIntent eventual negativo | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD02-T08 | Webhook tardío después de consulta negativa | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD02-T09 | Dos Sessions candidatas y misma correlación | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD02-T10 | Key posiblemente purgada y no retry inseguro | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD02-T11 | Sesión expirada pero trabajador viejo ejecutable | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD02-T12 | Stripe indisponible horas y escalado | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD02-T13 | Tenant/account/mode incorrecto | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD02-T14 | Cancelación con CreateSession unknown | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD02-T15 | Caída antes persistir Session ID recuperado | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD02-T16 | Prueba ventana expires_at absoluto | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD03-T01 | Stripe confirma con Ordering caído | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD03-T02 | Payments cae después de persistir hecho | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD03-T03 | Ordering ACK perdido tras aplicar transición | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD03-T04 | Dos webhooks por un mismo cobro | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD03-T05 | Eventos externos desordenados | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD03-T06 | PaymentAttempt conocido, Order inaccesible | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD03-T07 | Cobro sin Order acreditable | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD03-T08 | Order PENDING_PAYMENT aunque cobro confirmado | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD03-T09 | Cobro tardío después cancelación | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD03-T10 | Monto/moneda contra snapshot | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD03-T11 | Crash al persistir Order y continuación | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD03-T12 | Mongo commit local desconocido | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD03-T13 | Dos workers entregan PaymentConfirmed | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD03-T14 | Otro tenant/cuenta atribución prohibida | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD03-T15 | requires_capture no significa captura | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD03-T16 | Extraer Payments sin escrituras cruzadas | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD04-T01 | Dos workers autorizan ramas distintas | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD04-T02 | Licencia entregada, respuesta perdida | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD04-T03 | CreateRefund enviada, respuesta perdida | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD04-T04 | Worker Fulfillment suspendido antes exponer | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD04-T05 | Comando de entrega obsoleto | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD04-T06 | Refund pending mientras reaparece stock | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD04-T07 | Refund confirmado con webhook duplicado | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD04-T08 | Refund failed/unknown y obligación abierta | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD04-T09 | Licencia ya expuesta antes de refund | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD04-T10 | Dos líneas, una sin asignar antes exposición | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD04-T11 | Exposición parcial excepcional | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD04-T12 | Caída tras seleccionar rama, antes comando | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD04-T13 | Caída tras habilitar efecto sin resultado | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD04-T14 | Cross-tenant/account rechazado | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD04-T15 | Eventos distintos del mismo Refund | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD04-T16 | Extraer Payments/Fulfillment manteniendo invariantes | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD11-T01 | Dos reservas última unidad | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD11-T02 | TTL inicial contra transición protección | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD11-T03 | Stripe abierta tras quince minutos | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD11-T04 | Stripe expirada pero resultado financiero unknown | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD11-T05 | Segundo intento sin resetear TTL | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD11-T06 | Liberación contra nueva sesión | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD11-T07 | Commit repetido tras respuesta perdida | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD11-T08 | Worker viejo intenta liberar committed | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD11-T09 | Reactivar RELEASED imposible | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD11-T10 | Refund no vuelve committed a available | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD11-T11 | Pedido multilínea stock insuficiente | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD11-T12 | Crash escritura StockPool/Reservation | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD12-T01 | Payment paid y Order pendiente | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD12-T02 | Saga recibe mismo evento duplicado | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD12-T03 | Dos eventos mismo cobro | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD12-T04 | Ordering cae antes ACK | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD12-T05 | Refund unknown no compensa Order | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD12-T06 | Refund confirmado conserva cobro histórico | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD12-T07 | Cancelación contradice cobro tardío | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD12-T08 | Saga stale no abre otro PaymentAttempt | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD12-T09 | Proyección stale no autoriza efectos | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD12-T10 | Nuevos hechos no borran histórico | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD12-T11 | Evento otro tenant/store | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD12-T12 | Extraer Payments sin escrituras cruzadas | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD13-T01 | Reintento dentro de ventana relativa | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD13-T02 | Reintento vencida ventana relativa | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD13-T03 | Ventana relativa vigente pero global vencida | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD13-T04 | Deadline global con Stripe Session abierta | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD13-T05 | Reintento y cierre concurrentes | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD13-T06 | Ventana expira mientras Payments caído | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD13-T07 | Cobro confirmado tras plazo de admisión | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD13-T08 | UNKNOWN supera todos los deadlines | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD13-T09 | Segundo intento con Reservation protegida | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD13-T10 | Reserva liberada y UI presenta ventana | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD13-T11 | Configuración cambia a mitad checkout | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD13-T12 | Varios checkouts una intención | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD13-T13 | Compra adicional legítima | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD13-T14 | Deadline con comunicación pendiente | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD13-T15 | Crash después expirar ventana antes sellar | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
| AUD13-T16 | Reserva anómala detectable/escalable | SOURCE-REVIEW: confirm exact acceptance oracle against the source table before implementation | RECONSTRUCTED_FROM_CONVERSATION |
