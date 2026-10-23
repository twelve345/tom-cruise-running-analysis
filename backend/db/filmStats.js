/**
 * Derived film statistics.
 *
 * Mirrors what the old PostgreSQL trigger (update_film_stats + calculate_cpi)
 * stored, including its DECIMAL(10,2) / DECIMAL(10,4) rounding:
 * - running time is estimated at ~6 mph (14.7 ft/sec)
 * - running density is feet per minute of runtime
 * - CPI (Cruise Performance Index) = distance / runtime * (Tomatometer / 100)
 * A film with no running distance never had stats computed, so density and CPI stay null.
 * Density needs a runtime and CPI needs a runtime and a score; without them they are null,
 * which is what the API reported on PostgreSQL (its mapper turned a stored 0 into null).
 */

const FEET_PER_SECOND = 14.7;

// Decimal-safe half-up rounding (avoids 1.005 * 100 = 100.49999 style float errors).
function round(value, places) {
  return Number(`${Math.round(Number(`${value}e${places}`))}e-${places}`);
}

function deriveFilmStats({ totalRunningDistanceFeet, runtimeMinutes, rottenTomatoesScore }) {
  const distance = totalRunningDistanceFeet || 0;

  if (distance <= 0) {
    return { totalRunningTimeSeconds: 0, runningDensity: null, cpiScore: null };
  }

  const hasRuntime = runtimeMinutes > 0;
  const hasScore = rottenTomatoesScore !== null && rottenTomatoesScore !== undefined;

  return {
    totalRunningTimeSeconds: round(distance / FEET_PER_SECOND, 2),
    runningDensity: hasRuntime ? round(distance / runtimeMinutes, 4) : null,
    cpiScore:
      hasRuntime && hasScore
        ? round((distance * rottenTomatoesScore) / (runtimeMinutes * 100), 4)
        : null,
  };
}

module.exports = { deriveFilmStats, round, FEET_PER_SECOND };
