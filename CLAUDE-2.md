---
tags:
  - outfitcanvas
  - claude-context
  - project-index
  - react
  - vite
  - capacitor
  - google-drive
---

# Outfit Canvas Project Index

#outfitcanvas #claude-context #project-index

This file is a compact map of the Outfit Canvas codebase so future AI edits can start here instead of rereading the whole project.

## Project Summary

#overview #architecture

Outfit Canvas is a React 18 + Vite + TypeScript digital closet app. Users sign in with Google, upload clothing photos, organize items by category/subcategory/custom tags, build outfits on a drag-and-drop canvas, save outfit combinations, view weather while planning outfits, and sync closet data to Google Drive. Local persistence uses IndexedDB with migration support from old localStorage keys. The repo also includes a Capacitor Android wrapper that points at the deployed web app.

Main runtime flow:

1. `src/main.tsx` mounts `src/App.tsx`.
2. `src/App.tsx` wires React Router, Google auth, dark mode, toast providers, analytics, and subdomain redirects.
3. Protected `/app` renders `src/pages/Index.tsx`.
4. `Index.tsx` coordinates closet state, Drive sync, tabs, modals, outfit canvas state, weather preference, and navigation.
5. Feature components under `src/components` render upload/edit/detail modals, item grid, outfit builder, saved outfits, weather, support, and bottom nav.

## High-Value Edit Map

#edit-map #where-to-change

- Add/change clothing categories: `src/types/closet.ts`, then placement defaults in `src/config.ts`.
- Change upload image limits/formats: `src/lib/image-processing.ts`.
- Change Google OAuth client, Drive folder/file, canvas sizing, grid columns, animation timings: `src/config.ts`.
- Change local storage/IndexedDB behavior: `src/lib/closet-storage.ts` and `src/hooks/useCloset.ts`.
- Change Google Drive sync payload or folder/file lookup: `src/hooks/useGoogleDrive.ts`.
- Change sign-in scopes/profile handling: `src/hooks/useGoogleAuth.ts`.
- Change app routing/protected routes/subdomain mapping: `src/App.tsx` and `src/utils/navigation.ts`.
- Change main app tabs/header/profile menu/autosync behavior: `src/pages/Index.tsx`.
- Change closet cards/filtering/tag pills/delete behavior: `src/components/ClothingGrid.tsx`.
- Change outfit drag/keyboard/zoom/layer/save behavior: `src/components/OutfitCanvas.tsx`.
- Change saved outfit card previews/load/delete behavior: `src/components/SavedOutfits.tsx`.
- Change weather search/forecast/unit behavior: `src/components/WeatherWidget.tsx`.
- Change theme colors/fonts/shadows: `src/index.css` and `tailwind.config.ts`.
- Change Android app id/name/web URL/navigation allowlist: `capacitor.config.ts`, `android/app/build.gradle`, `android/app/src/main/AndroidManifest.xml`, and Android resource files.

## Important Current Notes

#notes #gotchas

- The current `C:\Users\fortn\Documents\ChatGPT\OutfitCanvas` workspace root is effectively empty except `.git`; the actual app files are in `C:\Users\fortn\Desktop\_\outfit-visualizer-studio`.
- `src/pages/DeleteData.tsx` has UI for deletion and accepts `onConfirmDelete`, but `src/App.tsx` currently mounts it without passing that prop. As routed, it does not actually clear local state or Drive data.
- Terms and Privacy pages show `Last updated: {new Date().toLocaleDateString()}`. Use a fixed date if legal/app-store consistency matters.
- `README.md` and some comments contain mojibake/encoding artifacts from smart punctuation or emoji. This guide is plain ASCII on purpose.
- `node_modules/`, `dist/`, lockfiles, generated Android splash/icon files, and Gradle wrapper jars are not files future AI should edit unless the request specifically targets dependencies, builds, or mobile packaging.
- The Google OAuth client ID is hardcoded in `src/config.ts`.
- Weather uses Open-Meteo and fetches directly from the browser, no API key.

## Root Files

#files #root

