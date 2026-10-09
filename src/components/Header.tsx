import React from 'react';
import { BookOpen, RefreshCw, Settings, Code, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  currentTab: 'map' | 'myReservations' | 'guide';
  onTabChange: (tab: 'map' | 'myReservations' | 'guide') => void;
  onRefresh: () => void;
  isLoading: boolean;
  onOpenSettings: () => void;
  onOpenExport: () => void;
  onOpenGasCode: () => void;
  apiSource: 'gas' | 'local_fallback';
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  onRefresh,
  isLoading,
  onOpenSettings,
  onOpenExport,
  onOpenGasCode,
  apiSource,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Brand Bar */}
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight whitespace-nowrap">
                도서관 좌석 예약 시스템
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                시트1·2·3 실시간 연동
              </span>
              <span
                className={`hidden sm:inline text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
                  apiSource === 'gas'
                    ? 'bg-slate-100 text-slate-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {apiSource === 'gas' ? 'GAS 연결' : '캐시 동기화'}
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              A열(seat_id) · B열(room_name) · C열(seat_number) · D열(status: 사용가능/사용중)
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Refresh */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 sm:px-3 sm:py-2 text-xs font-medium text-slate-700 hover:text-emerald-700 bg-slate-50 hover:bg-emerald-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            title="좌석 정보 새로고침"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            <span className="hidden sm:inline">새로고침</span>
          </button>

          {/* Standalone HTML Copy */}
          <button
            onClick={onOpenExport}
            className="p-2 sm:px-3 sm:py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1.5"
            title="단일 index.html 소스코드 보기 / 복사"
          >
            <Code className="w-3.5 h-3.5" />
            <span className="hidden md:inline">단일 HTML 복사</span>
          </button>

          {/* Apps Script Guide */}
          <button
            onClick={onOpenGasCode}
            className="p-2 sm:px-2.5 sm:py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1"
            title="Google Apps Script(Code.gs) 코드 보기"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden lg:inline">GAS 백엔드 코드</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 sm:px-2.5 sm:py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center"
            title="API URL 설정"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-6xl mx-auto px-4 flex border-t border-slate-100">
        <button
          onClick={() => onTabChange('map')}
          className={`flex-1 py-2.5 sm:py-3 text-center text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            currentTab === 'map'
              ? 'border-emerald-600 text-emerald-600 bg-emerald-50/20'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          좌석 배치도 (예약하기)
        </button>
        <button
          onClick={() => onTabChange('myReservations')}
          className={`flex-1 py-2.5 sm:py-3 text-center text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            currentTab === 'myReservations'
              ? 'border-emerald-600 text-emerald-600 bg-emerald-50/20'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          내 예약 확인 / 취소
        </button>
        <button
          onClick={() => onTabChange('guide')}
          className={`flex-1 py-2.5 sm:py-3 text-center text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            currentTab === 'guide'
              ? 'border-emerald-600 text-emerald-600 bg-emerald-50/20'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          도서관 이용 규정
        </button>
      </div>
    </header>
  );
};
