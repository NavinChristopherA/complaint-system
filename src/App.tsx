import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { EmergencyContactsModal } from './components/common/EmergencyContactsModal';
import { CitizenHome } from './components/citizen/CitizenHome';
import { GrievanceWizard } from './components/citizen/GrievanceWizard';
import { TicketTracker } from './components/citizen/TicketTracker';
import { WardOverview } from './components/citizen/WardOverview';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { getTickets, resetToDemoData } from './services/storageService';
import { GrievanceTicket } from './types/grievance';
import { UserPersona, PRESET_PERSONAS } from './types/user';
import { Language, TRANSLATIONS } from './utils/translations';
import { 
  Home, 
  FileEdit, 
  Search, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export function App() {
  const [viewMode, setViewMode] = useState<'citizen' | 'admin'>('citizen');
  const [citizenTab, setCitizenTab] = useState<'home' | 'wizard' | 'tracker' | 'wards'>('home');
  const [trackedTicketId, setTrackedTicketId] = useState<string>('POL-2026-W14-0101');
  const [activePersona, setActivePersona] = useState<UserPersona>(PRESET_PERSONAS[0]);
  const [language, setLanguage] = useState<Language>('en');
  const [tickets, setTickets] = useState<GrievanceTicket[]>([]);

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  const addToast = (title: string, message: string, type: ToastMessage['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newToast: ToastMessage = { id, title, message, type };
    setToasts(prev => [...prev.slice(-3), newToast]); // Keep max 4 toasts

    // Auto dismiss after 4.5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const handleDismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Load tickets on mount
  useEffect(() => {
    setTickets(getTickets());
    addToast(
      'Namma Pollachi Portal Active',
      'AI Smart Triage, 36-Ward Map, and CivicOps Command Center loaded.',
      'success'
    );
  }, []);

  const t = TRANSLATIONS[language];

  const handleResetDemo = () => {
    if (window.confirm('Reset all Pollachi grievance data to default demonstration cases?')) {
      const resetList = resetToDemoData();
      setTickets(resetList);
      setCitizenTab('home');
      addToast('Demo Data Reset', 'Restored 5 realistic Pollachi municipal cases with SLA timers.', 'info');
    }
  };

  const handleTicketCreated = (newTicket: GrievanceTicket) => {
    setTickets(getTickets());
    setTrackedTicketId(newTicket.id);
  };

  const handleTrackTicket = (ticketId: string) => {
    setTrackedTicketId(ticketId);
    setCitizenTab('tracker');
    setViewMode('citizen');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Universal Top Header */}
      <Header
        viewMode={viewMode}
        setViewMode={setViewMode}
        activePersona={activePersona}
        setActivePersona={setActivePersona}
        language={language}
        setLanguage={setLanguage}
        onResetDemo={handleResetDemo}
        onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
      />

      {/* Citizen Navigation Strip (Only active in Citizen mode) */}
      {viewMode === 'citizen' && (
        <div style={{ background: 'white', borderBottom: '1px solid var(--slate-200)', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
          <div className="container" style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', padding: '0.5rem 1.5rem' }}>
            <button
              onClick={() => setCitizenTab('home')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.95rem',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: citizenTab === 'home' ? 'var(--primary-50)' : 'transparent',
                color: citizenTab === 'home' ? 'var(--primary-800)' : 'var(--slate-600)',
                fontWeight: citizenTab === 'home' ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <Home size={16} />
              {language === 'ta' ? 'முகப்பு' : 'Home'}
            </button>

            <button
              onClick={() => setCitizenTab('wizard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.95rem',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: citizenTab === 'wizard' ? 'var(--primary-50)' : 'transparent',
                color: citizenTab === 'wizard' ? 'var(--primary-800)' : 'var(--slate-600)',
                fontWeight: citizenTab === 'wizard' ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <FileEdit size={16} />
              {t.navRegister}
            </button>

            <button
              onClick={() => setCitizenTab('tracker')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.95rem',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: citizenTab === 'tracker' ? 'var(--primary-50)' : 'transparent',
                color: citizenTab === 'tracker' ? 'var(--primary-800)' : 'var(--slate-600)',
                fontWeight: citizenTab === 'tracker' ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <Search size={16} />
              {t.navTrack}
            </button>

            <button
              onClick={() => setCitizenTab('wards')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.95rem',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: citizenTab === 'wards' ? 'var(--primary-50)' : 'transparent',
                color: citizenTab === 'wards' ? 'var(--primary-800)' : 'var(--slate-600)',
                fontWeight: citizenTab === 'wards' ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <MapPin size={16} />
              {t.navWards}
            </button>
          </div>
        </div>
      )}

      {/* Main View Area */}
      <main style={{ flex: 1, paddingBottom: '3rem' }}>
        {viewMode === 'citizen' ? (
          <>
            {citizenTab === 'home' && (
              <ErrorBoundary fallbackTitle="Citizen Home — Display Error">
                <CitizenHome
                  language={language}
                  onNavigate={(tab) => setCitizenTab(tab)}
                />
              </ErrorBoundary>
            )}

            {citizenTab === 'wizard' && (
              <ErrorBoundary fallbackTitle="Grievance Registration — Processing Error">
                <GrievanceWizard
                  language={language}
                  onTicketCreated={handleTicketCreated}
                  onTrackTicket={handleTrackTicket}
                  onShowToast={addToast}
                />
              </ErrorBoundary>
            )}

            {citizenTab === 'tracker' && (
              <ErrorBoundary fallbackTitle="Ticket Tracker — Loading Error">
                <TicketTracker
                  initialTicketId={trackedTicketId}
                  language={language}
                  onShowToast={addToast}
                />
              </ErrorBoundary>
            )}

            {citizenTab === 'wards' && (
              <ErrorBoundary fallbackTitle="Ward Overview — Rendering Error">
                <WardOverview
                  language={language}
                />
              </ErrorBoundary>
            )}
          </>
        ) : (
          <ErrorBoundary fallbackTitle="Admin Command Center — Critical Error">
            <AdminDashboard
              tickets={tickets}
              onTicketsUpdated={(updated) => setTickets(updated)}
              activePersona={activePersona}
              language={language}
              onShowToast={addToast}
            />
          </ErrorBoundary>
        )}
      </main>

      {/* Official Corporation Footer */}
      <Footer language={language} />

      {/* Emergency Modal */}
      {isEmergencyModalOpen && (
        <EmergencyContactsModal
          isOpen={isEmergencyModalOpen}
          onClose={() => setIsEmergencyModalOpen(false)}
          language={language}
        />
      )}

      {/* Real-Time Floating Toasts */}
      <ToastContainer
        toasts={toasts}
        onDismiss={handleDismissToast}
      />
    </div>
  );
}

export default App;
