import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Blueprint from '@/pages/Blueprint';
import StartSession from '@/pages/StartSession';
import Leaderboard from '@/pages/Leaderboard';
import Account from '@/pages/Account';
import PlanRequests from '@/pages/PlanRequests';
import Premium from '@/pages/Premium';
import SavedDrills from '@/pages/SavedDrills';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/blueprint" element={<Blueprint />} />
        <Route path="/start" element={<StartSession />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/account" element={<Account />} />
        <Route path="/plan-requests" element={<PlanRequests />} />
        <Route path="/premium" element={<Premium />} />
        <Route path="/saved-drills" element={<SavedDrills />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <Sonner position="top-center" richColors />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
