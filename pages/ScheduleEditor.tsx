import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { getScheduleById, saveSchedule, deleteSchedule, getMusicians, getSetlists } from '../services/storage';
import { ScheduleEntry, Musician, ScheduleAssignment, Setlist, LiturgicalColor } from '../types';
import { ArrowLeft, Trash2, Save, Plus, X, Check, Loader2, Filter } from 'lucide-react';

const COLORS: { value: LiturgicalColor; label: string; bgClass: string; borderClass: string }[] = [
  { value: 'green', label: 'Tempo Comum', bgClass: 'bg-emerald-500', borderClass: 'border-emerald-500' },
  { value: 'white', label: 'Festas/Solenidades', bgClass: 'bg-slate-100', borderClass: 'border-slate-300' },
  { value: 'red', label: 'Mártires/Espírito Santo', bgClass: 'bg-red-500', borderClass: 'border-red-500' },
  { value: 'purple', label: 'Advento/Quaresma', bgClass: 'bg-purple-600', borderClass: 'border-purple-600' },
  { value: 'rose', label: 'Gaudete/Laetare', bgClass: 'bg-pink-400', borderClass: 'border-pink-400' },
];

const ScheduleEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentMinistry } = useAuth();
  const isNew = !id;

  const [formData, setFormData] = useState<ScheduleEntry>({
    id: crypto.randomUUID(),
    ministryId: '',
    date: new Date().toISOString().split('T')[0],
    time: '19:00',
    title: '',
    assignments: [],
    setlistId: '',
    liturgicalColor: 'green',
    notes: ''
  });

  const [musicians, setMusicians] = useState<Musician[]>([]);
  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [rowFilters, setRowFilters] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
        if (!currentMinistry) return;

        const [musList, setListData] = await Promise.all([
            getMusicians(currentMinistry.id), 
            getSetlists(currentMinistry.id)
        ]);
        setMusicians(musList);
        setSetlists(setListData);

        if (!isNew && id) {
            const existing = await getScheduleById(id);
            if (existing) {
                setFormData(existing);
                setRowFilters(new Array(existing.assignments.length).fill(''));
            }
        } else {
            setFormData(prev => ({ ...prev, ministryId: currentMinistry.id }));
        }
        setLoading(false);
    };
    load();
  }, [id, isNew, currentMinistry]);

  const uniqueInstruments = Array.from(new Set(musicians.flatMap(m => m.instruments))).sort();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return alert('O título é obrigatório');
    
    setIsSaving(true);
    await saveSchedule(formData);
    setIsSaving(false);
    navigate('/schedules');
  };

  const handleDelete = async () => {
    if (confirm('Excluir esta escala?')) {
      if (id) {
          setIsSaving(true);
          await deleteSchedule(id);
          navigate('/schedules');
      }
    }
  };

  const addAssignment = () => {
    if (musicians.length === 0) return alert('Cadastre músicos antes de escalar!');
    
    setFormData(prev => ({
      ...prev,
      assignments: [...prev.assignments, { musicianId: '', role: '' }]
    }));
    
    setRowFilters(prev => [...prev, '']);
  };

  const handleFilterChange = (index: number, instrument: string) => {
      const newFilters = [...rowFilters];
      newFilters[index] = instrument;
      setRowFilters(newFilters);
  };

  const handleMusicianChange = (index: number, musicianId: string) => {
    const musician = musicians.find(m => m.id === musicianId);
    
    const currentFilter = rowFilters[index];
    const defaultRole = currentFilter || (musician ? (musician.instruments[0] || '') : '');
    
    const newAssignments = [...formData.assignments];
    newAssignments[index] = { 
        ...newAssignments[index], 
        musicianId,
        role: defaultRole 
    };
    setFormData({ ...formData, assignments: newAssignments });
  };

  const updateAssignment = (index: number, field: keyof ScheduleAssignment, value: string) => {
    const newAssignments = [...formData.assignments];
    newAssignments[index] = { ...newAssignments[index], [field]: value };
    setFormData({ ...formData, assignments: newAssignments });
  };

  const removeAssignment = (index: number) => {
    const newAssignments = formData.assignments.filter((_, i) => i !== index);
    setFormData({ ...formData, assignments: newAssignments });
    
    const newFilters = rowFilters.filter((_, i) => i !== index);
    setRowFilters(newFilters);
  };

  const getFilteredMusicians = (filter: string) => {
      if (!filter) return musicians;
      return musicians.filter(m => m.instruments.includes(filter));
  };

  if (loading) return (
      <Layout>
          <div className="flex justify-center mt-10">
              <Loader2 className="animate-spin w-8 h-8 text-slate-400" />
          </div>
      </Layout>
  );

  return (
    <Layout>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => navigate('/schedules')} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
            <ArrowLeft />
          </button>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{isNew ? 'Nova Escala' : 'Editar Escala'}</h1>
          {!isNew && (
            <button type="button" onClick={handleDelete} className="text-red-500 hover:text-red-700 dark:hover:text-red-400">
              <Trash2 size={20} />
            </button>
          )}
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-zinc-800 space-y-4">
            {/* LITURGICAL COLOR SELECTOR */}
            <div>
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Cor Litúrgica</label>
               <div className="flex flex-wrap gap-3">
                  {COLORS.map(color => (
                     <button
                        key={color.value}
                        type="button"
                        onClick={() => setFormData({...formData, liturgicalColor: color.value})}
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${color.bgClass} ${
                           formData.liturgicalColor === color.value 
                             ? 'ring-2 ring-offset-2 ring-accent-500 dark:ring-offset-zinc-900 scale-110 ' + color.borderClass
                             : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                        title={color.label}
                     >
                        {formData.liturgicalColor === color.value && <Check size={20} className={color.value === 'white' ? 'text-slate-600' : 'text-white'} />}
                     </button>
                  ))}
               </div>
               <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                 Selecionado: <span className="font-bold">{COLORS.find(c => c.value === formData.liturgicalColor)?.label || 'Padrão'}</span>
               </p>
            </div>

            <hr className="border-slate-100 dark:border-zinc-800" />

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Título do Evento</label>
              <input 
                type="text" 
                required
                placeholder="Ex: Missa Domingo"
                className="w-full p-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-accent-500 outline-none"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div className="flex gap-4">
                 <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data</label>
                    <input 
                        type="date" 
                        required
                        className="w-full p-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-accent-500 outline-none"
                        value={formData.date}
                        onChange={e => setFormData({...formData, date: e.target.value})}
                    />
                 </div>
                 <div className="w-32">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Hora</label>
                    <input 
                        type="time" 
                        required
                        className="w-full p-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-accent-500 outline-none"
                        value={formData.time}
                        onChange={e => setFormData({...formData, time: e.target.value})}
                    />
                 </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Repertório Vinculado (Opcional)</label>
              <select 
                className="w-full p-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-accent-500 outline-none"
                value={formData.setlistId || ''}
                onChange={e => setFormData({...formData, setlistId: e.target.value})}
              >
                 <option value="">-- Selecione um repertório --</option>
                 {setlists.map(setlist => (
                     <option key={setlist.id} value={setlist.id}>
                         {setlist.name} ({new Date(setlist.date).toLocaleDateString('pt-BR')})
                     </option>
                 ))}
              </select>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ao vincular, um botão de acesso rápido aparecerá na lista de escalas.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Observações</label>
              <textarea 
                className="w-full p-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-accent-500 outline-none h-20"
                value={formData.notes || ''}
                onChange={e => setFormData({...formData, notes: e.target.value})}
              />
            </div>
        </div>

        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <h2 className="font-serif font-semibold text-lg text-slate-800 dark:text-slate-100">Músicos Escalados</h2>
            </div>
            
            {formData.assignments.length === 0 && (
                <div className="text-center py-6 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-xl text-slate-400 dark:text-zinc-600 text-sm">
                    Ninguém escalado ainda.
                </div>
            )}

            {formData.assignments.map((assign, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-3 items-start bg-white dark:bg-zinc-900 p-3 rounded-lg border border-slate-100 dark:border-zinc-800 shadow-sm animate-in slide-in-from-left-2 relative">
                    
                    {/* Filter Instrument */}
                    <div className="w-full sm:w-1/3">
                         <label className="flex items-center gap-1 text-xs font-bold text-accent-600 dark:text-accent-400 mb-1">
                            <Filter size={10} />
                            Filtro
                         </label>
                         <select
                            className="w-full p-2 border border-slate-200 dark:border-zinc-700 rounded-lg bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-accent-500 text-sm"
                            value={rowFilters[idx]}
                            onChange={(e) => handleFilterChange(idx, e.target.value)}
                         >
                             <option value="">Todos os instrumentos</option>
                             {uniqueInstruments.map(inst => (
                                 <option key={inst} value={inst}>{inst}</option>
                             ))}
                         </select>
                    </div>

                    {/* Select Musician */}
                    <div className="w-full sm:flex-1">
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Músico</label>
                        <select 
                           className="w-full p-2 border border-slate-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-accent-500"
                           value={assign.musicianId}
                           onChange={e => handleMusicianChange(idx, e.target.value)}
                        >
                            <option value="">-- Selecione --</option>
                            {getFilteredMusicians(rowFilters[idx]).map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Role Input */}
                    <div className="w-full sm:flex-1">
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Função</label>
                         <input 
                            type="text"
                            placeholder="Ex: Voz, Violão"
                            className="w-full p-2 border border-slate-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-accent-500"
                            value={assign.role}
                            onChange={e => updateAssignment(idx, 'role', e.target.value)}
                         />
                    </div>

                    <button 
                        type="button"
                        onClick={() => removeAssignment(idx)}
                        className="absolute top-2 right-2 sm:static sm:mt-6 p-2 text-slate-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
            ))}

            <button 
                type="button" 
                onClick={addAssignment}
                className="w-full py-3 border border-slate-300 dark:border-zinc-700 rounded-xl text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
            >
                <Plus size={18} />
                Adicionar Músico
            </button>
        </div>

        <button 
            type="submit"
            disabled={isSaving}
            className="w-full bg-accent-600 hover:bg-accent-700 dark:bg-accent-700 dark:hover:bg-accent-600 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 mb-8 transition-colors disabled:opacity-70"
        >
            {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            {isSaving ? 'Salvando...' : 'Salvar Escala'}
        </button>
      </form>
    </Layout>
  );
};

export default ScheduleEditor;