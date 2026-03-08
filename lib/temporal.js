/**
 * @param {string} dateString
 * @returns Temporal.ZonedDateTime | Temporal.Instant
 */
export function parsePageDate(dateString) {
  try {
    return Temporal.ZonedDateTime.from(dateString);
  } catch {
    return Temporal.Instant.from(dateString);
  }
}

/**
 * @param {Date} date
 * @returns Temporal.ZonedDateTime
 */
export function zonedDateTimeFromPageDate(date) {
  return date.toTemporalInstant().toZonedDateTimeISO("Asia/Tokyo");
}
