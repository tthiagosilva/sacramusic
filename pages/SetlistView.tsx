import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getSetlistById, getSongById } from '../services/storage';
import { Setlist, Song, MassMoment, SetlistCategory } from '../types';
import { ArrowLeft, Edit, Calendar, Info, Mic2, Star, Loader2 } from 'lucide-react';

const SetlistView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [setlist, setSetlist] = useState<Setlist | null>(null);
  const [songMap, setSongMap] = useState<Record<string, Song>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const load = async () => {
        const data = await getSetlistById(id);
        if (data) {
          setSetlist(data);
          const map: Record<string, Song> = {};
          
          const promises: Promise<void>[] = [];

          // Load songs for Mass
          Object.values(data.items).forEach(songId => {
            if(songId) {
                promises.push(getSongById(songId).then(s => {
                    if (s) map[songId] = s;
                }));
            }
          });

          // Load songs for Custom Lists
          if (data.customItems) {
              data.customItems.forEach(item => {
                  if(item.songId) {
                    promises.push(getSongById(item.songId).then(s => {
                        if (s) map[item.songId] = s;
                    }));
                  }
              });
          }
          
          await Promise.all(promises);
          setSongMap(map);
        }
        setLoading(false);
      };
      load();
    }
  }, [id]);

  if (loading) return (
      <Layout>
          <div className="flex justify-center mt-10">
              <Loader2 className="animate-spin w-8 h-8 text-slate-400" />
          </div>
      </Layout>
  );

  if (!setlist) return <Layout><div className="text-center mt-10 text-slate-500 dark:text-slate-400">Repertório não encontrado.</div></Layout>;

  // Icon based on category
  const CategoryIcon = () => {
      if (setlist.category === SetlistCategory.ADORACAO) return <Star className="w-4 h-4" />;
      if (setlist.category === SetlistCategory.APRESENTACAO) return <Mic2 className="w-4 h-4" />;
      return null;
  }

  // Format date helper with TZ fix
  const displayDate = setlist.date ? new Date(setlist.date + 'T12:00:00').toLocaleDateString('pt-BR') : '---';

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
           <button onClick={() => navigate('/setlists')} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
            <ArrowLeft />
          </button>
          <div className="flex gap-2">
            <button onClick={() => navigate(`/setlists/edit/${id}`)} className="text-accent-600 dark:text-accent-400 hover:text-accent-800 dark:hover:text-accent-300 p-2 bg-accent-50 dark:bg-accent-900/30 rounded-full transition-colors">
              <Edit size={20} />
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-zinc-800 text-center transition-colors">
            <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 px-3 py-1 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wide">
                <CategoryIcon />
                {setlist.category || SetlistCategory.MISSA}
            </div>
            <h1 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-2">{setlist.name}</h1>
            <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                <Calendar size={16} />
                <span>{displayDate}</span>
                {setlist.type && setlist.category === SetlistCategory.MISSA && (
                    <>
                        <span className="mx-2 text-slate-300 dark:text-zinc-700">•</span>
                        <span>{setlist.type}</span>
                    </>
                )}
            </div>
            {setlist.notes && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-sm rounded-lg flex gap-2 items-start text-left border border-yellow-100 dark:border-yellow-900/30">
                    <Info size={16} className="mt-1 shrink-0" />
                    <p>{setlist.notes}</p>
                </div>
            )}
        </div>

        <div className="space-y-3 pb-8">
            <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300 px-1">Ordem da Celebração</h2>
            
            {/* RENDER FOR MASS */}
            {(setlist.category === SetlistCategory.MISSA || !setlist.category) && (
                Object.values(MassMoment).map(moment => {
                    const songId = setlist.items[moment];
                    if (!songId) return null;
                    const song = songMap[songId];
                    if (!song) return null;

                    return (
                        <Link 
                            key={moment} 
                            to={`/perform/${setlist.id}/${songId}`}
                            className="flex flex-col bg-white dark:bg-zinc-900 border-l-4 border-accent-500 dark:border-accent-600 rounded-r-lg shadow-sm p-4 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-all border-y border-r border-slate-100 dark:border-zinc-800"
                        >
                            <span className="text-xs uppercase tracking-wide font-bold text-slate-400 dark:text-zinc-500 mb-1">{moment}</span>
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-serif font-medium text-slate-800 dark:text-slate-200">{song.title}</span>
                                <span className="text-sm font-mono bg-slate-100 dark:bg-zinc-800 px-2 py-1 rounded text-slate-600 dark:text-slate-300 font-bold">{song.key}</span>
                            </div>
                        </Link>
                    );
                })
            )}

            {/* RENDER FOR FREE LISTS (Adoração/Apresentação) */}
            {(setlist.category === SetlistCategory.ADORACAO || setlist.category === SetlistCategory.APRESENTACAO) && (
                (setlist.customItems || []).map((item, index) => {
                    if (!item.songId) return null;
                    const song = songMap[item.songId];
                    if (!song) return null;
                    
                    return (
                        <Link 
                            key={item.uuid} 
                            // We use a query param idx to disambiguate if song appears multiple times
                            to={`/perform/${setlist.id}/${item.songId}?idx=${index}`}
                            className="flex items-center gap-4 bg-white dark:bg-zinc-900 border-l-4 border-indigo-500 dark:border-indigo-600 rounded-r-lg shadow-sm p-4 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-all border-y border-r border-slate-100 dark:border-zinc-800"
                        >
                            <span className="text-lg font-mono font-bold text-indigo-200 dark:text-indigo-900">{index + 1}</span>
                            <div className="flex-1">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-serif font-medium text-slate-800 dark:text-slate-200">{song.title}</span>
                                    <span className="text-sm font-mono bg-slate-100 dark:bg-zinc-800 px-2 py-1 rounded text-slate-600 dark:text-slate-300 font-bold">{song.key}</span>
                                </div>
                            </div>
                        </Link>
                    );
                })
            )}
            
            {(setlist.category !== SetlistCategory.MISSA && (!setlist.customItems || setlist.customItems.length === 0)) && (
                 <div className="text-center py-8 text-slate-400 dark:text-zinc-600">
                    <p>Nenhuma música adicionada a esta lista.</p>
                 </div>
            )}
        </div>
      </div>
    </Layout>
  );
};

export default SetlistView;
