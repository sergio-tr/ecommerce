# Control formal de cambios y disciplina documental

1. Registrar contexto, riesgo, alternativas con consecuencias, recomendación y experimentos.
2. Ratificar de manera explícita **solo** ID concretos; registrar reservas del usuario de forma rastreable.
3. Un hallazgo puede quedar OPEN/BLOCKING aunque su política asociada esté ACCEPTED. Un resultado experimental TEST_PLANNED no equivale a VERIFIED. Nunca se promocionan decisiones R0.3–R0.10 en lote.
4. Para cada cambio, modificar en la misma revisión documental registro JSON, narrativa, ADR y vínculos de requisitos, especificación, issue y prueba. Prohibido sobrescribir histórico sin ADR de reemplazo.
5. Para M00.1-R2 futura: comparación R1 conservado/modificado/descartado, guardias/contratos, fuente, decisiones pendientes y experimentos. **R1 no tiene versión archivada independiente**, por lo que no inventar diff formal.
6. Auditorías sobre seguridad vs progreso: desconocido no es resultado negativo; TTL/timeout/lease no son evidencia de inexistencia de cobro ni exposición de licencia.
7. Cualquier cambio en Stripe Connect, política captura, recuperación de Session, subdecisiones FSM e infraestructura requiere discusión y estado propios.
8. GitHub docs es canónico una vez versionado; Linear refleja planificación; Slack avisos de revisión. Evidencia debe enlazar commit y pruebas observables.
9. No añadir código, prototipo, CI, despliegue ni infraestructura sin autorización explícita nueva del usuario.
10. Antes de publicar material en el repositorio **público**, revisar secretos, datos personales, licencias y tokens.
