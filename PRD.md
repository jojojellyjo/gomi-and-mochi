# Pressed — Product Requirements Document

**Status:** In development · **Owner:** Joanne · **Last updated:** 14 Oct 2026
**Competition:** Twigpine Project Treetop, Round 01 (Games) — https://twigpine.com/treetop

---

## 1. Competition requirements

### Key dates (all times UTC)

| Milestone | Date | Notes |
|---|---|---|
| Round opened | Fri 9 Oct 2026 | Work started before this does not count |
| **Submission deadline** | **Fri 16 Oct 2026, 23:59 UTC** | Convert to local time — e.g. 7:59 pm EDT Fri, 8:59 am AEDT Sat, 7:59 am SGT Sat |
| Judging | Within one week of the deadline | Twigpine team plays every eligible entry |
| Winner announced | By ~Fri 23 Oct 2026 | Winner emailed first, then announced on X and the site |

### Prize
- **$1,000 USDC on Base**, one winner, paid to the wallet named in the entry after the win is confirmed.
- Twigpine may ask the winner to prove control of the wallet **and** the X account used to enter.
- Winner is responsible for any taxes.

### Rules (must all be satisfied)
1. **Built during the round** (9–16 Oct). Source history must show when it was made → keep a public git repo with frequent commits from day one.
2. **Playable from a link** in a browser, **nothing to install, no account** to make.
3. **Own work or assets we have rights to.** No characters, logos or brands belonging to someone else.
4. **One entry per builder.** Resubmitting before the deadline replaces the earlier entry (latest is judged).
5. Teams allowed; one wallet receives the prize.
6. Judges' decision is final; Twigpine team members cannot enter.
7. Entries stay private until reviewed; reviewed entries may be shown on the site and X with name and links.
8. **We keep all rights** to what we make.
9. AI tools are explicitly allowed. Any engine/stack, as long as it runs in a browser from a link.

### Judging criteria
| Criterion | What judges look for | How Pressed answers it |
|---|---|---|
| **Fun** | "Makes you want one more go" | Skill-based pressing, cat chaos, herbarium to complete, new random scraps every day |
| **Originality** | An idea not played before, or a familiar one taken somewhere new | Flower pressing + junk journalling + a meddling cat — a combination we haven't seen in a game |
| **Polish** | Loads, works, feels finished for 7 days of work | One tight loop polished hard; hand-made textures, sound, keepsake export, works on mobile |

### Submission form (8 fields, 2 optional)
| Field | Required | Our value |
|---|---|---|
| Name | ✅ | Pressed |
| One line about it | optional | "Forage flowers, press them just right and junk-journal a keepsake — while your cat tries to help." |
| Where we play it | ✅ | Public game URL (GitHub Pages) |
| Source | ✅ | Public GitHub repo |
| Short video | optional | ≤ 1 minute of play (record a full day: garden → press → journal → keepsake) |
| X handle | ✅ | Joanne's handle |
| Wallet on Base | ✅ | Paste from wallet — **Joanne fills this in herself** |
| Email | ✅ | Joanne's email |
| Checkbox | ✅ | "I built this during the round, it is my own work, and I accept the rules." |

Optional: post on X and tag **@twigpine** (not a condition of entry).

### Compliance checklist
- [ ] Public repo with commit history starting 14 Oct 2026
- [ ] Game hosted at a public URL, opens without login on desktop + mobile
- [ ] All art is code-drawn or Joanne's own photos — no logos, brand names, or third-party characters (check every photo: receipts, tickets, packaging)
- [ ] No personal data in photos (addresses, card numbers, barcodes)
- [ ] Fonts are open-licence (Google Fonts: Fraunces, Caveat, Special Elite — all SIL OFL)
- [ ] Submitted before **Fri 16 Oct 23:59 UTC** (aim for Fri 16 Oct, 18:00 UTC to leave buffer)

---

## 2. Product overview

### One-liner
A cosy browser game about foraging flowers, pressing them just right and junk-journalling a keepsake spread — while your cat, Mochi, tries very hard to help.

