# CommerceCore — Arquitectura y registro canónico

**Estado al 13/10/2026:** fase de diseño exclusivamente; M00.1 OPEN, AUD-P0-01..04 OPEN / BLOCKING. **NO se autoriza implementación ni infraestructura por existir documentación.**

## Producto
- **CommerceCore:** motor de comercio headless reutilizable, framework agnóstico de frontend, SaaS y proveedores.
- **CommerceCloud:** plataforma SaaS multiempresa con Control Plane separado.
- **eGame:** primera tienda consumidora, venta controlada de licencias digitales de videojuegos. Una segunda aplicación independiente validará reutilización.

## Empezar aquí
1. [Continuidad y recuperación](docs/07-handoff/START_HERE.md).
2. [181 decisiones históricas](docs/01-historical-baseline/R0.10_181_decisions.md) y [JSON](docs/01-historical-baseline/R0.10_181_decisions.json): 26 ACCEPTED, 155 PROPOSED — SELECTED.
3. [Registro actual de 79 decisiones y hallazgos](docs/02-decisions/status-matrix.md) y [JSON](docs/02-decisions/decision-register.json).
4. [D01-D07 ratificadas](docs/02-decisions/D01-D07-policies.md), [ratificaciones P0](docs/02-decisions/AUD-P0-ratifications.md), [ratificaciones P1](docs/02-decisions/AUD-P1-ratifications.md).
5. [Fronteras y ownership DDD](docs/03-domain/context-map.md), [riesgos](docs/04-audit/REGISTER.md), [pruebas](docs/05-tests/TEST_CATALOG.json).
6. [Roadmap](docs/06-planning/ROADMAP.md), [trazabilidad](docs/06-planning/TRACEABILITY.md) y [control de cambios](docs/00-governance/CHANGE_CONTROL.md).

## Destinos
[Linear: proyecto CommerceCore](https://linear.app/sergiotr/project/commercecore-arquitectura-decisiones-y-trazabilidad-41d0d123f4e6) · [Slack #ecommerce](https://app.slack.com/client/T0BKS9E5L21/C0C8YHEPASV)

## Regla
**Requisito → Hallazgo → ADR → Especificación → Linear Issue → GitHub Issue → Rama → PR → Contrato → Prueba → Evidencia.**

El archivo de continuidad íntegro y el DOCX histórico original permanecen en Biblioteca de ChatGPT: /CommerceCore/architecture-baselines/CommerceCore_contexto_completo_2026-10-13.zip. Los resúmenes posteriores no son un volcado literal del chat original; se explicita la procedencia. El repositorio es público: nunca subir secretos/identificadores personales sensibles.
