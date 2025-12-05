import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Loader2 } from 'lucide-react';

import Home from './pages/Home';
import Login from './pages/Login';
import MinistrySetup from './pages/MinistrySetup';
import SongList from './pages/SongList';
import SongEditor from './pages/SongEditor';
import SetlistList from './pages/SetlistList';
import SetlistEditor from './pages/SetlistEditor';
import SetlistView from './pages/SetlistView';
import PerformanceView from './pages/PerformanceView';
import MusicianList from './pages/MusicianList';
import ScheduleList from './pages/ScheduleList';
import ScheduleEditor from './pages/ScheduleEditor';
import MinistryMembers from './pages/MinistryMembers';
import MinistryDashboard from './pages/MinistryDashboard';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, currentMinistry, loading } = useAuth();

  if (loading) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-accent-600" />
        </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!currentMinistry) {
    return <Navigate to="/setup" replace />;
  }

  return <>{children}</>;
};

const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, currentMinistry, loading } = useAuth();

    // Se estiver carregando o perfil, exibe spinner para não redirecionar errado
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-accent-600" />
            </div>
        );
    }

    if (user) {
        // LÓGICA DE REDIRECIONAMENTO PÓS-LOGIN
        if (currentMinistry) {
            return <Navigate to="/ministry" replace />;
        } else {
            return <Navigate to="/setup" replace />;
        }
    }
    
    return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={
              <PublicOnlyRoute>
                  <Login />
              </PublicOnlyRoute>
          } />
          
          <Route path="/setup" element={
              <MinistrySetup />
          } />

          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          
          <Route path="/ministry" element={<ProtectedRoute><MinistryDashboard /></ProtectedRoute>} />
          <Route path="/ministry/members" element={<ProtectedRoute><MinistryMembers /></ProtectedRoute>} />

          {/* Songs Routes */}
          <Route path="/songs" element={<ProtectedRoute><SongList /></ProtectedRoute>} />
          <Route path="/songs/new" element={<ProtectedRoute><SongEditor /></ProtectedRoute>} />
          <Route path="/songs/:id" element={<ProtectedRoute><SongEditor /></ProtectedRoute>} />
          
          {/* Setlists Routes */}
          <Route path="/setlists" element={<ProtectedRoute><SetlistList /></ProtectedRoute>} />
          <Route path="/setlists/new" element={<ProtectedRoute><SetlistEditor /></ProtectedRoute>} />
          <Route path="/setlists/edit/:id" element={<ProtectedRoute><SetlistEditor /></ProtectedRoute>} />
          <Route path="/setlists/:id" element={<ProtectedRoute><SetlistView /></ProtectedRoute>} />

          {/* Schedules / Musicians Routes */}
          <Route path="/musicians" element={<ProtectedRoute><MusicianList /></ProtectedRoute>} />
          <Route path="/schedules" element={<ProtectedRoute><ScheduleList /></ProtectedRoute>} />
          <Route path="/schedules/new" element={<ProtectedRoute><ScheduleEditor /></ProtectedRoute>} />
          <Route path="/schedules/edit/:id" element={<ProtectedRoute><ScheduleEditor /></ProtectedRoute>} />

          {/* Performance/Live View */}
          <Route path="/perform/:setlistId/:songId" element={<ProtectedRoute><PerformanceView /></ProtectedRoute>} />
          <Route path="/perform/song/:songId" element={<ProtectedRoute><PerformanceView /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
