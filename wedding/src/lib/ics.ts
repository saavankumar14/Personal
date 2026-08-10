/**
 * Minimal RFC 5545 iCalendar builder.
 *
 * Deliberately hand-rolled rather than pulling a dependency: we emit exactly
 * one event with a handful of fields, and the spec's fiddly parts (escaping,
 * 75-octet line folding, CRLF endings) are about thirty lines of code.
 *
 * Timezone approach:
 *  - An all-day event (`showTime: false`) uses VALUE=DATE, which has no
 *    timezone at all. This is the right shape for a save-the-date and
 *    sidesteps timezone handling completely.
 *  - A timed event is converted to UTC and emitted with a `Z` suffix, so we
 *    never have to ship a VTIMEZONE block. Calendars render it back in the
 *    viewer's local zone, which is what people expect.
 */

/** Escape a text value per RFC 5545 §3.3.11. Order matters: backslash first. */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * Fold lines to 75 octets per RFC 5545 §3.1, measuring UTF-8 bytes rather
 * than JS characters so multi-byte glyphs (e.g. an accented name) can't push
 * a line over the limit or get split mid-codepoint.
 */
function foldLine(line: string): string {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;

  const out: string[] = [];
  let current = '';
  let currentBytes = 0;

  for (const char of line) {
    const charBytes = encoder.encode(char).length;
    // Continuation lines are prefixed with a space, so their budget is 74.
    const limit = out.length === 0 ? 75 : 74;
    if (currentBytes + charBytes > limit) {
      out.push(current);
      current = '';
      currentBytes = 0;
    }
    current += char;
    currentBytes += charBytes;
  }
  if (current) out.push(current);

  return out.join('\r\n ');
}

/** "20270515" */
function toDateStamp(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, '');
}

/** "20270515T200000Z" */
function toUtcStamp(date: Date): string {
  return `${date.toISOString().slice(0, 19).replace(/[-:]/g, '')}Z`;
}

/**
 * Resolve a wall-clock time in an IANA zone to a real UTC instant.
 *
 * `new Date("2027-05-15T16:00:00")` is parsed in the *build machine's* zone,
 * which would silently produce a different result on a laptop than on
 * Vercel's UTC builders. This reads the zone's actual offset for that
 * instant — including daylight saving — and corrects for it.
 */
function zonedTimeToUtc(localIso: string, timeZone: string): Date {
  const asUtc = new Date(`${localIso}Z`);

  const offsetLabel = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'longOffset',
  })
    .formatToParts(asUtc)
    .find((part) => part.type === 'timeZoneName')?.value;

  // Format is "GMT-04:00", or plain "GMT" at zero offset.
  const match = offsetLabel?.match(/GMT([+-])(\d{2}):(\d{2})/);
  if (!match) return asUtc;

  const [, sign, hours, minutes] = match;
  const offsetMinutes =
    (sign === '-' ? -1 : 1) * (Number(hours) * 60 + Number(minutes));

  return new Date(asUtc.getTime() - offsetMinutes * 60_000);
}

export interface CalendarEvent {
  uid: string;
  title: string;
  description: string;
  location: string;
  /** Local wall-clock start, e.g. "2027-05-15T16:00:00". */
  startsAt: string;
  timeZone: string;
  durationHours: number;
  /** false → all-day event. */
  timed: boolean;
  url?: string;
}

export function buildIcs(event: CalendarEvent): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wedding Site//Save the Date//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.uid}`,
    // DTSTAMP must be the moment the file was generated (build time).
    `DTSTAMP:${toUtcStamp(new Date())}`,
  ];

  if (event.timed) {
    const start = zonedTimeToUtc(event.startsAt, event.timeZone);
    const end = new Date(start.getTime() + event.durationHours * 3_600_000);
    lines.push(`DTSTART:${toUtcStamp(start)}`, `DTEND:${toUtcStamp(end)}`);
  } else {
    // All-day events use an exclusive end date, so DTEND is the next day.
    const start = new Date(`${event.startsAt.slice(0, 10)}T00:00:00Z`);
    const end = new Date(start.getTime() + 86_400_000);
    lines.push(
      `DTSTART;VALUE=DATE:${toDateStamp(start)}`,
      `DTEND;VALUE=DATE:${toDateStamp(end)}`,
    );
  }

  lines.push(
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
    `LOCATION:${escapeText(event.location)}`,
    'STATUS:CONFIRMED',
    'TRANSP:TRANSPARENT',
  );

  if (event.url) lines.push(`URL:${escapeText(event.url)}`);

  lines.push('END:VEVENT', 'END:VCALENDAR');

  // RFC 5545 requires CRLF line endings.
  return lines.map(foldLine).join('\r\n') + '\r\n';
}
