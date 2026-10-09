import React from 'react';
import { Reservation } from '../types';
import { CheckCircle2, QrCode, Calendar, Clock, User, Phone, X } from 'lucide-react';

interface TicketModalProps {
  reservation: Reservation | null;
  onClose: () => void;
  onGoToMyReservations: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({
  reservation,
  onClose,
  onGoToMyReservations,
}) => {
  if (!reservation) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 transform transition-all text-center animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Success Badge */}
        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-bold text-slate-900">
          좌석 예약이 완료되었습니다!
        </h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          선택하신 좌석이 정상적으로 배정되었습니다.
        </p>

        {/* Digital Boarding Pass / Ticket Card */}
        <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 text-left space-y-3 relative overflow-hidden mb-5">
          <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
            <div>
              <span className="text-[10px] text-emerald-800 font-semibold uppercase tracking-wider block">
                DIGITAL SEAT PASS
              </span>
              <span className="text-sm font-bold text-slate-900">
                {reservation.room_name || '도서관 열람실'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black font-mono text-emerald-600">
                {reservation.seat_number || reservation.seat_id}
                <span className="text-xs font-sans text-emerald-700 ml-0.5">번</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[11px] text-slate-400 block flex items-center gap-1">
                <User className="w-3 h-3" /> 예약자
              </span>
              <span className="font-semibold text-slate-800">{reservation.user_name}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block flex items-center gap-1">
                <Phone className="w-3 h-3" /> 연락처
              </span>
              <span className="font-semibold text-slate-800 font-mono text-[11px]">
                {reservation.user_phone}
              </span>
            </div>
          </div>

          <div className="pt-1 border-t border-emerald-200/40 text-xs">
            <span className="text-[11px] text-slate-400 block flex items-center gap-1">
              <Clock className="w-3 h-3" /> 이용 시간
            </span>
            <span className="font-bold text-emerald-800 text-sm">
              {reservation.start_time} ~ {reservation.end_time}
            </span>
          </div>

          {/* Simulated QR Code / Ticket Code */}
          <div className="pt-2 flex items-center justify-between bg-white/70 rounded-xl p-2.5 border border-emerald-100">
            <div className="text-[10px] text-slate-500 font-mono">
              <span className="block text-slate-400">예약 식별번호</span>
              <span className="font-bold text-slate-800">{reservation.id}</span>
            </div>
            <QrCode className="w-7 h-7 text-emerald-700" />
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2">
          <button
            onClick={onGoToMyReservations}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            내 예약 내역 확인하기
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold transition-colors"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
