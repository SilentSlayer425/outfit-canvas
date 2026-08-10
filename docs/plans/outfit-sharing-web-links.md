# Outfit Sharing Via Web Links

## Goal

Enable users to generate shareable web links that show their outfits to friends, social media followers, or the community. Viewers can see outfit details, try variations, and optionally import items into their own closet. This drives social engagement and inspiration discovery.

## Current Code Anchors

- `src/types/closet.ts`: `Outfit` stores outfit metadata and items.
- `src/lib/closet-storage.ts`: persists and retrieves outfits.
- `src/hooks/useGoogleDrive.ts`: syncs outfit data.
- `src/pages/Index.tsx`: main app routing.
- `src/components/SavedOutfits.tsx`: displays saved outfits.

## Data Model

Extend outfit schema to support sharing:

```ts
export interface OutfitShareLink {
  id: string;
  outfitId: string;
  shareCode: string;  // short URL slug
  createdBy: string;  // user email or ID
  visibility: 'private' | 'link-only' | 'public';
  allowImports: boolean;  // can viewers import items?
  allowComments?: boolean;  // enable social features
  viewCount?: number;
  createdAt: number;
  expiresAt?: number;  // optional: auto-expire after X days
}

export interface Outfit {
  // ... existing fields ...
  shareLink?: OutfitShareLink;
  isPublic?: boolean;
}
```

## Implementation Steps

### Phase 1: Backend Infrastructure (Minimal)

Two implementation options:

**Option A: Stateless URL Encoding**
- Encode outfit data (items, canvas state) directly in URL as Base64.
- No backend storage required.
- Limitation: URL becomes very long (~2KB+); not ideal for social.
- Advantage: works immediately, no server needed.

**Option B: Backend with Short URLs**
- Deploy lightweight backend (Firebase, Vercel, Node.js).
- Store outfit share metadata in database.
- Generate short share codes (e.g., `outfit.app/look/abc123`).
- Backend retrieves outfit data on viewer request.
- Advantage: short URLs, trackable, can add features (comments, analytics).

**Recommendation**: Start with Option B for better UX; use Option A as fallback.

### Phase 2: Share Link Generation

1. Create `src/lib/share-links.ts`:
   ```ts
   export async function generateShareLink(
     outfit: Outfit,
     userId: string,
     options?: {
       visibility?: 'link-only' | 'public';
       allowImports?: boolean;
       expiryDays?: number;
     }
   ): Promise<OutfitShareLink>
   ```

2. If using backend:
   - Call API endpoint to create share record.
   - Return short URL slug and full shareable URL.
   - Track creation timestamp and creator.

3. If using URL encoding:
   - Serialize outfit data to JSON.
   - Compress with gzip or similar.
   - Encode as Base64.
   - Create URL: `outfit.app/shared?data={encoded}`.

### Phase 3: UI for Share Creation

1. Update `SavedOutfits.tsx`:
   - Add "Share" button on each saved outfit.
   - Clicking opens `ShareOutfitModal.tsx`.

2. Create `ShareOutfitModal.tsx`:
   - Generate link on first open.
   - Display link with copy-to-clipboard button.
   - Visibility selector (private, link-only, public).
   - Toggle: "Allow imports" (viewers can add items to their closet).
   - Optional expiry date picker.
   - Social share buttons (Twitter, Pinterest, Instagram, WhatsApp).
   - QR code for easy mobile sharing.

3. Share presets:
   - "Private" (link only, not searchable).
   - "Public" (listed in gallery, searchable).
   - "Expiring" (auto-delete after X days).

### Phase 4: Shared Outfit Viewer

1. Create `SharedOutfitPage.tsx` (public route: `/shared/:shareCode`):
   - Fetch outfit data from backend or decode from URL.
   - Display outfit in read-only canvas view.
   - Show outfit metadata: creator name, creation date, item list.
   - Display each item with:
     - Image.
     - Brand, category, color tags.
     - Link to library if available.
     - Price (if stored).

2. Viewer interactions:
   - "View Details" expands item info.
   - "Import to My Closet" button (if `allowImports` is true).
   - "Remix" button: load outfit to canvas for editing (logged-in users).
   - "Report/Flag" if inappropriate.

3. Optional social features:
   - View count and share counter.
   - Comment section (requires moderation).
   - "Like" / "Save" to user's inspiration board.
   - Creator's other outfits (if public).

### Phase 5: Public Gallery & Discovery (Phase 2+)

1. Create `OutfitGallery.tsx`:
   - Browse public outfits sorted by:
     - Trending (most views, recent shares).
     - Creator (by username).
     - Category/style filters.
     - Seasonal.

2. Search public outfits:
   - Full-text search by outfit name, creator, items.
   - Filter by tag, season, style, color palette.

3. Creator profiles (optional):
   - Show user's public outfits and bio.
   - Follow creators to see their new outfits (requires user accounts).

### Phase 6: Analytics & Moderation

1. Track share metrics:
   - View count, click-through rate to items, import count.
   - Show stats to outfit creator.

2. Abuse prevention:
   - Flag inappropriate outfits.
   - Moderation queue for public submissions.
   - Auto-delete expired links.

3. Privacy controls:
   - Users can delete shared links anytime.
   - GDPR compliance: delete all shares on account deletion.

## UI Notes

- **Share button prominence**: Make it obvious and quick (one click from outfit).
- **Copy feedback**: "Link copied!" toast notification.
- **QR code**: Include in share modal for quick mobile access.
- **Social preview**: Generate Open Graph meta tags for Twitter/Facebook embeds.
  ```html
  <meta property="og:title" content="Check out my outfit!">
  <meta property="og:image" content="{outfit_preview_image}">
  <meta property="og:url" content="{share_url}">
  ```
- **Mobile-first**: Share viewer must work smoothly on phones.

## Verification

- Share link generation completes within 1 second.
- Shared outfit loads correctly for viewers without login.
- Copy-to-clipboard works on all devices.
- Social share buttons open with pre-populated text.
- QR code scans and resolves to shared outfit.
- Import to My Closet works for logged-in viewers.
- Public gallery search is fast (<500ms).
- Analytics track views accurately.
- Expired links properly redirect or show 404.

## Backend Requirements (if Option B)

**Endpoints:**
- `POST /api/outfits/share` – create share link.
- `GET /api/outfits/share/:shareCode` – retrieve outfit.
- `DELETE /api/outfits/share/:shareCode` – delete share link.
- `GET /api/outfits/public` – browse public gallery.
- `POST /api/outfits/share/:shareCode/flag` – report inappropriate outfit.

**Database:**
- Share link table: `id`, `outfitId`, `userId`, `shareCode`, `visibility`, `viewCount`, `createdAt`, `expiresAt`.
- Outfit data can reference existing Google Drive data or duplicate for performance.

## Future Enhancements

- Outfit collaboration: invite friends to edit outfit together (real-time sync).
- Outfit challenges: "Create outfit with theme X by date Y".
- Trending outfits widget on homepage.
- Integration with TikTok/Instagram Reels for outfit videos.
- Outfit ratings and community favorites.
- Creator monetization: earn from outfit shares (affiliate links, sponsored).
- AR try-on: preview shared outfit on user's photo (advanced).
