# Outfit Canvas Plans Review

## Overview
Comprehensive technical review of 13 feature plans for Outfit Canvas. Feedback focuses on feasibility, architectural fit, dependencies, and implementation complexity.

---

## 1. Alt Images, Cropping, And Compression ✅

### Strengths
- Well-scoped and clearly structured
- Backward compatibility approach is solid (lazy migration)
- Reuses existing `normalizeImageFile()` infrastructure
- Clear data model with proper interface definitions

### Issues & Feedback
- **Crop implementation**: Plan mentions "accept an optional crop rectangle before compression" but doesn't detail the UI/UX for cropping. Need more specifics on crop tool (freeform, preset ratios, interaction model).
- **Multiple image storage impact**: With Google Drive sync, storing multiple images per item could significantly increase JSON payload. Document estimated size impact.
- **Primary image selection**: Plan says "use first image" but doesn't specify how users select which image becomes primary. UI for reordering images needed.
- **Backwards compatibility edge case**: If user has old items with only `imageData`, the lazy migration creates a single-image array. This is fine, but document the behavior clearly.

### Recommendations
1. Break crop UI into separate plan or doc
2. Add storage/sync size estimates to verification section
3. Clarify primary image selection UI

### Priority: **Medium** (foundational for image management features)

---

## 2. Brand Tagging Dropdown ✅

### Strengths
- Simple, focused feature
- Minimal data model changes
- Filtering logic reuses existing `ClothingGrid` pattern
- No migration complexity

### Issues & Feedback
- **Brand extraction**: Plan says "derive available brands from visible result set" but doesn't address:
  - Case sensitivity (is "Nike" and "nike" same brand?)
  - Typo handling (should "Addidas" and "Adidas" merge?)
  - Should users manage a brand list or autocomplete?
- **Ordering**: No mention of how brands appear in dropdown (alphabetical? frequency? custom order?)
- **Display on items**: Plan says "show brand in item cards" but doesn't specify where or prominence level

### Recommendations
1. Add brand normalization helper and document case/typo strategy
2. Clarify dropdown ordering (recommend frequency-based)
3. Mock brand display on item cards

### Priority: **Low** (good quality-of-life feature)

---

## 3. Builder Closet Hover Text ✅

### Strengths
- Non-invasive enhancement
- Reuses existing Tooltip component
- Clear separation between builder and closet views
- Simple to implement

### Issues & Feedback
- **Mobile interaction**: Plan says "keep mobile unchanged" but mobile has no hover. Does tapping show tooltip, or is it contextual? Clarify interaction model.
- **Tooltip content dependencies**: References "brand-tagging feature exists" and "short description when present" — these are forward-looking dependencies. Should this feature gate on them?
- **Performance**: No mention of performance impact if many items are hovered rapidly. Should tooltips be memoized or virtualized?

### Recommendations
1. Define mobile tooltip behavior explicitly
2. Remove brand dependency or make optional
3. Consider tooltip caching/memoization

### Priority: **Low** (nice UX polish)

---

## 4. Canvas: Back of Person (Rear View Builder) ⚠️

### Strengths
- Comprehensive and well-thought-out
- Detailed phases and clear milestones
- Addresses both single canvas and advanced features
- Good consideration for mobile responsiveness

### Major Issues
- **Scope creep**: Plan is extremely large (6+ phases, 3D rotation, AI suggestions). Recommend splitting into multiple PRs:
  - Phase 1: Basic dual canvas layout
  - Phase 2: Silhouette management
  - Phase 3+: Separate future plans
- **Shared item constraint**: Plan says "same item can't be on both front & back simultaneously (unless duplicated)" but doesn't explain why. If user drags same item to back, what happens? Copy or move?
- **Performance**: Rendering 2 canvases means 2× paint/composite costs. No benchmarking guidance. Recommend testing with 20+ item outfits before committing.
- **Outfit JSON size**: Doubling potential items per outfit increases Drive sync payload. Should document max expected size and compression strategy.
- **Keyboard shortcut conflicts**: Plan uses `X` and `Tab` but doesn't check existing canvas shortcuts. Verify no conflicts with `OutfitCanvas.tsx`.

