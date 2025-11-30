import React from 'react';
import { LANGUAGES } from '../constants';
import { Language } from '../types';

interface Props {
  nativeLang: Language;
  targetLang: Language;
  setNativeLang: (l: Language) => void;
  setTargetLang: (l: Language) => void;
  onStart: () => void;
}

const WelcomeScreen: React.FC<Props> = ({ 
  nativeLang, targetLang, setNativeLang, setTargetLang, onStart 
}) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl shadow-2xl max-w-md w-full border border-white/20">
        <h1 className="text-4xl font-bold text-center mb-2 display-font">LingoPop! 🍭</h1>
        <p className="text-center text-white/80 mb-8">Your fun AI pocket dictionary.</p>

        <div className="space-y-6">
          {/* Native Language */}
          <div className="space-y-2">
            <label className="text-sm font-semibold uppercase tracking-wider opacity-80">I speak</label>
            <div className="grid grid-cols-2 gap-2">
              <select 
                value={nativeLang.code}
                onChange={(e) => setNativeLang(LANGUAGES.find(l => l.code === e.target.value) || LANGUAGES[0])}
                className="w-full bg-white/20 border border-white/30 rounded-xl p-3 text-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white [&>option]:text-slate-900"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.flag} {lang.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Language */}
          <div className="space-y-2">
            <label className="text-sm font-semibold uppercase tracking-wider opacity-80">I want to learn</label>
            <div className="grid grid-cols-2 gap-2">
               <select 
                value={targetLang.code}
                onChange={(e) => setTargetLang(LANGUAGES.find(l => l.code === e.target.value) || LANGUAGES[1])}
                className="w-full bg-white/20 border border-white/30 rounded-xl p-3 text-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white [&>option]:text-slate-900"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.flag} {lang.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            onClick={onStart}
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-indigo-900 font-bold text-xl py-4 rounded-xl shadow-lg transform transition active:scale-95 flex items-center justify-center gap-2 mt-4"
          >
            Let's Go! 🚀
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;