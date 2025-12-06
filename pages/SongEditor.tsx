
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { getSongById, saveSong, deleteSong } from '../services/storage';
import { Song, MassMoment, LiturgicalSeason } from '../types';
import { ArrowLeft, Trash2, Save, Download, Loader2, Link as LinkIcon } from 'lucide-react';

const SongEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNew = !id;

  const [formData, setFormData] = useState<Song>({
    id: crypto.randomUUID(),
    title: '',
    key: '',
    moments: [],
    seasons: [],
    lyrics: '',
    chords: '',
    youtubeLink: ''
  });

  const [importUrl, setImportUrl] = useState('');
  const [isLoadingImport, setIsLoadingImport] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isNew && id) {
      getSongById(id).then(existing => {
        if (existing) setFormData(existing);
      });
    }
  }, [id, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return alert('O título é obrigatório');
    
    setIsSaving(true);
    // Add creator if new
    const songToSave = isNew && user ? { ...formData, createdBy: user.uid } : formData;
    await saveSong(songToSave);
    setIsSaving(false);
    navigate('/songs');
  };

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja excluir esta música?')) {
      if (id) {
          setIsSaving(true);
          await deleteSong(id);
          navigate('/songs');
      }
    }
  };

  const toggleMoment = (moment: MassMoment) => {
    setFormData(prev => ({
      ...prev,
      moments: prev.moments.includes(moment) 
        ? prev.moments.filter(m => m !== moment)
        : [...prev.moments, moment]
    }));
  };

  const toggleSeason = (season: LiturgicalSeason) => {
    setFormData(prev => ({
      ...prev,
      seasons: prev.seasons.includes(season) 
        ? prev.seasons.filter(s => s !== season)
        : [...prev.seasons, season]
    }));
  };

  const importFromCifraClub = async () => {
    if (!importUrl) return;
    if (!importUrl.includes('cifraclub.com.br')) {
      alert('Por favor, insira um link válido do CifraClub.');
      return;
    }

    try {
      setIsLoadingImport(true);
      // Use a more reliable CORS proxy
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(importUrl)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error('Falha ao acessar a URL');
      
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Extract Title and Artist
      const songName = doc.querySelector('h1.t1')?.textContent?.trim() || '';
      const artistName = doc.querySelector('h2.t3')?.textContent?.trim() || '';
      const fullTitle = songName && artistName ? `${songName} (${artistName})` : (songName || '');

      // Extract Key
      let key = '';
      const keyElement = doc.querySelector('#cifra_tom a'); 
      if (keyElement) {
        key = keyElement.textContent?.trim() || '';
      }

      // Extract Chords
      const pre = doc.querySelector('.cifra_cnt pre');
      let chordsContent = '';
      let lyricsContent = '';

      if (pre) {
        chordsContent = pre.textContent || '';
        
        // Try to generate lyrics by removing bold tags (chords)
        const preClone = pre.cloneNode(true) as HTMLElement;
        const bTags = preClone.querySelectorAll('b');
        bTags.forEach(b => b.remove());
        const rawLyrics = preClone.textContent || '';
        // Clean up empty lines
        lyricsContent = rawLyrics.split('\n').filter(line => line.trim().length > 0).join('\n');
      }

      if (fullTitle || chordsContent) {
        setFormData(prev => ({
          ...prev,
          title: fullTitle || prev.title,
          key: key || prev.key,
          chords: chordsContent || prev.chords,
          lyrics: lyricsContent || prev.lyrics,
          youtubeLink: importUrl
        }));
        alert('Música importada com sucesso!');
        setImportUrl('');
      } else {
        alert('Não foi possível extrair os dados. A estrutura da página pode ter mudado.');
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao importar. Verifique o link e tente novamente.');
    } finally {
      setIsLoadingImport(false);
    }
  };

  return (
    <Layout>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => navigate(-1)} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
            <ArrowLeft />
          </button>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{isNew ? 'Nova Música' : 'Editar Música'}</h1>
          {!isNew && (
            <button type="button" onClick={handleDelete} className="text-red-500 hover:text-red-700 dark:hover:text-red-400">
              <Trash2 size={20} />
            </button>
          )}
        </div>

        {/* Import Section */}
        <div className="bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2 text-slate-700 dark:text-slate-300 font-semibold text-sm">
            <Download size={16} />
            Importar do CifraClub
          </div>
          <div className="flex gap-2">
            <input 
              type="url" 
              placeholder="Cole o link da música aqui..."
              className="flex-1 p-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
              value={importUrl}
              onChange={e => setImportUrl(e.target.value)}
            />
            <button 
              type="button"
              onClick={importFromCifraClub}
              disabled={isLoadingImport || !importUrl}
              className="bg-slate-800 dark:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 dark:hover:bg-zinc-600 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoadingImport ? <Loader2 size={16} className="animate-spin" /> : 'Importar'}
            </button>
          </div>
        </div>

        {/* Main Fields */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-zinc-800 space-y-4">
            <div className="flex gap-4">
                 <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Título</label>
                    <input 
                        type="text" 
                        required
                        className="w-full p-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-accent-500 outline-none"
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                 </div>
                 <div className="w-24">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tom</label>
                    <input 
                        type="text" 
                        required
                        placeholder="Ex: C"
                        className="w-full p-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-accent-500 outline-none"
                        value={formData.key}
                        onChange={e => setFormData({...formData, key: e.target.value})}
                    />
                 </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Momentos Litúrgicos</label>
              <div className="flex flex-wrap gap-2">
                {Object.values(MassMoment).map(moment => (
                  <button
                    key={moment}
                    type="button"
                    onClick={() => toggleMoment(moment)}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      formData.moments.includes(moment)
                        ? 'bg-accent-600 dark:bg-accent-700 text-white border-accent-600 dark:border-accent-700'
                        : 'bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-zinc-700 hover:border-accent-400'
                    }`}
                  >
                    {moment}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tempo Litúrgico</label>
              <div className="flex flex-wrap gap-2">
                {Object.values(LiturgicalSeason).map(season => (
                  <button
                    key={season}
                    type="button"
                    onClick={() => toggleSeason(season)}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      formData.seasons.includes(season)
                        ? 'bg-indigo-600 dark:bg-indigo-700 text-white border-indigo-600 dark:border-indigo-700'
                        : 'bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-zinc-700 hover:border-indigo-400'
                    }`}
                  >
                    {season}
                  </button>
                ))}
              </div>
            </div>
        </div>

        {/* Content Tabs/Fields */}
        <div className="grid md:grid-cols-2 gap-4">
             <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-zinc-800">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Letra (apenas texto)</label>
                <textarea 
                    className="w-full h-64 p-3 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-accent-500 outline-none text-sm leading-relaxed"
                    value={formData.lyrics}
                    onChange={e => setFormData({...formData, lyrics: e.target.value})}
                    placeholder="Cole a letra da música aqui..."
                />
             </div>
             <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-zinc-800">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Cifra (com acordes)</label>
                <textarea 
                    className="w-full h-64 p-3 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-accent-500 outline-none font-mono text-xs sm:text-sm leading-relaxed whitespace-pre"
                    value={formData.chords}
                    onChange={e => setFormData({...formData, chords: e.target.value})}
                    placeholder="Cole a cifra completa aqui..."
                />
             </div>
        </div>
        
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-zinc-800">
             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Link de Referência (YouTube/Spotify)</label>
             <div className="relative">
                <LinkIcon className="absolute left-3 top-3 text-slate-400" size={16} />
                <input 
                    type="url" 
                    className="w-full pl-10 p-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-accent-500 outline-none"
                    value={formData.youtubeLink || ''}
                    onChange={e => setFormData({...formData, youtubeLink: e.target.value})}
                    placeholder="https://..."
                />
             </div>
        </div>

        <button 
            type="submit" 
            disabled={isSaving}
            className="w-full bg-accent-600 hover:bg-accent-700 dark:bg-accent-700 dark:hover:bg-accent-600 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 mb-8 transition-colors disabled:opacity-70"
        >
            {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            {isSaving ? 'Salvando...' : 'Salvar Música'}
        </button>
      </form>
    </Layout>
  );
};

export default SongEditor;