### Medium Issues
- **CanvasProfile naming**: Plan introduces `CanvasProfile` but so does `custom-canvas-person-mask.md`. Ensure both plans align on schema.
- **Unified z-index complexity**: "Global layers" toggle adds state complexity. Recommend deferring to Phase 2+.
- **Copy/paste across sides**: Using `Ctrl+C` on front then `Ctrl+V` on back is unintuitive. Better UX would be drag-to-side or "Move to back" context menu.

### Recommendations
1. **Split this plan into smaller increments**: Core dual-canvas feature (Phase 1) as MVP. Defer phases 2-6 to separate plans.
2. Add performance benchmarks (target: 60 FPS with 20+ items)
3. Clarify item duplication vs. move behavior
4. Align `CanvasProfile` schema with `custom-canvas-person-mask.md`
5. Remove or defer "Global layers" toggle
6. Replace `Ctrl+C/V` copy-paste with right-click "Move to back" context menu

### Priority: **High** (major feature, but needs decomposition)

---

## 5. Canvas Layers Panel ✅

### Strengths
- Well-specified UI and layout
- Clear interaction model (click to select, drag to reorder, keyboard shortcuts)
- Good phase breakdown
- Detailed verification checklist

### Issues & Feedback
- **Hook reference**: Plan mentions `src/hooks/useOutfitState.ts` but this hook doesn't exist in CLAUDE.md. Canvas state is in `Index.tsx`. Update anchor to actual location.
- **Virtualization guidance**: Phase 2 mentions virtualization for 20+ items, but doesn't specify library or implementation approach. Recommend React Virtualized or react-window.
- **Reorder logic**: Plan says "preserve relative z-index" but doesn't clarify algorithm. If stack is [1, 5, 10] and user moves 5 up, does it become 3, 7, or 8? Define clearly.
- **Opacity in Phase 4**: Opacity is Phase 4, but visibility toggle in Phase 2 could be confused with opacity. Clarify distinction (hidden = invisible, opacity = semi-transparent).
- **Drag-to-reorder interaction**: Plan mentions drag in Phase 3 but Phase 1 lists "drag layer to new position" in interaction. Inconsistent phasing.

### Recommendations
1. Fix hook reference to `useCloset` + Index.tsx state
2. Specify virtualization library choice
3. Document z-index reordering algorithm with examples
4. Clarify hidden vs. opacity semantics
5. Move drag-to-reorder to Phase 1 or clarify why it's Phase 3

### Priority: **High** (essential for managing complex outfits)

---

## 6. Custom Canvas Person Mask ✅

### Strengths
- Focused and achievable
- Reuses `normalizeImageFile()` pattern
- Clear data model
- Good note on client-side masking limitations

### Issues & Feedback
- **Mask generation vagueness**: "Estimate transparent/background pixels where possible" is too vague. What algorithm? Client-side masking is approximate; document expected accuracy.
- **CanvasProfile schema conflict**: This plan and `canvas-back-of-person.md` both introduce `CanvasProfile`. They define it differently:
  - This plan: `mannequinImageData`, `maskImageData`, `showDefaultArms`
  - Back-of-person: includes `front`/`back` variants
  - **Must align schemas before implementation**
- **Default SVG arms**: What's the exact SVG? Should it be proportional to canvas size? Does it render above or below items? Need to specify z-index and sizing logic.
- **Person image compression**: Plan says "large phone photos are compressed before storage" but doesn't specify target dimensions. Recommend explicit limits (e.g., max 1024×1024).

### Recommendations
1. Document mask-generation algorithm or recommend a library (e.g., removal.ai WASM model)
2. **Align CanvasProfile schema with `canvas-back-of-person.md` before proceeding**
3. Provide default SVG or link to exact design
4. Specify person image size limits (e.g., max width 1024px, max 500KB)
5. If masking is too approximate, plan Phase 2 upgrade to external service

### Priority: **Medium** (nice visual enhancement, blocks back-of-person feature)

---

## 7. Custom Main Tags ✅

### Strengths
- Clear problem statement (string union is awkward)
- Solid data model with migration helpers
- Addresses filtering and canvas placement for custom categories
- Good attention to duplicate prevention

