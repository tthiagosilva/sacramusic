import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { getSetlistById, saveSetlist, deleteSetlist, getSongs } from '../services/storage';
import { Setlist, Song, MassMoment, SetlistCategory } from '../types';
import { ArrowLeft, Trash2, Save, PlusCircle, X, Loader2 } from 'lucide-react';

const SetlistEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentMinistry } = useAuth();
  const isNew = !id;

  const [formData, setFormData] = useState<Setlist>({
    id: crypto.randomUUID(),
    ministryId: '',
    name: '',
    date: new Date().toISOString().split('T')[0],
    category: SetlistCategory.MISSA,
    type: 'Missa Dominical',
    items: {},
    customItems: [],
    notes: ''
  });

  const [availableSongs, setAvailableSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
        if (!currentMinistry) return;

        const songs = await getSongs();
        setAvailableSongs(songs);
        
        if (!isNew && id) {
            const existing = await getSetlistById(id);
            if (existing) {
                setFormData({
                    ...existing,
                    category: existing.category || SetlistCategory.MISSA,
                    customItems: existing.customItems || []
                });
            }
        } else {
            // Set ministry ID for new setlists
            setFormData(prev => ({ ...prev, ministryId: currentMinistry.id }));
        }
        setLoading(false);
    };
    init();
  }, [id, isNew, currentMinistry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return alert('O nome é obrigatório');
    
    setIsSaving(true);
    await saveSetlist(formData);
    setIsSaving(false);
    navigate(`/setlists/${formData.id}`);
  };

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja excluir este repertório?')) {
      if (id) {
          setIsSaving(true);
          await deleteSetlist(id);
          navigate('/setlists');
      }
    }
  };

  // Logic for MASS (Fixed slots)
  const handleMassSongSelection = (momentKey: string, songId: string) => {
    setFormData(prev => {
        const newItems = { ...prev.items };
        if (songId === "") {
            delete newItems[momentKey];
        } else {
            newItems[momentKey] = songId;
        }
        return { ...prev, items: newItems };
    });
  };

  // Logic for ADORATION/PERFORMANCE (Dynamic List)
  const addCustomItem = () => {
    setFormData(prev => ({
        ...prev,
        customItems: [
            ...(prev.customItems || []),
            { uuid: crypto.randomUUID(), songId: '' }
        ]
    }));
  };

  const updateCustomItem = (uuid: string, songId: string) => {
      setFormData(prev => ({
          ...prev,
          customItems: (prev.customItems || []).map(item => 
              item.uuid === uuid ? { ...item, songId } : item
          )
      }));
  };

  const removeCustomItem = (uuid: string) => {
      setFormData(prev => ({
          ...prev,
          customItems: (prev.customItems || []).filter(item => item.uuid !== uuid)
      }));
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
          <button type="button" onClick={() => navigate(-1)} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
            <ArrowLeft />
          </button>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{isNew ? 'Novo Repertório' : 'Editar Repertório'}</h1>
          {!isNew && (
            <button type="button" onClick={handleDelete} className="text-red-500 hover:text-red-700 dark:hover:text-red-400">
              <Trash2 size={20} />
            </button>
          )}
        </div>

        {/* Basic Info */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-zinc-800 space-y-4">
            <h2 className="font-serif font-semibold text-slate-700 dark:text-slate-300">Configurações</h2>
            
            {/* Category Selector */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Categoria</label>
                <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-lg">
                    {Object.values(SetlistCategory).map(cat => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setFormData({...formData, category: cat})}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                                formData.category === cat 
                                ? 'bg-white dark:bg-zinc-700 text-accent-600 dark:text-accent-400 shadow-sm' 
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome</label>
              <input 
                type="text" 
                required
                placeholder={formData.category === SetlistCategory.MISSA ? "Ex: Missa 7º Dia" : "Ex: Noite de Louvor"}
                className="w-full p-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-accent-500 outline-none"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
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
                 {/* Only show Sub-type if it is Mass, purely for legacy/details */}
                 {formData.category === SetlistCategory.MISSA && (
                     <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo de Celebração</label>
                        <select 
                            className="w-full p-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-accent-500 outline-none"
                            value={formData.type}
                            onChange={e => setFormData({...formData, type: e.target.value})}
                        >
                            <option>Missa Dominical</option>
                            <option>Casamento</option>
                            <option>Vigília</option>
                            <option>Batizado</option>
                            <option>Outro</option>
                        </select>
                     </div>
                 )}
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

        {/* --- DYNAMIC SECTION BASED ON CATEGORY --- */}
        
        {/* MODE: MISSA (Fixed Slots) */}
        {formData.category === SetlistCategory.MISSA && (
            <div className="space-y-4">
                <h2 className="font-serif font-semibold text-xl text-slate-800 dark:text-slate-100 px-1">Liturgia</h2>
                {Object.values(MassMoment).map((moment) => (
                    <div key={moment} className="bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-sm border border-slate-100 dark:border-zinc-800">
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">{moment}</label>
                        <select 
                            className="w-full p-3 border border-slate-200 dark:border-zinc-700 rounded-lg bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-zinc-800 focus:ring-2 focus:ring-accent-500 outline-none transition-colors"
                            value={formData.items[moment] || ""}
                            onChange={(e) => handleMassSongSelection(moment, e.target.value)}
                        >
                            <option value="">-- Selecionar Música --</option>
                            {availableSongs.map(song => (
                                <option key={song.id} value={song.id}>
                                    {song.title} ({song.key})
                                </option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>
        )}

        {/* MODE: ADORATION / PERFORMANCE (Free List) */}
        {(formData.category === SetlistCategory.ADORACAO || formData.category === SetlistCategory.APRESENTACAO) && (
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h2 className="font-serif font-semibold text-xl text-slate-800 dark:text-slate-100">Lista de Músicas</h2>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{(formData.customItems || []).length} itens</span>
                </div>

                <div className="space-y-3">
                    {(formData.customItems || []).map((item, index) => (
                        <div key={item.uuid} className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-3 rounded-lg shadow-sm border border-slate-100 dark:border-zinc-800 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <span className="text-slate-400 dark:text-zinc-600 font-mono font-bold w-6 text-center">{index + 1}</span>
                            <select 
                                className="flex-1 p-3 border border-slate-200 dark:border-zinc-700 rounded-lg bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-zinc-800 focus:ring-2 focus:ring-accent-500 outline-none transition-colors"
                                value={item.songId}
                                onChange={(e) => updateCustomItem(item.uuid, e.target.value)}
                            >
                                <option value="">-- Selecionar Música --</option>
                                {availableSongs.map(song => (
                                    <option key={song.id} value={song.id}>
                                        {song.title} ({song.key})
                                    </option>
                                ))}
                            </select>
                            <button 
                                type="button" 
                                onClick={() => removeCustomItem(item.uuid)}
                                className="p-3 text-slate-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    ))}
                </div>

                <button 
                    type="button" 
                    onClick={addCustomItem}
                    className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-zinc-700 rounded-xl text-slate-500 dark:text-slate-400 font-medium hover:border-accent-500 dark:hover:border-accent-500 hover:text-accent-600 dark:hover:text-accent-400 hover:bg-accent-50 dark:hover:bg-accent-900/10 transition-all flex items-center justify-center gap-2"
                >
                    <PlusCircle size={20} />
                    Adicionar Música
                </button>
            </div>
        )}

        <button 
            type="submit" 
            disabled={isSaving}
            className="w-full bg-accent-600 hover:bg-accent-700 dark:bg-accent-700 dark:hover:bg-accent-600 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 mb-8 transition-colors disabled:opacity-70"
        >
            {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            {isSaving ? 'Salvando...' : 'Salvar Repertório'}
        </button>
      </form>
    </Layout>
  );
};

export default SetlistEditor;