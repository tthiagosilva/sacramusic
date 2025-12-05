import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserMinistries } from '../services/storage';
import { Ministry } from '../types';
import { Loader2, Plus, LogOut, Users, Check, ArrowRight, ShieldCheck } from 'lucide-react';

const MinistrySelection: React.FC = () => {
  const { user, selectMinistry, signOut } = useAuth();
  const navigate = useNavigate();
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
        loadMinistries();
    }
  }, [user]);

  const loadMinistries = async () => {
      if (!user) return;
      const list = await getUserMinistries(user.uid);
      setMinistries(list);
      setLoading(false);
  };

  const handleSelect = async (ministryId: string) => {
      await selectMinistry(ministryId);
      navigate('/');
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-2">Seus Ministérios</h1>
                <p className="text-slate-500 dark:text-slate-400">Selecione qual ministério deseja acessar agora.</p>
            </div>

            <div className="space-y-4 mb-8">
                {ministries.length === 0 ? (
                    <div className="text-center py-8 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
                        <p className="text-slate-500 dark:text-slate-400 mb-4">Você ainda não participa de nenhum ministério.</p>
                        <button 
                            onClick={() => navigate('/setup')}
                            className="bg-accent-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-accent-700 transition-colors"
                        >
                            Começar Agora
                        </button>
                    </div>
                ) : (
                    ministries.map(ministry => (
                        <button
                            key={ministry.id}
                            onClick={() => handleSelect(ministry.id)}
                            className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-2xl flex items-center justify-between group hover:border-accent-500 dark:hover:border-accent-500 transition-all shadow-sm"
                        >
                            <div className="text-left">
                                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">{ministry.name}</h3>
                                <div className="flex items-center gap-4 mt-1">
                                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        <Users size={12} />
                                        {ministry.members.length} membros
                                    </span>
                                    {ministry.ownerId === user?.uid && (
                                        <span className="text-xs bg-accent-50 dark:bg-accent-900/20 text-accent-700 dark:text-accent-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                            <ShieldCheck size={10} />
                                            Admin
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="bg-slate-50 dark:bg-zinc-800 p-2 rounded-lg text-slate-400 dark:text-zinc-500 group-hover:bg-accent-600 group-hover:text-white transition-colors">
                                <ArrowRight size={20} />
                            </div>
                        </button>
                    ))
                )}
            </div>

            <div className="flex flex-col gap-3">
                <button 
                    onClick={() => navigate('/setup')}
                    className="w-full py-3 border border-dashed border-slate-300 dark:border-zinc-700 rounded-xl text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus size={18} />
                    Criar ou Entrar em outro
                </button>

                <button 
                    onClick={() => signOut()}
                    className="w-full py-3 text-slate-400 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                    <LogOut size={16} />
                    Sair da conta
                </button>
            </div>
        </div>
    </div>
  );
};

export default MinistrySelection;
