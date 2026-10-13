---
name: Revisión arquitectónica
about: Definición y ratificación documental, sin implementar
labels: []
---

# [AUD / REQ / SPEC] <ID estable> — <Título verificable>

**Tipo:** revisión documental / contrato / diseño / experimento / implementación futura (no autorizada por defecto)

**Estado decisional:** PENDING / PROPOSED — SELECTED / ACCEPTED según ratificación exacta
**Hallazgo:** AUD-...
**Severidad:** P0/P1/P2
**Hito:** M00.1/M00.2/M00.3/M00.4/M04...
**Dueño de bounded context:** ...
**Fuente canónica:** enlace a docs/...

## Problema observable y riesgo comercial
## Dependencias y decisiones inmutables
## Alternativas consideradas y descartadas
## Precondiciones / autorización / guardias
## Contratos (request, events, errores, idempotency keys, versionado)
## Postcondiciones e invariantes
## Escenarios normales y adversos
## Concurrencia / partición / restart / timeout / unknown
## Aislamiento tenant/store/cuenta
## Observabilidad, recuperación y escalado
## Pruebas Given/When/Then con IDs y oráculos
## Evidencia requerida (NOT_RUN ≠ VERIFIED)
## Fuera de alcance y reglas de no implementación
## Trazabilidad
REQ → AUD → ADR → SPEC → Linear → GitHub Issue → branch futura → PR → contract → test → evidence.
