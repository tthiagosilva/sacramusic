import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createMinistry, joinMinistryByCode } from '../services/storage';
import { Plus, Users, ArrowRight, Music, Loader2 } from 'lucide-react';

const MinistrySetup: React.FC = () => {
  const { userProfile, refreshProfile, signOut } = useAuth();
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !userProfile) return;
    
    try {
        setLoading(true);
        await createMinistry(name, userProfile);
        await refreshProfile();
    } catch (error) {
        console.error("Erro ao criar ministério:", error);
        alert("Ocorreu um erro ao criar o ministério. Tente novamente.");
    } finally {
        setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !userProfile) return;
    
    try {
        setLoading(true);
        const result = await joinMinistryByCode(code.toUpperCase(), userProfile);
        if (result) {
            await refreshProfile();
        } else {
            alert("Código inválido ou ministério não encontrado.");
        }
    } catch (error) {
        console.error("Erro ao entrar no ministério:", error);
        alert("Ocorreu um erro ao tentar entrar. Verifique sua conexão.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <h1 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-2">Olá, {userProfile?.displayName?.split(' ')[0]}</h1>
            <p className="text-slate-500 dark:text-slate-400">Para começar, você precisa fazer parte de um Ministério de Música.</p>
        </div>

        {mode === 'menu' && (
            <div className="space-y-4">
                <button 
                    onClick={() => setMode('create')}
                    className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl flex items-center gap-4 hover:border-accent-500 dark:hover:border-accent-500 transition-all text-left group shadow-sm"
                >
                    <div className="bg-accent-100 dark:bg-accent-900/30 p-3 rounded-xl text-accent-600 dark:text-accent-400 group-hover:scale-110 transition-transform">
                        <Plus size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-100">Criar Novo Ministério</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Sou o coordenador e quero criar um grupo.</p>
                    </div>
                </button>

                <button 
                    onClick={() => setMode('join')}
                    className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl flex items-center gap-4 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all text-left group shadow-sm"
                >
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                        <Users size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-100">Entrar em um Ministério</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Tenho um código de convite.</p>
                    </div>
                </button>

                <button onClick={() => signOut()} className="block w-full text-center text-sm text-slate-400 hover:text-slate-600 mt-6">
                    Sair da conta
                </button>
            </div>
        )}

        {mode === 'create' && (
            <form onSubmit={handleCreate} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-lg">
                <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-slate-100">Nome do Ministério</h3>
                <input 
                    type="text"
                    placeholder="Ex: Ministério Santa Cecília"
                    className="w-full p-3 border border-slate-300 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-slate-200 mb-4 focus:ring-2 focus:ring-accent-500 outline-none"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoFocus
                />
                <div className="flex gap-2">
                    <button type="button" onClick={() => setMode('menu')} className="flex-1 py-3 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 rounded-xl font-medium">Voltar</button>
                    <button type="submit" disabled={loading} className="flex-1 py-3 bg-accent-600 text-white rounded-xl font-bold flex justify-center items-center gap-2">
                        {loading ? <Loader2 className="animate-spin" /> : 'Criar'}
                    </button>
                </div>
            </form>
        )}

        {mode === 'join' && (
            <form onSubmit={handleJoin} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-lg">
                <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-slate-100">Código do Convite</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Peça ao coordenador o código de 6 dígitos.</p>
                <input 
                    type="text"
                    placeholder="Ex: X9A-2B3"
                    className="w-full p-3 text-center uppercase tracking-widest font-mono text-xl border border-slate-300 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-slate-200 mb-4 focus:ring-2 focus:ring-accent-500 outline-none"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    autoFocus
                    maxLength={10}
                />
                <div className="flex gap-2">
                    <button type="button" onClick={() => setMode('menu')} className="flex-1 py-3 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 rounded-xl font-medium">Voltar</button>
                    <button type="submit" disabled={loading} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold flex justify-center items-center gap-2">
                        {loading ? <Loader2 className="animate-spin" /> : 'Entrar'}
                    </button>
                </div>
            </form>
        )}
      </div>
    </div>
  );
};

export default MinistrySetup;
