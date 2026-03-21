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

export type MaintenanceLevel = "wash-and-go" | "styled-daily" | "high-maintenance";
export type HairDensity = "fine" | "medium" | "thick";
export type VolumeLevel = "flat" | "natural" | "big";
export type HairType =
  | "1a" | "1b" | "1c"
  | "2a" | "2b" | "2c"
  | "3a" | "3b" | "3c"
  | "4a" | "4b" | "4c";

export interface AuxOptions {
  maintenance: MaintenanceLevel | null;
  density: HairDensity | null;
  volume: VolumeLevel | null;
  hairType: HairType | null;
}

export type MoodboardCategory = "colour" | "texture" | "length-shape";

export interface MoodboardEntry {
  id: string;
  file: File;
  previewUrl: string;
  category: MoodboardCategory;
}
