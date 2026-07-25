import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, MapPin, Navigation, Settings, Smartphone, Wifi, Clock, Train, LogOut, LogIn, User } from 'lucide-react';
import { useSupabase } from './contexts/SupabaseProvider';
import { saveTrackingData, getTrackingData, saveStopPreference, saveAlertHistory } from './lib/database';

export default function App() {
  const { user, signIn, signUp, signOut } = useSupabase();
  const [progress, setProgress] = useState(0);
  const [radius, setRadius] = useState(500);
  const [showAuth, setShowAuth] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMode, setAuthMode] = useState('signin');
  const [formLoading, setFormLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Simulate progress
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalDistance = 5000;
  const remainingDistance = Math.max(0, totalDistance - (totalDistance * (progress / 100)));
  const etaMinutes = Math.max(0, Math.ceil((remainingDistance / 1000) * 3));
  const isApproaching = remainingDistance <= radius;

  // Load saved tracking data when user is authenticated
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        const saved = await getTrackingData(user.id);
        if (saved) {
          setRadius(saved.radius ?? 500);
        }
      } catch (err) {
        console.error('Failed to load tracking data:', err.message);
      }
    };
    loadData();
  }, [user]);

  // Save tracking data to Supabase on changes
  useEffect(() => {
    if (!user) return;

    const timeoutId = setTimeout(async () => {
      try {
        await saveTrackingData(user.id, {
          progress,
          radius,
          remainingDistance,
          etaMinutes,
          isApproaching,
        });
      } catch (err) {
        console.error('Failed to save tracking data:', err.message);
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [progress, radius, remainingDistance, etaMinutes, isApproaching, user]);

  // Save stop preference when radius changes (debounced)
  useEffect(() => {
    if (!user) return;

    const timeoutId = setTimeout(async () => {
      try {
        await saveStopPreference(user.id, {
          name: 'Downtown Station',
          lat: 0,
          lng: 0,
          radius,
        });
      } catch (err) {
        console.error('Failed to save stop preference:', err.message);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [radius, user]);

  // Save alert history when approaching triggers
  useEffect(() => {
    if (!user || !isApproaching || progress === 0) return;

    const timeoutId = setTimeout(async () => {
      try {
        await saveAlertHistory(user.id, {
          stopName: 'Downtown Station',
          distance: remainingDistance,
          etaMinutes,
        });
      } catch (err) {
        console.error('Failed to save alert history:', err.message);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [isApproaching, progress, remainingDistance, etaMinutes, user]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setAuthError('');
    try {
      await signIn(authEmail, authPassword);
      setShowAuth(false);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setAuthError('');
    try {
      await signUp(authEmail, authPassword);
      setShowAuth(false);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  if (formLoading && !user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="animate-pulse text-slate-400 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 overflow-x-hidden relative">
      {/* Background glow effects */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-neon-blue/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-neon-emerald/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="p-6 pt-10 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
          >
            <Bell className="text-neon-blue w-6 h-6" />
          </motion.div>
          <span className="text-xl font-bold tracking-wide">StopAlert</span>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="w-8 h-8 rounded-full bg-neon-blue/20 flex items-center justify-center border border-neon-blue/30">
                <User className="w-4 h-4 text-neon-blue" />
              </div>
              <button
                onClick={signOut}
                className="p-2 rounded-lg bg-slate-800/50 flex items-center justify-center border border-white/10 backdrop-blur-md hover:bg-slate-700/50 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4 text-slate-300" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="p-2 rounded-lg bg-slate-800/50 flex items-center justify-center border border-white/10 backdrop-blur-md hover:bg-slate-700/50 transition-colors"
              title="Sign in"
            >
              <LogIn className="w-4 h-4 text-slate-300" />
            </button>
          )}
        </div>
      </header>

      {/* Auth Modal */}
      {showAuth && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={() => setShowAuth(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass rounded-3xl p-8 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-6 text-center">Welcome to StopAlert</h3>
            <form onSubmit={authMode === 'signin' ? handleSignIn : handleSignUp} className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-white/10 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-neon-blue/50 transition-colors"
              />
              <input
                type="password"
                placeholder="Password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-white/10 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-neon-blue/50 transition-colors"
              />
              {authError && (
                <p className="text-red-400 text-sm text-center">{authError}</p>
              )}
              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-neon-blue text-white font-semibold text-lg shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:shadow-[0_0_30px_rgba(56,189,248,0.5)] transition-shadow disabled:opacity-50"
              >
                {formLoading ? 'Please wait...' : authMode === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            </form>
            <p className="text-center text-slate-400 text-sm mt-4">
              {authMode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={() => { setAuthMode(authMode === 'signin' ? 'signup' : 'signin'); setAuthError(''); }}
                className="text-neon-blue hover:underline ml-1"
              >
                {authMode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}

      <main className="px-6 relative z-10 flex flex-col gap-8">
        {/* Hero Section */}
        <section className="mt-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-3 neon-text-blue leading-tight"
          >
            Never Miss Your<br />Stop Again.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-lg mb-8"
          >
            Set your destination. Sleep in peace. We'll wake you up on time.
          </motion.p>

          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-neon-blue text-white font-semibold text-lg flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-shadow hover:shadow-[0_0_30px_rgba(56,189,248,0.6)] relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <MapPin className="w-5 h-5" /> Set My Stop
            </span>
            <div className="absolute inset-0 bg-white/20 blur-xl rounded-full transform -translate-x-full animate-[shimmer_2s_infinite]" />
          </motion.button>
        </section>

        {/* Live Tracking Dashboard (Glassmorphic) */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`p-6 rounded-3xl glass transition-all duration-500 ${isApproaching ? 'border-neon-emerald/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : ''}`}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Live Tracking</h2>
            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-neon-blue text-sm font-medium flex items-center gap-2 border border-blue-500/20">
              <div className="w-2 h-2 rounded-full bg-neon-blue animate-pulse" /> Active
            </span>
          </div>

          <div className="flex gap-6 mb-8">
            <div className="flex-1 bg-slate-800/40 rounded-2xl p-4 border border-white/5">
              <p className="text-slate-400 text-sm mb-1">Distance Left</p>
              <p className={`text-2xl font-bold ${isApproaching ? 'neon-text-emerald' : 'text-white'}`}>
                {remainingDistance < 1000 ? `${Math.round(remainingDistance)}m` : `${(remainingDistance / 1000).toFixed(1)}km`}
              </p>
            </div>
            <div className="flex-1 bg-slate-800/40 rounded-2xl p-4 border border-white/5">
              <p className="text-slate-400 text-sm mb-1">ETA</p>
              <p className="text-2xl font-bold text-white">{etaMinutes} min</p>
            </div>
          </div>

          {/* Vertical Route Progress */}
          <div className="relative pl-6 py-2 mb-8">
            <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-slate-700/50 rounded-full" />
            <motion.div
              className={`absolute left-[11px] top-0 w-0.5 rounded-full ${isApproaching ? 'bg-neon-emerald shadow-[0_0_10px_#10b981]' : 'bg-neon-blue shadow-[0_0_10px_#38bdf8]'}`}
              style={{ height: `${progress}%` }}
              layout
            />

            <div className="relative z-10 flex items-center gap-4 mb-12">
              <div className="absolute -left-[29px] w-6 h-6 rounded-full bg-slate-900 border-2 border-neon-blue flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-neon-blue" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Current Station</p>
                <p className="font-semibold text-lg">Central Hub</p>
              </div>
            </div>

            <div className="relative z-10 flex items-center gap-4">
              <div className={`absolute -left-[29px] w-6 h-6 rounded-full bg-slate-900 border-2 ${isApproaching ? 'border-neon-emerald' : 'border-slate-600'} flex items-center justify-center transition-colors`}>
                <div className={`w-2 h-2 rounded-full ${isApproaching ? 'bg-neon-emerald animate-pulse' : 'bg-slate-600'}`} />
              </div>
              <div>
                <p className="text-sm text-slate-400">Destination</p>
                <p className="font-semibold text-lg">Downtown Station</p>
              </div>
            </div>
          </div>

          {/* Alert Radius Slider */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex justify-between mb-2">
              <label className="text-sm text-slate-300">Alert Radius</label>
              <span className="text-sm font-bold text-neon-blue">{radius}m</span>
            </div>
            <input
              type="range"
              min="100"
              max="2000"
              step="100"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-neon-blue"
            />
          </div>
        </motion.section>

        {/* Features Grid */}
        <section>
          <h3 className="text-xl font-semibold mb-4">Smart Features</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="glass p-4 rounded-2xl flex flex-col items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20 text-neon-blue">
                <Wifi className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">Multi-Transport</p>
                <p className="text-xs text-slate-400">GPS + Cell tracking</p>
              </div>
            </div>
            <div className="glass p-4 rounded-2xl flex flex-col items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">Smart Alerts</p>
                <p className="text-xs text-slate-400">Audio, vibe, visual</p>
              </div>
            </div>
            <div className="glass p-4 rounded-2xl flex flex-col items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-neon-emerald">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">Quick Start</p>
                <p className="text-xs text-slate-400">Save favorites</p>
              </div>
            </div>
            <div className="glass p-4 rounded-2xl flex flex-col items-start gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400">
                <Train className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">Underground</p>
                <p className="text-xs text-slate-400">Offline estimation</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full glass rounded-t-3xl border-b-0 border-x-0 pb-safe z-50">
        <div className="flex justify-around items-center p-4">
          <button className="flex flex-col items-center gap-1 text-neon-blue">
            <Navigation className="w-6 h-6" />
            <span className="text-[10px] font-medium">Track</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors">
            <MapPin className="w-6 h-6" />
            <span className="text-[10px] font-medium">Stops</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors">
            <Settings className="w-6 h-6" />
            <span className="text-[10px] font-medium">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
}