- `.gitignore`: Git ignore rules.
- `README.md`: User-facing project overview, feature list, routing notes, stack, and project structure.
- `CLAUDE.md`: This AI/Obsidian context guide.
- `package.json`: NPM scripts and dependencies. Scripts include `dev`, `start`, `build`, `build:dev`, `lint`, `preview`, `test`, and `test:watch`.
- `package-lock.json`: npm dependency lockfile.
- `bun.lock`, `bun.lockb`: Bun dependency lockfiles from earlier/alternate package manager use.
- `vite.config.ts`: Vite config. Uses React SWC, `@` alias to `src`, dev/preview port `8080`, HMR settings, `dist` output, and `lovable-tagger` in development.
- `vitest.config.ts`: Vitest config for tests.
- `tsconfig.json`: TypeScript project reference/root config.
- `tsconfig.app.json`: TypeScript config for app/source files.
- `tsconfig.node.json`: TypeScript config for Node-side config files.
- `tailwind.config.ts`: Tailwind theme extension, dark mode class strategy, font families, design token color mappings, shadows, radii, animations.
- `postcss.config.js`: PostCSS plugins for Tailwind/autoprefixer.
- `eslint.config.js`: ESLint flat config.
- `components.json`: shadcn/ui component configuration and aliases.
- `index.html`: Vite HTML entry. Contains SEO/social metadata, favicon links, and the root element.
- `vercel.json`: Vercel hosting config.
- `capacitor.config.ts`: Capacitor config for Android. App id/name, `dist` webDir, deployed URL `https://outfitcanvas.com`, and subdomain allowlist.
- `LICENSE`: Project license text.

## Source Entry And Routing

#files #src #routing

- `src/main.tsx`: React entry point. Imports global CSS and renders `<App />` into `#root`. It imports `goToSubdomain` but does not use it.
- `src/App.tsx`: App root. Creates React Query client, wraps tooltip/toast providers and Vercel Analytics, sets routes, handles protected `/app`, redirects `/login` if already signed in, and maps subdomains to paths on mount.
- `src/vite-env.d.ts`: Vite TypeScript environment declarations.
- `src/utils/navigation.ts`: Shared `goToSubdomain(subdomain)` helper. In production subdomains it navigates to `https://{subdomain}.outfitcanvas.com`; on root/dev it falls back to path routes.

## Config, Types, And Libraries

#files #config #types #storage #images

- `src/config.ts`: Central customization constants. Contains Google client ID, Drive folder/file names, canvas height, arrow step, item scale limits, item base size, category default X/Y placement, grid columns, animation durations, and notes about theme colors.
- `src/types/closet.ts`: Shared domain model. Defines `ClothingCategory`, `ClothingItem`, `OutfitItem`, `Outfit`, category labels/order, and built-in subcategories. This is the first place to edit when adding clothing taxonomy.
- `src/lib/utils.ts`: Utility helper for class name merging, usually `cn(...)` for Tailwind/shadcn classes.
- `src/lib/closet-storage.ts`: IndexedDB persistence. Reads/writes a single closet state object in database `closet-studio-db`, store `closet-state`, key `current`; reads/removes legacy localStorage keys `closet-items` and `closet-outfits`.
- `src/lib/image-processing.ts`: Upload normalization. Supports common image formats including HEIC/HEIF, converts HEIC via `heic-to/csp` with `heic2any` fallback, redraws images to canvas to strip metadata, outputs WebP, caps resolution and encoded size.

## Hooks

#files #hooks

- `src/hooks/useCloset.ts`: Main closet state hook. Loads IndexedDB state, migrates legacy localStorage, persists changes, adds/updates/removes items, saves/removes outfits, removes deleted items from outfits, and exposes `replaceAll` for Drive loads.
- `src/hooks/useGoogleAuth.ts`: Browser-only Google Identity Services OAuth. Loads GIS script, requests `openid email profile https://www.googleapis.com/auth/drive.file`, fetches profile, stores user/access token in localStorage key `google-user`, and revokes token on sign-out.
- `src/hooks/useGoogleDrive.ts`: Drive sync hook. Finds/creates configured Drive folder, finds JSON data file, saves via multipart upload PATCH/POST, loads JSON file media, tracks `syncing` and `lastSync`.
- `src/hooks/useDarkMode.ts`: Dark mode state. Reads localStorage key `darkMode`, falls back to system preference, toggles document `.dark`, and persists preference.
- `src/hooks/use-mobile.tsx`: Responsive/mobile detection hook used by the app page to alter builder layout.
- `src/hooks/use-toast.ts`: Toast hook re-export/implementation from the shadcn/ui toast setup.

## Pages

#files #pages

