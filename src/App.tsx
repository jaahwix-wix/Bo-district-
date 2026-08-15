import React, { useState, useEffect } from 'react';
import { TabType, ServiceReport, DevelopmentProject, Announcement, Citizen, PaymentReceipt, BusinessLicence, BuildingPermit, CouncilEvent, ChiefdomInfo } from './types';
import { CHIEFDOMS_DATA } from './data/chiefdoms';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CivicReport } from './components/CivicReport';
import { ChiefdomDirectory } from './components/ChiefdomDirectory';
import { RateCalculator } from './components/RateCalculator';
import { DevTracker } from './components/DevTracker';
import { NoticesAndBylaws } from './components/NoticesAndBylaws';
import { CivicAssistant } from './components/CivicAssistant';
import { AdminPortal } from './components/AdminPortal';
import { CitizenManagement } from './components/CitizenManagement';
import { RevenueAndReceipts } from './components/RevenueAndReceipts';
import { LicencesAndPermits } from './components/LicencesAndPermits';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { LoginScreen } from './components/LoginScreen';
import { MobileBottomNav } from './components/MobileBottomNav';
import { auth } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Auth States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'citizen' | 'officer' | 'admin'>('citizen');
  const [userChiefdom, setUserChiefdom] = useState<string>('Kakua');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);

  // Core Data States
  const [reports, setReports] = useState<ServiceReport[]>([]);
  const [projects, setProjects] = useState<DevelopmentProject[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<CouncilEvent[]>([]);
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [licences, setLicences] = useState<BusinessLicence[]>([]);
  const [permits, setPermits] = useState<BuildingPermit[]>([]);
  const [chiefdoms, setChiefdoms] = useState<ChiefdomInfo[]>(CHIEFDOMS_DATA);
  const [loading, setLoading] = useState(true);

  // Cross-component interaction parameters
  const [selectedReportSearchId, setSelectedReportSearchId] = useState<string>('');

  // Firebase Auth Observer & Sync with PostgreSQL
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const token = await user.getIdToken();
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setUserRole(data.role || 'citizen');
            setUserChiefdom(data.chiefdom || 'Kakua');
            if (data.role === 'admin' || data.role === 'officer') {
              setIsAdmin(true);
            }
          }
        } catch (err) {
          console.error('Failed to sync user with PostgreSQL:', err);
        }
      } else {
        setUserRole('citizen');
      }
      setAuthChecking(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch Initial Data
  useEffect(() => {
    async function fetchJsonSafe(url: string) {
      try {
        const res = await fetch(url);
        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          return await res.json();
        }
      } catch (err) {
        console.warn(`Safe fetch warning for ${url}:`, err);
      }
      return null;
    }

    async function loadInitialData() {
      try {
        const [repData, projData, annData, evtData, citData, recData, licData, perData, chfData] = await Promise.all([
          fetchJsonSafe('/api/reports'),
          fetchJsonSafe('/api/projects'),
          fetchJsonSafe('/api/announcements'),
          fetchJsonSafe('/api/events'),
          fetchJsonSafe('/api/citizens'),
          fetchJsonSafe('/api/receipts'),
          fetchJsonSafe('/api/licences'),
          fetchJsonSafe('/api/permits'),
          fetchJsonSafe('/api/chiefdoms')
        ]);

        if (Array.isArray(repData)) setReports(repData);
        if (Array.isArray(projData)) setProjects(projData);
        if (Array.isArray(annData)) setAnnouncements(annData);
        if (Array.isArray(evtData)) setEvents(evtData);
        if (Array.isArray(citData)) setCitizens(citData);
        if (Array.isArray(recData)) setReceipts(recData);
        if (Array.isArray(licData)) setLicences(licData);
        if (Array.isArray(perData)) setPermits(perData);
        if (Array.isArray(chfData) && chfData.length > 0) setChiefdoms(chfData);
      } catch (err) {
        console.error('Error in loadInitialData:', err);
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, []);

  const handleNewReport = (newReport: ServiceReport) => {
    setReports((prev) => [newReport, ...prev]);
  };

  const handleUpdateReportStatus = async (reportId: string, status: ServiceReport['status'], officialNote: string) => {
    try {
      let headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (currentUser) {
        const token = await currentUser.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status, officialNote })
      });

      if (res.ok) {
        const updated = await res.json();
        setReports((prev) => prev.map((r) => (r.id === reportId ? updated : r)));
      }
    } catch (err) {
      console.error('Failed to patch report:', err);
    }
  };

  const handleAddProject = async (newProject: DevelopmentProject) => {
    setProjects((prev) => [newProject, ...prev]);
  };

  const handleAddAnnouncement = async (newAnnouncement: Announcement) => {
    setAnnouncements((prev) => [newAnnouncement, ...prev]);
  };

  const handleAddCitizen = (newCitizen: Citizen) => {
    setCitizens((prev) => [newCitizen, ...prev]);
  };

  const handleAddReceipt = (newReceipt: PaymentReceipt) => {
    setReceipts((prev) => [newReceipt, ...prev]);
  };

  const handleAddLicence = (newLicence: BusinessLicence) => {
    setLicences((prev) => [newLicence, ...prev]);
  };

  const handleUpdateLicence = (updatedLicence: BusinessLicence) => {
    setLicences((prev) => prev.map((l) => (l.id === updatedLicence.id ? updatedLicence : l)));
  };

  const handleDeleteLicence = (licenceId: string) => {
    setLicences((prev) => prev.filter((l) => l.id !== licenceId));
  };

  const handleAddPermit = (newPermit: BuildingPermit) => {
    setPermits((prev) => [newPermit, ...prev]);
  };

  const handleUpdatePermit = (updatedPermit: BuildingPermit) => {
    setPermits((prev) => prev.map((p) => (p.id === updatedPermit.id ? updatedPermit : p)));
  };

  const handleDeletePermit = (permitId: string) => {
    setPermits((prev) => prev.filter((p) => p.id !== permitId));
  };

  const handleAddChiefdom = (newChiefdom: ChiefdomInfo) => {
    setChiefdoms((prev) => [newChiefdom, ...prev]);
  };

  const handleUpdateChiefdom = (updatedChiefdom: ChiefdomInfo) => {
    setChiefdoms((prev) => prev.map((c) => (c.id === updatedChiefdom.id ? updatedChiefdom : c)));
  };

  const handleDeleteChiefdom = (chiefdomId: string) => {
    setChiefdoms((prev) => prev.filter((c) => c.id !== chiefdomId));
  };

  const handleAddEvent = (newEvent: CouncilEvent) => {
    setEvents((prev) => [newEvent, ...prev]);
  };

  const handleEditEvent = (updatedEvent: CouncilEvent) => {
    setEvents((prev) => prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)));
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-emerald-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4" />
        <h3 className="font-extrabold text-base text-amber-300">Bo District Council Portal</h3>
        <p className="text-xs text-emerald-200 mt-1">Verifying security credentials & session...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={(user, role) => {
          setCurrentUser(user);
          setUserRole(role);
          if (role === 'admin' || role === 'officer') {
            setIsAdmin(true);
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans flex flex-col antialiased selection:bg-amber-400 selection:text-emerald-950">
      {/* Fixed Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        currentUser={currentUser}
        userRole={userRole}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={currentUser}
        userRole={userRole}
        userChiefdom={userChiefdom}
        onRoleChanged={(newRole) => {
          setUserRole(newRole);
          if (newRole === 'admin' || newRole === 'officer') {
            setIsAdmin(true);
          }
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 md:py-8 space-y-8 pb-24 lg:pb-8">
        {loading ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3 my-8 shadow-sm">
            <div className="w-8 h-8 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-bold text-slate-700">Connecting to Bo District Council Digital Gateway...</p>
            <p className="text-xs text-slate-400">Loading Cloud SQL records, service queue & project budgets</p>
          </div>
        ) : (
          <>
            {activeTab === 'home' && (
              <HeroBanner
                setActiveTab={setActiveTab}
                reports={reports}
                announcements={announcements}
                onSearchReport={(id) => {
                  setSelectedReportSearchId(id);
                  setActiveTab('report');
                }}
              />
            )}

            {activeTab === 'citizens' && (
              <CitizenManagement
                citizens={citizens}
                onAddCitizen={handleAddCitizen}
              />
            )}

            {activeTab === 'revenue' && (
              <RevenueAndReceipts
                receipts={receipts}
                onAddReceipt={handleAddReceipt}
              />
            )}

            {activeTab === 'licences' && (
              <LicencesAndPermits
                licences={licences}
                permits={permits}
                chiefdoms={chiefdoms}
                onAddLicence={handleAddLicence}
                onUpdateLicence={handleUpdateLicence}
                onDeleteLicence={handleDeleteLicence}
                onAddPermit={handleAddPermit}
                onUpdatePermit={handleUpdatePermit}
                onDeletePermit={handleDeletePermit}
              />
            )}

            {activeTab === 'report' && (
              <CivicReport
                reports={reports}
                onNewReport={handleNewReport}
                selectedReportId={selectedReportSearchId}
              />
            )}

            {activeTab === 'chiefdoms' && (
              <ChiefdomDirectory
                chiefdoms={chiefdoms}
                setActiveTab={setActiveTab}
                onAddChiefdom={handleAddChiefdom}
                onUpdateChiefdom={handleUpdateChiefdom}
                onDeleteChiefdom={handleDeleteChiefdom}
              />
            )}

            {activeTab === 'tax' && (
              <RateCalculator />
            )}

            {activeTab === 'projects' && (
              <DevTracker
                projects={projects}
              />
            )}

            {activeTab === 'notices' && (
              <NoticesAndBylaws
                announcements={announcements}
                events={events}
                onAddEvent={handleAddEvent}
                onEditEvent={handleEditEvent}
                onDeleteEvent={handleDeleteEvent}
              />
            )}

            {activeTab === 'assistant' && (
              <CivicAssistant
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'admin' && (
              <AdminPortal
                reports={reports}
                projects={projects}
                announcements={announcements}
                events={events}
                onUpdateReportStatus={handleUpdateReportStatus}
                onAddProject={handleAddProject}
                onAddAnnouncement={handleAddAnnouncement}
                onAddEvent={handleAddEvent}
                onEditEvent={handleEditEvent}
                onDeleteEvent={handleDeleteEvent}
              />
            )}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Footer */}
      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}
