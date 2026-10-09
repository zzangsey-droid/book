import React, { useState, useEffect, useCallback } from 'react';
import { Seat, Reservation } from './types';
import { fetchSeats } from './services/api';
import { Header } from './components/Header';
import { SeatMap } from './components/SeatMap';
import { ReservationModal } from './components/ReservationModal';
import { TicketModal } from './components/TicketModal';
import { MyReservations } from './components/MyReservations';
import { LibraryGuide } from './components/LibraryGuide';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { StandaloneExportModal } from './components/StandaloneExportModal';
import { GasScriptModal } from './components/GasScriptModal';
import { Check, AlertCircle, Info, Grid, BookmarkCheck, HelpCircle, Code } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'map' | 'myReservations' | 'guide'>('map');
  const [seats, setSeats] = useState<Seat[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiSource, setApiSource] = useState<'gas' | 'local_fallback'>('gas');

  // Modals state
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [ticketReservation, setTicketReservation] = useState<Reservation | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isGasCodeOpen, setIsGasCodeOpen] = useState<boolean>(false);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    const timer = setTimeout(() => {
      setToast(null);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  // Fetch seats data
  const loadSeatsData = useCallback(async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    try {
      const result = await fetchSeats();
      setSeats(result.data);
      setApiSource(result.source);
    } catch (err: any) {
      console.error('Failed to load seats:', err);
      showToast('좌석 정보 동기화 중 오류가 발생했습니다.', 'error');
    } finally {
      if (!quiet) setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadSeatsData();

    // Auto-refresh every 45 seconds for live status
    const interval = setInterval(() => {
      loadSeatsData(true);
    }, 45000);

    return () => clearInterval(interval);
  }, [loadSeatsData]);

  const handleSeatSelect = (seat: Seat) => {
    setSelectedSeat(seat);
  };

  const handleReservationSuccess = (reservation: Reservation, msg: string) => {
    setSelectedSeat(null);
    setTicketReservation(reservation);
    showToast(msg || '좌석 예약이 완료되었습니다.', 'success');
    loadSeatsData(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased text-slate-800 pb-20 md:pb-8">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onRefresh={() => {
          loadSeatsData();
          showToast('좌석 정보를 새로고침했습니다.', 'info');
        }}
        isLoading={isLoading}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenGasCode={() => setIsGasCodeOpen(true)}
        apiSource={apiSource}
      />

      {/* Main View Area */}
      <main className="max-w-6xl mx-auto w-full px-4 py-4 sm:py-6 flex-1">
        {currentTab === 'map' && (
          <SeatMap
            seats={seats}
            onSelectSeat={handleSeatSelect}
            isLoading={isLoading}
          />
        )}

        {currentTab === 'myReservations' && (
          <MyReservations
            seats={seats}
            onSeatUpdated={() => loadSeatsData(true)}
            onToast={showToast}
          />
        )}

        {currentTab === 'guide' && <LibraryGuide />}
      </main>

      {/* Floating Bottom Nav for Mobile Screens */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setCurrentTab('map')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[11px] font-semibold transition-colors ${
            currentTab === 'map' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Grid className="w-5 h-5 mb-0.5" />
          <span>좌석배치도</span>
        </button>

        <button
          onClick={() => setCurrentTab('myReservations')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[11px] font-semibold transition-colors ${
            currentTab === 'myReservations' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <BookmarkCheck className="w-5 h-5 mb-0.5" />
          <span>내 예약</span>
        </button>

        <button
          onClick={() => setIsExportOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
        >
          <Code className="w-5 h-5 mb-0.5 text-emerald-600" />
          <span>HTML 복사</span>
        </button>

        <button
          onClick={() => setCurrentTab('guide')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[11px] font-semibold transition-colors ${
            currentTab === 'guide' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <HelpCircle className="w-5 h-5 mb-0.5" />
          <span>이용규정</span>
        </button>
      </nav>

      {/* Modals */}
      <ReservationModal
        seat={selectedSeat}
        onClose={() => setSelectedSeat(null)}
        onSuccess={handleReservationSuccess}
      />

      <TicketModal
        reservation={ticketReservation}
        onClose={() => setTicketReservation(null)}
        onGoToMyReservations={() => {
          setTicketReservation(null);
          setCurrentTab('myReservations');
        }}
      />

      <StandaloneExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      <ApiSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onRefreshData={() => loadSeatsData(false)}
        onToast={showToast}
      />

      <GasScriptModal
        isOpen={isGasCodeOpen}
        onClose={() => setIsGasCodeOpen(false)}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-16 md:bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div
            className={`px-4 py-2.5 rounded-full text-xs font-medium shadow-xl flex items-center space-x-2 text-white ${
              toast.type === 'error'
                ? 'bg-rose-600'
                : toast.type === 'info'
                ? 'bg-slate-800'
                : 'bg-emerald-700'
            }`}
          >
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 shrink-0" />}
            {toast.type === 'success' && <Check className="w-4 h-4 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