- `src/pages/Home.tsx`: Public landing page. Header/profile menu, sign-in/sign-out buttons, dark mode toggle, feature cards, how-it-works, privacy/data callout, final CTA, footer, and subdomain navigation links.
- `src/pages/Login.tsx`: Google sign-in page with app logo, dark mode toggle, Terms/Privacy links, and sign-in button. Redirect handling is controlled by `App.tsx`.
- `src/pages/Index.tsx`: Authenticated app shell. Owns active tab, upload/edit/detail modal state, selected category, outfit builder items, weather city/coords, Drive initial load, debounced Drive autosave, profile dropdown, and tab content for closet/builder/outfits/donate.
- `src/pages/TermsOfService.tsx`: Public Terms page with back button and static legal sections. Uses current date at render time for "Last updated".
- `src/pages/PrivacyPolicy.tsx`: Public Privacy page with back button and static privacy sections. Uses current date at render time for "Last updated".
- `src/pages/DeleteData.tsx`: Public delete-data confirmation UI. Two-step "type DELETE" flow; only calls optional `onConfirmDelete` if a parent passes it.
- `src/pages/NotFound.tsx`: 404 page. Logs missing path to console and links back home.

## Feature Components

#files #components #features

- `src/components/AppNav.tsx`: Fixed bottom tab navigation for `closet`, `builder`, `outfits`, `donate`, and `home`.
- `src/components/ClothingGrid.tsx`: Filterable clothing card grid. Category pills, subcategory/custom-tag pills, selectable mode for builder, view/edit/delete controls, delete confirmation, and empty state.
- `src/components/UploadModal.tsx`: Add-item modal. Drag/drop or file picker image upload, image validation/normalization, name, description, category, subcategory, custom tags, and submit/reset behavior.
- `src/components/EditItemModal.tsx`: Metadata-only item edit modal. Edits name, description, category, subcategory, and custom tags; does not change the image.
- `src/components/ItemDetailModal.tsx`: Item viewer modal. Shows full image, category/subcategory, description, tags, optional edit/delete actions, and nested delete confirmation.
- `src/components/OutfitCanvas.tsx`: Drag-and-drop outfit editor. Supports pointer drag, canvas bounds, selected item, arrow-key nudging, Delete/Backspace remove, scale controls, z-index layering, mannequin silhouette, and outfit save input.
- `src/components/SavedOutfits.tsx`: Saved outfit list. Cards with item thumbnails, tooltip names, item detail modal on thumbnail click, load into builder, delete confirmation, and empty state.
- `src/components/WeatherWidget.tsx`: Collapsible weather panel. Searches cities via Open-Meteo geocoding, scores/deduplicates results, stores selected label/coords, fetches 24-hour forecast, supports F/C toggle, and displays hourly weather.
- `src/components/DonationPage.tsx`: Support page content linking to Throne URL `https://throne.com/silentslayer425`; has back behavior using history or home fallback.
- `src/components/ConfirmDialog.tsx`: Shared animated confirm/cancel modal, mostly used for destructive deletes.

## UI Components

#files #components #shadcn

Most files in `src/components/ui/` are shadcn/Radix primitives. Prefer using them instead of raw HTML when adding app UI.

- `accordion.tsx`: Accordion primitive.
- `alert-dialog.tsx`: Alert dialog primitive.
- `alert.tsx`: Alert message styles.
- `aspect-ratio.tsx`: Aspect-ratio wrapper.
- `avatar.tsx`: Avatar primitive.
- `badge.tsx`: Badge styles.
- `breadcrumb.tsx`: Breadcrumb navigation.
- `button.tsx`: Button variants/sizes used throughout the app.
- `calendar.tsx`: Calendar/date picker.
- `card.tsx`: Card primitives.
- `carousel.tsx`: Carousel primitive.
- `chart.tsx`: Recharts helpers/theme wrapper.
- `checkbox.tsx`: Checkbox primitive.
- `collapsible.tsx`: Collapsible primitive.
- `command.tsx`: Command palette/list primitive.
- `context-menu.tsx`: Context menu primitive.
- `dialog.tsx`: Dialog primitive.
- `drawer.tsx`: Drawer primitive.
- `dropdown-menu.tsx`: Dropdown menu primitive.
- `form.tsx`: React Hook Form helpers.
- `hover-card.tsx`: Hover-card primitive.
- `input-otp.tsx`: OTP input primitive.
- `input.tsx`: Text input component.
- `label.tsx`: Form label primitive.
- `menubar.tsx`: Menubar primitive.
- `navigation-menu.tsx`: Navigation menu primitive.
- `pagination.tsx`: Pagination components.
- `popover.tsx`: Popover primitive.
- `progress.tsx`: Progress bar primitive.
- `radio-group.tsx`: Radio group primitive.
- `resizable.tsx`: Resizable panel primitive.
- `scroll-area.tsx`: Scroll area primitive.
- `select.tsx`: Select/dropdown primitive.
- `separator.tsx`: Separator primitive.
- `sheet.tsx`: Side sheet primitive.
- `sidebar.tsx`: Sidebar system primitives.
- `skeleton.tsx`: Loading skeleton.
- `slider.tsx`: Slider primitive.
- `sonner.tsx`: Sonner toaster wrapper.
- `switch.tsx`: Switch/toggle primitive.
- `table.tsx`: Table primitives.
- `tabs.tsx`: Tabs primitive.
- `textarea.tsx`: Textarea component.
- `toast.tsx`: Toast primitives.
- `toaster.tsx`: Toast renderer.
- `toggle-group.tsx`: Toggle group primitive.
- `toggle.tsx`: Toggle primitive.
- `tooltip.tsx`: Tooltip primitive.
- `use-toast.ts`: Toast state helper.

