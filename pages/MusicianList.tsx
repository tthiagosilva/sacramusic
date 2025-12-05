import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { Musician } from '../types';
import { getMusicians, saveMusician, deleteMusician } from '../services/storage';
import { Plus, Trash2, User, Mic2, Guitar, Drum, Keyboard, Music, Loader2, Sliders, Edit, Save, X, Phone } from 'lucide-react';

const INSTRUMENT_OPTIONS = [
  "Voz", 
  "Violão", 
  "Teclado", 
  "Baixo", 
  "Bateria", 
  "Guitarra", 
  "Percussão",
  "Técnico de Som"
];

const MusicianList: React.FC = () => {
  const { currentMinistry } = useAuth();
  const [musicians, setMusicians] = useState<Musician[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // New Musician Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentMinistry) {
        getMusicians(currentMinistry.id).then(data => {
            setMusicians(data);
            setLoading(false);
        });
    }
  }, [currentMinistry]);

  const resetForm = () => {
    setNewName('');
    setNewPhone('');
    setSelectedInstruments([]);
    setEditingId(null);
    setIsAdding(false);
    setIsSaving(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !currentMinistry) return;

    setIsSaving(true);
    
    const musicianData: Musician = {
      id: editingId || crypto.randomUUID(),
      ministryId: currentMinistry.id,
      name: newName,
      phone: newPhone,
      instruments: selectedInstruments.length > 0 ? selectedInstruments : ['Voz']
    };

    await saveMusician(musicianData);
    
    // Refresh list
    const updated = await getMusicians(currentMinistry.id);
    setMusicians(updated);
    
    resetForm();
  };

  const handleEdit = (musician: Musician) => {
    setNewName(musician.name);
    setNewPhone(musician.phone || '');
    setSelectedInstruments(musician.instruments);
    setEditingId(musician.id);
    setIsAdding(true);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este músico?')) {
      if (currentMinistry) {
          await deleteMusician(id);
          const updated = await getMusicians(currentMinistry.id);
          setMusicians(updated);
          
          // If we deleted the one being edited, close form
          if (editingId === id) resetForm();
      }
    }
  };

  const toggleInstrument = (inst: string) => {
    if (selectedInstruments.includes(inst)) {
      setSelectedInstruments(prev => prev.filter(i => i !== inst));
    } else {
      setSelectedInstruments(prev => [...prev, inst]);
    }
  };

  const getIcon = (inst: string) => {
    const i = inst.toLowerCase();
    if (i.includes('voz')) return <Mic2 size={12} />;
    if (i.includes('violão') || i.includes('guitarra') || i.includes('baixo')) return <Guitar size={12} />;
    if (i.includes('bateria') || i.includes('percussão')) return <Drum size={12} />;
    if (i.includes('teclado')) return <Keyboard size={12} />;
    if (i.includes('técnico') || i.includes('som')) return <Sliders size={12} />;
    return <Music size={12} />;
  };

  const getInstrumentStyle = (inst: string) => {
      const i = inst.toLowerCase();
      if (i.includes('voz')) return 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      if (i.includes('violão') || i.includes('guitarra')) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      if (i.includes('baixo')) return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      if (i.includes('teclado')) return 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 border-sky-200 dark:border-sky-800';
      if (i.includes('bateria') || i.includes('percussão')) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      if (i.includes('técnico') || i.includes('som')) return 'bg-stone-100 text-stone-700 dark:bg-stone-900/40 dark:text-stone-300 border-stone-200 dark:border-stone-800';
      
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  }

  const getAvatarColor = (name: string) => {
    const colors = [
        'bg-red-200 text-red-800', 'bg-orange-200 text-orange-800', 
        'bg-amber-200 text-amber-800', 'bg-green-200 text-green-800',
        'bg-emerald-200 text-emerald-800', 'bg-teal-200 text-teal-800',
        'bg-cyan-200 text-cyan-800', 'bg-blue-200 text-blue-800',
        'bg-indigo-200 text-indigo-800', 'bg-violet-200 text-violet-800',
        'bg-purple-200 text-purple-800', 'bg-fuchsia-200 text-fuchsia-800',
        'bg-pink-200 text-pink-800', 'bg-rose-200 text-rose-800'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  return (
    <Layout>
       <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100">Músicos</h1>
          <button 
            type="button"
            onClick={() => { resetForm(); setIsAdding(!isAdding); }} 
            className="bg-accent-600 text-white p-2 rounded-full hover:bg-accent-500 shadow-md transition-transform active:scale-95"
            title="Adicionar Músico"
          >
            <Plus size={24} />
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleSave} className="bg-slate-50 dark:bg-zinc-900 p-4 rounded-xl animate-in fade-in space-y-4 border border-slate-200 dark:border-zinc-800 shadow-sm">
            <h3 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                {editingId ? <Edit size={16} /> : <Plus size={16} />}
                {editingId ? 'Editar Músico' : 'Novo Músico'}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Nome</label>
                    <input 
                        type="text" 
                        placeholder="Nome completo"
                        className="w-full p-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-accent-500"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Telefone (WhatsApp)</label>
                    <input 
                        type="tel" 
                        placeholder="(00) 00000-0000"
                        className="w-full p-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-accent-500"
                        value={newPhone}
                        onChange={e => setNewPhone(e.target.value)}
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Instrumentos</label>
                <div className="flex flex-wrap gap-2">
                    {INSTRUMENT_OPTIONS.map(inst => (
                        <button
                            key={inst}
                            type="button"
                            onClick={() => toggleInstrument(inst)}
                            className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                                selectedInstruments.includes(inst)
                                ? 'bg-accent-600 text-white border-accent-600 shadow-sm'
                                : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-zinc-700 hover:border-slate-400'
                            }`}
                        >
                            {inst}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                type="button" 
                onClick={resetForm}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-lg flex items-center gap-2"
              >
                <X size={16} />
                Cancelar
              </button>
              <button 
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isSaving ? 'Salvando...' : (editingId ? 'Atualizar' : 'Salvar')}
              </button>
            </div>
          </form>
        )}

        {loading ? (
             <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-accent-500" />
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {musicians.length === 0 ? (
                <p className="text-slate-400 dark:text-zinc-600 col-span-2 text-center py-8">Nenhum músico cadastrado.</p>
            ) : (
                musicians.map(m => (
                <div key={m.id} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm hover:border-slate-300 dark:hover:border-zinc-600 transition-colors flex justify-between items-start group">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${getAvatarColor(m.name)}`}>
                            {m.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-200">{m.name}</h3>
                            {m.phone && (
                                <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 mb-1">
                                    <Phone size={10} />
                                    <span>{m.phone}</span>
                                </div>
                            )}
                            <div className="flex flex-wrap gap-1 mt-1">
                                {m.instruments.map(inst => (
                                <span 
                                    key={inst} 
                                    className={`text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 border ${getInstrumentStyle(inst)}`}
                                >
                                    {getIcon(inst)}
                                    {inst}
                                </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-1">
                         <button 
                            type="button"
                            onClick={() => handleEdit(m)} 
                            className="z-20 p-2 text-slate-300 dark:text-zinc-600 hover:text-accent-600 dark:hover:text-accent-400 hover:bg-accent-50 dark:hover:bg-accent-900/10 rounded-lg transition-colors"
                            title="Editar"
                         >
                            <Edit size={18} />
                         </button>
                         <button 
                            type="button"
                            onClick={() => handleDelete(m.id)} 
                            className="z-20 p-2 text-slate-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                            title="Excluir"
                         >
                            <Trash2 size={18} />
                         </button>
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

export default MusicianList;