### Issues & Feedback
- **Migration complexity**: Moving from strict union to string union is a breaking change. How do existing items with old category types behave? Need detailed migration logic.
- **Backwards compatibility**: Plan says "Guard against duplicate labels by normalizing ids from trimmed lowercase labels" but what if user creates "Tops" and later "tops"? UI should prevent this.
- **Placement defaults**: "Default custom category canvas placement to center until user picks better defaults" — should there be a UX flow to set defaults? Or should users manually position items from new categories?
- **Subcategories for custom tags**: Plan mentions `subcategories?: string[]` for custom tags, but no UI spec for managing these. How do users create/edit subcategories?

### Recommendations
1. Document category type migration path in detail
2. Add UI logic to prevent case-insensitive duplicates
3. Add UX flow for users to set canvas placement defaults for custom categories
4. Clarify subcategory management UI or defer to Phase 2

### Priority: **Medium** (enabling for advanced users, moderate complexity)

---

## 8. Duplicate Items ✅

### Strengths
- Well-phased with clear MVP and enhancements
- Good use cases documented
- Solid data model
- Linking concept is interesting

### Issues & Feedback
- **Duplication logic ambiguity**: Does `duplicatedFromId` point to the original or the immediate predecessor? If user duplicates A → B → C, do all point to A or does C point to B? Document clearly.
- **Batch duplicate UI**: Phase 2 mentions "customize each individually" but doesn't specify UX. Modal per item? Side-by-side preview? Too vague.
- **Linking/syncing complexity**: Phase 3 "sync duplicates" feature could be confusing:
  - If user updates original and synced duplicates, what fields sync? (category, tags, description — but not image?)
  - What happens if user also manually edited the duplicate? Conflict resolution?
  - Document carefully or defer to Phase 3+.
- **Quick duplicate shortcut**: `Ctrl+D` might conflict with browser shortcuts in some browsers. Test first.

### Recommendations
1. Document duplication reference semantics (chain or direct?)
2. Specify batch customize UX (recommend modal per item or simpler: "apply to all" toggle)
3. Create separate plan for Phase 3 linking/syncing — too complex to include here
4. Test `Ctrl+D` for browser/OS conflicts; use alternative if needed
5. Defer "Bulk templates" (Phase 5) to separate plan

### Priority: **Medium** (good UX improvement, moderate implementation)

---

## 9. Image Editing ✅

### Strengths
- Comprehensive editing feature set
- Good consideration of non-destructive editing
- Performance optimization section is thoughtful
- Clear phase breakdown

### Issues & Feedback
- **Library choice not specified**: Canvas API is fine, but consider using an editing library (Fabric.js, Pixie) to reduce complexity. Plan doesn't compare options.
- **Web Worker implementation**: Phase 1 mentions Web Worker for heavy edits, but doesn't specify which operations run off-thread. Should all edit operations move to Worker? Only blur/sharpen?
- **Edit history storage**: Phase 3 mentions "edit history timeline" but doesn't explain storage strategy. Full image snapshots are expensive. Should store operations (crop, brightness: +20) instead. Update plan.
- **Batch editing scope**: Phase 4 mentions batch edits, but applying same crop to 50 items could produce awkward results (different aspect ratios). Document limitations.
- **AI enhancements vagueness**: Phase 5 (auto-enhance, wrinkles, perspective) should be deferred to separate plan. Too much scope creep.

### Recommendations
1. Compare image editing libraries and document choice (recommend starting with canvas API, upgrade later)
2. Specify which operations run in Web Worker vs. main thread
3. **Change edit history to store operations, not snapshots** (much more storage-efficient)
4. Clarify batch edit limitations (e.g., will warn if aspect ratio mismatch)
5. Defer Phase 5 (AI) to separate plan entirely

### Priority: **High** (significant feature, high complexity)

---

## 10. Local AI Background Removal ✅

### Strengths
- Privacy-first approach with local ONNX
- Clear integration points in upload and edit flows
- Performance optimization mentioned
- Good graceful fallback strategy

### Issues & Feedback
- **Model size underestimated**: Plan says "~20–50 MB" for DelphiTools but doesn't account for ONNX Runtime (~30–50MB). Total could be 50–100 MB. IndexedDB limits vary by browser (often 50MB per origin). Document this clearly.
- **Loading strategy unclear**: Does model download block page load or lazy-load on first use? Plan says "lazy load" but doesn't specify when. Should happen in background thread to avoid jank.
- **Inference time**: "3–5 seconds" is generous. ResizeNet or similar on 512×512 often takes 2–10s depending on device. Document device-dependent variation (mobile could be much slower).
- **ONNX Runtime browser support**: Some older browsers don't support required JS features. Document minimum browser versions.
- **Fallback on error**: Plan says "user gets original image" but should there be a warning? User might not realize background removal failed.

