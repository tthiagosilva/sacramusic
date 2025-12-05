import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Music, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const { signInWithGoogle } = useAuth();
  const [error, setError] = useState<any>(null);

  const handleLogin = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-zinc-900 to-black flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-zinc-800 text-center">
        <div className="bg-accent-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3">
            <Music className="text-white w-10 h-10" />
        </div>
        
        <h1 className="text-3xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-2">SacraMusic</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Organize seu ministério de música, acesse cifras e monte escalas em um só lugar.</p>
        
        {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 p-4 rounded-xl text-sm text-left mb-6 border border-red-200 dark:border-red-900/50 flex flex-col gap-2">
                <div className="flex items-center gap-2 font-bold">
                    <AlertCircle size={16} />
                    <span>Erro ao entrar ({error.code})</span>
                </div>
                
                {error.code === 'auth/unauthorized-domain' && (
                    <div className="mt-1 space-y-2 text-xs sm:text-sm">
                        <p>Este domínio não está autorizado no Firebase.</p>
                        <div className="bg-white dark:bg-black/40 p-2 rounded border border-red-100 dark:border-red-900/30">
                            <p className="font-mono break-all font-bold select-all">{window.location.hostname}</p>
                        </div>
                        <p>Para corrigir:</p>
                        <ol className="list-decimal ml-4 space-y-1 opacity-90">
                            <li>Acesse o Console do Firebase</li>
                            <li>Vá em <strong>Authentication</strong> &gt; <strong>Settings</strong></li>
                            <li>Clique na aba <strong>Authorized domains</strong></li>
                            <li>Adicione o domínio acima.</li>
                        </ol>
                    </div>
                )}

                {error.code === 'auth/configuration-not-found' && (
                    <div className="mt-1 space-y-1 text-xs sm:text-sm">
                        <p>O login com Google não está ativado no console.</p>
                        <ol className="list-decimal ml-4 space-y-1 opacity-90">
                            <li>Acesse o Console do Firebase</li>
                            <li>Vá em <strong>Authentication</strong> &gt; <strong>Sign-in method</strong></li>
                            <li>Clique em <strong>Google</strong> e ative a chave.</li>
                        </ol>
                    </div>
                )}
                 {error.code === 'auth/popup-closed-by-user' && (
                    <p className="mt-1">Você fechou a janela de login antes de terminar.</p>
                )}
            </div>
        )}

        <button
            onClick={handleLogin}
            className="w-full bg-white dark:bg-black border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-200 font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-sm"
        >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
            Entrar com Google
        </button>

        <p className="text-xs text-slate-400 dark:text-zinc-600 mt-8">
            Ao continuar, você concorda com os termos de uso.
        </p>
      </div>
    </div>
  );
};

export default Login;