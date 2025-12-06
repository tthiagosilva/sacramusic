
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { ScheduleEntry, Musician, LiturgicalColor } from '../types';
import { getSchedules, getMusicians, deleteSchedule } from '../services/storage';
import { Plus, Users, Calendar, Filter, ListMusic, User, Loader2, Trash2, Edit } from 'lucide-react';

const ScheduleList: React.FC = () => {
  const { currentMinistry, userProfile } = useAuth();
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [musicians, setMusicians] = useState<Musician[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const [filterMusicianId, setFilterMusicianId] = useState<string>('');

  useEffect(() => {
    if (currentMinistry) loadData();
  }, [currentMinistry]);

  const loadData = async () => {
    if (!currentMinistry) return;
    const [schList, musList] = await Promise.all([getSchedules(currentMinistry.id), getMusicians(currentMinistry.id)]);
    schList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setSchedules(schList);
    setMusicians(musList);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
      if (window.confirm('Tem certeza que deseja excluir esta escala?')) {
          await deleteSchedule(id);
          setSchedules(prev => prev.filter(s => s.id !== id));
      }
  };

  const getMusicianName = (id: string) => {
    const m = musicians.find(mus => mus.id === id);
    return m ? m.name : 'Desconhecido';
  };

  const getDayOfWeek = (dateStr: string) => {
     const d = new Date(dateStr + 'T12:00:00');
     return d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase();
  };

  const getLiturgicalColorClasses = (color?: LiturgicalColor) => {
      switch(color) {
          case 'red': return {
              border: 'border-l-red-500',
              dateBg: 'bg-red-500 text-white',
              dateText: 'text-red-600',
              dayBadge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800'
          };
          case 'white': return {
              border: 'border-l-slate-300 dark:border-l-zinc-500',
              dateBg: 'bg-slate-200 dark:bg-zinc-700 text-slate-800 dark:text-slate-100',
              dateText: 'text-slate-600 dark:text-slate-300',
              dayBadge: 'bg-white text-slate-700 dark:bg-zinc-800 dark:text-slate-300 border-slate-200 dark:border-zinc-700'
          };
          case 'purple': return {
              border: 'border-l-purple-600',
              dateBg: 'bg-purple-600 text-white',
              dateText: 'text-purple-600',
              dayBadge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800'
          };
          case 'rose': return {
              border: 'border-l-pink-400',
              dateBg: 'bg-pink-400 text-white',
              dateText: 'text-pink-500',
              dayBadge: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300 border-pink-200 dark:border-pink-800'
          };
          case 'green':
          default: return {
              border: 'border-l-emerald-500',
              dateBg: 'bg-emerald-500 text-white',
              dateText: 'text-emerald-600',
              dayBadge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
          };
      }
  };

  const getRoleStyle = (role: string) => {
      const r = role.toLowerCase();
      if (r.includes('voz') || r.includes('canto')) return 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300';
      if (r.includes('violão') || r.includes('guitarra')) return 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300';
      if (r.includes('teclado')) return 'bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300';
      return 'bg-slate-50 text-slate-700 dark:bg-zinc-800 dark:text-slate-300';
  }

  const filteredSchedules = filterMusicianId 
    ? schedules.filter(sch => sch.assignments.some(a => a.musicianId === filterMusicianId))
    : schedules;

  const canEdit = userProfile?.isSubscriber;

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100">Escala</h1>
          <div className="flex gap-2">
            <Link to="/musicians" className="bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 p-3 rounded-full hover:bg-slate-300 dark:hover:bg-zinc-700 transition-colors" title="Gerenciar Músicos">
               <Users size={20} />
            </Link>
            {canEdit && (
                <Link to="/schedules/new" className="bg-accent-600 hover:bg-accent-500 dark:bg-accent-700 dark:hover:bg-accent-600 text-white p-3 rounded-full shadow-lg transition-transform active:scale-95" title="Nova Escala">
                    <Plus size={20} />
                </Link>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <select 
                className="w-full bg-transparent text-sm text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
                value={filterMusicianId}
                onChange={(e) => setFilterMusicianId(e.target.value)}
            >
                <option value="" className="dark:bg-zinc-900">Todas as escalas</option>
                <option disabled className="text-xs bg-slate-50 uppercase tracking-widest text-slate-400 dark:bg-zinc-900">--- Filtrar por Músico ---</option>
                {musicians.map(m => (
                    <option key={m.id} value={m.id} className="dark:bg-zinc-900">{m.name}</option>
                ))}
            </select>
        </div>

        {loading ? (
             <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-accent-500" />
            </div>
        ) : filteredSchedules.length === 0 ? (
           <div className="text-center py-12 text-slate-400 dark:text-zinc-600">
             <Calendar className="mx-auto w-12 h-12 mb-3 opacity-50" />
             <p>{filterMusicianId ? 'Nenhuma escala encontrada para este músico.' : 'Nenhuma escala cadastrada.'}</p>
           </div>
        ) : (
          <div className="flex flex-col gap-4">
              {filteredSchedules.map(sch => {
                  const colors = getLiturgicalColorClasses(sch.liturgicalColor);
                  
                  return (
                      <div key={sch.id} className={`bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-slate-100 dark:border-zinc-800 overflow-hidden flex flex-col sm:flex-row border-l-[6px] ${colors.border}`}>
                          {/* Left / Top Date Section */}
                          <div className="flex flex-row sm:flex-col items-center sm:justify-center gap-3 sm:gap-1 p-3 sm:w-24 bg-slate-50 dark:bg-zinc-800/50 sm:bg-transparent">
                                <div className={`flex flex-col items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl shadow-sm ${colors.dateBg}`}>
                                    <span className="text-xs font-bold uppercase">{new Date(sch.date + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                                    <span className="text-xl leading-none font-bold">{new Date(sch.date + 'T12:00:00').getDate()}</span>
                                </div>
                                <div className="flex flex-col sm:items-center">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${colors.dayBadge}`}>
                                        {getDayOfWeek(sch.date)}
                                    </span>
                                    <span className="text-xs text-slate-400 dark:text-zinc-500 mt-1 sm:hidden">{sch.time}</span>
                                </div>
                          </div>
                          
                          {/* Content Section */}
                          <div className="flex-1 p-4 pt-0 sm:pt-4 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-zinc-800">
                              <div className="flex justify-between items-start mb-3">
                                  <div>
                                      <div className="text-xs text-slate-400 dark:text-zinc-500 hidden sm:block mb-1 font-bold">{sch.time}</div>
                                      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{sch.title}</h3>
                                  </div>
                                  {canEdit && (
                                      <div className="flex gap-1">
                                          <button 
                                              type="button"
                                              onClick={() => navigate(`/schedules/edit/${sch.id}`)}
                                              className="p-1.5 text-slate-300 dark:text-zinc-600 hover:text-accent-600 dark:hover:text-accent-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded transition-colors"
                                              title="Editar"
                                          >
                                              <Edit size={16} />
                                          </button>
                                          <button 
                                              type="button"
                                              onClick={() => handleDelete(sch.id)}
                                              className="p-1.5 text-slate-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded transition-colors"
                                              title="Excluir"
                                          >
                                              <Trash2 size={16} />
                                          </button>
                                      </div>
                                  )}
                              </div>

                              <div className="space-y-2 mb-3">
                                  {sch.assignments.map((assign, idx) => (
                                      <div key={idx} className={`flex items-center justify-between text-sm ${filterMusicianId === assign.musicianId ? 'bg-yellow-50 dark:bg-yellow-900/10 -mx-2 px-2 py-1 rounded' : ''}`}>
                                          <div className="flex items-center gap-2">
                                              <User size={14} className="text-slate-400" />
                                              <span className="text-slate-700 dark:text-slate-300 font-medium">{getMusicianName(assign.musicianId)}</span>
                                          </div>
                                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${getRoleStyle(assign.role)}`}>
                                              {assign.role}
                                          </span>
                                      </div>
                                  ))}
                              </div>
                              
                              <div className="flex gap-2 mt-auto pt-2 border-t border-slate-50 dark:border-zinc-800">
                                  {sch.setlistId && (
                                      <Link 
                                          to={`/setlists/${sch.setlistId}`} 
                                          className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-700 dark:text-accent-400 hover:underline"
                                      >
                                          <ListMusic size={14} />
                                          Ver Repertório
                                      </Link>
                                  )}
                              </div>
                          </div>
                      </div>
                  );
              })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ScheduleList;
