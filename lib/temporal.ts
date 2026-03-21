export function parsePageDate(dateString: string): Temporal.ZonedDateTime | Temporal.Instant {
  try {
    return Temporal.ZonedDateTime.from(dateString);
  } catch {
    return Temporal.Instant.from(dateString);
  }
}

export function zonedDateTimeFromPageDate(date: Date): Temporal.ZonedDateTime {
  return date.toTemporalInstant().toZonedDateTimeISO("Asia/Tokyo");
}
