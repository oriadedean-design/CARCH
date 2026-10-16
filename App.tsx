import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Auth } from './pages/Auth';
import { Welcome } from './pages/Welcome';
import { OnboardingIndividual } from './pages/OnboardingIndividual';
import { OnboardingEnterprise } from './pages/OnboardingEnterprise';

// Dashboards
import { DashboardIndividual } from './pages/DashboardIndividual';
import { DashboardEnterprise } from './pages/DashboardEnterprise';
import { JobsIndividual } from './pages/JobsIndividual';
import { JobsEnterprise } from './pages/JobsEnterprise';
import { SettingsIndividual } from './pages/SettingsIndividual';
import { SettingsEnterprise } from './pages/SettingsEnterprise';
import { JobDetail } from './pages/Jobs';
import { Reports } from './pages/Reports';
import { Finance } from './pages/Finance';
import { Management } from './pages/Management';

// Public Pages
import { Resources } from './pages/Resources';
import { Manual } from './pages/Manual';
import { About } from './pages/About';
import { Privacy } from './pages/Privacy';

import { api } from './services/storage';
import { supabase } from './services/supabase';
import { User } from './types';
import { ToastProvider } from './context/ToastContext';

const MainApp = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [authAgentMode, setAuthAgentMode] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    
    const hydrateSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && isMounted.current) {
          const u = await api.auth.getUser();
          if (isMounted.current) {
            setUser(u);
            setShowWelcome(false);
          }
        }
      } catch (err) {
        console.warn("Session hydration interrupted");
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    hydrateSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted.current) return;
      
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        if (session) {
          const u = await api.auth.getUser();
          if (isMounted.current) {
            setUser(u);
            setShowWelcome(false);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setShowWelcome(true);
      }
    });

    return () => { 
      isMounted.current = false;
      subscription.unsubscribe(); 
    };
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    setShowWelcome(false);
  };

  const handleLogout = () => {
    api.auth.logout();
  };

  const handleWelcomeEnter = (asAgent: boolean = false) => {
    setAuthAgentMode(asAgent);
    setShowWelcome(false);
  };
  
  const handleAuthBack = () => setShowWelcome(true);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent animate-spin"></div>
    </div>
  );

  const isAgent = user?.accountType === 'AGENT';

  const PrivateRoute = ({ children }: { children?: React.ReactNode }) => {
    if (!user) {
      if (showWelcome) return <Welcome onEnter={handleWelcomeEnter} />;
      return <Auth onLogin={handleLogin} onBack={handleAuthBack} initialAgentMode={authAgentMode} />;
    }
    if (!user.isOnboarded) {
      return user.accountType === 'AGENT' 
        ? <OnboardingEnterprise user={user} onComplete={() => setUser({ ...user, isOnboarded: true })} />
        : <OnboardingIndividual user={user} onComplete={() => setUser({ ...user, isOnboarded: true })} />;
    }
    return <>{children}</>;
  };

  return (
    <Layout onLogout={handleLogout}>
      <Routes>
        <Route path="/about" element={<About />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/manual" element={<Manual />} />
        <Route path="/privacy" element={<Privacy />} />

        <Route path="/" element={
          <PrivateRoute>
            {isAgent ? <DashboardEnterprise /> : <DashboardIndividual />}
          </PrivateRoute>
        } />
        
        <Route path="/jobs" element={
          <PrivateRoute>
            {isAgent ? <JobsEnterprise /> : <JobsIndividual />}
          </PrivateRoute>
        } />
        
        <Route path="/jobs/:id" element={
          <PrivateRoute>
            <JobDetail />
          </PrivateRoute>
        } />
        
        <Route path="/roster" element={
          <PrivateRoute>
            {isAgent ? <Management /> : <Navigate to="/" replace />}
          </PrivateRoute>
        } />
        
        <Route path="/settings" element={
          <PrivateRoute>
            {isAgent ? <SettingsEnterprise /> : <SettingsIndividual />}
          </PrivateRoute>
        } />
        
        <Route path="/finance" element={
          <PrivateRoute>
            <Finance />
          </PrivateRoute>
        } />
        
        <Route path="/reports" element={
          <PrivateRoute>
            <Reports />
          </PrivateRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

const App = () => {
  return (
    <ToastProvider>
      <HashRouter>
        <MainApp />
      </HashRouter>
    </ToastProvider>
  );
};

export default App;