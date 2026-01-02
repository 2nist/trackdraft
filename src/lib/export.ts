import { Song } from '../types/music';

/**
 * Export utilities for songs
 */

/**
 * Export lyrics as plain text
 */
export function exportLyrics(song: Song): string {
  const sections = song.sections
    .map((section) => {
      const header = `[${section.type.toUpperCase()}]`;
      return `${header}\n${section.lyrics || '(no lyrics)'}\n`;
    })
    .join('\n');
  
  return sections;
}

/**
 * Export structure as plain text
 */
export function exportStructure(song: Song): string {
  let output = `Song Structure: ${song.title}\n`;
  output += `Key: ${song.key.root} ${song.key.mode}\n`;
  output += `Tempo: ${song.tempo} BPM\n\n`;
  
  const structure = song.sections
    .map((section, index) => {
      let line = `${index + 1}. ${section.type.toUpperCase()}`;
      if (section.duration) {
        line += ` - ${section.duration} bars`;
      }
      if (section.narrativePurpose) {
        line += `\n   Purpose: ${section.narrativePurpose}`;
      }
      return line;
    })
    .join('\n');
  
  return output + structure;
}

/**
 * Export chords and lyrics together (chord chart format)
 */
export function exportChordChart(song: Song): string {
  let output = `${song.title}\n`;
  output += `Key: ${song.key.root} ${song.key.mode} | Tempo: ${song.tempo} BPM\n`;
  output += '='.repeat(50) + '\n\n';
  
  // If there's a main progression, show it first
  if (song.progression && song.progression.length > 0) {
    output += 'Main Progression: ';
    output += song.progression.map(chord => chord.name || chord.romanNumeral).join(' - ');
    output += '\n\n';
  }
  
  // Export each section with chords and lyrics
  song.sections.forEach((section) => {
    output += `[${section.type.toUpperCase()}]\n`;
    
    // If section has chords, show them
    if (section.chords && section.chords.length > 0) {
      const chordNames = section.chords.map(c => c.name || c.romanNumeral).join(' | ');
      output += `Chords: ${chordNames}\n`;
    }
    
    // Add lyrics
    if (section.lyrics) {
      output += section.lyrics + '\n';
    } else {
      output += '(no lyrics)\n';
    }
    
    if (section.duration) {
      output += `(${section.duration} bars)\n`;
    }
    
    output += '\n';
  });
  
  return output;
}

/**
 * Export as JSON (with proper date serialization)
 */
export function exportJSON(song: Song): string {
  // Create a copy and convert dates to ISO strings for JSON
  const songForExport = {
    ...song,
    createdAt: song.createdAt.toISOString(),
    updatedAt: song.updatedAt.toISOString(),
  };
  
  return JSON.stringify(songForExport, null, 2);
}

/**
 * Download a file with the given content
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Export song in the specified format
 */
export function exportSong(song: Song, format: 'lyrics' | 'structure' | 'chordchart' | 'json'): void {
  const sanitizedTitle = song.title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
  
  switch (format) {
    case 'lyrics':
      downloadFile(exportLyrics(song), `${sanitizedTitle}_lyrics.txt`, 'text/plain');
      break;
    case 'structure':
      downloadFile(exportStructure(song), `${sanitizedTitle}_structure.txt`, 'text/plain');
      break;
    case 'chordchart':
      downloadFile(exportChordChart(song), `${sanitizedTitle}_chord_chart.txt`, 'text/plain');
      break;
    case 'json':
      downloadFile(exportJSON(song), `${sanitizedTitle}_complete.json`, 'application/json');
      break;
  }
}

