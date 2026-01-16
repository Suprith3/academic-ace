
import React from 'react';
import { db } from '../services/store';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onNavigate: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onNavigate }) => {
  const user = db.auth.getCurrentUser();

  const handleLogout = () => {
    db.auth.setCurrentUser(null);
    window.location.reload();
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'upload', label: 'Upload Paper', icon: '📤' },
    { id: 'plans', label: 'Study Plans', icon: '📅' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-inter">
      {/* Sidebar - White/Purple theme */}
      <aside className="w-72 bg-white flex flex-col border-r border-slate-200 shadow-sm z-20">
        <div className="p-8 border-b border-slate-100">
          <h1 className="text-2xl font-black text-indigo-600 flex items-center gap-3 italic whitespace-nowrap">
            <span className="bg-indigo-600 text-white rounded-xl p-2 w-10 h-10 flex items-center justify-center not-italic shadow-lg shadow-indigo-200 shrink-0">AA</span>
            Academic Ace
          </h1>
        </div>
        
        <nav className="flex-1 p-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full text-left px-5 py-4 rounded-2xl flex items-center gap-4 transition-all duration-200 font-bold text-sm ${
                activeTab === item.id 
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-[1.02]' 
                : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100">
          <div className="bg-slate-50 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-sm font-black text-indigo-600">
                {user?.email[0].toUpperCase()}
              </div>
              <div className="text-xs truncate">
                <div className="font-bold text-slate-900 truncate">{user?.email.split('@')[0]}</div>
                <div className="text-slate-500 font-medium">Student Account</div>
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full px-5 py-3 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors text-center uppercase tracking-widest"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-10">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">
            {activeTab.replace('-', ' ')}
          </h2>
          <div className="flex items-center gap-4">
             <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Ready</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="p-10 max-w-[1600px] mx-auto min-h-full flex flex-col">
            <div className="flex-1">
              {children}
            </div>
            <footer className="mt-20 py-8 flex justify-center border-t border-slate-100">
              <span className="text-[10px] text-slate-300 font-medium uppercase tracking-[0.3em] select-none">
                powered by gemini
              </span>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
