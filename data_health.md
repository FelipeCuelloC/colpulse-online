# Data Health | ColPulse

Fecha de reporte: 2026-09-19

## Resumen

- OK: 21
- En integracion: 0
- Fallidos: 0
- Sin dato en la corrida: 0
- Stale: 1
- Diferidos: 0
- Severidad critica: 0
- Bloquean publicacion: 0

## Decision operativa

No hay bloqueos para indicadores headline activos. Se puede usar la base para analisis interno de indicadores OK.

## Estado por indicador

| Indicador | Grupo V1 | Estado | Severidad | Bloquea | Frescura | Ultimo periodo | Ultimo valor | Accion | Nota |
|---|---|---|---|---:|---:|---|---:|---|---|
| trm | automated | ok | ok | False | 0 | 2026-09-19 | 3,192.92 COP/USD | Mantener monitoreo. | Dato disponible y validado. |
| policy_rate | automated | ok | ok | False | 1 | 2026-09-18 | 12.00% | Mantener monitoreo. | Dato disponible y validado. |
| ibr_overnight | automated | ok | ok | False | 1 | 2026-09-18 | 12.00% | Mantener monitoreo. | Dato disponible y validado. |
| colcap_monthly | automated | stale | warning | False | 49 | 2026-08-01 | 2,436.94 | Revisar fuente y actualizar antes de publicar. | Ultimo dato excede umbral de frescura de 45 dias. |
| trm_monthly_average | derived | ok | ok | False | 0 | 2026-09-19 | 3,126.36 COP/USD | Mantener monitoreo. | Dato disponible y validado. |
| trm_month_end | derived | ok | ok | False | 0 | 2026-09-19 | 3,192.92 COP/USD | Mantener monitoreo. | Dato disponible y validado. |
| ipc_yoy | dane_priority | ok | ok | False | 19 | 2026-08-31 | 6.25% | Mantener monitoreo. | Dato disponible y validado. |
| ipc_mom | dane_priority | ok | ok | False | 19 | 2026-08-31 | 0.39% | Mantener monitoreo. | Dato disponible y validado. |
| ise | dane_priority | ok | ok | False | 50 | 2026-07-31 | 130.01 | Mantener monitoreo. | Dato disponible y validado. |
| tasa_desocupacion | dane_priority | ok | ok | False | 50 | 2026-07-31 | 8.78% | Mantener monitoreo. | Dato disponible y validado. |
| exportaciones_fob | dane_priority | ok | ok | False | 50 | 2026-07-31 | 4,690,713.55 thousand_usd_fob | Mantener monitoreo. | Dato disponible y validado. |
| importaciones | dane_priority | ok | ok | False | 81 | 2026-06-30 | 6,775,762.73 thousand_usd_cif | Mantener monitoreo. | Dato disponible y validado. |
| cartera_bruta | sfc_priority | ok | ok | False | 50 | 2026-07-31 | 1,015,953,232,139,128.38 COP | Mantener monitoreo. | Dato disponible y validado. |
| cartera_vencida | sfc_priority | ok | ok | False | 50 | 2026-07-31 | 42,977,766,359,886.50 COP | Mantener monitoreo. | Dato disponible y validado. |
| icv | sfc_priority | ok | ok | False | 50 | 2026-07-31 | 0.04 ratio | Mantener monitoreo. | Dato disponible y validado. |
| captaciones_publico | sfc_priority | ok | ok | False | 50 | 2026-07-31 | 7,590,678,857,279.20 COP | Mantener monitoreo. | Dato disponible y validado. |
| tasa_ocupacion | dane_priority | ok | ok | False | 50 | 2026-07-31 | 59.76% | Mantener monitoreo. | Dato disponible y validado. |
| tasa_global_participacion | dane_priority | ok | ok | False | 50 | 2026-07-31 | 65.51% | Mantener monitoreo. | Dato disponible y validado. |
| brent_usd | automated | ok | ok | False | 4 | 2026-09-15 | 130.80 USD/bbl | Mantener monitoreo. | Dato disponible y validado. |
| dxy_broad | automated | ok | ok | False | 8 | 2026-09-11 | 118.21 | Mantener monitoreo. | Dato disponible y validado. |
| fed_funds | automated | ok | ok | False | 2 | 2026-09-17 | 3.88% | Mantener monitoreo. | Dato disponible y validado. |
| embi_proxy_hy | automated | ok | ok | False | 2 | 2026-09-17 | 2.85% | Mantener monitoreo. | Dato disponible y validado. |
