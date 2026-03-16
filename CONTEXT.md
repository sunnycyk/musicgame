# Music Flashcard Game

## Overview
This is a music game similar to a flashcard game, designed to help music learners identify music notes quickly and accurately under different key signatures.

## Game Mechanics
1. **Game Menu**:
   - **Player Name**: Users must enter their name before starting a session.
   - **Mode Selection**:
     - **No Key Signature**: Only the music note card is shown. Questions assume "C Major" (no sharps/flats in the key signature).
     - **With Key Signature**: Both the key signature card and music note card are shown.
2. **Decks of Cards**:
   - **Key Signature Deck**: Contains cards showing different key signatures in either Treble Clef or Bass Clef.
   - **Music Note Deck**: Contains cards showing pictures of music notes.
3. **Gameplay Interface**:
   - Two cards are displayed on the screen (or one in "No Key" mode).
   - 3 answer boxes are displayed at the bottom of the screen.
4. **Logic**:
   - The correct answer depends on both the note shown and the active key signature.
5. **Session Flow and Scoring**:
   - A session consists of **30 questions**.
   - The timer runs continuously, and the total time is accumulated.
   - The final score is the total elapsed time in seconds.
   - Shorter total time results in a higher ranking.
6. **Aesthetics**:
   - Harmonic color palettes and background images featuring outlines/silhouettes of famous musicians.
5. **Game Modes**:
   - **Phase 1 (Initial)**: Asynchronous single-player game mode.
   - **Phase 2 (Future)**: Real-time multiplayer game mode using WebSockets, built once the base game is mature.
