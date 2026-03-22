import { useState, useEffect } from 'react';
import './App.css';
import type { KeySignature, NoteName } from './logic/MusicEngine';
import { MusicEngine, KEY_SIGNATURES } from './logic/MusicEngine';
import { SoundEngine } from './logic/SoundEngine';
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
  const [incorrectGuesses, setIncorrectGuesses] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const MAX_ROUNDS = 30;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handleMobileChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handleMobileChange);
    return () => mediaQuery.removeEventListener('change', handleMobileChange);
  }, []);

  useEffect(() => {
    let interval: number;
    if (gameState === 'PLAYING' && round < MAX_ROUNDS) {
      interval = setInterval(() => {
        setTimer((prev: number) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, round]);

  const startGame = async (mode: GameMode) => {
    if (!playerName.trim()) return;
    
    // Initialize audio context on first user interaction
    await SoundEngine.init();

    setGameMode(mode);
    setScore(0);
    setTimer(0);
    setRound(0);
    setIncorrectGuesses(0);
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
    
    // Determine note string to play (e.g. C#4 instead of C#)
    let noteToPlay = answer.replace('b', 'b').replace('#', '#'); 
    SoundEngine.playNote(noteToPlay, currentOctave);

    if (answer === correct) {
      setScore((prev: number) => prev + 1);
      
      SoundEngine.playSuccessSound();

      // Calculate rank and sparkle on correct answer
      const rect = (document.activeElement as HTMLElement)?.getBoundingClientRect();
      if (rect) {
        createSparkles(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }
      
      generateNewQuestion();
    } else {
      setIncorrectGuesses((prev: number) => prev + 1);
      SoundEngine.playFailSound();
      
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

  const getRanking = (time: number, mistakes: number) => {
    const penaltyTime = mistakes * 3; // 3 seconds penalty per wrong guess
    const totalEffectiveTime = time + penaltyTime;
    
    // Adjusted thresholds slightly to account for penalties
    if (totalEffectiveTime < 90) return { title: 'Music Star 🌟', rank: 'S', effectiveTime: totalEffectiveTime, penaltyTime };
    if (totalEffectiveTime < 150) return { title: 'Rhythm Hero 🎸', rank: 'A', effectiveTime: totalEffectiveTime, penaltyTime };
    return { title: 'Note Learner 🎵', rank: 'B', effectiveTime: totalEffectiveTime, penaltyTime };
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
    const rankInfo = getRanking(timer, incorrectGuesses);
    return (
      <div className="game-container game-over">
        <h1 className="menu-title">Great Job!</h1>
        <div className="stats-results">
          <p className="player-highlight">{playerName}!</p>
          <p style={{ fontSize: '1.8rem', fontWeight: 900 }}>
            Time: <span className="time-highlight">{timer}s</span>
          </p>
          {incorrectGuesses > 0 && (
            <p style={{ fontSize: '1.2rem', color: '#ff6b81' }}>
              +{incorrectGuesses} mistakes ({rankInfo.penaltyTime}s penalty)
            </p>
          )}
          <p style={{ fontSize: '1.4rem' }}>
            Effective Time: <strong>{rankInfo.effectiveTime}s</strong>
          </p>
          <p style={{ fontSize: '1.5rem', marginTop: '1rem' }}>Notes Found: {score} out of {MAX_ROUNDS}</p>
          <p className="ranking-label">
            Your Rank: {rankInfo.title}
          </p>
        </div>
        <div className="mode-selection" style={{ marginTop: '2rem' }}>
          <button className="menu-button" style={{ background: '#7bed9f' }} onClick={() => setGameState('MENU')}>
            Play Again! 🎨
          </button>
        </div>
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
          {isMobile ? (
            <div className="card-wrapper">
              <span className="card-label">{gameMode === 'WITH_KEY' ? 'Key & Note' : 'Note'}</span>
              <div className="card">
                <MusicalCard 
                  type={gameMode === 'WITH_KEY' ? 'both' : 'note'} 
                  keySignature={currentKey.shortName} 
                  clef={currentKey.clef} 
                  note={currentNote}
                  octave={currentOctave}
                  width={isMobile ? 200 : 240}
                  height={isMobile ? 240 : 300}
                />
              </div>
            </div>
          ) : (
            <>
              {gameMode === 'WITH_KEY' && (
                <div className="card-wrapper">
                  <span className="card-label">Key Signature</span>
                  <div className="card">
                    <MusicalCard 
                      type="key" 
                      keySignature={currentKey.shortName} 
                      clef={currentKey.clef} 
                      width={240}
                      height={300}
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
                    width={240}
                    height={300}
                  />
                </div>
              </div>
            </>
          )}
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
