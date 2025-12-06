
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Music2, Loader2, Edit, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { getSongs, deleteSong } from '../services/storage';
import { Song } from '../types';

const SongList: React.FC = () => {
  const { userProfile } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    const data = await getSongs();
    setSongs(data);
    setLoading(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Tem certeza que deseja excluir esta música?')) {
        await deleteSong(id);
        setSongs(prev => prev.filter(s => s.id !== id));
    }
  };

  const filteredSongs = songs.filter(song => {
    const term = searchTerm.toLowerCase();
    return (
      song.title.toLowerCase().includes(term) || 
      song.lyrics.toLowerCase().includes(term) ||
      song.moments.some(m => m.toLowerCase().includes(term)) || 
      song.seasons.some(s => s.toLowerCase().includes(term))
    );
  });

  const getTagStyle = (moment: string) => {
    const m = moment.toLowerCase();
    if (m.includes('penitencial') || m.includes('quaresma')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    if (m.includes('gloria') || m.includes('glória') || m.includes('santo') || m.includes('natal') || m.includes('pascoa')) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    if (m.includes('maria') || m.includes('nossa senhora')) return 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 border-sky-200 dark:border-sky-800';
    if (m.includes('entrada')) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    if (m.includes('comunhão') || m.includes('comunhao')) return 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    
    return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
  };

  const canEdit = userProfile?.isSubscriber;

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100">Músicas</h1>
          {canEdit && (
            <Link to="/songs/new" className="bg-accent-600 hover:bg-accent-500 dark:bg-accent-700 dark:hover:bg-accent-600 text-white p-3 rounded-full shadow-lg transition-transform active:scale-95">
                <Plus size={24} />
            </Link>
          )}
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por título, letra, momento..."
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-accent-500 shadow-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-4 top-4 text-slate-400 dark:text-zinc-500 w-5 h-5" />
        </div>

        {loading ? (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
            </div>
        ) : (
            <div className="space-y-3">
            {filteredSongs.length === 0 ? (
                <div className="text-center py-12 text-slate-400 dark:text-zinc-600">
                <Music2 className="mx-auto w-12 h-12 mb-3 opacity-50" />
                <p>Nenhuma música encontrada.</p>
                </div>
            ) : (
                filteredSongs.map(song => (
                <div 
                    key={song.id} 
                    className="relative group block bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-accent-500 dark:hover:border-accent-600 transition-all"
                >
                    <Link to={`/perform/song/${song.id}`} className="absolute inset-0 z-0" aria-label="Tocar música"></Link>
                    
                    <div className="relative z-10 flex justify-between items-start gap-3 pointer-events-none">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors truncate pr-16">
                            {song.title}
                            </h3>
                            
                            <div className="flex flex-wrap gap-1.5 mt-2">
                            {song.moments.slice(0, 3).map(moment => (
                                <span 
                                key={moment} 
                                className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${getTagStyle(moment)}`}
                                >
                                {moment}
                                </span>
                            ))}
                            {song.moments.length > 3 && (
                                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-slate-400">
                                +{song.moments.length - 3}
                                </span>
                            )}
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 pointer-events-auto">
                             {canEdit && (
                                 <div className="flex gap-1 z-20 relative">
                                    <button 
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            navigate(`/songs/${song.id}`); 
                                        }}
                                        className="p-2 text-slate-300 dark:text-zinc-600 hover:text-accent-600 dark:hover:text-accent-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                        title="Editar"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={(e) => handleDelete(e, song.id)}
                                        className="p-2 text-slate-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                                        title="Excluir"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                 </div>
                             )}
                             <span className="bg-slate-800 dark:bg-white text-white dark:text-slate-900 text-xs font-mono font-bold px-2.5 py-1.5 rounded-lg shadow-sm">
                                {song.key}
                            </span>
                        </div>
                    </div>
                </div>
                ))
            )}
            </div>
        )}
      </div>
    </Layout>
  );
};

export default SongList;
