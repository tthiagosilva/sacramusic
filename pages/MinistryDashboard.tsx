import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { updateMinistry } from '../services/storage';
import { Users, CalendarDays, ListMusic, Music, Copy, Check, Save, Loader2, Settings, ArrowRight } from 'lucide-react';

const MinistryDashboard: React.FC = () => {
  const { currentMinistry, user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentMinistry) {
      setNewName(currentMinistry.name);
    }
  }, [currentMinistry]);

  const copyCode = () => {
    if (currentMinistry?.inviteCode) {
        navigator.clipboard.writeText(currentMinistry.inviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveName = async () => {
    if (!currentMinistry || !newName.trim()) return;
    setSaving(true);
    try {
      await updateMinistry(currentMinistry.id, { name: newName });
      await refreshProfile();
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      alert('Erro ao atualizar nome.');
    } finally {
      setSaving(false);
    }
  };

  const isOwner = currentMinistry?.ownerId === user?.uid;

  if (!currentMinistry) return null;

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        <div>
           <h1 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-2">Meu Ministério</h1>
           <p className="text-slate-500 dark:text-slate-400">Gerencie informações, membros e configurações do grupo.</p>
        </div>

        {/* Invite Code Section */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                    <h2 className="text-indigo-100 text-sm font-bold uppercase tracking-wider mb-1">Código de Convite</h2>
                    <p className="text-indigo-200 text-sm max-w-xs">Envie este código para os músicos entrarem no ministério.</p>
                </div>
                
                <div 
                    onClick={copyCode}
                    className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-6 py-4 cursor-pointer hover:bg-white/30 transition-colors flex items-center gap-4 group"
                >
                    <span className="text-3xl font-mono font-bold tracking-widest">{currentMinistry.inviteCode}</span>
                    <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/40 transition-colors">
                        {copied ? <Check className="text-green-300 w-5 h-5" /> : <Copy className="text-white w-5 h-5" />}
                    </div>
                </div>
            </div>
            <Users className="absolute -bottom-6 -right-6 w-32 h-32 text-white opacity-10 rotate-12" />
        </div>

        {/* Shortcuts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             <Link to="/ministry/members" className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-xl hover:border-accent-500 dark:hover:border-accent-500 transition-all group shadow-sm">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 w-10 h-10 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3 group-hover:scale-110 transition-transform">
                    <Users size={20} />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100">Equipe</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Gerenciar {currentMinistry.members.length} membros</p>
             </Link>

             <Link to="/musicians" className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-xl hover:border-accent-500 dark:hover:border-accent-500 transition-all group shadow-sm">
                <div className="bg-orange-100 dark:bg-orange-900/30 w-10 h-10 rounded-lg flex items-center justify-center text-orange-600 dark:text-orange-400 mb-3 group-hover:scale-110 transition-transform">
                    <Music size={20} />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100">Músicos</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Instrumentistas e vozes</p>
             </Link>

             <Link to="/schedules" className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-xl hover:border-accent-500 dark:hover:border-accent-500 transition-all group shadow-sm">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 w-10 h-10 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
                    <CalendarDays size={20} />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100">Escalas</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ver agenda de missas</p>
             </Link>
        </div>

        {/* Settings Section */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
                <Settings className="text-slate-400" size={20} />
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Configurações</h3>
            </div>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Nome do Ministério</label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            className="flex-1 p-3 border border-slate-300 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:opacity-60"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            disabled={!isEditing || !isOwner}
                        />
                        {isOwner && (
                            !isEditing ? (
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="px-6 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
                                >
                                    Editar
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => { setIsEditing(false); setNewName(currentMinistry.name); }}
                                        className="px-4 bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-slate-400 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-700"
                                        disabled={saving}
                                    >
                                        X
                                    </button>
                                    <button 
                                        onClick={handleSaveName}
                                        disabled={saving}
                                        className="px-4 bg-accent-600 text-white font-bold rounded-xl hover:bg-accent-700 flex items-center justify-center min-w-[3rem]"
                                    >
                                        {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save size={20} />}
                                    </button>
                                </div>
                            )
                        )}
                    </div>
                    {!isOwner && <p className="text-xs text-slate-400 mt-2">Apenas o coordenador pode alterar o nome.</p>}
                </div>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default MinistryDashboard;
