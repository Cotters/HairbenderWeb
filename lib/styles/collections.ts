import type { CollectionKey, StyleItem } from "./types";

export const COLLECTION_LABELS: Record<CollectionKey, string> = {
  paris: "The Paris Collection",
  grunge: "The Grunge Issue",
  executive: "The Executive",
  coastal: "The Coastal Edit",
  curl: "The Curl Manifesto",
  retro: "The Retro Archive",
};

export const COLLECTION_ORDER: CollectionKey[] = [
  "paris",
  "grunge",
  "executive",
  "coastal",
  "curl",
  "retro",
];

export const styleCollections: Record<CollectionKey, StyleItem[]> = {
  // ── The Paris Collection ──────────────────────────────────────────────────
  // European editorial chic: sleek, high-gloss, precisely tailored.
  paris: [
    { id: "paris-01", name: "Chic Bob",           notes: "Jaw-length, soft edge" },
    { id: "paris-02", name: "Glass Cut",           notes: "Blunt, high shine" },
    { id: "paris-03", name: "Italian Lob",         notes: "Mid-length, airy" },
    { id: "paris-04", name: "French Pixie",        notes: "Micro fringe" },
    { id: "paris-05", name: "Bixie",               notes: "Bob-pixie hybrid" },
    { id: "paris-06", name: "Curtain Fringe Lob",  notes: "Parted fringe, layered" },
    { id: "paris-07", name: "Voluminous Blowout",  notes: "Round, high-gloss volume" },
  ],

  // ── The Grunge Issue ──────────────────────────────────────────────────────
  // Raw texture, deliberate disorder, and subversive edge.
  grunge: [
    { id: "grunge-01", name: "Shag Matrix",   notes: "Layered, undone" },
    { id: "grunge-02", name: "Razor Wave",    notes: "Textured depth" },
    { id: "grunge-03", name: "Soft Mullet",   notes: "Short crown" },
    { id: "grunge-04", name: "Grit Fringe",   notes: "Broken bangs" },
    { id: "grunge-05", name: "Wolf Cut",      notes: "Shaggy, curtain fringe" },
    { id: "grunge-06", name: "Skater Crop",   notes: "Blunt fringe, faded sides" },
    { id: "grunge-07", name: "The Bettie",    notes: "Blunt cut, bold fringe" },
  ],

  // ── The Executive ─────────────────────────────────────────────────────────
  // Polished, structured precision — boardroom authority.
  executive: [
    { id: "exec-01", name: "The Boardroom",  notes: "Clean taper" },
    { id: "exec-02", name: "Contour Fade",   notes: "Sharp edges" },
    { id: "exec-03", name: "Classic Part",   notes: "Defined line" },
    { id: "exec-04", name: "Executive Crop", notes: "Tidy texture" },
    { id: "exec-05", name: "Skin Fade",      notes: "Bold high fade" },
    { id: "exec-06", name: "Slick Back",     notes: "Polished, swept back" },
    { id: "exec-07", name: "The Edgar",      notes: "Line-up, textured top" },
  ],

  // ── The Coastal Edit ──────────────────────────────────────────────────────
  // Effortless movement, beachy texture, sun-kissed ease.
  coastal: [
    { id: "coastal-01", name: "Beach Wave Lob",    notes: "Effortless mid-length" },
    { id: "coastal-02", name: "Mermaid Tides",     notes: "Long, sweeping waves" },
    { id: "coastal-03", name: "Salt & Texture",    notes: "Tousled, lived-in" },
    { id: "coastal-04", name: "Surfer Curtain",    notes: "Center-parted, wavy" },
    { id: "coastal-05", name: "Butterfly Cut",     notes: "Layered, face-framing" },
    { id: "coastal-06", name: "Windswept Layers",  notes: "Airy, face-framing" },
  ],

  // ── The Curl Manifesto ────────────────────────────────────────────────────
  // Natural curl and coil textures celebrated in full.
  curl: [
    { id: "curl-01", name: "Coily Crown Afro",    notes: "Full, spherical volume" },
    { id: "curl-02", name: "Defined Curl Lob",    notes: "Shoulder-length spirals" },
    { id: "curl-03", name: "Big Fro",             notes: "Maximalist volume" },
    { id: "curl-04", name: "Curly Shag",          notes: "Layered, bouncy texture" },
    { id: "curl-05", name: "Spiral Bounce",       notes: "Loose corkscrew ringlets" },
    { id: "curl-06", name: "Ringlet Bob",         notes: "Chin-length, tight curls" },
  ],

  // ── The Retro Archive ─────────────────────────────────────────────────────
  // Iconic silhouettes from the 1920s through the 1990s.
  retro: [
    { id: "retro-01", name: "70s Featherback",   notes: "Winged layers, sweep" },
    { id: "retro-02", name: "The Rachel",        notes: "90s layered lob" },
    { id: "retro-03", name: "Bouffant Crown",    notes: "60s high volume" },
    { id: "retro-04", name: "Finger Wave Bob",   notes: "20s sculpted S-waves" },
    { id: "retro-05", name: "Farrah Flick",      notes: "70s winged volume" },
    { id: "retro-06", name: "80s Power Shag",    notes: "Big volume, drama" },
  ],
};
