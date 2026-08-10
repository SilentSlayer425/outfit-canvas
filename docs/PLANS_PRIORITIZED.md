# Outfit Canvas Plans — Prioritized by Impact-to-Effort

**Goal:** Maximize user value while minimizing implementation complexity. Organized in **4 tiers** from quick wins to ambitious features.

---

## ⚡ TIER 1: Quick Wins (Implement ASAP)
*Easy + noticeable impact. Ship these first to build momentum.*

### 1. **Builder Closet Hover Text** ⭐⭐⭐⭐⭐
- **Effort:** 🟢 Tiny (1-2 days)
- **User Impact:** 🟡 Medium (nice UX polish, saves time browsing)
- **Why First:** Trivial to ship, improves core builder experience immediately
- **Dependencies:** None
- **Why High Impact:** Users spend most time in builder; clarity on items reduces friction

---

### 2. **Brand Tagging Dropdown** ⭐⭐⭐⭐
- **Effort:** 🟢 Tiny (2-3 days)
- **User Impact:** 🟡 Medium (better organization, filtering)
- **Why Here:** Minimal schema change, reuses existing filter patterns
- **Dependencies:** None
- **Why High Impact:** Users want to filter by brand; very requested feature type

---

### 3. **Accessory Pairing Indicators** ⭐⭐⭐⭐
- **Effort:** 🟢 Tiny (2-3 days)
- **User Impact:** 🟡 Medium (saves clicks, clarifies relationships)
- **Why Here:** Single optional field, simple UI affordance
- **Dependencies:** None
- **Why High Impact:** Users build complex outfits; clarity on pairings saves mental load

---

## ⭐ TIER 2: Solid Foundations (Next Sprint)
*Medium effort, foundational features that unblock other features + unlock core workflows.*

### 4. **Duplicate Items (Phase 1 Only)** ⭐⭐⭐⭐⭐
- **Effort:** 🟡 Medium (4-5 days)
- **User Impact:** 🟢 High (solves "create variations" workflow)
- **Why Here:** Users ask for this; enables size/color/condition variants without re-uploading
- **Dependencies:** None (Phase 1 only; defer Phase 3 syncing)
- **Why High Impact:** Reduces user friction for multi-variant items (huge use case)
- **Note:** Skip Phase 3 (linking/syncing) for now — too complex, save for later

---

### 5. **Scheduling Outfits With Calendar** ⭐⭐⭐⭐
- **Effort:** 🟡 Medium (4-5 days)
- **User Impact:** 🟢 High (unlocks "planning" use case)
- **Why Here:** Clear integration points, small data model
- **Dependencies:** None; uses existing Google auth
- **Why High Impact:** Opens new use case (event → outfit planning); users ask for this

---

### 6. **Custom Canvas Person Mask** ⭐⭐⭐⭐
- **Effort:** 🟡 Medium (4-6 days)
- **User Impact:** 🟢 High (major visual/personalization improvement)
- **Why Here:** Reuses existing image processing, clear UX
- **Dependencies:** Must align `CanvasProfile` schema first
- **Why High Impact:** Users immediately see personal mannequin; wow factor
- **Blocker Note:** Coordinate schema with `canvas-back-of-person.md` first

---

### 7. **Alt Images, Cropping & Compression** ⭐⭐⭐⭐
- **Effort:** 🟡 Medium (5-7 days)
- **User Impact:** 🟢 High (foundational; unblocks other image features)
- **Why Here:** Reuses patterns, backward-compatible migration
- **Dependencies:** None
- **Why High Impact:** Users want multiple photos per item; foundation for image ecosystem
- **Blocker Note:** Need to spec crop tool UI before starting

---

### 8. **Custom Main Tags (User-Created Categories)** ⭐⭐⭐
- **Effort:** 🟡 Medium (5-6 days)
- **User Impact:** 🟢 High (for power users; unlocks custom workflows)
- **Why Here:** Enables users to add "Formal", "Gym", "Lounge" categories
- **Dependencies:** None
- **Why High Impact:** Power users love this; drives engagement
- **Blocker Note:** Document category type migration path carefully

---

## 🎯 TIER 3: Major Features (High-Impact, Worth the Complexity)
*Complex but transformative. Ship after Tier 1/2 foundation.*

