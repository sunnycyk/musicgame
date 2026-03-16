import { useState, useEffect } from 'react';
import './App.css';
import type { KeySignature, NoteName } from './logic/MusicEngine';
import { MusicEngine, KEY_SIGNATURES } from './logic/MusicEngine';
import MusicalCard from './components/MusicalCard';

type GameState = 'MENU' | 'PLAYING' | 'GAMEOVER';
type GameMode = 'NO_KEY' | 'WITH_KEY';

function App() {
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [gameMode, setGameMode] = useState<GameMode>('WITH_KEY');
  const [playerName, setPlayerName] = useState('');
  
  const [currentKey, setCurrentKey] = useState<KeySignature>(KEY_SIGNATURES[0]);
  const [currentNote, setCurrentNote] = useState<NoteName>('C');
  const [choices, setChoices] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [round, setRound] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const MAX_ROUNDS = 30;

  useEffect(() => {
    let interval: number;
    if (gameState === 'PLAYING' && round < MAX_ROUNDS) {
      interval = setInterval(() => {
        setTimer((prev: number) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, round]);

  const startGame = (mode: GameMode) => {
    if (!playerName.trim()) return;
    setGameMode(mode);
    setScore(0);
    setTimer(0);
    setRound(0);
    setGameState('PLAYING');
    generateNewQuestion(mode);
  };

  const generateNewQuestion = (mode = gameMode) => {
    if (round >= MAX_ROUNDS) {
      setGameState('GAMEOVER');
      return;
    }

    let randomKey: KeySignature;
    if (mode === 'NO_KEY') {
      // Force C Major for "No Key Signature" mode
      randomKey = KEY_SIGNATURES.find(k => k.shortName === 'C' && k.clef === 'treble') || KEY_SIGNATURES[0];
    } else {
      randomKey = KEY_SIGNATURES[Math.floor(Math.random() * KEY_SIGNATURES.length)];
    }

    const notes: NoteName[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const randomNote = notes[Math.floor(Math.random() * notes.length)];
    
    const correct = MusicEngine.getEffectiveNote(randomNote, randomKey);
    const newChoices = MusicEngine.generateChoices(correct, mode === 'WITH_KEY');
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentKey(randomKey);
      setCurrentNote(randomNote);
      setChoices(newChoices);
      setRound((prev: number) => prev + 1);
      setIsTransitioning(false);
    }, 300);
  };

  const handleAnswer = (answer: string) => {
    if (isTransitioning || gameState !== 'PLAYING') return;

    const correct = MusicEngine.getEffectiveNote(currentNote, currentKey);
    if (answer === correct) {
      setScore((prev: number) => prev + 1);
      generateNewQuestion();
    } else {
      const btn = document.activeElement as HTMLElement;
      btn?.classList.add('shake');
      setTimeout(() => btn?.classList.remove('shake'), 500);
    }
  };

  if (gameState === 'MENU') {
    return (
      <div className="game-container menu-container">
        <h1 className="menu-title">Musical Flashcards</h1>
        <div className="name-input-group">
          <input 
            type="text" 
            placeholder="Enter Your Name" 
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="name-input"
          />
        </div>
        <div className="mode-selection">
          <button 
            className="menu-button" 
            disabled={!playerName.trim()}
            onClick={() => startGame('NO_KEY')}
          >
            No Key Signature
          </button>
          <button 
            className="menu-button" 
            disabled={!playerName.trim()}
            onClick={() => startGame('WITH_KEY')}
          >
            With Key Signature
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'GAMEOVER') {
    return (
      <div className="game-container game-over">
        <h1 className="menu-title">Session Complete!</h1>
        <div className="stats-results">
          <p className="player-highlight">{playerName}</p>
          <p>Total Time: <span className="time-highlight">{timer}s</span></p>
          <p>Questions Answered: {score} / {MAX_ROUNDS}</p>
          <p className="ranking-label">
            Rank: {timer < 60 ? 'Mozart (S)' : timer < 120 ? 'Beethoven (A)' : 'Student (B)'}
          </p>
        </div>
        <button className="menu-button" onClick={() => setGameState('MENU')}>Main Menu</button>
      </div>
    );
  }

  return (
    <div className="game-container">
      <header className="game-header">
        <div className="stat-box">Progress: {round} / {MAX_ROUNDS}</div>
        <div className="stat-box headline">{playerName}</div>
        <div className="stat-box">Time: {timer}s</div>
      </header>

      <main className="cards-area">
        <div className={`card-container ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
          {gameMode === 'WITH_KEY' && (
            <div className="card-wrapper">
              <span className="card-label">Key Signature</span>
              <div className="card">
                <MusicalCard 
                  type="key" 
                  keySignature={currentKey.shortName} 
                  clef={currentKey.clef} 
                />
              </div>
            </div>
          )}
          <div className="card-wrapper">
            <span className="card-label">Note</span>
            <div className="card">
              <MusicalCard 
                type="note" 
                note={currentNote} 
                clef={currentKey.clef}
                octave={currentKey.clef === 'treble' ? 4 : 2}
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="answers-area">
        {choices.map((choice: string) => (
          <button 
            key={choice} 
            className="answer-box"
            onClick={() => handleAnswer(choice)}
          >
            {choice}
          </button>
        ))}
      </footer>
    </div>
  );
}

export default App;