### Why this game
Built from Joanne's real hobbies (junk journalling, bujo, flower drying, plants, edible plants, matcha and coffee, wax seals, wire art, origami, leather craft, skating, and their cat). Personal, original and naturally shareable: every run produces an image worth posting.

### Competitive landscape
| Product | What it is | How Pressed differs |
|---|---|---|
| JuJo: Creative Journal & Diary (iOS) | Journaling/scrapbook app: templates, stickers, drawing, photo collages | A tool with no goal. Pressed is a game: skill (pressing), stakes (the cat), progression (herbarium) |
| Junk Journal: Scrapbook Art (Android, Novixa-Labs) | Vintage junk-journal sandbox with a "craft box" of papers, stickers, washi, ephemera | Same craft vibe, but Pressed adds foraging and pressing your *own* materials, a cat that scatters untaped scraps, and a finished keepsake in 5 minutes, all in the browser with no install |

| Journal (Steam, 2014, Locked Door Puzzle) | Hand-painted narrative adventure played on a notebook page on a desk | Story game, no crafting. Useful reference for atmosphere: desk props (mug, pencil) framing the page make it feel personal |

Takeaway: tabbed "craft box" trays are a familiar pattern, so ours should feel intuitive. Nobody combines the craft with game mechanics.

### Target player
Anyone who opens the link — especially cosy-game, stationery, journalling and plant people. Session length 4–6 minutes; replayable.

### Platforms
Modern desktop and mobile browsers (Chrome, Safari, Firefox, Edge). Landscape canvas scaled to fit; touch and mouse.

---

## 3. Core loop — one in-game day

```
Title → Garden → Press → Journal → Keepsake → (new day)
```

### 3.1 Garden
- Three raised beds, 12 flowers from 7 types: daisy, pansy, cosmos, nasturtium (edible), lavender, fern, mint (edible).
- Tap a flower to pick it; up to **4** per day go into the basket.
- **Mochi** wanders in and naps on a bed. Flowers under Mochi can't be picked. If Mochi isn't shooed within ~3 s, Mochi **squashes** one.
- Tap Mochi to shoo them away.

### 3.2 Press (even pressure)
- One flower at a time on blotting paper in a wooden press with **four wing nuts**.
- **Hold** a nut to tighten it (speeds up the longer you hold, so short taps are precise). Keyboard: hold 1–4.
- A pressure gauge shows all four nuts against the flower's green band; an **evenness** bubble level shows the spread.
- Open the press to see the result: **perfect** (all four in the band, spread ≤ 12), **good** (near the band, spread ≤ 22), **curled** (too loose or uneven), **browned** (a corner far too tight). A line explains why.
- Each flower has its own band width (lavender forgiving, pansy and cosmos tight).
- Mochi's paw sometimes reaches in and loosens or bumps a nut unless tapped away.
- First press of each type adds it to the **herbarium** (persists between visits).