### 9. **Canvas Layers Panel** ⭐⭐⭐⭐⭐
- **Effort:** 🔴 Hard (7-10 days)
- **User Impact:** 🟢 Very High (critical for complex outfits)
- **Why Here:** Solves pain point of managing 10+ items on canvas
- **Dependencies:** Needs foundation from Tier 2
- **Why High Impact:** Game-changer for users building intricate outfits; reduces frustration
- **Note:** Do this after custom person mask (visual groundwork)

---

### 10. **Image Editing Suite** ⭐⭐⭐⭐
- **Effort:** 🔴 Hard (8-12 days)
- **User Impact:** 🟢 Very High (foundational for image quality)
- **Why Here:** Core editing features (crop, brightness, rotate) are essential; defer AI enhancements
- **Dependencies:** Alt Images feature should exist first
- **Why High Impact:** Users upload phone photos; editing them in-app saves workflow
- **Blocker Note:** **Defer Phase 5 (AI) entirely** — too much scope; add later
- **MVP Scope:** Crop, rotate, brightness, contrast, saturation only

---

### 11. **Canvas: Back of Person (MVP Only)** ⭐⭐⭐⭐
- **Effort:** 🔴 Hard (8-10 days for Phase 1 only)
- **User Impact:** 🟢 Very High (complete 360° outfit visualization)
- **Why Here:** Addresses real need (users forget back accessories); major feature
- **Dependencies:** Canvas layers panel should exist first
- **Why High Impact:** "Aha!" feature; users see outfit completeness
- **Blocker Note:** **SPLIT THIS PLAN.** Phase 1 (dual canvas layout) only. Defer Phases 2-6 to separate plans
- **MVP Scope:** 
  - Side-by-side front/back canvases
  - Drag items to either side
  - Save/load front+back items
  - Basic responsive layout (stack on mobile)
  - **Skip:** 3D rotation, advanced silhouettes, global layering, auto-mirroring

---

### 12. **Local AI Background Removal** ⭐⭐⭐
- **Effort:** 🔴 Hard (6-8 days + bundle size risk)
- **User Impact:** 🟡 Medium-High (nice visual polish, but bundle bloat)
- **Why Here:** Privacy-first approach is good; but adds ~80–100MB bundle size
- **Dependencies:** None
- **Why High Impact:** Clean product-like images improve aesthetic
- **Blocker Note:** Monitor bundle size impact. Consider lazy-loading model. May not be worth the cost.
- **Risk:** Could increase initial load time significantly

---

## 🚀 TIER 4: Ambitious/Future (Lower Priority, Plan for Later)
*High complexity, medium-high impact. Plan these but don't start yet.*

### 13. **Outfit Sharing via Web Links** ⭐⭐⭐⭐⭐
- **Effort:** 🔴 Hard (12-20+ days for full feature)
- **User Impact:** 🟢🟢 Very High (social engagement, growth driver)
- **Why Here:** Needs backend infrastructure; transformative if done well
- **Dependencies:** Requires deployment planning
- **Why High Impact:** Social sharing = growth. Major feature.
- **Blocker Note:** **SPLIT THIS PLAN.**
  - **MVP (Option A - Stateless):** 5-7 days, URL-encoded sharing, read-only viewer
  - **Phase 2 (Option B - Backend):** 10-15 days, separate plan, requires backend
- **Recommendation:** Start with stateless MVP first (no backend); add backend later
- **Current Priority:** Defer until Tiers 1-3 complete

---

## 📊 Quick Reference Table

