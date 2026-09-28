export function validateRun(input: {
  distance: number;
  durationMs: number;
  collectibles: number;
  startedAt: Date;
  endedAt: Date;
}) {
  const durationSeconds =
    input.durationMs / 1000;

  const speed =
    input.distance / durationSeconds;

  if (input.endedAt <= input.startedAt) {
    return {
      valid: false,
      reason: "Invalid timestamps."
    };
  }

  if (input.durationMs < 1000) {
    return {
      valid: false,
      reason: "Run was too short."
    };
  }

  /*
   * The game is intentionally bounded by a maximum
   * physical speed. Extremely high distances for a
   * short duration are therefore rejected.
   */
  if (speed < 2 || speed > 13.5) {
    return {
      valid: false,
      reason: "Impossible run speed."
    };
  }

  /*
   * Collectibles also have a physical upper limit.
   */
  const maximumCollectibles =
    Math.ceil(input.distance / 8) + 50;

  if (
    input.collectibles >
    maximumCollectibles
  ) {
    return {
      valid: false,
      reason: "Impossible collectible count."
    };
  }

  return {
    valid: true as const
  };
}