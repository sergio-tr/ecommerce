# Gestión del conocimiento y trazabilidad integral

## Fuente de verdad
GitHub docs/ (ADRs, requisitos, context map, contratos, matrículas de pruebas y registro versionado) es el baseline normativo desde la primera publicación verificada. Linear gestiona backlog, responsable, dependencias y estado de planificación; GitHub Issues enlazan el trabajo atómico y futuras ramas/PR; Slack comunica y enlaza, **no sustituye ratificaciones normativas**.

## Cadena
REQ → AUD/RISK → ADR → SPEC/CONTRACT → LINEAR ISSUE → GITHUB ISSUE → BRANCH → PR → TEST → EVIDENCE.

Ninguna fuente puede cambiar el estado de otra por inferencia. Ej: Linear Done no equivale a ADR ACCEPTED ni a TEST VERIFIED. Un commit no ratifica política. Una historia de Slack no es fuente de verdad contractual hasta que se formalice.

## Formato de issue atómica
- ID estable de requisito/issue, problema y outcome demostrable.
- Bounded context propietario y límites de escritura.
- Decisiones ratificadas aplicables, subdecisiones pendientes; enlaces al ADR y contrato exactos.
- Precondiciones/poscondiciones, cambios autorizados de estado, versiones y comandos idempotentes.
- Flujos normal y adversos, concurrencia, restart, errores, unknown, dedup, aislamiento multi-tenant.
- No funcionales: seguridad, durabilidad, observabilidad y recuperabilidad.
- AC independientes Given/When/Then; tests con IDs y evidencia exigida.
- Impacto, dependencias, no-go, rollback/compensación y DoD.
- GitHub issue enlazado en Linear; nomenclatura branch feature/<linear-id>-<slug> solo tras autorización de implementación.

## Proceso de cambio
1. Elaborar propuesta y alternativas; registrar REQ/RISK.
2. Usuario ratifica política con reservas; actualizar estado de ID exacto.
3. Revisar subdecisiones/guards por separado; no aprobar defaults silenciosos.
4. Cambiar registro JSON y narrativa en un mismo PR documental.
5. Mantener historical baseline inmutable y añadir ADR de supersession cuando proceda.
6. Actualizar Linear (planning), GitHub Issue (contrato implementable) y Slack (notificación de decisión).
7. Solo ejecutar pruebas reales cuando se autorice; publicar evidencia con commit/config/test mode y hashes.

## Protección
Repositorio público: no publicar secrets Stripe, tokens de comprador, datos privados, claves de licencia ni registros reales de cliente. En archivos originales, revisar sensibilidad antes de exponer. La copia íntegra ZIP conserva DOCX histórico en Biblioteca.
