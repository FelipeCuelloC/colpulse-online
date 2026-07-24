# Data Health | ColPulse

Fecha de reporte: 2026-07-24

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
| trm | automated | ok | ok | False | 0 | 2026-07-24 | 3,219.31 COP/USD | Mantener monitoreo. | Dato disponible y validado. |
| policy_rate | automated | ok | ok | False | 0 | 2026-07-24 | 12.00% | Mantener monitoreo. | Dato disponible y validado. |
| ibr_overnight | automated | ok | ok | False | 1 | 2026-07-23 | 12.02% | Mantener monitoreo. | Dato disponible y validado. |
| colcap_monthly | automated | stale | warning | False | 53 | 2026-06-01 | 2,311.70 | Revisar fuente y actualizar antes de publicar. | Ultimo dato excede umbral de frescura de 45 dias. |
| trm_monthly_average | derived | ok | ok | False | 0 | 2026-07-24 | 3,289.82 COP/USD | Mantener monitoreo. | Dato disponible y validado. |
| trm_month_end | derived | ok | ok | False | 0 | 2026-07-24 | 3,219.31 COP/USD | Mantener monitoreo. | Dato disponible y validado. |
| ipc_yoy | dane_priority | ok | ok | False | 24 | 2026-06-30 | 6.14% | Mantener monitoreo. | Dato disponible y validado. |
| ipc_mom | dane_priority | ok | ok | False | 24 | 2026-06-30 | 0.39% | Mantener monitoreo. | Dato disponible y validado. |
| ise | dane_priority | ok | ok | False | 54 | 2026-05-31 | 129.91 | Mantener monitoreo. | Dato disponible y validado. |
| tasa_desocupacion | dane_priority | ok | ok | False | 54 | 2026-05-31 | 8.82% | Mantener monitoreo. | Dato disponible y validado. |
| exportaciones_fob | dane_priority | ok | ok | False | 54 | 2026-05-31 | 5,193,042.38 thousand_usd_fob | Mantener monitoreo. | Dato disponible y validado. |
| importaciones | dane_priority | ok | ok | False | 54 | 2026-05-31 | 6,785,281.98 thousand_usd_cif | Mantener monitoreo. | Dato disponible y validado. |
| cartera_bruta | sfc_priority | ok | ok | False | 85 | 2026-04-30 | 998,813,489,695,905.75 COP | Mantener monitoreo. | Dato disponible y validado. |
| cartera_vencida | sfc_priority | ok | ok | False | 85 | 2026-04-30 | 42,442,244,366,181.88 COP | Mantener monitoreo. | Dato disponible y validado. |
| icv | sfc_priority | ok | ok | False | 85 | 2026-04-30 | 0.04 ratio | Mantener monitoreo. | Dato disponible y validado. |
| captaciones_publico | sfc_priority | ok | ok | False | 85 | 2026-04-30 | 7,494,640,819,923.31 COP | Mantener monitoreo. | Dato disponible y validado. |
| tasa_ocupacion | dane_priority | ok | ok | False | 54 | 2026-05-31 | 59.64% | Mantener monitoreo. | Dato disponible y validado. |
| tasa_global_participacion | dane_priority | ok | ok | False | 54 | 2026-05-31 | 65.40% | Mantener monitoreo. | Dato disponible y validado. |
| brent_usd | automated | ok | ok | False | 4 | 2026-07-20 | 86.99 USD/bbl | Mantener monitoreo. | Dato disponible y validado. |
| dxy_broad | automated | ok | ok | False | 7 | 2026-07-17 | 120.53 | Mantener monitoreo. | Dato disponible y validado. |
| fed_funds | automated | ok | ok | False | 2 | 2026-07-22 | 3.63% | Mantener monitoreo. | Dato disponible y validado. |
| embi_proxy_hy | automated | ok | ok | False | 2 | 2026-07-22 | 3.04% | Mantener monitoreo. | Dato disponible y validado. |
