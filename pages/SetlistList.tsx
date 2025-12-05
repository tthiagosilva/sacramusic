import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, ListMusic, Star, Mic2, BookOpen, Loader2, Trash2, Edit } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { getSetlists, deleteSetlist } from '../services/storage';
import { Setlist, SetlistCategory } from '../types';

const SetlistList: React.FC = () => {
  const { currentMinistry } = useAuth();
  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [activeCategory, setActiveCategory] = useState<SetlistCategory | 'Todos'>('Todos');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentMinistry) loadSetlists();
  }, [currentMinistry]);

  const loadSetlists = async () => {
    if (!currentMinistry) return;
    const list = await getSetlists(currentMinistry.id);
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setSetlists(list);
    setLoading(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();
      if (window.confirm('Tem certeza que deseja excluir este repertório?')) {
          await deleteSetlist(id);
          setSetlists(prev => prev.filter(s => s.id !== id));
      }
  };

  const formatDate = (isoDate: string) => {
    try {
      const d = new Date(isoDate);
      return {
        day: d.toLocaleDateString('pt-BR', { day: '2-digit' }),
        month: d.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', ''),
        full: d.toLocaleDateString('pt-BR')
      }
    } catch {
      return { day: '--', month: '---', full: isoDate };
    }
  };

  const getCategoryIcon = (cat: SetlistCategory) => {
    switch (cat) {
      case SetlistCategory.ADORACAO: return <Star size={14} />;
      case SetlistCategory.APRESENTACAO: return <Mic2 size={14} />;
      default: return <BookOpen size={14} />;
    }
  };

  const getCategoryColor = (cat: SetlistCategory) => {
      switch (cat) {
          case SetlistCategory.ADORACAO: return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800';
          case SetlistCategory.APRESENTACAO: return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800';
          default: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      }
  }

  const getCategory = (s: Setlist) => s.category || SetlistCategory.MISSA;

  const filteredSetlists = activeCategory === 'Todos' 
    ? setlists 
    : setlists.filter(s => getCategory(s) === activeCategory);

  const counts = {
    'Todos': setlists.length,
    [SetlistCategory.MISSA]: setlists.filter(s => getCategory(s) === SetlistCategory.MISSA).length,
    [SetlistCategory.ADORACAO]: setlists.filter(s => getCategory(s) === SetlistCategory.ADORACAO).length,
    [SetlistCategory.APRESENTACAO]: setlists.filter(s => getCategory(s) === SetlistCategory.APRESENTACAO).length,
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100">Repertórios</h1>
          <Link to="/setlists/new" className="bg-accent-600 hover:bg-accent-500 dark:bg-accent-700 dark:hover:bg-accent-600 text-white p-3 rounded-full shadow-lg transition-transform active:scale-95">
            <Plus size={24} />
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 gap-2 no-scrollbar">
          {['Todos', ...Object.values(SetlistCategory)].map((cat) => (
             <button
               key={cat}
               onClick={() => setActiveCategory(cat as any)}
               className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 border ${
                 activeCategory === cat 
                   ? 'bg-slate-800 dark:bg-slate-700 text-white border-slate-800 dark:border-slate-700 shadow-md' 
                   : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800'
               }`}
             >
               {cat !== 'Todos' && getCategoryIcon(cat as SetlistCategory)}
               {cat}
               <span className={`ml-1 text-xs py-0.5 px-1.5 rounded-full ${activeCategory === cat ? 'bg-slate-600 dark:bg-slate-900 text-slate-200' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500'}`}>
                 {counts[cat as keyof typeof counts]}
               </span>
             </button>
          ))}
        </div>

        {loading ? (
             <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
            </div>
        ) : (
            <div className="space-y-4">
            {filteredSetlists.length === 0 ? (
                <div className="text-center py-12 text-slate-400 dark:text-zinc-600">
                <ListMusic className="mx-auto w-12 h-12 mb-3 opacity-50" />
                <p>Nenhum repertório encontrado.</p>
                </div>
            ) : (
                filteredSetlists.map(setlist => {
                const cat = getCategory(setlist);
                const dateObj = formatDate(setlist.date);
                
                return (
                    <div 
                    key={setlist.id} 
                    className="relative group block bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-4 shadow-sm hover:border-accent-500 dark:hover:border-accent-500 hover:shadow-md transition-all"
                    >
                    <Link to={`/setlists/${setlist.id}`} className="absolute inset-0 z-0"></Link>
                    
                    <div className="relative z-10 pointer-events-none">
                        <div className="flex justify-between items-start gap-4">
                            
                            {/* Date Badge */}
                            <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl min-w-[3.5rem] h-[3.5rem]">
                                <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase">{dateObj.month}</span>
                                <span className="text-xl font-bold text-slate-800 dark:text-slate-200 leading-none">{dateObj.day}</span>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wide border ${getCategoryColor(cat)}`}>
                                    {getCategoryIcon(cat)}
                                    {cat}
                                    </span>
                                </div>
                                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors truncate">{setlist.name}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{setlist.type || 'Sem tipo definido'}</p>
                            </div>

                            <button 
                                type="button"
                                onClick={(e) => handleDelete(e, setlist.id)}
                                className="pointer-events-auto z-20 p-2 text-slate-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                                title="Excluir"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-50 dark:border-zinc-800 flex justify-between items-center text-xs text-slate-400 dark:text-zinc-500">
                            <span>{(cat === SetlistCategory.MISSA) 
                                ? `${Object.keys(setlist.items).length} músicas` 
                                : `${(setlist.customItems || []).length} músicas`
                            }</span>
                        </div>
                    </div>
                    </div>
                );
                })
            )}
            </div>
        )}
      </div>
    </Layout>
  );
};

export default SetlistList;