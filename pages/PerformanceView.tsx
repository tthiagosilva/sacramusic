import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getSongById, getSetlistById } from '../services/storage';
import { Song, MassMoment, SetlistCategory } from '../types';
import { ArrowLeft, ArrowRight, Music, Type, Moon, Sun, Minus, Plus, RefreshCw, Loader2 } from 'lucide-react';

// --- TRANSPOSITION LOGIC ---
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLATS: Record<string, string> = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#', 'Cb': 'B' };

const transposeNote = (note: string, semitones: number) => {
  const norm = FLATS[note] || note;
  const idx = NOTES.indexOf(norm);
  if (idx === -1) return note; // Not a recognized note
  let newIdx = (idx + semitones) % 12;
  if (newIdx < 0) newIdx += 12;
  return NOTES[newIdx];
};

const transposeChord = (chord: string, steps: number) => {
  const regex = /^([A-G][#b]?)([^/\s]*)(\/)?([A-G][#b]?)?([^/\s]*)?$/;
  const match = chord.match(regex);
  if (!match) return chord;
  const root = match[1];
  const suffix = match[2] || '';
  const slash = match[3] || '';
  const bass = match[4] || '';
  const bassSuffix = match[5] || '';
  const newRoot = transposeNote(root, steps);
  const newBass = bass ? transposeNote(bass, steps) : '';
  return `${newRoot}${suffix}${slash}${newBass}${bassSuffix}`;
};

const PerformanceView: React.FC = () => {
  const { setlistId, songId } = useParams<{ setlistId?: string; songId: string }>();
  const [searchParams] = useSearchParams();
  const indexParam = searchParams.get('idx'); 

  const navigate = useNavigate();
  const [song, setSong] = useState<Song | null>(null);
  const [mode, setMode] = useState<'lyrics' | 'chords'>('lyrics');
  const [fontSize, setFontSize] = useState(1);
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Transposition State
  const [transposeSteps, setTransposeSteps] = useState(0);

  // Sync with global theme
  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
        setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
      if (isDark) {
          document.documentElement.classList.remove('dark');
          setIsDark(false);
      } else {
          document.documentElement.classList.add('dark');
          setIsDark(true);
      }
  }

  // Navigation Logic
  const [nextSongUrl, setNextSongUrl] = useState<string | null>(null);
  const [prevSongUrl, setPrevSongUrl] = useState<string | null>(null);
  const [setlistTitle, setSetlistTitle] = useState<string>('');

  const isChordLine = (line: string): boolean => {
    const trimmed = line.trim();
    if (trimmed.length === 0) return false;
    const chordPattern = /^[A-G]([b#])?((m|maj|min|sus|dim|aug|add)?[0-9]*)?(\/[A-G]([b#])?)?$/;
    const tokens = trimmed.split(/\s+/);
    let chordCount = 0;
    tokens.forEach(token => {
      const cleanToken = token.replace(/[(),]/g, '');
      if (chordPattern.test(cleanToken)) chordCount++;
    });
    return (chordCount / tokens.length) > 0.4 || (chordCount > 0 && tokens.length < 3);
  };

  useEffect(() => {
    const loadData = async () => {
        if (songId) {
            const s = await getSongById(songId);
            if (s) {
                setSong(s);
                if (s.chords && s.chords.length > 10) setMode('chords');
                setTransposeSteps(0);
            }
        }

        if (setlistId && songId) {
            const setlist = await getSetlistById(setlistId);
            if (setlist) {
                setSetlistTitle(setlist.name);
                if (setlist.category === SetlistCategory.MISSA || !setlist.category) {
                    const moments = Object.values(MassMoment);
                    const momentKeysPresent: string[] = [];
                    moments.forEach(m => {
                        if (setlist.items[m]) momentKeysPresent.push(setlist.items[m]);
                    });
                    const currentIndex = momentKeysPresent.indexOf(songId);
                    if (currentIndex > 0) setPrevSongUrl(`/perform/${setlistId}/${momentKeysPresent[currentIndex - 1]}`);
                    else setPrevSongUrl(null);

                    if (currentIndex >= 0 && currentIndex < momentKeysPresent.length - 1) setNextSongUrl(`/perform/${setlistId}/${momentKeysPresent[currentIndex + 1]}`);
                    else setNextSongUrl(null);
                } 
                else if (setlist.customItems) {
                    const list = setlist.customItems;
                    const currentIdx = indexParam ? parseInt(indexParam) : list.findIndex(i => i.songId === songId);
                    if (currentIdx >= 0) {
                        if (currentIdx > 0) {
                            const prevItem = list[currentIdx - 1];
                            setPrevSongUrl(`/perform/${setlistId}/${prevItem.songId}?idx=${currentIdx - 1}`);
                        } else setPrevSongUrl(null);

                        if (currentIdx < list.length - 1) {
                            const nextItem = list[currentIdx + 1];
                            setNextSongUrl(`/perform/${setlistId}/${nextItem.songId}?idx=${currentIdx + 1}`);
                        } else setNextSongUrl(null);
                    }
                }
            }
        }
        setLoading(false);
    };
    loadData();
  }, [setlistId, songId, indexParam]);

  // --- MEMOIZED CONTENT TRANSFORMATION ---
  const displayedContent = useMemo(() => {
      if (!song) return [];
      
      const rawText = mode === 'chords' ? (song.chords || song.lyrics) : song.lyrics;
      if (!rawText) return [];

      const lines = rawText.split('\n');
      
      if (mode === 'lyrics' || transposeSteps === 0) {
          return lines.map(line => ({ text: line, isChord: mode === 'chords' && isChordLine(line) }));
      }

      return lines.map(line => {
          if (!isChordLine(line)) return { text: line, isChord: false };
          const tokenRegex = /([A-G][#b]?)([^/\s]*)(\/[A-G][#b]?)?([^/\s]*)?/g;
          const newLine = line.replace(tokenRegex, (match) => {
              return transposeChord(match, transposeSteps);
          });
          return { text: newLine, isChord: true };
      });

  }, [song, mode, transposeSteps]);

  // Calculate Display Key
  const currentKey = useMemo(() => {
      if (!song || !song.key) return '';
      const match = song.key.match(/^([A-G][#b]?)/);
      if (!match) return song.key;
      const root = match[1];
      const newRoot = transposeNote(root, transposeSteps);
      return song.key.replace(root, newRoot);
  }, [song, transposeSteps]);


  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-slate-400" />
    </div>
  );
  
  if (!song) return <div className="p-10 text-center dark:text-white">Música não encontrada.</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex flex-col font-sans transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-30 px-3 py-2 sm:px-4 sm:py-3 shadow-sm">
         <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3 overflow-hidden">
                <button onClick={() => navigate(setlistId ? `/setlists/${setlistId}` : '/songs')} className="p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800">
                    <ArrowLeft size={24} />
                </button>
                <div className="flex flex-col overflow-hidden">
                    <h1 className="font-serif font-bold text-slate-900 dark:text-slate-100 text-lg sm:text-xl truncate">{song.title}</h1>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        {setlistTitle && <span className="truncate max-w-[150px]">{setlistTitle}</span>}
                    </div>
                </div>
            </div>

            <div className="flex gap-2 shrink-0">
                <button 
                    onClick={toggleTheme}
                    className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                >
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>
         </div>
         
         {/* Toolbar */}
         <div className="flex items-center justify-between bg-slate-100 dark:bg-zinc-800 rounded-lg p-1 gap-2">
             <div className="flex gap-1">
                <button 
                    onClick={() => setMode('lyrics')}
                    className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-bold transition-colors ${mode === 'lyrics' ? 'bg-white dark:bg-zinc-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                >
                    Letra
                </button>
                <button 
                    onClick={() => setMode('chords')}
                    className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-bold transition-colors ${mode === 'chords' ? 'bg-white dark:bg-zinc-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                >
                    Cifra
                </button>
             </div>

             {/* Transpose Controls (Only visible in Chords mode) */}
             {mode === 'chords' && (
                 <div className="flex items-center bg-white dark:bg-zinc-700 rounded-md shadow-sm px-1">
                    <button onClick={() => setTransposeSteps(s => s - 1)} className="p-1.5 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-600 rounded">
                        <Minus size={14} />
                    </button>
                    <div className="px-2 min-w-[3.5rem] text-center flex flex-col leading-none">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Tom</span>
                        <span className="text-sm font-bold text-accent-600 dark:text-accent-400">{currentKey || '?'}</span>
                    </div>
                    <button onClick={() => setTransposeSteps(s => s + 1)} className="p-1.5 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-600 rounded">
                        <Plus size={14} />
                    </button>
                 </div>
             )}
             
             {/* Reset Button (if transposed) */}
             {transposeSteps !== 0 && mode === 'chords' && (
                 <button onClick={() => setTransposeSteps(0)} className="p-1.5 text-slate-400 hover:text-slate-600">
                     <RefreshCw size={14} />
                 </button>
             )}
         </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto bg-white dark:bg-black">
        <div 
            className={`max-w-3xl mx-auto whitespace-pre-wrap leading-relaxed ${mode === 'chords' ? 'font-mono text-sm sm:text-base' : 'font-sans text-lg sm:text-xl'}`}
            style={{ fontSize: `${mode === 'chords' ? 14 * fontSize : 18 * fontSize}px` }}
        >
            {displayedContent.map((lineObj, i) => {
                return (
                    <div 
                        key={i} 
                        className={`${lineObj.isChord ? 'text-orange-600 dark:text-orange-400 font-bold mt-4 mb-0' : 'text-slate-800 dark:text-slate-200 mb-1'} min-h-[1.5em]`}
                    >
                        {lineObj.text || ' '}
                    </div>
                );
            })}
        </div>
      </main>

      {/* Footer / Navigation Controls */}
      <footer className="sticky bottom-0 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 p-3 z-30">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
             <button 
                onClick={() => setFontSize(s => Math.max(0.8, s - 0.1))}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 font-serif font-bold hover:bg-slate-200 dark:hover:bg-zinc-700 active:scale-95"
             >
                A-
             </button>

             <div className="flex gap-4 flex-1 justify-center max-w-xs">
                 <button 
                    disabled={!prevSongUrl}
                    onClick={() => prevSongUrl && navigate(prevSongUrl)}
                    className="flex-1 bg-slate-800 dark:bg-zinc-700 text-white h-12 rounded-2xl flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed shadow-lg active:scale-95 transition-transform"
                 >
                    <ArrowLeft size={24} />
                 </button>
                 <button 
                    disabled={!nextSongUrl}
                    onClick={() => nextSongUrl && navigate(nextSongUrl)}
                    className="flex-1 bg-accent-600 dark:bg-accent-700 text-white h-12 rounded-2xl flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed shadow-lg active:scale-95 transition-transform"
                 >
                    <ArrowRight size={24} />
                 </button>
             </div>

             <button 
                onClick={() => setFontSize(s => Math.min(2, s + 0.1))}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 font-serif font-bold hover:bg-slate-200 dark:hover:bg-zinc-700 active:scale-95"
             >
                A+
             </button>
        </div>
      </footer>
    </div>
  );
};

export default PerformanceView;