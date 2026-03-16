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
  const [currentOctave, setCurrentOctave] = useState(4);
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
    
    // Widen range: random octave based on clef (Narrowed for beginners)
    // Treble: 4 to 5 (Standard staff range)
    // Bass: 2 to 3 (Standard staff range)
    const randomOctave = randomKey.clef === 'treble' 
      ? Math.floor(Math.random() * 2) + 4 
      : Math.floor(Math.random() * 2) + 2;

    const correct = MusicEngine.getEffectiveNote(randomNote, randomKey);
    const newChoices = MusicEngine.generateChoices(correct, mode === 'WITH_KEY');
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentKey(randomKey);
      setCurrentNote(randomNote);
      setCurrentOctave(randomOctave);
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
      
      // Calculate rank and sparkle on correct answer
      const rect = (document.activeElement as HTMLElement)?.getBoundingClientRect();
      if (rect) {
        createSparkles(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }
      
      generateNewQuestion();
    } else {
      const btn = document.activeElement as HTMLElement;
      btn?.classList.add('shake');
      setTimeout(() => btn?.classList.remove('shake'), 500);
    }
  };

  const createSparkles = (x: number, y: number) => {
    const colors = ['#ff6b81', '#7bed9f', '#70a1ff', '#ffa502', '#ffd32a'];
    for (let i = 0; i < 15; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle';
      sparkle.style.left = `${x}px`;
      sparkle.style.top = `${y}px`;
      sparkle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      
      const angle = Math.random() * Math.PI * 2;
      const dist = 50 + Math.random() * 100;
      sparkle.style.setProperty('--x', `${Math.cos(angle) * dist}px`);
      sparkle.style.setProperty('--y', `${Math.sin(angle) * dist}px`);
      
      document.body.appendChild(sparkle);
      setTimeout(() => sparkle.remove(), 1000);
    }
  };

  const getRanking = (time: number) => {
    if (time < 60) return { title: 'Music Star 🌟', rank: 'S' };
    if (time < 120) return { title: 'Rhythm Hero 🎸', rank: 'A' };
    return { title: 'Note Learner 🎵', rank: 'B' };
  };

  if (gameState === 'MENU') {
    return (
      <div className="game-container menu-container">
        <h1 className="menu-title">Musical Playground</h1>
        <div className="name-input-group">
          <input 
            type="text" 
            placeholder="What's your name?" 
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="name-input"
          />
        </div>
        <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ff6b81', marginBottom: '1rem' }}>Ready to start your adventure?</p>
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
    const rankInfo = getRanking(timer);
    return (
      <div className="game-container game-over">
        <h1 className="menu-title">Great Job!</h1>
        <div className="stats-results">
          <p className="player-highlight">{playerName}!</p>
          <p style={{ fontSize: '1.8rem', fontWeight: 900 }}>You finished in <span className="time-highlight">{timer} seconds!</span></p>
          <p style={{ fontSize: '1.5rem' }}>Notes Found: {score} out of {MAX_ROUNDS}</p>
          <p className="ranking-label">
            Your Rank: {rankInfo.title}
          </p>
        </div>
        <button className="menu-button" onClick={() => setGameState('MENU')}>Play Again! 🎨</button>
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
                octave={currentOctave}
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
