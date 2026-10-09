import React, { useState, useEffect } from 'react';
import { Seat, Reservation, CreateReservationPayload } from '../types';
import { createReservation } from '../services/api';
import { X, Clock, User, Phone, CheckCircle, AlertCircle, Zap, Sun } from 'lucide-react';

interface ReservationModalProps {
  seat: Seat | null;
  onClose: () => void;
  onSuccess: (reservation: Reservation, message: string) => void;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({ seat, onClose, onSuccess }) => {
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize times and restore previous user name/phone from localStorage
  useEffect(() => {
    if (!seat) return;

    // Default: current time rounded to nearest 5 minutes
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const startStr = `${pad(now.getHours())}:${pad(Math.floor(now.getMinutes() / 5) * 5)}`;
    
    // Default duration: 3 hours later
    const end = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    const endStr = `${pad(end.getHours())}:${pad(Math.floor(end.getMinutes() / 5) * 5)}`;

    setStartTime(startStr);
    setEndTime(endStr);
    setErrorMsg(null);

    // Load saved user info
    try {
      const saved = localStorage.getItem('library_last_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name) setUserName(parsed.name);
        if (parsed.phone) setUserPhone(parsed.phone);
      }
    } catch {
      // ignore
    }
  }, [seat]);

  if (!seat) return null;

  // Format phone number automatically as 010-XXXX-XXXX
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    let formatted = raw;
    if (raw.length > 3 && raw.length <= 7) {
      formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`;
    } else if (raw.length > 7) {
      formatted = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 11)}`;
    }
    setUserPhone(formatted);
  };

  const handleQuickDuration = (hours: number) => {
    if (!startTime) return;
    const [h, m] = startTime.split(':').map(Number);
    const endH = (h + hours) % 24;
    setEndTime(`${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!userName.trim()) {
      setErrorMsg('이용자 성명을 입력해주세요.');
      return;
    }

    const cleanPhone = userPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('정확한 휴대전화 번호를 입력해주세요 (10~11자리).');
      return;
    }

    if (!startTime || !endTime) {
      setErrorMsg('이용 시작 및 종료 시간을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CreateReservationPayload = {
        user_name: userName.trim(),
        user_phone: userPhone.trim(),
        seat_id: seat.seat_id,
        start_time: startTime,
        end_time: endTime,
      };

      // Save user info for quick next booking
      localStorage.setItem('library_last_user', JSON.stringify({ name: userName.trim(), phone: userPhone.trim() }));

      const res = await createReservation(payload);
      if (res.success && res.reservation) {
        // Enriched with seat info
        const fullReservation: Reservation = {
          ...res.reservation,
          room_name: seat.room_name,
          seat_number: seat.seat_number,
        };
        onSuccess(fullReservation, res.message);
      } else {
        setErrorMsg(res.message || '예약 처리에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || '네트워크 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 transform transition-all animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
              SEAT RESERVATION
            </span>
            <h3 className="text-lg font-bold text-slate-900">
              도서관 좌석 예약 신청
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Seat Summary Card */}
        <div className="my-4 bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-1.5 mb-0.5">
              <span className="font-mono text-xs font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                A열 {seat.seat_id}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-semibold text-slate-700">B열 {seat.room_name}</span>
            </div>
            <div className="flex items-center space-x-2 mt-1 text-[11px] text-slate-500">
              <span className="text-emerald-700 font-medium">D열 상태: 예약 시 '사용중'으로 변경</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-400 block font-medium">C열 좌석 번호</span>
            <span className="text-2xl font-black font-mono text-emerald-600 tabular-nums">
              {seat.seat_number}
              <span className="text-xs font-sans text-emerald-700 ml-0.5">번</span>
            </span>
          </div>
        </div>

        {/* Error notification if any */}
        {errorMsg && (
          <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Reservation Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* User Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              이용자 성명 <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="홍길동"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* User Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              휴대전화 번호 <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                placeholder="010-1234-5678"
                maxLength={13}
                value={userPhone}
                onChange={handlePhoneChange}
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              * 예약 조회 및 취소 시 본인 확인에 사용됩니다.
            </p>
          </div>

          {/* Time slot picker */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                이용 시작 시간 <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full pl-9 pr-2 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                이용 종료 시간 <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full pl-9 pr-2 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Quick Duration Buttons */}
          <div>
            <span className="text-[11px] font-medium text-slate-400 block mb-1">
              빠른 이용 시간 선택
            </span>
            <div className="grid grid-cols-4 gap-1.5 text-xs">
              {[1, 2, 4, 6].map(hours => (
                <button
                  key={hours}
                  type="button"
                  onClick={() => handleQuickDuration(hours)}
                  className="py-1.5 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 transition-colors font-medium text-center"
                >
                  +{hours}시간
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Action buttons */}
          <div className="pt-3 flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors"
            >
              닫기
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>예약 처리 중...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>좌석 예약 확정하기</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
