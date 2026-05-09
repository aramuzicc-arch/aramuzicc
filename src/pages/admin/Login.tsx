import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Lock, User } from 'lucide-react';
import CrimsonVoid from '@/components/CrimsonVoid';
import { apiFetch, setToken } from '@/lib/api';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await apiFetch<{ token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      setToken(response.token);
      navigate('/admin');
    } catch {
      setError('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] flex items-center justify-center">
      <CrimsonVoid />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="glass rounded-2xl p-8">
          <h1 className="font-display text-3xl text-champagne tracking-wider text-center mb-8">ADMIN PORTAL</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-[11px] tracking-[0.2em] uppercase text-muted-warm mb-2 block">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-warm" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full glass rounded-lg pl-10 pr-4 py-3 text-champagne font-body text-sm focus:outline-none focus:border-olive-light/30"
                  placeholder="admin"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] tracking-[0.2em] uppercase text-muted-warm mb-2 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-warm" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full glass rounded-lg pl-10 pr-4 py-3 text-champagne font-body text-sm focus:outline-none focus:border-olive-light/30"
                  placeholder="admin123"
                />
              </div>
            </div>
            {error && <p className="text-amber-700 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-olive text-obsidian py-3 rounded-full text-[11px] tracking-[0.2em] uppercase font-body hover:bg-olive-light transition-colors"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