### Recommendations
1. Document total model + runtime size more accurately (~80–100 MB)
2. Specify lazy-load strategy: background worker on app init?
3. Add inference time estimates for mobile vs. desktop
4. Document browser compatibility (ES6, WebGL/WebAssembly requirements)
5. Show warning toast if background removal fails instead of silent fallback

### Priority: **Medium** (nice feature, but adds significant bundle size)

---

## 11. Outfit Sharing Via Web Links ⚠️

### Strengths
- Two implementation options provided (URL encoding vs. backend)
- Comprehensive phases including social features
- Good consideration of privacy and analytics
- Clear API spec for backend option

### Major Issues
- **Backend dependency not addressed**: Plan recommends Option B (backend with DB) but doesn't explain deployment requirements. Does this require Vercel serverless? Separate Node server? Firebase? Need clarity.
- **URL encoding size**: Option A mentions "URL becomes very long (~2KB+)" but some browsers/platforms have URL limits (2000-8000 chars). Could be problematic for social sharing. Recommend Option B as default.
- **Data encoding security**: Option A doesn't address: can users tamper with URL-encoded outfit data? Should there be integrity checks (hash/signature)?
- **Scope explosion**: Plan includes 6 full phases (sharing, gallery, discovery, analytics, moderation, Creator profiles). This is a massive undertaking. Recommend:
  - Phase 1: Basic share link generation + viewer (stateless URL encoding for MVP)
  - Phase 2+: Separate backend implementation plan
- **Import to My Closet security**: How does the app prevent malicious outfit imports (e.g., thousands of fake items)? Any validation?

### Medium Issues
- **QR code generation**: Plan mentions QR code but doesn't specify library. Recommend `qrcode.react` or similar.
- **Social preview metadata**: Open Graph tags are good, but outfit preview image generation isn't specified. How is the image created for sharing?
- **Expiry handling**: Plan mentions expiring links but doesn't detail user experience (404 page? Redirect? Archive?).

### Recommendations
1. **Split this plan into smaller phases**:
   - MVP: Stateless share link (URL encoding) + read-only viewer
   - Backend plan: Separate doc for Option B with deployment details
   - Social features: Separate plan for gallery/discovery
2. For URL encoding MVP, add integrity check (HMAC signature of data)
3. Specify outfit preview image generation strategy (canvas screenshot?)
4. Choose QR code library
5. Define 404 behavior for expired links

### Priority: **High** (major social feature, but needs decomposition)

---

## 12. Scheduling Outfits With Calendar Events ✅

### Strengths
- Clear use case and user value
- Good consideration of both Google and Apple Calendar
- Simple data model
- External references provided

### Issues & Feedback
- **Google Calendar scope**: Plan mentions "extend scopes to include Calendar" but doesn't specify which scopes. Need `calendar` vs. `calendar.events.readonly`? Both read and write? Clarify OAuth scope requirements.
- **Event note insertion**: Plan says "compact outfit summary into event description" but doesn't specify format or length limits. Google Calendar description has no length limit, but Apple Calendar might truncate. Document format.
- **Apple Calendar limitations**: Plan defers two-way sync to future ("CalDAV feature"), but `.ics` export is a good interim solution. However, how does user stay in sync? Does `.ics` import overwrite previous versions?
- **Upcoming events fetch**: Plan doesn't specify time window. Should the app only fetch next 30 days? Next 6 months? Let user configure?
- **Error handling**: What if user revokes Calendar permissions? Does app gracefully degrade to .ics-only mode?

### Recommendations
1. Document exact Google Calendar OAuth scopes needed (`https://www.googleapis.com/auth/calendar` or `.readonly`?)
2. Specify outfit note format (plain text, markdown?) and length
3. Clarify Apple Calendar `.ics` sync strategy (one-time import vs. re-sync?)
4. Specify upcoming events fetch window (recommend: next 3 months)
5. Add error states for revoked permissions
6. Consider adding "Sync calendar notes to outfit" as inverse operation (user saves outfit notes from event)

