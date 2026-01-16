
import React, { useState } from 'react';
import { db } from '../services/store';
import { User } from '../types';

interface AuthPageProps {
  onAuthSuccess: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const user = db.users.find(email);
      if (user) {
        db.auth.setCurrentUser(user);
        onAuthSuccess(user);
      } else {
        setError('User not found. Please register.');
      }
    } else {
      const existing = db.users.find(email);
      if (existing) {
        setError('Email already exists');
      } else {
        const newUser = db.users.create({ email });
        db.auth.setCurrentUser(newUser);
        onAuthSuccess(newUser);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-4 shadow-xl shadow-indigo-100">
            AA
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Academic Ace</h1>
          <p className="text-slate-500 mt-2">Personalized Study Schedules powered by AI</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                placeholder="you@university.edu"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                placeholder="••••••••"
              />
            </div>
            
            {error && <div className="text-xs text-red-500 mt-1">{error}</div>}

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
            >
              {isLogin ? 'Sign In' : 'Register Now'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
