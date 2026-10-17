# Data Health | ColPulse

Fecha de reporte: 2026-10-17

## Resumen

- OK: 21
- En integracion: 0
- Fallidos: 0
- Sin dato en la corrida: 0
- Stale: 11
- Diferidos: 0
- Severidad crítica: 0
- Bloquean publicación: 0

## Decision operativa

No hay bloqueos para indicadores headline activos. Se puede usar la base para análisis interno de indicadores OK.

## Estado por indicador

| Indicador | Grupo V1 | Estado | Severidad | Bloquea | Frescura | Último periodo | Último valor | Acción | Nota |
|---|---|---|---|---:|---:|---|---:|---|---|
| trm | automated | ok | ok | False | 0 | 2026-10-17 | 3,174.67 COP/USD | Mantener monitoreo. | Dato disponible y validado. |
| policy_rate | automated | ok | ok | False | 2 | 2026-10-15 | 12.25% | Mantener monitoreo. | Dato disponible y validado. |
| ibr_overnight | automated | ok | ok | False | 1 | 2026-10-16 | 12.26% | Mantener monitoreo. | Dato disponible y validado. |
| colcap_monthly | automated | stale | warning | False | 46 | 2026-09-01 | 2,560.61 | Revisar fuente y actualizar antes de publicar. | Último dato excede umbral de frescura de 45 días. |
| trm_monthly_average | derived | ok | ok | False | 0 | 2026-10-17 | 3,225.10 COP/USD | Mantener monitoreo. | Dato disponible y validado. |
| trm_month_end | derived | ok | ok | False | 0 | 2026-10-17 | 3,174.67 COP/USD | Mantener monitoreo. | Dato disponible y validado. |
| ipc_yoy | dane_priority | ok | ok | False | 17 | 2026-09-30 | 6.28% | Mantener monitoreo. | Dato disponible y validado. |
| ipc_mom | dane_priority | ok | ok | False | 17 | 2026-09-30 | 0.36% | Mantener monitoreo. | Dato disponible y validado. |
| ise | dane_priority | ok | ok | False | 78 | 2026-07-31 | 130.01 | Mantener monitoreo. | Dato disponible y validado. |
| tasa_desocupacion | dane_priority | ok | ok | False | 47 | 2026-08-31 | 9.81% | Mantener monitoreo. | Dato disponible y validado. |
| exportaciones_fob | dane_priority | ok | ok | False | 47 | 2026-08-31 | 4,456,218.11 thousand_usd_fob | Mantener monitoreo. | Dato disponible y validado. |
| importaciones | dane_priority | ok | ok | False | 78 | 2026-07-31 | 7,968,133.88 thousand_usd_cif | Mantener monitoreo. | Dato disponible y validado. |
| cartera_bruta | sfc_priority | ok | ok | False | 78 | 2026-07-31 | 1,015,953,232,139,128.38 COP | Mantener monitoreo. | Dato disponible y validado. |
| cartera_vencida | sfc_priority | ok | ok | False | 78 | 2026-07-31 | 42,977,766,359,886.50 COP | Mantener monitoreo. | Dato disponible y validado. |
| icv | sfc_priority | ok | ok | False | 78 | 2026-07-31 | 0.04 ratio | Mantener monitoreo. | Dato disponible y validado. |
| captaciones_publico | sfc_priority | ok | ok | False | 78 | 2026-07-31 | 7,590,678,857,279.20 COP | Mantener monitoreo. | Dato disponible y validado. |
| tasa_ocupacion | dane_priority | ok | ok | False | 47 | 2026-08-31 | 58.10% | Mantener monitoreo. | Dato disponible y validado. |
| tasa_global_participacion | dane_priority | ok | ok | False | 47 | 2026-08-31 | 64.42% | Mantener monitoreo. | Dato disponible y validado. |
| brent_usd | automated | ok | ok | False | 3 | 2026-10-14 | 126.55 USD/bbl | Mantener monitoreo. | Dato disponible y validado. |
| dxy_broad | automated | ok | ok | False | 8 | 2026-10-09 | 121.60 | Mantener monitoreo. | Dato disponible y validado. |
| fed_funds | automated | ok | ok | False | 2 | 2026-10-15 | 3.88% | Mantener monitoreo. | Dato disponible y validado. |
| embi_proxy_hy | automated | ok | ok | False | 2 | 2026-10-15 | 3.39% | Mantener monitoreo. | Dato disponible y validado. |
| tes_cop_1y | market_package | stale | warning | False | 15 | 2026-10-02 | 12.44% | Revisar fuente y actualizar antes de publicar. | Último dato excede umbral de frescura de 10 días. |
| tes_cop_5y | market_package | stale | warning | False | 15 | 2026-10-02 | 13.08% | Revisar fuente y actualizar antes de publicar. | Último dato excede umbral de frescura de 10 días. |
| tes_10y | market_package | stale | warning | False | 15 | 2026-10-02 | 13.30% | Revisar fuente y actualizar antes de publicar. | Último dato excede umbral de frescura de 10 días. |
| tes_uvr_1y | market_package | stale | warning | False | 15 | 2026-10-02 | 4.86% | Revisar fuente y actualizar antes de publicar. | Último dato excede umbral de frescura de 10 días. |
| tes_uvr_5y | market_package | stale | warning | False | 15 | 2026-10-02 | 6.65% | Revisar fuente y actualizar antes de publicar. | Último dato excede umbral de frescura de 10 días. |
| tes_uvr_10y | market_package | stale | warning | False | 15 | 2026-10-02 | 6.84% | Revisar fuente y actualizar antes de publicar. | Último dato excede umbral de frescura de 10 días. |
| tes_slope_10_1 | market_package | stale | warning | False | 15 | 2026-10-02 | 86.00 bp | Revisar fuente y actualizar antes de publicar. | Último dato excede umbral de frescura de 10 días. |
| tes_bei_5y | market_package | stale | warning | False | 15 | 2026-10-02 | 6.03% | Revisar fuente y actualizar antes de publicar. | Último dato excede umbral de frescura de 10 días. |
| tes_bei_10y | market_package | stale | warning | False | 15 | 2026-10-02 | 6.05% | Revisar fuente y actualizar antes de publicar. | Último dato excede umbral de frescura de 10 días. |
| tes_fwd_5y5y | market_package | stale | warning | False | 15 | 2026-10-02 | 13.52% | Revisar fuente y actualizar antes de publicar. | Último dato excede umbral de frescura de 10 días. |