## Styling

#files #styling #tailwind

- `src/index.css`: Global CSS. Imports Google fonts, Tailwind layers, CSS custom properties for light/dark themes, font variables, shadow tokens, and base body/heading styles.
- `src/App.css`: App-level CSS file. Currently present for app styles if needed; most styling is Tailwind + `index.css`.
- `tailwind.config.ts`: Maps CSS variables to Tailwind tokens and configures fonts, shadows, radii, accordion animations, and `tailwindcss-animate`.

## Public Assets And Metadata

#files #public #seo #assets

- `public/_redirects`: Static host redirect rules.
- `public/sitemap.xml`: Search engine sitemap.
- `public/robots.txt`: Search crawler rules.
- `public/llms.txt`: LLM-facing site/app description metadata.
- `public/favicon.ico`: Main favicon.
- `public/favicon-16x16.png`: 16px favicon.
- `public/favicon-32x32.png`: 32px favicon.
- `public/apple-touch-icon.png`: iOS home screen icon.
- `public/android-chrome-192x192.png`: Android/PWA icon.
- `public/android-chrome-512x512.png`: Android/PWA large icon.
- `public/og-image.png`: Social sharing/Open Graph image.

## Android / Capacitor Wrapper

#files #android #capacitor #mobile

- `android/settings.gradle`: Gradle project settings.
- `android/build.gradle`: Top-level Android Gradle build config.
- `android/variables.gradle`: Shared Android dependency/version variables.
- `android/gradle.properties`: Gradle/Android build properties.
- `android/capacitor.settings.gradle`: Capacitor plugin settings.
- `android/gradlew`, `android/gradlew.bat`: Gradle wrapper launchers.
- `android/gradle/wrapper/gradle-wrapper.properties`: Gradle wrapper distribution config.
- `android/gradle/wrapper/gradle-wrapper.jar`: Gradle wrapper binary.
- `android/app/build.gradle`: Android app module build config.
- `android/app/capacitor.build.gradle`: Capacitor-generated app build additions.
- `android/app/proguard-rules.pro`: ProGuard/R8 rules placeholder.
- `android/app/src/main/AndroidManifest.xml`: Android app manifest. Declares main activity, file provider, launcher intent, and internet permission.
- `android/app/src/main/java/com/outfitcanvas/app/MainActivity.java`: Capacitor `MainActivity`.
- `android/app/src/main/res/layout/activity_main.xml`: Android activity layout.
- `android/app/src/main/res/values/strings.xml`: Android app strings.
- `android/app/src/main/res/values/styles.xml`: Android themes/styles.
- `android/app/src/main/res/values/ic_launcher_background.xml`: Launcher icon background color/resource.
- `android/app/src/main/res/xml/file_paths.xml`: FileProvider path config.
- `android/app/src/main/res/drawable/ic_launcher_background.xml`: Launcher background drawable.
- `android/app/src/main/res/drawable-v24/ic_launcher_foreground.xml`: Launcher foreground vector.
- `android/app/src/main/res/drawable*/splash.png`: Splash images for base/landscape/portrait density buckets.
- `android/app/src/main/res/mipmap-*/ic_launcher*.png`: Launcher icons for density buckets.
- `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml`: Adaptive launcher icon.
- `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml`: Adaptive round launcher icon.
- `android/app/src/test/java/com/getcapacitor/myapp/ExampleUnitTest.java`: Placeholder unit test.
- `android/app/src/androidTest/java/com/getcapacitor/myapp/ExampleInstrumentedTest.java`: Placeholder instrumented test.

