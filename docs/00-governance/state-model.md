# Gobierno de estados y evidencia

## Decisión
- `ACCEPTED`: ratificación explícita del usuario, con sus reservas; no convierte subdecisiones pendientes en aceptadas.
- `PROPOSED — SELECTED`: alternativa elegida como propuesta, no ratificada formalmente.
- `PENDING`: decisión aún no tomada.
- `DEFERRED`: aplazada deliberadamente.
- `REJECTED` / `SUPERSEDED`: alternativas descartadas o reemplazadas con causa y vínculo.
- Los hallazgos usan además `OPEN`, `BLOCKING` y resolución documental vinculada a subdecisiones; aprobar política no implica cerrar hallazgo.

## Evidencia
`NOT_EVALUATED`, `SPECIFIED`, `TEST_PLANNED`, `VERIFIED`, `FAILED`, `NOT_APPLICABLE`. No atribuir `VERIFIED` sin ejecución, identificadores de pruebas y resultados preservados.

## Precedencia
(1) Ratificaciones explícitas posteriores; (2) 26 decisiones fundacionales R0.1/R0.2; (3) selecciones históricas R0.3–R0.10; (4) propuestas técnicas posteriores no ratificadas. Conservación del histórico sin sobreescritura; toda revisión añade ADR y enlaza a decisión original.

## Reglas de gestión
Cambiar una ratificación exige nueva aprobación expresa. El estado documental es distinto de implementación, verificación y progreso de issue. No crear rama, deploy ni código sin autorización separada.
