export function getTodayInTimezone(timezone: string): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return formatter.format(new Date());
}

export function getWeekStartInTimezone(timezone: string): string {
  const now = new Date();

  // Convert "now" to the user's timezone
  const localDate = new Date(
    now.toLocaleString('en-US', { timeZone: timezone }),
  );

  const day = localDate.getDay(); // Sun=0, Mon=1

  const diff = day === 0 ? -6 : 1 - day;

  const monday = new Date(localDate);
  monday.setDate(localDate.getDate() + diff);

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return formatter.format(monday);
}
