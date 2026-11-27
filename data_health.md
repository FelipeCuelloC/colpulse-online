# Data Health | ColPulse

Fecha de reporte: 2026-11-27

## Resumen

- OK: 17
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
| trm | automated | warning | warning | False | 2 | 2026-11-25 | 3,592.03 COP/USD | Reintentar la fuente; mantener visible el último corte validado mientras siga fresco. | Fuente temporalmente no disponible; se conserva el último dato validado dentro del umbral de frescura. Detalle: Fallo el conector BanRep SDMX: not well-formed (invalid token): line 4, column 17 |
| policy_rate | automated | warning | warning | False | 2 | 2026-11-25 | 12.25% | Reintentar la fuente; mantener visible el último corte validado mientras siga fresco. | Fuente temporalmente no disponible; se conserva el último dato validado dentro del umbral de frescura. Detalle: Fallo el conector BanRep SDMX: not well-formed (invalid token): line 4, column 17 |
| ibr_overnight | automated | warning | warning | False | 2 | 2026-11-25 | 12.26% | Reintentar la fuente; mantener visible el último corte validado mientras siga fresco. | Fuente temporalmente no disponible; se conserva el último dato validado dentro del umbral de frescura. Detalle: Fallo el conector BanRep SDMX: not well-formed (invalid token): line 4, column 17 |
| colcap_monthly | automated | stale | warning | False | 57 | 2026-10-01 | 2,536.51 | Revisar fuente y actualizar antes de publicar. | Último dato excede umbral de frescura de 45 días. |
| trm_monthly_average | derived | ok | ok | False | 2 | 2026-11-25 | 3,316.62 COP/USD | Mantener monitoreo. | Dato disponible y validado. |
| trm_month_end | derived | ok | ok | False | 2 | 2026-11-25 | 3,592.03 COP/USD | Mantener monitoreo. | Dato disponible y validado. |
| ipc_yoy | dane_priority | ok | ok | False | 27 | 2026-10-31 | 6.30% | Mantener monitoreo. | Dato disponible y validado. |
| ipc_mom | dane_priority | ok | ok | False | 27 | 2026-10-31 | 0.20% | Mantener monitoreo. | Dato disponible y validado. |
| ise | dane_priority | ok | ok | False | 58 | 2026-09-30 | 128.78 | Mantener monitoreo. | Dato disponible y validado. |
| tasa_desocupacion | dane_priority | ok | ok | False | 58 | 2026-09-30 | 8.63% | Mantener monitoreo. | Dato disponible y validado. |
| exportaciones_fob | dane_priority | ok | ok | False | 58 | 2026-09-30 | 5,410,724.64 thousand_usd_fob | Mantener monitoreo. | Dato disponible y validado. |
| importaciones | dane_priority | warning | warning | False | 88 | 2026-08-31 | 7,702,463.50 thousand_usd_cif | Reintentar la fuente; mantener visible el último corte validado mientras siga fresco. | Fuente temporalmente no disponible; se conserva el último dato validado dentro del umbral de frescura. Detalle: Fallo el conector DANE comercio exterior: Unable to read workbook: could not assign names from None.
This is most probably because the workbook source files contain some invalid XML.
Please see the exception for more details. |
| cartera_bruta | sfc_priority | ok | ok | False | 58 | 2026-09-30 | 1,035,832,837,840,729.62 COP | Mantener monitoreo. | Dato disponible y validado. |
| cartera_vencida | sfc_priority | ok | ok | False | 58 | 2026-09-30 | 43,564,921,083,595.25 COP | Mantener monitoreo. | Dato disponible y validado. |
| icv | sfc_priority | ok | ok | False | 58 | 2026-09-30 | 0.04 ratio | Mantener monitoreo. | Dato disponible y validado. |
| captaciones_publico | sfc_priority | ok | ok | False | 58 | 2026-09-30 | 7,689,478,489,727.92 COP | Mantener monitoreo. | Dato disponible y validado. |
| tasa_ocupacion | dane_priority | ok | ok | False | 58 | 2026-09-30 | 58.99% | Mantener monitoreo. | Dato disponible y validado. |
| tasa_global_participacion | dane_priority | ok | ok | False | 58 | 2026-09-30 | 64.56% | Mantener monitoreo. | Dato disponible y validado. |
| brent_usd | automated | ok | ok | False | 3 | 2026-11-24 | 91.80 USD/bbl | Mantener monitoreo. | Dato disponible y validado. |
| dxy_broad | automated | ok | ok | False | 7 | 2026-11-20 | 123.60 | Mantener monitoreo. | Dato disponible y validado. |
| fed_funds | automated | ok | ok | False | 3 | 2026-11-24 | 3.88% | Mantener monitoreo. | Dato disponible y validado. |
| embi_proxy_hy | automated | ok | ok | False | 1 | 2026-11-26 | 4.52% | Mantener monitoreo. | Dato disponible y validado. |
| tes_cop_1y | market_package | stale | warning | False | 56 | 2026-10-02 | 12.44% | Revisar fuente y actualizar antes de publicar. | Último dato excede umbral de frescura de 10 días. |
| tes_cop_5y | market_package | stale | warning | False | 56 | 2026-10-02 | 13.08% | Revisar fuente y actualizar antes de publicar. | Último dato excede umbral de frescura de 10 días. |
| tes_10y | market_package | stale | warning | False | 56 | 2026-10-02 | 13.30% | Revisar fuente y actualizar antes de publicar. | Último dato excede umbral de frescura de 10 días. |
| tes_uvr_1y | market_package | stale | warning | False | 56 | 2026-10-02 | 4.86% | Revisar fuente y actualizar antes de publicar. | Último dato excede umbral de frescura de 10 días. |
| tes_uvr_5y | market_package | stale | warning | False | 56 | 2026-10-02 | 6.65% | Revisar fuente y actualizar antes de publicar. | Último dato excede umbral de frescura de 10 días. |
| tes_uvr_10y | market_package | stale | warning | False | 56 | 2026-10-02 | 6.84% | Revisar fuente y actualizar antes de publicar. | Último dato excede umbral de frescura de 10 días. |
| tes_slope_10_1 | market_package | stale | warning | False | 56 | 2026-10-02 | 86.00 bp | Revisar fuente y actualizar antes de publicar. | Último dato excede umbral de frescura de 10 días. |
| tes_bei_5y | market_package | stale | warning | False | 56 | 2026-10-02 | 6.03% | Revisar fuente y actualizar antes de publicar. | Último dato excede umbral de frescura de 10 días. |
| tes_bei_10y | market_package | stale | warning | False | 56 | 2026-10-02 | 6.05% | Revisar fuente y actualizar antes de publicar. | Último dato excede umbral de frescura de 10 días. |
| tes_fwd_5y5y | market_package | stale | warning | False | 56 | 2026-10-02 | 13.52% | Revisar fuente y actualizar antes de publicar. | Último dato excede umbral de frescura de 10 días. |
