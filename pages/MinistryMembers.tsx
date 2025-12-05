import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { getMinistryMembers, removeMemberFromMinistry } from '../services/storage';
import { UserProfile } from '../types';
import { ArrowLeft, Trash2, Crown, Copy, Check, User as UserIcon, Loader2 } from 'lucide-react';

const MinistryMembers: React.FC = () => {
  const { currentMinistry, user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (currentMinistry) {
      loadMembers();
    }
  }, [currentMinistry]);

  const loadMembers = async () => {
    if (!currentMinistry) return;
    const list = await getMinistryMembers(currentMinistry.members);
    setMembers(list);
    setLoading(false);
  };

  const copyCode = () => {
    if (currentMinistry?.inviteCode) {
        navigator.clipboard.writeText(currentMinistry.inviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!currentMinistry) return;
    
    if (window.confirm(`Tem certeza que deseja remover ${memberName} do ministério?`)) {
        try {
            await removeMemberFromMinistry(currentMinistry.id, memberId);
            setMembers(prev => prev.filter(m => m.uid !== memberId));
            
            // If user removed themselves (unlikely via this button, but possible logic)
            if (memberId === user?.uid) {
                await refreshProfile();
                navigate('/setup');
            }
        } catch (error) {
            alert("Erro ao remover membro.");
        }
    }
  };

  const isOwner = currentMinistry?.ownerId === user?.uid;

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
            <ArrowLeft />
          </button>
          <h1 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100">Gerenciar Equipe</h1>
        </div>

        {/* Invite Code Card */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg text-center">
            <h2 className="text-indigo-100 text-sm font-bold uppercase tracking-wider mb-2">Código de Convite</h2>
            <div 
                onClick={copyCode}
                className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4 mb-3 cursor-pointer hover:bg-white/30 transition-colors flex items-center justify-center gap-3"
            >
                <span className="text-4xl font-mono font-bold tracking-widest">{currentMinistry?.inviteCode}</span>
                {copied ? <Check className="text-green-300" /> : <Copy className="text-white/70" />}
            </div>
            <p className="text-sm text-indigo-100">Compartilhe este código com os outros integrantes para que eles tenham acesso às escalas e repertórios.</p>
        </div>

        <div className="space-y-4">
            <h3 className="font-bold text-slate-700 dark:text-slate-300 px-1">Integrantes ({members.length})</h3>
            
            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin text-accent-500" />
                </div>
            ) : (
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-100 dark:border-zinc-800 divide-y divide-slate-100 dark:divide-zinc-800 overflow-hidden">
                    {members.map(member => (
                        <div key={member.uid} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-zinc-700 overflow-hidden flex-shrink-0">
                                    {member.photoURL ? (
                                        <img src={member.photoURL} alt={member.displayName || ''} className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon className="w-5 h-5 m-auto mt-2.5 text-slate-400" />
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-slate-800 dark:text-slate-200">{member.displayName || 'Usuário sem nome'}</h4>
                                        {member.uid === currentMinistry?.ownerId && (
                                            <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-200 dark:border-amber-800">
                                                <Crown size={10} />
                                                COORD.
                                            </span>
                                        )}
                                        {member.uid === user?.uid && (
                                            <span className="bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                VOCÊ
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-400 dark:text-zinc-500">{member.email}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            {isOwner && member.uid !== user?.uid && (
                                <button 
                                    onClick={() => handleRemoveMember(member.uid, member.displayName || 'Membro')}
                                    className="p-2 text-slate-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                                    title="Remover do ministério"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </Layout>
  );
};

export default MinistryMembers;