# Data Health | ColPulse

Fecha de reporte: 2026-10-30

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
| trm | automated | ok | ok | False | 0 | 2026-10-30 | 3,166.91 COP/USD | Mantener monitoreo. | Dato disponible y validado. |
| policy_rate | automated | ok | ok | False | 0 | 2026-10-30 | 12.25% | Mantener monitoreo. | Dato disponible y validado. |
| ibr_overnight | automated | ok | ok | False | 0 | 2026-10-30 | 12.24% | Mantener monitoreo. | Dato disponible y validado. |
| colcap_monthly | automated | stale | warning | False | 59 | 2026-09-01 | 2,560.61 | Revisar fuente y actualizar antes de publicar. | Último dato excede umbral de frescura de 45 días. |
| trm_monthly_average | derived | ok | ok | False | 0 | 2026-10-30 | 3,199.44 COP/USD | Mantener monitoreo. | Dato disponible y validado. |
| trm_month_end | derived | ok | ok | False | 0 | 2026-10-30 | 3,166.91 COP/USD | Mantener monitoreo. | Dato disponible y validado. |
| ipc_yoy | dane_priority | ok | ok | False | 30 | 2026-09-30 | 6.28% | Mantener monitoreo. | Dato disponible y validado. |
| ipc_mom | dane_priority | ok | ok | False | 30 | 2026-09-30 | 0.36% | Mantener monitoreo. | Dato disponible y validado. |
| ise | dane_priority | ok | ok | False | 60 | 2026-08-31 | 125.65 | Mantener monitoreo. | Dato disponible y validado. |
| tasa_desocupacion | dane_priority | ok | ok | False | 30 | 2026-09-30 | 8.63% | Mantener monitoreo. | Dato disponible y validado. |
| exportaciones_fob | dane_priority | ok | ok | False | 60 | 2026-08-31 | 4,456,218.11 thousand_usd_fob | Mantener monitoreo. | Dato disponible y validado. |
| importaciones | dane_priority | ok | ok | False | 60 | 2026-08-31 | 7,702,463.50 thousand_usd_cif | Mantener monitoreo. | Dato disponible y validado. |
| cartera_bruta | sfc_priority | ok | ok | False | 60 | 2026-08-31 | 1,022,068,341,061,803.12 COP | Mantener monitoreo. | Dato disponible y validado. |
| cartera_vencida | sfc_priority | ok | ok | False | 60 | 2026-08-31 | 44,024,620,901,236.88 COP | Mantener monitoreo. | Dato disponible y validado. |
| icv | sfc_priority | ok | ok | False | 60 | 2026-08-31 | 0.04 ratio | Mantener monitoreo. | Dato disponible y validado. |
| captaciones_publico | sfc_priority | ok | ok | False | 60 | 2026-08-31 | 7,620,645,579,916.46 COP | Mantener monitoreo. | Dato disponible y validado. |
| tasa_ocupacion | dane_priority | ok | ok | False | 30 | 2026-09-30 | 58.99% | Mantener monitoreo. | Dato disponible y validado. |
| tasa_global_participacion | dane_priority | ok | ok | False | 30 | 2026-09-30 | 64.56% | Mantener monitoreo. | Dato disponible y validado. |
| brent_usd | automated | ok | ok | False | 3 | 2026-10-27 | 123.10 USD/bbl | Mantener monitoreo. | Dato disponible y validado. |
| dxy_broad | automated | ok | ok | False | 7 | 2026-10-23 | 121.32 | Mantener monitoreo. | Dato disponible y validado. |
| fed_funds | automated | ok | ok | False | 2 | 2026-10-28 | 3.88% | Mantener monitoreo. | Dato disponible y validado. |
| embi_proxy_hy | automated | ok | ok | False | 1 | 2026-10-29 | 3.74% | Mantener monitoreo. | Dato disponible y validado. |
| tes_cop_1y | market_package | stale | warning | False | 28 | 2026-10-02 | 12.44% | Revisar fuente y actualizar antes de publicar. | Último dato excede umbral de frescura de 10 días. |
| tes_cop_5y | market_package | stale | warning | False | 28 | 2026-10-02 | 13.08% | Revisar fuente y actualizar antes de publicar. | Último dato excede umbral de frescura de 10 días. |
| tes_10y | market_package | stale | warning | False | 28 | 2026-10-02 | 13.30% | Revisar fuente y actualizar antes de publicar. | Último dato excede umbral de frescura de 10 días. |
| tes_uvr_1y | market_package | stale | warning | False | 28 | 2026-10-02 | 4.86% | Revisar fuente y actualizar antes de publicar. | Último dato excede umbral de frescura de 10 días. |
| tes_uvr_5y | market_package | stale | warning | False | 28 | 2026-10-02 | 6.65% | Revisar fuente y actualizar antes de publicar. | Último dato excede umbral de frescura de 10 días. |
| tes_uvr_10y | market_package | stale | warning | False | 28 | 2026-10-02 | 6.84% | Revisar fuente y actualizar antes de publicar. | Último dato excede umbral de frescura de 10 días. |
| tes_slope_10_1 | market_package | stale | warning | False | 28 | 2026-10-02 | 86.00 bp | Revisar fuente y actualizar antes de publicar. | Último dato excede umbral de frescura de 10 días. |
| tes_bei_5y | market_package | stale | warning | False | 28 | 2026-10-02 | 6.03% | Revisar fuente y actualizar antes de publicar. | Último dato excede umbral de frescura de 10 días. |
| tes_bei_10y | market_package | stale | warning | False | 28 | 2026-10-02 | 6.05% | Revisar fuente y actualizar antes de publicar. | Último dato excede umbral de frescura de 10 días. |
| tes_fwd_5y5y | market_package | stale | warning | False | 28 | 2026-10-02 | 13.52% | Revisar fuente y actualizar antes de publicar. | Último dato excede umbral de frescura de 10 días. |
