import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Music, ListMusic, Home, CalendarDays, Moon, Sun, LogOut, User as UserIcon, Copy, Check, Users, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, hideNav = false }) => {
  const location = useLocation();
  const { currentMinistry, userProfile, signOut } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check initial theme
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  const copyCode = () => {
    if (currentMinistry?.inviteCode) {
        navigator.clipboard.writeText(currentMinistry.inviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  const isActive = (path: string) => 
    location.pathname === path 
      ? 'text-accent-600 dark:text-accent-400 font-bold bg-accent-50 dark:bg-accent-900/20 rounded-xl' 
      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col font-sans transition-colors duration-300">
      <header className="fixed w-full top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 transition-colors duration-300">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-serif font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <div className="bg-accent-600 text-white p-1.5 rounded-lg shadow-sm">
              <Music className="w-5 h-5" />
            </div>
            <span className="hidden sm:inline">SacraMusic</span>
          </Link>
          
          <div className="flex items-center gap-2">
            {!hideNav && (
              <nav className="flex gap-1 mr-2">
                 <Link to="/" className={`p-2 transition-all ${isActive('/')}`} aria-label="Home">
                  <Home className="w-5 h-5" />
                </Link>
                <Link to="/songs" className={`p-2 transition-all ${isActive('/songs')}`} aria-label="Músicas">
                  <Music className="w-5 h-5" />
                </Link>
                <Link to="/setlists" className={`p-2 transition-all ${isActive('/setlists')}`} aria-label="Repertórios">
                  <ListMusic className="w-5 h-5" />
                </Link>
                <Link to="/schedules" className={`p-2 transition-all ${isActive('/schedules')}`} aria-label="Escalas">
                  <CalendarDays className="w-5 h-5" />
                </Link>
              </nav>
            )}
            
            <div className="relative">
                <button 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="w-9 h-9 rounded-full bg-slate-200 dark:bg-zinc-700 overflow-hidden border border-slate-300 dark:border-zinc-600"
                >
                    {userProfile?.photoURL ? (
                        <img src={userProfile.photoURL} alt="User" className="w-full h-full object-cover" />
                    ) : (
                        <UserIcon className="w-5 h-5 m-auto text-slate-500" />
                    )}
                </button>

                {showProfileMenu && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)}></div>
                        <div className="absolute right-0 top-12 w-64 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-slate-200 dark:border-zinc-800 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                            <div className="mb-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
                                <p className="font-bold text-slate-800 dark:text-slate-100 truncate">{userProfile?.displayName}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{userProfile?.email}</p>
                            </div>
                            
                            {currentMinistry && (
                                <div className="mb-4 bg-slate-50 dark:bg-zinc-800 p-3 rounded-lg">
                                    <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-bold mb-1">Ministério Atual</p>
                                    <p className="text-sm font-bold text-accent-600 dark:text-accent-400 mb-2 truncate">{currentMinistry.name}</p>
                                    <button 
                                        onClick={copyCode}
                                        className="w-full flex items-center justify-between text-xs bg-white dark:bg-zinc-700 border border-slate-200 dark:border-zinc-600 rounded px-2 py-1.5 text-slate-600 dark:text-slate-300 mb-2"
                                    >
                                        <span>Cód: <span className="font-mono font-bold">{currentMinistry.inviteCode}</span></span>
                                        {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                                    </button>

                                    <Link 
                                        to="/ministry" 
                                        onClick={() => setShowProfileMenu(false)}
                                        className="w-full flex items-center justify-center gap-2 text-xs bg-accent-600 hover:bg-accent-700 text-white rounded px-2 py-1.5 transition-colors font-bold"
                                    >
                                        <LayoutDashboard size={12} />
                                        Meu Ministério
                                    </Link>
                                </div>
                            )}

                            <button 
                                onClick={toggleTheme}
                                className="w-full flex items-center gap-3 p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors mb-1"
                            >
                                {isDark ? <Sun size={16} /> : <Moon size={16} />}
                                <span>{isDark ? 'Modo Claro' : 'Modo Escuro'}</span>
                            </button>

                            <button 
                                onClick={signOut}
                                className="w-full flex items-center gap-3 p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                <LogOut size={16} />
                                <span>Sair</span>
                            </button>
                        </div>
                    </>
                )}
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 w-full max-w-3xl mx-auto p-4 sm:p-6 pb-24 mt-16 animate-in fade-in duration-500">
        {children}
      </main>
    </div>
  );
};

export default Layout;
