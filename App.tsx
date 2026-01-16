
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import AnalysisPage from './pages/AnalysisPage';
import StudyPlanPage from './pages/StudyPlanPage';
import AuthPage from './pages/AuthPage';
import { db } from './services/store';
import { User, UploadedDocument } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(db.auth.getCurrentUser());

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    setActiveTab('dashboard');
  };

  if (!user) {
    return <AuthPage onAuthSuccess={handleLogin} />;
  }

  const handleDocAnalysis = (doc: UploadedDocument) => {
    setSelectedDocId(doc.id);
    setActiveTab('analysis');
  };

  const handleUploadSuccess = (docId: string) => {
    setSelectedDocId(docId);
    setActiveTab('analysis');
  };

  const handleGeneratePlan = () => {
    setActiveTab('plans');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onAnalyze={handleDocAnalysis} />;
      case 'upload':
        return <UploadPage onSuccess={handleUploadSuccess} />;
      case 'analysis':
        return selectedDocId ? (
          <AnalysisPage 
            docId={selectedDocId} 
            onGeneratePlan={handleGeneratePlan} 
          />
        ) : (
          <Dashboard onAnalyze={handleDocAnalysis} />
        );
      case 'plans':
        return <StudyPlanPage initialDocId={selectedDocId || undefined} />;
      default:
        return <Dashboard onAnalyze={handleDocAnalysis} />;
    }
  };

  const handleNavigate = (tab: string) => {
    if (tab !== 'analysis' && tab !== 'plans') {
      setSelectedDocId(null);
    }
    setActiveTab(tab);
  };

  return (
    <Layout activeTab={activeTab} onNavigate={handleNavigate}>
      {renderContent()}
    </Layout>
  );
};

export default App;
