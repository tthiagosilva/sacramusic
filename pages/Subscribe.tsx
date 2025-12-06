import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Check, Star, Shield, Zap, Music, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Subscribe: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!userProfile) return navigate('/login');
    
    setLoading(true);

    try {
      // Chama nossa API na Vercel
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userProfile.uid,
          email: userProfile.email,
          // Se quiser, pode passar o ID do preço dinamicamente, ou deixar o back-end decidir
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redireciona para o checkout do Stripe
        window.location.href = data.url;
      } else {
        alert('Erro ao iniciar pagamento. Tente novamente.');
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      alert('Erro de conexão.');
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center text-center py-8 gap-6">
        <div className="space-y-4 max-w-lg">
           <div className="bg-amber-100 dark:bg-amber-900/30 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400 mb-6 shadow-sm rotate-3">
              <Star size={32} className="fill-current" />
           </div>
           
           <h1 className="text-3xl font-serif font-bold text-slate-800 dark:text-slate-100">
             Seja Premium
           </h1>
           <p className="text-slate-500 dark:text-slate-400 text-lg">
             Desbloqueie todo o potencial do SacraMusic e gerencie seu ministério sem limites.
           </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-slate-200 dark:border-zinc-800 overflow-hidden max-w-md w-full mt-4">
            <div className="p-8 pb-4">
                <div className="flex justify-center items-baseline gap-1 mb-2">
                    <span className="text-4xl font-bold text-slate-800 dark:text-slate-100">R$ 19,90</span>
                    <span className="text-slate-500">/mês</span>
                </div>
                <p className="text-sm text-slate-400 dark:text-slate-500">Cancele quando quiser.</p>
            </div>

            <div className="px-8 space-y-4 mb-8 text-left">
                <Feature text="Criar Ministérios ilimitados" />
                <Feature text="Gerenciar membros da equipe" />
                <Feature text="Criar e editar escalas" />
                <Feature text="Criar e editar repertórios" />
                <Feature text="Adicionar novas músicas" />
                <Feature text="Cadastrar músicos e funções" />
            </div>

            <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 border-t border-slate-100 dark:border-zinc-800">
                <button 
                    onClick={handleSubscribe}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/20 transform transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Zap size={20} />}
                    {loading ? 'Processando...' : 'Assinar Agora'}
                </button>
                <p className="text-[10px] text-slate-400 mt-3">Pagamento seguro via Stripe</p>
            </div>
        </div>

        <div className="max-w-md text-left text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-zinc-900/50 p-4 rounded-xl">
            <p className="font-bold mb-1 flex items-center gap-2">
                <Shield size={14} />
                Garantia de Satisfação
            </p>
            <p>Seu ministério não parou de crescer? O nosso suporte também não. Tenha acesso a atualizações constantes.</p>
        </div>
      </div>
    </Layout>
  );
};

const Feature: React.FC<{text: string}> = ({text}) => (
    <div className="flex items-center gap-3">
        <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full text-green-600 dark:text-green-400">
            <Check size={14} strokeWidth={3} />
        </div>
        <span className="text-slate-700 dark:text-slate-300 font-medium">{text}</span>
    </div>
);

export default Subscribe;
