import React, { useState, useEffect } from 'react';
import { Reservation, Seat } from '../types';
import { fetchReservations, cancelReservation } from '../services/api';
import { Search, Calendar, Clock, User, Phone, XCircle, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface MyReservationsProps {
  seats: Seat[];
  onSeatUpdated: () => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const MyReservations: React.FC<MyReservationsProps> = ({
  seats,
  onSeatUpdated,
  onToast,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Auto fill last phone number
  useEffect(() => {
    try {
      const saved = localStorage.getItem('library_last_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.phone) {
          setPhoneNumber(parsed.phone);
          handleSearch(parsed.phone);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    let formatted = raw;
    if (raw.length > 3 && raw.length <= 7) {
      formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`;
    } else if (raw.length > 7) {
      formatted = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 11)}`;
    }
    setPhoneNumber(formatted);
  };

  const handleSearch = async (phoneToQuery = phoneNumber) => {
    const cleanQuery = phoneToQuery.replace(/[^0-9]/g, '');
    if (!cleanQuery) {
      onToast('조회할 휴대전화 번호를 입력해주세요.', 'error');
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const result = await fetchReservations();
      // Filter by phone number match
      const matched = result.data.filter(r => {
        const cleanRPhone = (r.user_phone || '').replace(/[^0-9]/g, '');
        return cleanRPhone.includes(cleanQuery) || cleanQuery.includes(cleanRPhone);
      });

      // Enrich with seat room details if available
      const enriched = matched.map(r => {
        const foundSeat = seats.find(s => s.seat_id === r.seat_id);
        return {
          ...r,
          room_name: r.room_name || foundSeat?.room_name || '열람실',
          seat_number: r.seat_number || foundSeat?.seat_number || r.seat_id,
        };
      });

      setReservations(enriched);
      if (enriched.length > 0) {
        onToast(`${enriched.length}건의 예약 내역을 찾았습니다.`, 'success');
      }
    } catch (err: any) {
      onToast('예약 내역 조회 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (reservation: Reservation) => {
    if (!confirm(`[${reservation.seat_number}번 좌석] 예약을 정말로 취소하시겠습니까?`)) {
      return;
    }

    setCancellingId(reservation.id);

    try {
      const res = await cancelReservation(reservation.id, reservation.seat_id);
      if (res.success) {
        onToast('예약이 정상적으로 취소되었습니다.', 'success');
        // Refresh local reservation list
        setReservations(prev =>
          prev.map(r => (r.id === reservation.id ? { ...r, status: 'cancelled' } : r))
        );
        // Refresh global seats
        onSeatUpdated();
      } else {
        onToast(res.message || '예약 취소에 실패했습니다.', 'error');
      }
    } catch (err: any) {
      onToast('예약 취소 처리 중 오류가 발생했습니다.', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Search Input Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mb-1">
          내 예약 확인 및 좌석 반납(취소)
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          예약 시 입력하셨던 휴대전화 번호로 나의 예약 상태를 확인하고, 퇴실 시 좌석을 반납할 수 있습니다.
        </p>

        <form
          onSubmit={e => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
        >
          <div className="relative flex-1">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              placeholder="휴대전화 번호 입력 (예: 010-1234-5678)"
              maxLength={13}
              value={phoneNumber}
              onChange={handlePhoneChange}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap disabled:opacity-50"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>예약 내역 조회</span>
          </button>
        </form>
      </div>

      {/* Results Section */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">
            조회 결과
            {hasSearched && (
              <span className="text-xs font-normal text-slate-500 ml-1.5">
                (총 {reservations.length}건)
              </span>
            )}
          </h3>
          {hasSearched && reservations.length > 0 && (
            <button
              onClick={() => handleSearch()}
              className="text-xs text-slate-500 hover:text-emerald-600 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> 새로고침
            </button>
          )}
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="py-12 text-center text-slate-400">
            <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs">예약 내역을 조회 중입니다...</p>
          </div>
        )}

        {/* Before Search Empty State */}
        {!isLoading && !hasSearched && (
          <div className="py-12 text-center text-slate-400">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">휴대전화 번호를 입력하고 조회를 눌러주세요.</p>
            <p className="text-xs text-slate-400 mt-1">예약하신 좌석과 이용 시간이 표시됩니다.</p>
          </div>
        )}

        {/* No Results Empty State */}
        {!isLoading && hasSearched && reservations.length === 0 && (
          <div className="py-12 text-center text-slate-400">
            <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">해당 번호로 등록된 예약이 없습니다.</p>
            <p className="text-xs text-slate-400 mt-1">
              입력하신 번호({phoneNumber})를 다시 확인하시거나, 좌석 배치도에서 새로 예약해주세요.
            </p>
          </div>
        )}

        {/* Reservations List */}
        {!isLoading && reservations.length > 0 && (
          <div className="space-y-3">
            {reservations.map(res => {
              const isActive = res.status === 'active';

              return (
                <div
                  key={res.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isActive
                      ? 'border-emerald-200 bg-emerald-50/20 shadow-xs'
                      : 'border-slate-200 bg-slate-50/80 opacity-75'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left Meta */}
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {isActive ? '현재 이용 중' : '취소 / 완료됨'}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          ID: {res.id}
                        </span>
                      </div>

                      <div className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{res.room_name || '도서관 열람실'}</span>
                        <span className="text-emerald-700 font-mono text-base font-extrabold">
                          {res.seat_number}번 좌석
                        </span>
                        <span className="text-xs font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          ID: {res.seat_id}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <strong>{res.start_time} ~ {res.end_time}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>예약자: {res.user_name}</span>
                        </span>
                      </div>
                    </div>

                    {/* Right Action */}
                    <div className="self-end sm:self-center">
                      {isActive ? (
                        <button
                          onClick={() => handleCancel(res)}
                          disabled={cancellingId === res.id}
                          className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors flex items-center gap-1 whitespace-nowrap shadow-2xs disabled:opacity-50"
                        >
                          {cancellingId === res.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-600" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5" />
                          )}
                          <span>좌석 반납 (예약 취소)</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium px-2 py-1 bg-slate-100 rounded-md">
                          취소 완료
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Guidance Card */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-600 space-y-1">
        <div className="font-semibold text-slate-800 mb-1">💡 좌석 반납 안내</div>
        <p>• 도서관 이용을 마치신 후에는 반드시 [좌석 반납] 버튼을 눌러 다음 이용자가 좌석을 이용할 수 있도록 배려해주세요.</p>
        <p>• 예약 후 30분 이상 미착석 시 관리자에 의해 예약이 자동 취소될 수 있습니다.</p>
      </div>
    </div>
  );
};
