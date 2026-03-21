export interface StyleItem {
  id: string;
  name: string;
  notes: string;
}

export type CollectionKey =
  | "paris"
  | "grunge"
  | "executive"
  | "coastal"
  | "curl"
  | "retro";

export type MoodboardCategory = "colour" | "texture" | "length-shape";

export interface MoodboardEntry {
  id: string;
  file: File;
  previewUrl: string;
  category: MoodboardCategory;
}
