/**
 * SINGLE SOURCE OF TRUTH for the wedding details.
 *
 * Every page and component imports from here, so changing the date or
 * the venue is one edit in one file — not a search-and-replace across
 * the site. Later pages (schedule, travel, RSVP) should import this too.
 *
 * >>> THE VALUES BELOW ARE PLACEHOLDERS. <<<
 * Replace them with the real details before the site goes live.
 */

export interface WeddingData {
  /** Names as they should appear, in order. */
  partnerOne: string;
  partnerTwo: string;
  /** Local start date & time, ISO 8601, no timezone suffix. */
  startsAt: string;
  /** IANA timezone the wedding happens in. */
  timeZone: string;
  /** Approximate duration, used only for the calendar file. */
  durationHours: number;
  /** Show the time on the page? A save-the-date often omits it. */
  showTime: boolean;
  /** Venue name, or null if not announced yet. */
  venue: string | null;
  city: string;
  region: string;
  /** Shown when `venue` is null. */
  venuePendingNote: string;
  /** Set true once the full invitation site exists. */
  invitationLive: boolean;
}

export const wedding: WeddingData = {
  partnerOne: 'Firstname',
  partnerTwo: 'Firstname',

  startsAt: '2027-05-15T16:00:00',
  timeZone: 'America/New_York',
  durationHours: 6,
  showTime: false,

  venue: null,
  city: 'City',
  region: 'State',
  venuePendingNote: 'Venue details to follow',

  invitationLive: false,
};

/** "Firstname & Firstname" */
export const coupleNames = `${wedding.partnerOne} & ${wedding.partnerTwo}`;

/** A real Date built from the local time + IANA zone above. */
export const weddingDate = new Date(`${wedding.startsAt}Z`);

/** "Saturday, May 15, 2027" */
export function formatLongDate(): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(weddingDate);
}

/** Split into parts so the design can typeset them independently. */
export function dateParts(): {
  weekday: string;
  month: string;
  day: string;
  year: string;
  time: string;
} {
  const part = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' }).format(weddingDate);

  return {
    weekday: part({ weekday: 'long' }),
    month: part({ month: 'long' }),
    day: part({ day: 'numeric' }),
    year: part({ year: 'numeric' }),
    time: part({ hour: 'numeric', minute: '2-digit', hour12: true }),
  };
}

/** "City, State" or "Venue · City, State" */
export function locationLine(): string {
  const place = `${wedding.city}, ${wedding.region}`;
  return wedding.venue ? `${wedding.venue} · ${place}` : place;
}

/** ISO date for <time datetime="…">, e.g. "2027-05-15". */
export const machineDate = wedding.startsAt.slice(0, 10);
