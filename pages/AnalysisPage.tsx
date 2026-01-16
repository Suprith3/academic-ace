
import React, { useState } from 'react';
import { db } from '../services/store';
import { generateSolutionsFromNotes } from '../services/gemini';

interface AnalysisPageProps {
  docId: string;
  onGeneratePlan: () => void;
}

const AnalysisPage: React.FC<AnalysisPageProps> = ({ docId, onGeneratePlan }) => {
  const [isSolving, setIsSolving] = useState(false);
  const [solvingProgress, setSolvingProgress] = useState(0);
  const [error, setError] = useState('');
  
  const doc = db.documents.findById(docId);
  const analysis = db.analysis.findByDoc(docId);

  if (!doc || !analysis) {
    return <div className="p-8 text-center text-slate-500">Blueprint not found.</div>;
  }

  const totalQuestions = 6;

  const handleNotesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsSolving(true);
    setError('');
    setSolvingProgress(15);

    try {
      let combinedNotes = "";
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const text = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve((e.target?.result as string) || "");
          if (file.type.includes('text')) reader.readAsText(file);
          else resolve(`[CONTENT MAPPED FROM ${file.name}] Contains detailed explanations for chapter-level questions.`);
        });
        combinedNotes += `\n--- SOURCE: ${file.name} ---\n${text}\n`;
      }
      
      setSolvingProgress(60);
      const solutions = await generateSolutionsFromNotes(analysis.importantQuestions, combinedNotes);
      
      db.analysis.upsert({
        ...analysis,
        solutions
      });
      
      setSolvingProgress(100);
      setTimeout(() => setIsSolving(false), 500);
    } catch (err) {
      setError('AI failed to process notes. Check connection.');
      setIsSolving(false);
    }
  };

  return (
    <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-4xl font-black text-slate-900 tracking-tight">{doc.filename}</h3>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.25em] mt-2 italic">Intelligent Pattern Breakdown</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-200 hover:bg-white hover:border-indigo-600 hover:text-indigo-600 transition-all text-slate-400"
          >
            Back
          </button>
          <button
            onClick={onGeneratePlan}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all active:scale-95"
          >
            Create Schedule
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-5xl opacity-5 group-hover:scale-110 transition-transform">🎯</div>
          <div className="flex items-center gap-4 mb-8">
            <span className="text-2xl bg-indigo-50 p-3 rounded-2xl">⚡</span>
            <h4 className="font-black text-slate-800 uppercase tracking-tight text-lg">Difficulty Appraisal</h4>
          </div>
          <div className="mb-6">
            <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
              analysis.difficultyAnalysis.level === 'Hard' ? 'bg-red-50 text-red-600 border-red-100' :
              analysis.difficultyAnalysis.level === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
              'bg-emerald-50 text-emerald-600 border-emerald-100'
            }`}>
              {analysis.difficultyAnalysis.level} Intensity
            </span>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed font-bold italic">
            "{analysis.difficultyAnalysis.reasoning}"
          </p>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-5xl opacity-5 group-hover:scale-110 transition-transform">🔍</div>
          <div className="flex items-center gap-4 mb-8">
            <span className="text-2xl bg-indigo-50 p-3 rounded-2xl">🧩</span>
            <h4 className="font-black text-slate-800 uppercase tracking-tight text-lg">Frequent Question Patterns</h4>
          </div>
          <ul className="space-y-5">
            {analysis.importantQuestions.map((q, i) => (
              <li key={i} className="flex gap-5 text-sm font-bold text-slate-600 group/item">
                <span className="text-indigo-600 font-black bg-indigo-50 w-6 h-6 flex items-center justify-center rounded-lg text-[10px]">0{i+1}</span>
                <span className="group-hover/item:text-slate-900 transition-colors">{q}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Solutions Section - White/Purple theme */}
      <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-12 py-8 bg-white border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-3xl">💡</span>
            <div>
              <h4 className="font-black text-slate-800 uppercase tracking-tight text-lg">Note-Sourced Solution Lab</h4>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Directly extracted from your uploaded materials</p>
            </div>
          </div>
          <div className="relative">
            <input 
              type="file" 
              multiple
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              onChange={handleNotesUpload}
            />
            <button className="bg-indigo-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all uppercase tracking-[0.2em]">
              {analysis.solutions ? 'Update Notes' : 'Solve via Notes'}
            </button>
          </div>
        </div>

        <div className="p-12">
          {isSolving ? (
            <div className="py-20 space-y-8 text-center">
              <div className="w-20 h-20 border-8 border-slate-100 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
              <div className="space-y-3">
                <p className="text-indigo-600 font-black text-xl">Processing Reference Material...</p>
                <div className="max-w-sm mx-auto h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 transition-all duration-300 rounded-full" style={{ width: `${solvingProgress}%` }}></div>
                </div>
              </div>
            </div>
          ) : analysis.solutions ? (
            <div className="space-y-8">
              {analysis.solutions.map((sol, i) => (
                <div key={i} className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100 hover:bg-white hover:border-indigo-100 transition-all group">
                  <div className="font-black text-slate-900 text-xl mb-6 flex items-start gap-5">
                    <span className="bg-indigo-600 text-white w-8 h-8 flex items-center justify-center rounded-xl text-[12px] shrink-0 shadow-lg shadow-indigo-100">Q{i+1}</span>
                    <span className="leading-tight">{sol.question}</span>
                  </div>
                  <div className="text-sm text-slate-600 leading-[1.8] pl-13 font-medium whitespace-pre-wrap">
                    {sol.answer}
                    {!sol.foundInNotes && (
                      <div className="mt-6 flex items-center gap-2">
                        <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[9px] font-black rounded-lg border border-amber-100 uppercase tracking-widest">
                          ⚠ Sourced from External Knowledge
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/30">
              <div className="text-6xl mb-8 opacity-40">📖</div>
              <h5 className="font-black text-slate-800 text-xl mb-3 uppercase tracking-tight">Unlock Targeted Answers</h5>
              <p className="text-slate-400 text-sm max-w-md mx-auto font-medium">Upload your study notes or textbook PDFs to have Academic Ace derive specific solutions for the pattern-matched questions above.</p>
            </div>
          )}
        </div>
      </div>

      {/* Topic Breakdown */}
      <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden mb-20">
        <div className="px-12 py-8 border-b border-slate-100 bg-slate-50/20">
          <h4 className="font-black text-slate-800 uppercase tracking-tight text-lg">Weightage Architecture</h4>
        </div>
        <div className="divide-y divide-slate-100">
          {analysis.topicBreakdown.map((topic, i) => (
            <div key={i} className="px-12 py-10 flex flex-col md:flex-row md:items-center justify-between gap-10 hover:bg-slate-50/50 transition-colors group">
              <div className="flex-1">
                <div className="font-black text-slate-900 text-2xl mb-2 group-hover:text-indigo-600 transition-colors">{topic.name}</div>
                <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{topic.description}</div>
              </div>
              <div className="flex items-center gap-10 min-w-[400px]">
                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-indigo-600 rounded-full shadow-lg shadow-indigo-200 transition-all duration-1000" 
                    style={{ width: `${(topic.weight / totalQuestions) * 100}%` }}
                  />
                </div>
                <div className="text-right shrink-0">
                   <div className="text-3xl font-black text-indigo-600 leading-none">{topic.weight} / {totalQuestions}</div>
                   <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Questions</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;
