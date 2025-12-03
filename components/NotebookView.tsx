import React, { useState, useMemo } from 'react';
import { SavedItem, SavedSentence } from '../types';
import { BookOpen, Sparkles, Trash2, ArrowRight, Play, CheckSquare, Square } from 'lucide-react';
import { weaveStory, generateSpeech } from '../services/geminiService';
import { playAudioData } from '../services/audioService';

interface Props {
  items: SavedItem[];
  savedSentences: SavedSentence[];
  nativeLangName: string;
  onDelete: (id: string) => void;
  onDeleteSentence: (id: string) => void;
  onReview: (item: SavedItem) => void;
}

const NotebookView: React.FC<Props> = ({ 
  items, 
  savedSentences,
  nativeLangName, 
  onDelete, 
  onDeleteSentence,
  onReview 
}) => {
  const [activeLang, setActiveLang] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'words' | 'sentences'>('words');
  const [story, setStory] = useState<string | null>(null);
  const [loadingStory, setLoadingStory] = useState(false);
  const [selectedWordIds, setSelectedWordIds] = useState<Set<string>>(new Set());
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  // Group items by target language
  const availableLanguages = useMemo(() => {
    const langs = new Set<string>();
    items.forEach(i => langs.add(i.targetLang));
    savedSentences.forEach(s => langs.add(s.targetLang));
    return Array.from(langs);
  }, [items, savedSentences]);

  // Set default active language if not set
  React.useEffect(() => {
    if (!activeLang && availableLanguages.length > 0) {
      setActiveLang(availableLanguages[0]);
    }
  }, [availableLanguages, activeLang]);

  // Filter items based on active language
  const filteredWords = useMemo(() => {
    return items.filter(i => i.targetLang === activeLang);
  }, [items, activeLang]);

  const filteredSentences = useMemo(() => {
    return savedSentences.filter(s => s.targetLang === activeLang);
  }, [savedSentences, activeLang]);

  const toggleWordSelection = (id: string) => {
    const next = new Set(selectedWordIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedWordIds(next);
  };

  const handleWeaveStory = async () => {
    const wordsToWeave = filteredWords.filter(w => selectedWordIds.has(w.id));
    
    if (wordsToWeave.length < 2) return;
    
    setLoadingStory(true);
    try {
      const generated = await weaveStory(wordsToWeave, nativeLangName);
      setStory(generated);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStory(false);
    }
  };

  const handlePlaySentence = async (text: string, id: string) => {
    if (playingAudio) return;
    setPlayingAudio(id);
    try {
      const base64 = await generateSpeech(text);
      if (base64) await playAudioData(base64);
    } catch(e) { console.error(e); }
    finally { setPlayingAudio(null); }
  };

  if (availableLanguages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 text-slate-400">
        <BookOpen size={64} className="mb-4 opacity-20" />
        <h3 className="text-xl font-bold mb-2">Your notebook is empty</h3>
        <p>Save words or sentences to get started.</p>
      </div>
    );
  }

  return (
    <div className="pb-24 max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800 display-font">My Notebook</h2>
      </div>

      {/* Language Tabs */}
      <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
        {availableLanguages.map(lang => (
          <button
            key={lang}
            onClick={() => { setActiveLang(lang); setSelectedWordIds(new Set()); }}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all ${
              activeLang === lang 
              ? 'bg-slate-800 text-white shadow-lg' 
              : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {lang}
          </button>
        ))}
      </div>

      {/* Sub Tabs (Words / Sentences) */}
      <div className="flex bg-slate-200 rounded-xl p-1 mb-6">
        <button 
          onClick={() => setActiveTab('words')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'words' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Words ({filteredWords.length})
        </button>
        <button 
          onClick={() => setActiveTab('sentences')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'sentences' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Sentences ({filteredSentences.length})
        </button>
      </div>

      {/* Story Result */}
      {story && (
        <div className="mb-8 bg-gradient-to-br from-indigo-900 to-purple-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden animate-slide-up">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500"></div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="text-yellow-400" /> AI Story Time
          </h3>
          <p className="whitespace-pre-wrap leading-relaxed opacity-90">{story}</p>
          <button 
            onClick={() => setStory(null)}
            className="mt-4 text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white"
          >
            Close Story
          </button>
        </div>
      )}

      {/* WORDS VIEW */}
      {activeTab === 'words' && (
        <>
          {filteredWords.length > 0 && (
             <div className="flex justify-between items-center mb-4 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
               <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">
                 {selectedWordIds.size} Selected
               </span>
               <button 
                 onClick={handleWeaveStory}
                 disabled={loadingStory || selectedWordIds.size < 2}
                 className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
               >
                 <Sparkles size={14} />
                 {loadingStory ? 'Weaving...' : 'Weave Story'}
               </button>
             </div>
          )}

          <div className="grid gap-4">
            {filteredWords.length === 0 && (
               <div className="text-center py-10 text-slate-400 italic">No words saved for {activeLang}.</div>
            )}
            {filteredWords.map(item => {
              const isSelected = selectedWordIds.has(item.id);
              return (
                <div key={item.id} className={`bg-white p-4 rounded-xl shadow-sm border transition flex items-center gap-4 cursor-pointer ${isSelected ? 'border-indigo-400 ring-1 ring-indigo-100' : 'border-slate-100 hover:border-indigo-200'}`}
                  onClick={() => toggleWordSelection(item.id)}
                >
                  <div className={`text-indigo-500 transition-transform ${isSelected ? 'scale-110' : 'opacity-30'}`}>
                    {isSelected ? <CheckSquare /> : <Square />}
                  </div>

                  <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0" onClick={(e) => { e.stopPropagation(); onReview(item); }}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.word} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">No Img</div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0" onClick={(e) => { e.stopPropagation(); onReview(item); }}>
                      <h3 className="font-bold text-lg text-slate-900 truncate">{item.word}</h3>
                      <p className="text-sm text-slate-500 truncate">{item.explanation}</p>
                  </div>

                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                    className="p-2 text-slate-300 hover:text-red-500 transition"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* SENTENCES VIEW */}
      {activeTab === 'sentences' && (
        <div className="space-y-4">
          {filteredSentences.length === 0 && (
             <div className="text-center py-10 text-slate-400 italic">No sentences saved for {activeLang}.</div>
          )}
          {filteredSentences.map(s => (
             <div key={s.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-indigo-100 transition relative">
                <div className="flex gap-4">
                   <button 
                     onClick={() => handlePlaySentence(s.original, s.id)}
                     disabled={playingAudio === s.id}
                     className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition ${playingAudio === s.id ? 'bg-indigo-100 text-indigo-500 animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'}`}
                   >
                     <Play size={18} fill="currentColor" />
                   </button>
                   <div className="flex-1">
                      <p className="text-slate-800 font-medium text-lg leading-relaxed mb-1">{s.original}</p>
                      <p className="text-slate-500 text-sm">{s.translated}</p>
                   </div>
                   <button 
                    onClick={() => onDeleteSentence(s.id)}
                    className="flex-shrink-0 text-slate-300 hover:text-red-500 self-start"
                   >
                     <Trash2 size={18} />
                   </button>
                </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotebookView;