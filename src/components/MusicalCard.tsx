import { useEffect, useRef } from 'react';
import { Renderer, Stave, StaveNote, Formatter } from 'vexflow';

interface MusicalCardProps {
  type: 'key' | 'note';
  keySignature?: string;
  clef?: 'treble' | 'bass';
  note?: string;
  octave?: number;
}

const MusicalCard: React.FC<MusicalCardProps> = ({ type, keySignature = 'C', clef = 'treble', note, octave = 4 }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
    renderer.resize(240, 300);
    const context = renderer.getContext();
    context.scale(1.2, 1.2);
    
    // Custom styling
    context.setFillStyle('#2c3e50');
    context.setStrokeStyle('#2c3e50');

    const stave = new Stave(10, 60, 180);
    stave.addClef(clef);
    
    if (type === 'key') {
      stave.addKeySignature(keySignature);
    }
    
    stave.setContext(context).draw();

    if (type === 'note' && note) {
      const staveNote = new StaveNote({
        clef: clef,
        keys: [`${note.toLowerCase()}/${octave}`],
        duration: 'q',
      });

      Formatter.FormatAndDraw(context, stave, [staveNote]);
    }
  }, [type, keySignature, clef, note, octave]);

  return (
    <div className="musical-card-inner" ref={containerRef}></div>
  );
};

export default MusicalCard;
