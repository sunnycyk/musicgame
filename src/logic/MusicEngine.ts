export type NoteName = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
export type Accidental = '' | '#' | 'b' | 'x' | 'bb';

export type Clef = 'treble' | 'bass';

export interface KeySignature {
  name: string;
  clef: Clef;
  shortName: string; // e.g. "G", "Eb"
  accidentals: Record<NoteName, Accidental>;
}

export const KEY_SIGNATURES: KeySignature[] = [
  // Treble Clef
  { name: 'C Major (Treble)', clef: 'treble', shortName: 'C', accidentals: { 'A': '', 'B': '', 'C': '', 'D': '', 'E': '', 'F': '', 'G': '' } },
  { name: 'A Minor (Treble)', clef: 'treble', shortName: 'Am', accidentals: { 'A': '', 'B': '', 'C': '', 'D': '', 'E': '', 'F': '', 'G': '' } },
  { name: 'G Major (Treble)', clef: 'treble', shortName: 'G', accidentals: { 'A': '', 'B': '', 'C': '', 'D': '', 'E': '', 'F': '#', 'G': '' } },
  { name: 'E Minor (Treble)', clef: 'treble', shortName: 'Em', accidentals: { 'A': '', 'B': '', 'C': '', 'D': '', 'E': '', 'F': '#', 'G': '' } },
  { name: 'D Major (Treble)', clef: 'treble', shortName: 'D', accidentals: { 'A': '', 'B': '', 'C': '#', 'D': '', 'E': '', 'F': '#', 'G': '' } },
  { name: 'B Minor (Treble)', clef: 'treble', shortName: 'Bm', accidentals: { 'A': '', 'B': '', 'C': '#', 'D': '', 'E': '', 'F': '#', 'G': '' } },
  { name: 'A Major (Treble)', clef: 'treble', shortName: 'A', accidentals: { 'A': '', 'B': '', 'C': '#', 'D': '', 'E': '', 'F': '#', 'G': '#' } },
  { name: 'F Major (Treble)', clef: 'treble', shortName: 'F', accidentals: { 'A': '', 'B': 'b', 'C': '', 'D': '', 'E': '', 'F': '', 'G': '' } },
  { name: 'D Minor (Treble)', clef: 'treble', shortName: 'Dm', accidentals: { 'A': '', 'B': 'b', 'C': '', 'D': '', 'E': '', 'F': '', 'G': '' } },
  { name: 'Bb Major (Treble)', clef: 'treble', shortName: 'Bb', accidentals: { 'A': '', 'B': 'b', 'C': '', 'D': '', 'E': 'b', 'F': '', 'G': '' } },
  { name: 'G Minor (Treble)', clef: 'treble', shortName: 'Gm', accidentals: { 'A': '', 'B': 'b', 'C': '', 'D': '', 'E': 'b', 'F': '', 'G': '' } },
  
  // Bass Clef
  { name: 'C Major (Bass)', clef: 'bass', shortName: 'C', accidentals: { 'A': '', 'B': '', 'C': '', 'D': '', 'E': '', 'F': '', 'G': '' } },
  { name: 'A Minor (Bass)', clef: 'bass', shortName: 'Am', accidentals: { 'A': '', 'B': '', 'C': '', 'D': '', 'E': '', 'F': '', 'G': '' } },
  { name: 'G Major (Bass)', clef: 'bass', shortName: 'G', accidentals: { 'A': '', 'B': '', 'C': '', 'D': '', 'E': '', 'F': '#', 'G': '' } },
  { name: 'F Major (Bass)', clef: 'bass', shortName: 'F', accidentals: { 'A': '', 'B': 'b', 'C': '', 'D': '', 'E': '', 'F': '', 'G': '' } },
  { name: 'D Minor (Bass)', clef: 'bass', shortName: 'Dm', accidentals: { 'A': '', 'B': 'b', 'C': '', 'D': '', 'E': '', 'F': '', 'G': '' } },
];

export class MusicEngine {
  static getEffectiveNote(note: NoteName, keySignature: KeySignature): string {
    const keyAccidental = keySignature.accidentals[note];
    return `${note}${keyAccidental}`;
  }

  static generateChoices(correctAnswer: string, allowAccidentals: boolean = true): string[] {
    const rawNotes = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const accidentals = ['', '#', 'b'];
    const choices = new Set<string>();
    choices.add(correctAnswer);
    
    while (choices.size < 3) {
      const randomNote = rawNotes[Math.floor(Math.random() * rawNotes.length)];
      const randomAcc = allowAccidentals 
        ? accidentals[Math.floor(Math.random() * accidentals.length)]
        : '';
      choices.add(`${randomNote}${randomAcc}`);
    }
    
    return Array.from(choices).sort(() => Math.random() - 0.5);
  }
}
