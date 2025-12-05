import React from 'react';
import { Link } from 'react-router-dom';
import { Music, ListMusic, PlusCircle, CalendarDays, ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';

const Home: React.FC = () => {
  return (
    <Layout>
      <div className="flex flex-col gap-8 py-4">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent-600 to-teal-800 dark:from-accent-900 dark:to-teal-950 p-8 text-white shadow-xl">
          <div className="relative z-10">
            <h1 className="text-3xl font-serif font-bold mb-2">Bem-vindo</h1>
            <p className="text-accent-100 opacity-90 max-w-md">
              Organize seus repertórios, escalas e cifras para a Santa Missa com simplicidade e beleza.
            </p>
          </div>
          <Music className="absolute -bottom-4 -right-4 w-32 h-32 text-white opacity-10 rotate-12" />
        </div>

        {/* Main Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/schedules" className="group relative bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all hover:border-accent-500 dark:hover:border-accent-500 md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-50 dark:bg-orange-900/30 p-3 rounded-xl text-orange-600 dark:text-orange-400">
                <CalendarDays size={28} />
              </div>
              <ArrowRight className="text-slate-300 dark:text-zinc-600 group-hover:text-accent-500 transition-colors" size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">Escalas</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Gerencie quem toca em cada missa.</p>
          </Link>

          <Link to="/setlists" className="group relative bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all hover:border-accent-500 dark:hover:border-accent-500">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-xl text-indigo-600 dark:text-indigo-400">
                <ListMusic size={28} />
              </div>
              <ArrowRight className="text-slate-300 dark:text-zinc-600 group-hover:text-accent-500 transition-colors" size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">Repertórios</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Organize as músicas por celebração e data.</p>
          </Link>

          <Link to="/songs" className="group relative bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all hover:border-accent-500 dark:hover:border-accent-500">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-emerald-50 dark:bg-emerald-900/30 p-3 rounded-xl text-emerald-600 dark:text-emerald-400">
                <Music size={28} />
              </div>
              <ArrowRight className="text-slate-300 dark:text-zinc-600 group-hover:text-accent-500 transition-colors" size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">Músicas</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Acesse sua biblioteca de letras e cifras.</p>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-100 dark:bg-zinc-900/50 rounded-2xl p-6 border border-slate-200 dark:border-zinc-800">
          <h3 className="font-serif font-semibold text-lg text-slate-700 dark:text-slate-300 mb-4">Acesso Rápido</h3>
          <div className="flex flex-col sm:flex-row gap-3">
             <Link to="/schedules/new" className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 py-3.5 rounded-xl text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors shadow-sm">
              <PlusCircle size={18} className="text-accent-600 dark:text-accent-400" />
              Nova Escala
             </Link>
             <Link to="/setlists/new" className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 py-3.5 rounded-xl text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors shadow-sm">
              <PlusCircle size={18} className="text-accent-600 dark:text-accent-400" />
              Novo Repertório
             </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;