# Contract changelog

## 0.1.2 - UI integration endpoints
- `GET /telemetry/crew`: simulated telemetry roster; bone-loss risk comes from the real engine forecast.
- `GET /osdr/studies`: NASA OSDR study bundles served from `data/processed/osdr/` (503 when unavailable).

## 0.1.1 - measurement value upper-bound guard
- `MeasurementCreate.value` gains `maximum: 1000000`, rejecting non-finite (`inf`/`nan`-class) payloads at validation time.

## 0.1.0 - initial contract
- Endpoints: health, model-info, scenarios, countermeasures, crew, measurements, forecast, whatif.
- Engine contract: `EngineInput` -> `Forecast`.

## 0.1.3 - telemetry risk semantics
- `bone_loss_risk_percentage` now carries the predicted worst-site BMD % change at the
  mission horizon from the unmitigated baseline forecast (negative = loss), replacing
  the tail probability that rounded to ~0 for short horizons.

## 0.1.3 - telemetry risk semantics
- `bone_loss_risk_percentage` now carries the predicted worst-site BMD % change at the
  mission horizon from the unmitigated baseline forecast (negative = loss), replacing
  the tail probability that rounded to ~0 for short horizons.
