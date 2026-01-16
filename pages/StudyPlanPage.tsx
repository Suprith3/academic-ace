
import React, { useState, useRef, useEffect } from 'react';
import { db } from '../services/store';
import { generateStudyPlan, refineStudyPlan } from '../services/gemini';
import { StudyPlan, StudyDay, Topic } from '../types';

interface StudyPlanPageProps {
  initialDocId?: string;
}

const StudyPlanPage: React.FC<StudyPlanPageProps> = ({ initialDocId }) => {
  const [step, setStep] = useState<'form' | 'loading' | 'view'>(initialDocId ? 'form' : 'view');
  const [days, setDays] = useState(7);
  const [knowledge, setKnowledge] = useState('Beginner');
  const [difficulty, setDifficulty] = useState('Standard');
  const [currentPlan, setCurrentPlan] = useState<StudyPlan | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = db.auth.getCurrentUser();
  const doc = initialDocId ? db.documents.findById(initialDocId) : null;
  const analysis = initialDocId ? db.analysis.findByDoc(initialDocId || '') : null;

  useEffect(() => {
    if (!initialDocId) {
      const plans = db.plans.findByUser(user?.id || '');
      if (plans.length > 0) {
        setCurrentPlan(plans[plans.length - 1]);
        setStep('view');
      }
    }
  }, [initialDocId, user?.id]);

  const handleGenerate = async () => {
    if (!analysis) {
      setError("Archive analysis not found. Start from dashboard.");
      return;
    }
    setStep('loading');
    setError(null);
    try {
      // Pass note filename contexts if they exist in solutions or store
      const notesContext = analysis.solutions ? "Reference documents were provided in the solving lab." : undefined;
      
      const planData = await generateStudyPlan(
        analysis.topicBreakdown,
        days,
        knowledge,
        difficulty,
        notesContext
      );
      
      const savedPlan = db.plans.create({
        userId: user?.id || '',
        inputs: { difficulty, knowledgeLevel: knowledge, daysLeft: days },
        generatedPlan: planData
      });
      
      setCurrentPlan(savedPlan);
      setStep('view');
    } catch (err: any) {
      console.error("Study plan generation error:", err);
      setError(`AI Generation failed: ${err?.message || 'Unknown error'}`);
      setStep('form');
    }
  };

  const handleRefine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !currentPlan) return;
    setIsRefining(true);
    const prompt = chatInput;
    setChatInput('');
    try {
      const updatedDays = await refineStudyPlan(currentPlan.generatedPlan, prompt);
      const updatedPlan = db.plans.update(currentPlan.id, { generatedPlan: updatedDays });
      if (updatedPlan) setCurrentPlan(updatedPlan);
    } catch (err) { console.error(err); } 
    finally { setIsRefining(false); }
  };

  if (step === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-10">
        <div className="relative">
          <div className="w-32 h-32 border-[12px] border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-5xl">⚡</div>
        </div>
        <div className="text-center">
          <h4 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Constructing Blueprint</h4>
          <p className="text-slate-400 font-bold uppercase tracking-widest mt-2">Mapping sessions to exam patterns...</p>
        </div>
      </div>
    );
  }

  if (step === 'form') {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <div className="bg-white p-16 rounded-[4rem] border border-slate-200 shadow-2xl space-y-12">
          <div className="text-center">
            <h3 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">Timeline Engine</h3>
            <p className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em]">Configure your study parameters</p>
          </div>

          <div className="space-y-10">
            <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Available Days</label>
                <span className="text-2xl font-black text-indigo-600">{days}</span>
              </div>
              <input 
                type="range" min="1" max="45" value={days} 
                onChange={(e) => setDays(parseInt(e.target.value))}
                className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] font-black text-slate-300 mt-4 uppercase">
                <span>1 Day</span>
                <span>45 Days</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Competency</label>
                <div className="flex flex-col gap-2">
                  {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => setKnowledge(lvl)}
                      className={`py-4 px-6 text-xs font-black rounded-2xl border transition-all text-left flex justify-between items-center ${
                        knowledge === lvl ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl' : 'bg-white text-slate-400 border-slate-200'
                      }`}
                    >
                      {lvl}
                      {knowledge === lvl && <span>✓</span>}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Prep Intensity</label>
                <div className="flex flex-col gap-2">
                  {['Light', 'Standard', 'Intensive'].map(diff => (
                    <button
                      key={diff}
                      onClick={() => setDifficulty(diff)}
                      className={`py-4 px-6 text-xs font-black rounded-2xl border transition-all text-left flex justify-between items-center ${
                        difficulty === diff ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl' : 'bg-white text-slate-400 border-slate-200'
                      }`}
                    >
                      {diff}
                      {difficulty === diff && <span>⚡</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && <div className="p-5 bg-red-50 text-red-600 text-xs font-black rounded-2xl border border-red-100 uppercase tracking-widest">{error}</div>}

            <button
              onClick={handleGenerate}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-3xl font-black text-lg shadow-2xl shadow-indigo-100 transition-all active:scale-[0.98] uppercase tracking-[0.2em]"
            >
              Generate Protocol
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 min-h-[calc(100vh-250px)]">
      {/* Schedule Feed - Maximum Width for Big Window */}
      <div className="lg:col-span-9 space-y-12">
        <div className="flex justify-between items-center bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm sticky top-0 z-10">
          <div>
            <h3 className="font-black text-slate-900 uppercase tracking-tight text-3xl">Study Timeline</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-2">Personalized Citations Enabled</p>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-[10px] text-slate-300 font-black uppercase">v1.4 Dynamic</span>
            {initialDocId && (
              <button 
                onClick={() => setStep('form')}
                className="px-6 py-3 border-2 border-slate-100 text-slate-400 rounded-2xl text-[10px] font-black hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all uppercase tracking-widest"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="space-y-10 pb-32">
          {currentPlan?.generatedPlan.map((day: StudyDay) => (
            <div key={day.day} className="bg-white rounded-[3.5rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-2xl hover:border-indigo-200 transition-all duration-500 group">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-40 bg-slate-50 group-hover:bg-indigo-600 flex items-center justify-center transition-all duration-500 border-r border-slate-100">
                  <div className="text-center p-8">
                    <div className="text-[10px] text-slate-400 group-hover:text-indigo-200 uppercase font-black tracking-[0.2em]">Sequence</div>
                    <div className="text-6xl font-black text-slate-900 group-hover:text-white leading-none mt-2">{day.day}</div>
                  </div>
                </div>
                <div className="flex-1 p-12">
                  <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                      <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg uppercase tracking-[0.2em]">{day.focusArea}</span>
                      <h4 className="font-black text-slate-900 text-3xl mt-4 tracking-tight">{day.topics.join(' & ')}</h4>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {day.tasks.map((task, idx) => (
                      <div key={idx} className="flex items-start gap-6 text-sm font-bold text-slate-600 bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-xl transition-all group/task relative overflow-hidden">
                        <input type="checkbox" className="mt-1 w-6 h-6 rounded-xl text-indigo-600 border-slate-300 focus:ring-indigo-600 cursor-pointer shadow-sm" />
                        <div className="space-y-3 flex-1">
                           <span className="block leading-[1.6] text-lg text-slate-800 font-black">{task.split('Ref:')[0]}</span>
                           {task.includes('Ref:') && (
                             <div className="bg-indigo-50 text-indigo-600 p-4 rounded-2xl border border-indigo-100 inline-block">
                                <span className="text-[10px] font-black uppercase tracking-widest block mb-1">Citation Marker</span>
                                <span className="text-xs font-bold">{task.substring(task.indexOf('Ref:'))}</span>
                             </div>
                           )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Refinement Sidebar */}
      <div className="lg:col-span-3 flex flex-col bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden h-fit sticky top-10">
        <div className="p-10 bg-indigo-600">
          <h4 className="font-black text-white text-lg uppercase tracking-tight">AI Assistant</h4>
          <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-widest mt-1">Real-time Refinement</p>
        </div>
        
        <div className="p-10 space-y-8 overflow-auto max-h-[400px]">
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-[2rem] rounded-tl-none font-bold text-slate-500 text-sm leading-relaxed italic shadow-inner">
            "I've calculated your schedule based on the paper patterns. Need more time for a specific topic or a weekend break?"
          </div>
          {isRefining && (
            <div className="flex gap-2 items-center px-4">
              <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-bounce"></div>
              <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            </div>
          )}
        </div>

        <form onSubmit={handleRefine} className="p-10 border-t border-slate-100 bg-white">
          <div className="relative">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Suggest adjustments..."
              className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-5 text-sm font-black focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white focus:border-indigo-600 transition-all pr-16"
              disabled={isRefining}
            />
            <button 
              type="submit"
              className="absolute right-3 top-3 p-3 bg-indigo-600 text-white rounded-xl shadow-xl shadow-indigo-100 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              disabled={isRefining}
            >
              ➔
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudyPlanPage;
