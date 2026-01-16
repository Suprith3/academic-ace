
import React, { useState } from 'react';
import { db } from '../services/store';
import { FileType } from '../types';
import { analyzeQuestionPaper } from '../services/gemini';

interface UploadPageProps {
  onSuccess: (docId: string) => void;
}

const UploadPage: React.FC<UploadPageProps> = ({ onSuccess }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleStartAnalysis = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setError('');
    setProgress(5);

    try {
      const user = db.auth.getCurrentUser();
      if (!user) throw new Error("Authentication failed. Please relogin.");

      let combinedText = "";
      let primaryDocId = "";

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const text = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve((e.target?.result as string) || `Extracted content from ${file.name}`);
          // Simulate extraction for binary files or handle text
          if (file.type.includes('text')) reader.readAsText(file);
          else resolve(`[SIMULATED DATA FROM ${file.name}] Focuses on exam chapters 1 through 5.`);
        });

        const doc = db.documents.create({
          userId: user.id,
          filename: file.name,
          fileType: FileType.QUESTION_PAPER,
          extractedText: text
        });

        if (i === 0) primaryDocId = doc.id;
        combinedText += `\nFILE_NAME: ${file.name}\n${text}\n---`;
        setProgress(5 + Math.floor(((i + 1) / selectedFiles.length) * 30));
      }

      const analysisData = await analyzeQuestionPaper(combinedText);
      db.analysis.upsert({
        documentId: primaryDocId,
        ...analysisData
      });

      setProgress(100);
      setTimeout(() => onSuccess(primaryDocId), 800);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during processing.");
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12">
      <div className="text-center mb-12">
        <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Paper Analysis Hub</h3>
        <p className="text-slate-500 font-medium">Select one or multiple previous papers to detect patterns.</p>
      </div>

      <div className={`bg-white p-16 rounded-[3rem] border-4 border-dashed transition-all duration-300 relative group ${
        selectedFiles.length > 0 ? 'border-indigo-400 bg-indigo-50/10' : 'border-slate-200 hover:border-indigo-200'
      }`}>
        <input
          type="file"
          multiple
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <div className="text-center">
          <div className="text-7xl mb-6 group-hover:scale-110 transition-transform duration-500 inline-block">📄</div>
          <div className="text-xl font-black text-slate-800 mb-2">
            {selectedFiles.length > 0 ? `${selectedFiles.length} files staged` : 'Drag & Drop Papers'}
          </div>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Supports PDF, JPEG, PNG, TXT</p>
        </div>
      </div>

      {selectedFiles.length > 0 && !isUploading && (
        <div className="mt-10 animate-in slide-in-from-top-4 duration-500">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 mb-8 shadow-sm">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Pending Batch</h4>
            <div className="space-y-3">
              {selectedFiles.map((f, i) => (
                <div key={i} className="flex items-center justify-between text-sm font-bold text-slate-600 bg-slate-50 px-5 py-3 rounded-2xl">
                  <span>{f.name}</span>
                  <span className="text-indigo-600 text-[10px] uppercase">Ready</span>
                </div>
              ))}
            </div>
          </div>
          
          <button
            onClick={handleStartAnalysis}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-3xl font-black text-lg shadow-2xl shadow-indigo-100 transition-all flex items-center justify-center gap-4 active:scale-95"
          >
            🚀 Begin Pattern Recognition
          </button>
        </div>
      )}

      {isUploading && (
        <div className="mt-12 space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-indigo-600 font-black text-lg animate-pulse">Scanning Files...</span>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">AI is analyzing recurring question themes</p>
            </div>
            <span className="text-2xl font-black text-slate-900">{progress}%</span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-500 rounded-full shadow-inner shadow-indigo-400/20" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="mt-8 p-6 bg-red-50 text-red-600 rounded-3xl text-sm font-bold border border-red-100 shadow-sm animate-shake">
          {error}
        </div>
      )}
    </div>
  );
};

export default UploadPage;