## Generated / Vendor Folders

#files #generated #vendor

- `node_modules/`: Installed npm packages. Do not edit directly.
- `dist/`: Vite build output. Regenerate with `npm run build`; do not hand edit unless specifically debugging a production artifact.

## Data Model Cheat Sheet

#data-model #closet

`ClothingItem`:

```ts
{
  id: string;
  name: string;
  category: ClothingCategory;
  subcategory?: string;
  customTags?: string[];
  description?: string;
  imageData: string;
  color?: string;
  createdAt: number;
}
```

`OutfitItem`:

```ts
{
  clothingId: string;
  category: ClothingCategory;
  x: number;
  y: number;
  scale: number;
  zIndex: number;
}
```

`Outfit`:

```ts
{
  id: string;
  name: string;
  items: OutfitItem[];
  createdAt: number;
}
```

Drive JSON currently stores:

```ts
{
  items: ClothingItem[];
  outfits: Outfit[];
  darkMode?: boolean;
  weatherCity?: string;
  weatherLat?: number;
  weatherLon?: number;
}
```

## Common Editing Recipes

#recipes

### Add A New Clothing Category

#recipes/categories

1. Add the category string to `ClothingCategory` in `src/types/closet.ts`.
2. Add a label to `CATEGORY_LABELS`.
3. Add it to `CATEGORY_ORDER`.
4. Add built-in subcategories to `SUBCATEGORIES`.
5. Add `CATEGORY_Y_DEFAULTS` and `CATEGORY_X_DEFAULTS` entries in `src/config.ts`.
6. Check grid filtering, upload modal category select, edit modal category select, and default canvas placement.

### Change The Outfit Builder Feel

#recipes/builder

- Item default size: `ITEM_BASE_SIZE` in `src/config.ts`.
- Canvas height: `CANVAS_MIN_HEIGHT` in `src/config.ts`.
- Keyboard nudge speed: `ARROW_KEY_STEP` in `src/config.ts`.
- Zoom min/max/step: `ITEM_MIN_SCALE`, `ITEM_MAX_SCALE`, `SCALE_STEP` in `src/config.ts`.
- Drag/bounds/layer logic: `src/components/OutfitCanvas.tsx`.
- Initial item placement: `CATEGORY_X_DEFAULTS` and `CATEGORY_Y_DEFAULTS` in `src/config.ts`.

### Change Sync Or Persistence

#recipes/sync #recipes/storage

- Local IndexedDB read/write/migration: `src/lib/closet-storage.ts`.
- React state API over local data: `src/hooks/useCloset.ts`.
- Drive folder/file names: `src/config.ts`.
- Drive payload schema and upload/load mechanics: `src/hooks/useGoogleDrive.ts`.
- Initial Drive load and autosave debounce: `src/pages/Index.tsx`.

### Change Auth

#recipes/auth

- Google client ID: `src/config.ts`.
- GIS script loading, scopes, profile fetch, localStorage user cache, sign-out revoke: `src/hooks/useGoogleAuth.ts`.
- Login screen UI: `src/pages/Login.tsx`.
- Route protection: `src/App.tsx`.

### Change Visual Theme

#recipes/theme

- Light/dark HSL tokens, fonts, shadows: `src/index.css`.
- Tailwind token mapping and animation utilities: `tailwind.config.ts`.
- Dark mode state/persistence: `src/hooks/useDarkMode.ts`.

### Make Delete Data Actually Delete

#recipes/delete-data

Current delete page only runs an optional callback. To make it real:

1. Pass a deletion handler into `<DeleteData />` from `src/App.tsx` or route deletion through authenticated app state.
2. Clear IndexedDB state via `replaceAll([], [])` or a new storage helper.
3. Delete or overwrite the Drive JSON in `src/hooks/useGoogleDrive.ts`.
4. Clear `darkMode`, `google-user`, weather state, and any related localStorage keys if desired.
5. Decide whether unauthenticated users should see instructions instead of a working delete button.

## Verification Commands

#verification #commands

Use these from `C:\Users\fortn\Desktop\_\outfit-visualizer-studio`:

```bash
npm run lint
npm run test
npm run build
npm run dev
```

The dev server is configured for port `8080` with `strictPort: true`.
