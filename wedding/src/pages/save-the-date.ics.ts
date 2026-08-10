import type { APIRoute } from 'astro';
import { buildIcs } from '../lib/ics';
import { coupleNames, locationLine, wedding } from '../data/wedding';

// Prerendered: this becomes a static /save-the-date.ics file at build time,
// so it works on any static host with no server involved.
export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const url = site ? new URL('/', site).href : undefined;

  const body = buildIcs({
    uid: `save-the-date-${wedding.startsAt.slice(0, 10)}@wedding`,
    title: `${coupleNames} — Wedding`,
    description: wedding.invitationLive
      ? `We're getting married! Details at ${url ?? 'our website'}`
      : "We're getting married! A formal invitation with full details will follow.",
    location: locationLine(),
    startsAt: wedding.startsAt,
    timeZone: wedding.timeZone,
    durationHours: wedding.durationHours,
    timed: wedding.showTime,
    url,
  });

  // NOTE: in a static build these headers apply to the dev/preview server
  // only — the deployed host serves the emitted .ics file with its own
  // headers. The `download` attribute on the link in AddToCalendar.astro is
  // what actually guarantees download behaviour in production. Both are kept
  // so the route still behaves correctly if the site ever moves to SSR.
  return new Response(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="save-the-date.ics"',
    },
  });
};