| Rank | Plan | Effort | Impact | Days | Start? |
|------|------|--------|--------|------|--------|
| 1 | Builder Hover Text | 🟢 | 🟡 | 1-2 | ✅ Now |
| 2 | Brand Tagging | 🟢 | 🟡 | 2-3 | ✅ Now |
| 3 | Accessory Pairing | 🟢 | 🟡 | 2-3 | ✅ Now |
| 4 | Duplicate Items (P1) | 🟡 | 🟢 | 4-5 | ✅ Week 2 |
| 5 | Calendar Scheduling | 🟡 | 🟢 | 4-5 | ✅ Week 2 |
| 6 | Custom Person Mask | 🟡 | 🟢 | 4-6 | ✅ Week 2 |
| 7 | Alt Images/Crop | 🟡 | 🟢 | 5-7 | ✅ Week 3 |
| 8 | Custom Main Tags | 🟡 | 🟢 | 5-6 | ✅ Week 3 |
| 9 | Layers Panel | 🔴 | 🟢🟢 | 7-10 | ✅ Week 4 |
| 10 | Image Editing | 🔴 | 🟢🟢 | 8-12 | ✅ Week 4 |
| 11 | Back of Person (P1) | 🔴 | 🟢🟢 | 8-10 | ✅ Week 5 |
| 12 | AI BG Removal | 🔴 | 🟡 | 6-8 | ⏳ Later |
| 13 | Outfit Sharing (MVP) | 🔴 | 🟢🟢 | 5-7* | ⏳ Later |

*For stateless MVP only (Option A)

---

## Recommended Roadmap

### **Sprint 1 (Week 1-2): Quick Wins**
Ship these to build momentum and get user feedback fast.
```
- Builder Closet Hover Text
- Brand Tagging Dropdown
- Accessory Pairing Indicators
+ Bug fixes / polish
```

**Result:** Small but noticeable UX improvements. User happiness ↑

---

### **Sprint 2 (Week 3-4): Core Workflows**
Enable major user workflows.
```
- Duplicate Items (Phase 1)
- Scheduling with Calendar
- Custom Canvas Person Mask
```

**Result:** Users can plan outfits with calendar, personalize mannequin, manage variations. Engagement ↑

---

### **Sprint 3 (Week 5-6): Image Ecosystem**
Foundation for image management.
```
- Alt Images, Cropping & Compression
- Custom Main Tags
```

**Result:** Users can organize items by custom categories, add multiple photos. Flexibility ↑

---

### **Sprint 4 (Week 7-9): Advanced Builders**
Complex but high-impact features.
```
- Canvas Layers Panel
- Image Editing Suite
```

**Result:** Users can build intricate outfits, edit photos in-app. Power users ↑

---

### **Sprint 5 (Week 10-12): Major Vision Features**
Transformative features.
```
- Canvas Back of Person (MVP: Phase 1 only)
```

**Result:** Complete outfit visualization. Wow factor ↑

---

### **Future (After Sprint 5): Optional/Complex**
Plan these but don't start until 1-5 complete.
```
- Outfit Sharing (MVP - stateless first)
- Local AI Background Removal (if bundle size acceptable)
- Other Phases from decomposed plans
```

---

## Key Decompositions Applied

This prioritization assumes you'll **split these large plans:**

| Original Plan | Decompose Into | Start Now? |
|---------------|---|---|
| Canvas: Back of Person | Phase 1 (MVP) + future phases | MVP only (Sprint 5) |
| Outfit Sharing | Option A (stateless MVP) + Option B (backend) | Option A (future) |
| Image Editing | Core features (Phases 1-3) + AI enhancements (Phase 5) | Core only (Sprint 4) |
| Duplicate Items | Phase 1 (basic duplicate) + Phase 3 (syncing) | Phase 1 only (Sprint 2) |

---

## Implementation Dependencies

```
Builder Hover ─────┐
Brand Tagging ─────┼─→ Sprint 1 Complete
Pairing ───────────┘

Duplicate Items ────┐
Calendar ──────────┬─→ Sprint 2 Complete
Person Mask ───────┘

Alt Images ────────┐
Custom Tags ───────┼─→ Sprint 3 Complete
                   └─ (enables Image Editing)

Layers Panel ──────┐
Image Editing ─────┼─→ Sprint 4 Complete
                   └─ (depends on Alt Images)

Canvas Back (P1) ──→ Sprint 5 (depends on Layers Panel)

Outfit Sharing ────→ Future (no hard dependencies)
AI BG Removal ─────→ Future (can be standalone)
```

---

## Success Metrics by Sprint

**Sprint 1:** User engagement (session time, return visits)
**Sprint 2:** Workflow adoption (calendar integrations, custom categories)
**Sprint 3:** Content volume (photos uploaded, categories created)
**Sprint 4:** Advanced user retention (complex outfits, power features)
**Sprint 5:** Outfit sharing readiness (if you plan sharing next)

