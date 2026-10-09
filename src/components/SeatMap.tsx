import React, { useState, useMemo } from 'react';
import { Seat } from '../types';
import { Zap, Sun, CheckCircle2, XCircle, Search, Filter } from 'lucide-react';

interface SeatMapProps {
  seats: Seat[];
  onSelectSeat: (seat: Seat) => void;
  isLoading: boolean;
}

export const SeatMap: React.FC<SeatMapProps> = ({ seats, onSelectSeat, isLoading }) => {
  const [selectedRoom, setSelectedRoom] = useState<string>('전체');
  const [filterType, setFilterType] = useState<'all' | 'power' | 'window'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract unique room names
  const roomNames = useMemo(() => {
    const list = Array.from(new Set(seats.map(s => s.room_name)));
    return ['전체', ...list];
  }, [seats]);

  // Filtered seats
  const filteredSeats = useMemo(() => {
    return seats.filter(seat => {
      // Room match
      if (selectedRoom !== '전체' && seat.room_name !== selectedRoom) return false;
      // Feature match
      if (filterType === 'power' && !seat.has_power) return false;
      if (filterType === 'window' && !seat.is_window) return false;
      // Search query (number or ID)
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchNum = String(seat.seat_number).toLowerCase().includes(query);
        const matchId = seat.seat_id.toLowerCase().includes(query);
        if (!matchNum && !matchId) return false;
      }
      return true;
    });
  }, [seats, selectedRoom, filterType, searchQuery]);

  // Calculate statistics for currently selected room (or all)
  const stats = useMemo(() => {
    const currentScope = selectedRoom === '전체'
      ? seats
      : seats.filter(s => s.room_name === selectedRoom);

    const total = currentScope.length;
    const available = currentScope.filter(s => s.status === 'available').length;
    const reserved = total - available;
    const rate = total > 0 ? Math.round((reserved / total) * 100) : 0;

    return { total, available, reserved, rate };
  }, [seats, selectedRoom]);

  return (
    <div className="space-y-4">
      {/* Overview Statistics Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {selectedRoom === '전체' ? '도서관 전체 열람실 좌석 현황' : selectedRoom}
            </h2>
            <p className="text-xs text-slate-500">
              초록색 좌석을 터치하시면 즉시 예약 신청이 가능합니다.
            </p>
          </div>

          {/* Quick legend */}
          <div className="flex items-center space-x-3 text-xs text-slate-600 self-start sm:self-center">
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-3.5 rounded bg-emerald-500 shadow-2xs"></span>
              <span className="font-medium text-emerald-800">예약 가능</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-3.5 rounded bg-rose-500 shadow-2xs"></span>
              <span className="font-medium text-rose-800">이용 중</span>
            </div>
          </div>
        </div>

        {/* 4 Stat Boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <span className="text-xs text-slate-500 block">전체 좌석</span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-800 tabular-nums">
              {stats.total}
            </span>
          </div>
          <div className="bg-emerald-50/70 rounded-xl p-3 border border-emerald-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-800">예약 가능</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 tabular-nums">
              {stats.available}
            </span>
          </div>
          <div className="bg-rose-50/70 rounded-xl p-3 border border-rose-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-800">이용 중</span>
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
            </div>
            <span className="text-xl sm:text-2xl font-bold font-mono text-rose-600 tabular-nums">
              {stats.reserved}
            </span>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <span className="text-xs text-slate-500 block">현재 점유율</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl sm:text-2xl font-bold font-mono text-slate-800 tabular-nums">
                {stats.rate}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        {/* Room Tabs */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">열람실 선택</label>
          <div className="flex flex-wrap gap-1.5">
            {roomNames.map(room => (
              <button
                key={room}
                onClick={() => setSelectedRoom(room)}
                className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                  selectedRoom === room
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {room}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Filters & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-slate-400 flex items-center mr-1">
              <Filter className="w-3 h-3 mr-1" /> 필터:
            </span>
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                filterType === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              전체 보기
            </button>
            <button
              onClick={() => setFilterType('power')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap ${
                filterType === 'power'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Zap className="w-3 h-3 text-amber-500" />
              <span>콘센트석</span>
            </button>
            <button
              onClick={() => setFilterType('window')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap ${
                filterType === 'window'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Sun className="w-3 h-3 text-sky-500" />
              <span>창가석</span>
            </button>
          </div>

          {/* Quick Seat Number Search */}
          <div className="relative min-w-[140px] sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="좌석 번호 검색"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Seat Map Visual Canvas */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
        {/* Floorplan Context Indicator */}
        <div className="flex items-center justify-between text-xs text-slate-400 border-b border-dashed border-slate-200 pb-2 mb-4">
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <span>창가 전망 존 (자연 채광)</span>
          </div>
          <div className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-medium">
            출입문 🚪
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-16 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs">좌석 정보를 불러오는 중입니다...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredSeats.length === 0 && (
          <div className="py-16 text-center text-slate-400">
            <p className="text-sm font-medium">조건에 맞는 좌석이 없습니다.</p>
            <p className="text-xs mt-1 text-slate-400">필터나 검색어를 변경해보세요.</p>
          </div>
        )}

        {/* Seats Grid */}
        {!isLoading && filteredSeats.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-2.5 sm:gap-3">
            {filteredSeats.map(seat => {
              const isAvailable = seat.status === 'available';

              if (isAvailable) {
                return (
                  <button
                    key={seat.seat_id}
                    onClick={() => onSelectSeat(seat)}
                    className="group relative flex flex-col items-center justify-between p-3 min-h-[98px] rounded-xl border border-emerald-400 bg-emerald-50/90 hover:bg-emerald-100/90 text-emerald-950 transition-all active:scale-95 shadow-2xs hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {/* Top Seat Meta */}
                    <div className="flex items-center justify-between w-full text-[10px] text-emerald-700 font-semibold">
                      <span className="font-mono bg-emerald-200/80 text-emerald-900 px-1 py-0.2 rounded font-bold">
                        {seat.seat_id}
                      </span>
                      <div className="flex items-center space-x-0.5">
                        {seat.has_power && (
                          <span title="콘센트 지원">
                            <Zap className="w-3 h-3 text-amber-500" />
                          </span>
                        )}
                        {seat.is_window && (
                          <span title="창가석">
                            <Sun className="w-3 h-3 text-sky-500" />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Seat Number */}
                    <div className="text-2xl font-bold font-mono tracking-tight my-0.5 group-hover:scale-105 transition-transform text-emerald-900 tabular-nums">
                      {seat.seat_number}
                    </div>

                    {/* Status Pill */}
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-md">
                      사용가능
                    </span>
                  </button>
                );
              } else {
                return (
                  <div
                    key={seat.seat_id}
                    className="relative flex flex-col items-center justify-between p-3 min-h-[98px] rounded-xl border border-rose-300 bg-rose-50/80 text-rose-950 select-none opacity-90 shadow-2xs cursor-not-allowed"
                  >
                    {/* Top Seat Meta */}
                    <div className="flex items-center justify-between w-full text-[10px] text-rose-700 font-semibold">
                      <span className="font-mono bg-rose-200/80 text-rose-900 px-1 py-0.2 rounded font-bold">
                        {seat.seat_id}
                      </span>
                      <div className="flex items-center space-x-0.5">
                        {seat.has_power && (
                          <span title="콘센트 지원">
                            <Zap className="w-3 h-3 text-amber-400/80" />
                          </span>
                        )}
                        {seat.is_window && (
                          <span title="창가석">
                            <Sun className="w-3 h-3 text-sky-400/80" />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Seat Number */}
                    <div className="text-2xl font-bold font-mono tracking-tight my-0.5 text-rose-800 tabular-nums">
                      {seat.seat_number}
                    </div>

                    {/* Status Pill */}
                    <span className="text-[10px] font-semibold text-rose-800 bg-rose-200/70 px-2 py-0.5 rounded-md">
                      사용중
                    </span>
                  </div>
                );
              }
            })}
          </div>
        )}

        {/* Bottom Ambient Note */}
        <div className="mt-6 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-1">
          <span>* 1인당 최대 1좌석만 예약할 수 있습니다.</span>
          <span>* 퇴실 시 다음 이용자를 위해 반드시 예약을 취소해주세요.</span>
        </div>
      </div>
    </div>
  );
};
