import { useEffect, useRef } from 'react';
import { Renderer, Stave, StaveNote, Formatter } from 'vexflow';

interface MusicalCardProps {
  type: 'key' | 'note' | 'both';
  keySignature?: string;
  clef?: 'treble' | 'bass';
  note?: string;
  octave?: number;
  width?: number;
  height?: number;
}

const MusicalCard: React.FC<MusicalCardProps> = ({ 
  type, 
  keySignature = 'C', 
  clef = 'treble', 
  note, 
  octave = 4,
  width = 240,
  height = 300
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
    renderer.resize(width, height);
    const context = renderer.getContext();
    const scale = width / 200; // Base scale on width
    context.scale(scale, scale);
    
    // Custom styling
    context.setFillStyle('#2c3e50');
    context.setStrokeStyle('#2c3e50');

    const stave = new Stave(10, 60, 180);
    stave.addClef(clef);
    
    if (type === 'key' || type === 'both') {
      stave.addKeySignature(keySignature);
    }
    
    stave.setContext(context).draw();

    if ((type === 'note' || type === 'both') && note) {
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
