/**
 * Song structure and narrative mapping types
 */

export type SectionType = 'intro' | 'verse' | 'chorus' | 'bridge' | 'outro';

export interface SectionPurpose {
  primaryGoal: string;
  secondaryConsiderations: string[];
  questions: string[];
  sensoryChecklist: string[];
}

export interface SongMap {
  id: string;
  name: string;
  structure: string; // e.g., "ABABCB"
  sections: Array<{
    type: SectionType;
    label: string; // e.g., "Verse 1", "Chorus"
    purpose: SectionPurpose;
  }>;
  narrativeLogic: string;
  prompts: Record<string, SectionPurpose>; // Keyed by section label
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  genres: string[];
  description?: string;
}

