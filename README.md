# Outfit Canvas

Outfit Canvas is a digital closet and outfit builder that helps you upload clothing items, organize them by category and tags, arrange full looks visually, and sync everything to Google Drive.

## What the app does

- Upload clothing photos and normalize them for web use.
- Organize items by category, subcategory, and custom tags.
- Build outfits on a drag-and-drop canvas.
- Save outfits and load them back later.
- Sync closet data to Google Drive.
- Support dark mode, account switching, and data deletion.

## Major sections

### Home
The public landing page introduces the app, highlights the main features, and links users to sign in, support, legal pages, and the app itself.

### Login
Users sign in with Google Identity Services. Authentication happens entirely in the browser, and the Google access token is used for profile lookup plus Drive access.

### My Closet
This section is the item library.

- Items are shown in a filterable grid.
- You can filter by category and then narrow by built-in subcategories or custom tags.
- Each card supports viewing, editing, and deleting an item.
- Uploads accept common image formats and can convert HEIC/HEIF images.

### Build Outfit
This is the visual outfit editor.

- Pick items from your closet and place them on a mannequin-style canvas.
- Drag items freely, or nudge them with arrow keys.
- Resize items with zoom controls.
- Change layer order with bring-forward / send-back buttons.
- Save the finished outfit with a name.

### Saved Outfits
Saved looks are displayed as cards with thumbnail previews.

- Hovering or tapping item thumbnails shows item details.
- A saved outfit can be loaded back into the builder.
- Outfits can be deleted with confirmation.

### Support
A donation page is included for people who want to support the project.

### Legal and data pages
- Terms of Service
- Privacy Policy
- Delete Data

## How the data works

### Local storage
Closet data is stored in IndexedDB so high-quality photos do not run into localStorage size limits. The app also migrates older localStorage data the first time it finds it.

### Google Drive sync
When a user signs in, the app stores closet data in Google Drive as a JSON file inside a dedicated folder. The Drive sync includes:

- clothing items
- saved outfits
- dark mode preference
- weather location data

## Routing

The app supports both normal routes and subdomain-based navigation.

Subdomains map to:

- `home` → `/`
- `login` → `/login`
- `app` → `/app`
- `builder` → `/app?tab=builder`
- `outfits` → `/app?tab=outfits`
- `donate` → `/donate`
- `terms` → `/terms`
- `privacy` → `/privacy`
- `delete` → `/delete`

## Tech stack

- React 18
- Vite
- TypeScript
- Tailwind CSS
- React Router
- TanStack Query
- Google Identity Services
- Google Drive API
- IndexedDB

## Project structure

- `src/pages` — top-level screens
- `src/components` — app UI and feature components
- `src/hooks` — auth, storage, theme, and sync logic
- `src/lib` — persistence and image processing helpers
- `src/types` — shared TypeScript types
- `src/utils` — small navigation helpers

## Notes

- The app is designed to work well on desktop and mobile.
- Outfit items stay above the mannequin silhouette and can’t leave the canvas bounds.
- If you want to customize behavior, most values live in `src/config.ts`.
