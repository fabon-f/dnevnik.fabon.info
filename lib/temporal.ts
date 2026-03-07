export function parsePageDate(dateString: string) {
  try {
    return Temporal.ZonedDateTime.from(dateString);
  } catch {
    return Temporal.Instant.from(dateString);
  }
}

export function zonedDateTimeFromPageDate(date: Date) {
  return date.toTemporalInstant().toZonedDateTimeISO("Asia/Tokyo");
}
