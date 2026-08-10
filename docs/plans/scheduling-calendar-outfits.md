# Scheduling Outfits With Calendar Events

## Goal

Let users connect calendar events to saved outfits, view upcoming events, and add outfit details into an event's notes. Google Calendar should support read/write integration. Apple Calendar should work through calendar-standard fallback options.

## Current Code Anchors

- `src/components/SavedOutfits.tsx`: existing saved outfit list and load actions.
- `src/types/closet.ts`: `Outfit` stores outfit metadata and item references.
- `src/pages/Index.tsx`: top-level tab state and Google user token.
- `src/hooks/useGoogleAuth.ts`: current Google sign-in/token flow.
- `src/hooks/useGoogleDrive.ts`: pattern for Google API calls.
- `src/components/AppNav.tsx`: add a calendar/schedule tab when ready.

## Data Model

```ts
export interface ScheduledOutfit {
  id: string;
  outfitId: string;
  provider: 'google' | 'ics';
  calendarEventId?: string;
  eventTitle: string;
  startsAt: string;
  notesUpdatedAt?: number;
  createdAt: number;
}
```

Persist `scheduledOutfits` alongside `items` and `outfits`.

## Implementation Steps

1. Add a `Schedule` tab and a `ScheduleOutfitModal`.
2. Extend Google auth scopes to include Calendar access.
3. Create `src/hooks/useGoogleCalendar.ts` using the existing `useGoogleDrive.ts` request style.
4. Pull upcoming events from Google Calendar and show event title, date, and current selected outfit.
5. Add a saved outfit selector that writes a compact outfit summary into the event description/notes.
6. For Apple Calendar support, generate an `.ics` event/update file with the outfit note included. This can be imported by Apple Calendar.
7. Keep direct Apple Calendar two-way sync as a later server-backed CalDAV feature, because browser-only access is not reliable for iCloud calendars.

## External References

- Google Calendar Events API: https://developers.google.com/calendar/api/v3/reference/events
- Google Calendar API scopes: https://developers.google.com/calendar/api/auth
- iCalendar format, RFC 5545: https://www.rfc-editor.org/rfc/rfc5545

## Verification

- User can fetch upcoming Google events after granting Calendar scope.
- Adding an outfit updates the Google event description without removing existing notes.
- Generated `.ics` imports into Apple Calendar with outfit notes visible.
- The app handles expired/insufficient Google tokens with a clear reconnect state.
