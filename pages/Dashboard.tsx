
import React from 'react';
import { db } from '../services/store';
import { UploadedDocument } from '../types';

interface DashboardProps {
  onAnalyze: (doc: UploadedDocument) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onAnalyze }) => {
  const user = db.auth.getCurrentUser();
  const documents = db.documents.findByUser(user?.id || '');
  const plans = db.plans.findByUser(user?.id || '');

  const sortedDocuments = [...documents].sort((a, b) => 
    new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-slate-400 text-xs font-black mb-1 uppercase tracking-[0.2em]">Analyzed Papers</div>
            <div className="text-5xl font-black text-indigo-600">{documents.length}</div>
          </div>
          <div className="text-6xl opacity-20">📑</div>
        </div>
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-slate-400 text-xs font-black mb-1 uppercase tracking-[0.2em]">Study Blueprints</div>
            <div className="text-5xl font-black text-indigo-600">{plans.length}</div>
          </div>
          <div className="text-6xl opacity-20">🗓️</div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <h3 className="font-black text-slate-800 uppercase tracking-tight">Recent Archives</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {sortedDocuments.length === 0 ? (
            <div className="p-20 text-center text-slate-400 font-medium italic">
              No archives found. Start your first analysis.
            </div>
          ) : (
            sortedDocuments.map((doc) => (
              <div key={doc.id} className="px-10 py-7 flex items-center justify-between hover:bg-indigo-50/30 transition-all group">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-white border-2 border-slate-100 text-indigo-600 rounded-2xl flex items-center justify-center font-black shadow-sm group-hover:border-indigo-200 transition-colors">
                    {doc.filename.slice(-3).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-black text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{doc.filename}</div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                      Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => onAnalyze(doc)}
                  className="px-8 py-3 text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
                >
                  View Blueprint
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