### 3.3 Journal (a big junk box)
- Two-page spread; paper style: dot grid, lined, grid, plain, kraft.
- **Junk box tray** with 7 tabs and ~70 pieces: **Flowers** (today's presses), **Paper** (patterned papers, sheet music, map, ledger, magazine, brochure, newspaper, bujo list, post-its, lace), **Finds** (tickets, receipts, polaroids, postage, wax seals, kraft tags, tea bag, film strip, fortune, library card, envelope, sweet wrapper, blush box, leather label), **Bits** (origami cranes, wire heart, buttons, paper clips, twine, pressed leaves, stickers), **Tape** (8 washi), **Stamps** (8 inks), **Photos** (player's own uploads + Joanne's photos).
- **Write a post-it:** type a note, it appears in handwriting on a sticky note.
- **Selection toolbar** (like Sticky Business): rotate 15° steps, smaller/bigger, flip, duplicate, delete; plus a drag handle to spin and resize.
- **Freehand scissors:** draw a loop over any piece (paper, flower, photo, tape) and it cuts that shape out for real: the piece becomes a new scrap and the original keeps the hole.
- **Glue stick:** tap a piece to glue it down for good (can't be moved, Mochi can't move it).
- **Realistic layering:** no "send to back". Picking a piece up puts it on top when you set it down; you can't lift a piece that has something lying on it, or that's held under tape or a glued piece, until you lift or peel the top one first.
- **Photos:** upload or snap a photo (stays on the device), then trim it with the scissors.
- **Mochi walks across the page** every ~15–20 s, knocking loose scraps askew. Taped or glued scraps stay put. If Mochi naps on the page and is left alone, Mochi leaves **paw prints**. Tap Mochi to shoo or pet.
- Undo; tap **Finish & keep** when happy.

### 3.3b Letter + wax seal (stretch)
- Option to make a letter in an envelope instead of a spread, sealed with a timed wax-seal mini-game (melt, pour, press the stamp while the wax is the right temperature).

### 3.4 Keepsake
- Finished spread on a desk with a caption card: day number, date, flowers pressed, perfect presses, Mochi visits, herbarium count, paw prints.
- **Save image** (PNG download) and **Share** (native share sheet on mobile, falls back to download).
- **Edit journal** (go back) or **New day**.

---

## 4. Content

### Scrap pool (code-drawn, randomised each time)
Ticket stubs (roller rink, ice rink, greenhouse, flower market, skate park), café receipt (matcha latte, hojicha, oat flat white…), wax seals (7 colours × 6 icons), postage stamps, polaroids (monstera, matcha, coffee, cat, roller skate, flowers), origami crane, lace, kraft tag, newspaper scrap, bujo checklist, wire-art heart, leather "handmade" label, matcha tea bag, kawaii stickers.

### Photo scraps (Joanne's own)
- Drop cut-out PNGs into `photos/` and list them in `photos/manifest.json`.
- Mixed into the daily pocket alongside drawn scraps.
- Rules: no brands/logos, no personal info.

### The cat
Drawn, animated Mochi (walk, sit, loaf, paw). Colours and name to be matched to Joanne's real cat.

---

## 5. Non-functional requirements

| Area | Requirement |
|---|---|
| Load | First paint < 2 s on broadband; no build step; no external assets except Google Fonts |
| Performance | 60 fps on a mid-range laptop and recent phones |
| Input | Mouse, touch, keyboard (Q/E rotate, −/+ size, F flip, D duplicate, Delete, Ctrl/⌘+Z, hold 1–4 for press nuts) |
| Audio | Synthesised SFX via Web Audio; mute toggle remembered |
| Storage | `localStorage` for herbarium, day count, mute — game works if storage is blocked |
| Privacy | No accounts, no analytics, no network calls besides fonts |
| Accessibility | Large tap targets, readable fonts, no time pressure in the journal step |

---

## 6. Tech
- Plain HTML + ES modules + Canvas 2D. No framework, no build.
- Structure: `index.html`, `js/` (textures, flowers, cat, ephemera, ui, sfx, state), `js/scenes/` (title, garden, press, journal, keepsake).
- Hosting: GitHub Pages from `main`.

---

## 7. Schedule

| When (local) | Milestone |
|---|---|
| Wed 14 Oct | Repo + PRD; full loop playable (garden → press → journal → keepsake) |
| Thu 15 Oct | Joanne's photos + cat in; balancing; mobile pass; deploy to GitHub Pages |
| Fri 16 Oct (day) | Polish, bug bash, record ≤ 1 min video, write one-liner |
| **Fri 16 Oct, by 18:00 UTC** | **Submit** (buffer before 23:59 UTC cut-off) |
| After submitting | Optional X post tagging @twigpine with keepsake image |

## 8. Stretch goals (only if time)
- Letter + timed wax seal ending (see 3.3b)
- Couch co-op (deferred: judges play solo; revisit after the contest)
- Seasons across days (new flowers by season)
- Herbarium page showing best press of each type
- Seasonal paper and tape unlocks
- Background music loop

## 9. Risks
| Risk | Mitigation |
|---|---|
| Missing the deadline | Loop playable on day 1; everything after is polish; submit early and resubmit if improved |
| Asset rule breach | All art code-drawn; review every photo for brands/personal info |
| Mobile layout cramped | Landscape scaling + rotate hint; large handles |
| Pressing feels unfair | Visible zones, per-flower tuning, playtest |