### Priority: **Low-Medium** (nice feature, moderate implementation)

---

## 13. Accessory Pairing Indicators ✅

### Strengths
- Simple and focused feature
- Clear data model (single optional field)
- Good UI interaction model
- No performance concerns

### Issues & Feedback
- **Accessor definition**: Plan assumes "accessory" is a known category, but it's a flexible tag system. How does app define what's an accessory? By category name or by user tagging? Or should user specify when pairing?
- **Paired item deletion**: Plan says "clears or hides pair links gracefully" but doesn't specify exact behavior. Should deleting target item:
  - Remove pair link? ✓
  - Warn user? 
  - Delete paired accessory too?
  - Document clearly.
- **Multiple pairs**: Can one accessory pair with multiple items? Plan doesn't address. Recommend: one pairing per item to start, allow multiple in Phase 2.
- **Visual indicator**: Plan mentions "link icon badge, connector line, matching outline color" but which is actually implemented in Phase 1? Recommend MVP with just link badge and hover text, defer connector lines to Phase 2.

### Recommendations
1. Clarify "accessory" definition (what makes something pairable?)
2. Document exact behavior when target item is deleted (remove pair link)
3. Restrict to single pairing per item (one accessory paired to one item max)
4. MVP visual: link badge + hover text showing "Paired with: [item name]"
5. Defer connector lines and outline colors to Phase 2

### Priority: **Low** (nice quality-of-life polish)

---

## Cross-Feature Dependencies & Conflicts

### Schema Alignment Issues
1. **CanvasProfile**: Both `canvas-back-of-person.md` and `custom-canvas-person-mask.md` define this. **Must align before either is implemented.**
2. **ClothingImage**: `alt-images-cropping-compression.md` defines this; `image-editing.md` extends it. Ensure compatibility.
3. **OutfitItem**: `canvas-back-of-person.md` adds `side` field; `canvas-layers-panel.md` adds `hidden`, `locked`, `opacity`. Coordinate.

### Implementation Order Recommendations
1. **Start here** (low risk, high value):
   - Brand tagging dropdown
   - Builder closet hover text
   - Duplicate items (Phase 1 only)
   - Accessory pairing indicators

2. **Medium risk, solid architecture**:
   - Alt images cropping compression
   - Canvas layers panel
   - Custom main tags
   - Scheduling with calendar
   - Custom canvas person mask (after aligning with back-of-person)

3. **High complexity, requires decomposition**:
   - **Canvas: Back of person** → Split into MVP + future phases
   - **Image editing** → Implement core features, defer AI enhancements
   - **Outfit sharing** → Start with stateless MVP, then backend
   - **Local AI background removal** → Monitor bundle size impact

---

## Summary Table

| Plan | Scope | Complexity | Risk | Recommendation |
|------|-------|-----------|------|-----------------|
| Alt Images Cropping | Medium | Medium | Low | Proceed; add crop UI spec |
| Brand Tagging | Small | Low | Low | Proceed; add normalization logic |
| Builder Hover Text | Tiny | Low | Low | Proceed; clarify mobile behavior |
| Canvas Back View | **HUGE** | High | High | Split into MVP + phases |
| Layers Panel | Large | Medium | Medium | Proceed; fix anchors, clarify reorder |
| Custom Person Mask | Small | Medium | Medium | Proceed; align CanvasProfile schema |
| Custom Main Tags | Medium | Medium | Medium | Proceed; document migration path |
| Duplicate Items | Medium | Medium | Low | Proceed (Phase 1 only); defer Phase 3 syncing |
| Image Editing | Large | **High** | **High** | Proceed (core features); defer Phase 5 AI |
| Local AI BG Removal | Medium | High | Medium | Proceed; document bundle size impact |
| Outfit Sharing | **MASSIVE** | High | High | Split into MVP (stateless) + backend |
| Scheduling Calendar | Small | Medium | Low | Proceed; clarify scopes |
| Accessory Pairing | Tiny | Low | Low | Proceed; narrow visual scope for MVP |

---

## Next Steps for User Review
1. Identify which plans should be prioritized
2. Flag any disagreements with complexity/risk assessments
3. Clarify whether to defer or accept marked high-complexity plans
4. Approve schema alignments (CanvasProfile, ClothingImage, OutfitItem)
5. Request additional details on specific issues

