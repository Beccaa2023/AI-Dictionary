import React, { useState } from 'react';
import { SavedItem } from '../types';
import { RotateCcw, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { playAudioData } from '../services/audioService';
import { generateSpeech } from '../services/geminiService';

interface Props {
  items: SavedItem[];
  onExit: () => void;
}

const FlashcardMode: React.FC<Props> = ({ items, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [finished, setFinished] = useState(false);

  if (items.length === 0) return null;

  const currentItem = items[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex < items.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setFinished(true);
      }
    }, 200);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev - 1), 200);
    }
  };

  const handlePlayAudio = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const base64 = await generateSpeech(currentItem.word);
    if (base64) playAudioData(base64);
  };

  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] p-8 text-center">
        <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2 display-font">All Done!</h2>
        <p className="text-slate-500 mb-8">You've reviewed all your words.</p>
        <button 
          onClick={onExit}
          className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-indigo-700 transition"
        >
          Back to Notebook
        </button>
        <button 
          onClick={() => { setFinished(false); setCurrentIndex(0); }}
          className="mt-4 text-indigo-600 font-semibold hover:underline"
        >
          Restart
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <div className="w-full max-w-sm aspect-[3/4] perspective-1000 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
        <div className={`relative w-full h-full duration-500 transform-style-3d transition-all ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* Front */}
          <div className="absolute w-full h-full backface-hidden bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 flex flex-col items-center justify-center">
            <div className="absolute top-4 right-4 text-xs text-slate-400 font-bold uppercase tracking-widest">
              {currentIndex + 1} / {items.length}
            </div>
            
            <div className="w-32 h-32 mb-8 rounded-2xl overflow-hidden shadow-inner bg-slate-100">
               {currentItem.imageUrl && <img src={currentItem.imageUrl} className="w-full h-full object-cover" />}
            </div>
            
            <h2 className="text-4xl font-bold text-slate-800 text-center mb-4 display-font">{currentItem.word}</h2>
            <p className="text-slate-400 text-sm">Tap to flip</p>
            
            <button 
              onClick={handlePlayAudio}
              className="mt-6 p-3 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition"
            >
              <span className="sr-only">Play</span>
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </button>
          </div>

          {/* Back */}
          <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-2xl p-8 flex flex-col justify-center text-white">
            <h3 className="text-2xl font-bold mb-4 border-b border-white/20 pb-2">{currentItem.word}</h3>
            <p className="text-lg font-medium mb-6 opacity-90">{currentItem.explanation}</p>
            
            {currentItem.examples[0] && (
              <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                <p className="text-sm italic mb-1">"{currentItem.examples[0].original}"</p>
                <p className="text-xs opacity-70">{currentItem.examples[0].translated}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <button 
          onClick={handlePrev} 
          disabled={currentIndex === 0}
          className="p-4 bg-white rounded-full shadow-lg text-slate-600 disabled:opacity-30 hover:scale-110 transition"
        >
          <ChevronLeft />
        </button>
        <button 
          onClick={handleNext}
          className="p-4 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-200 hover:scale-110 transition"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};

export default FlashcardMode;