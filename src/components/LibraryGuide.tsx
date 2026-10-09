import React from 'react';
import { ShieldCheck, Clock, AlertCircle, Sparkles, VolumeX, Coffee, Smartphone } from 'lucide-react';

export const LibraryGuide: React.FC = () => {
  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2 text-emerald-600 mb-1">
          <ShieldCheck className="w-5 h-5" />
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            도서관 열람실 좌석 이용 수칙 및 안내
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          쾌적하고 공정한 면학 분위기 조성을 위해 다음 규정을 준수해주시기 바랍니다.
        </p>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>1. 이용 시간 및 연장</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            기본 예약 시간은 1회 최대 6시간까지 가능합니다. 만료 30분 전부터 잔여 좌석이 있을 경우 내 예약 페이지에서 연장할 수 있습니다.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span>2. 좌석 반납(취소) 의무</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            퇴실 시 다음 이용자를 위해 반드시 [내 예약 확인/취소] 탭에서 좌석을 반납(예약 취소)해 주시기 바랍니다. 미반납 시 패널티가 부과될 수 있습니다.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
            <VolumeX className="w-4 h-4 text-amber-500" />
            <span>3. 열람실별 정숙 기준</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            제1열람실 및 제3열람실은 타이핑 및 소음이 엄격히 제한됩니다. 노트북 키보드나 마우스 사용은 <strong>제2열람실(노트북석)</strong>을 이용해주세요.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
            <Coffee className="w-4 h-4 text-sky-600" />
            <span>4. 음식물 반입 기준</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            밀폐용기 텀블러에 담긴 맑은 물과 뚜껑이 있는 음료만 반입이 허용되며, 냄새가 나거나 부스러기가 생기는 음식물은 반입 불가합니다.
          </p>
        </div>
      </div>

      {/* Opening Hours Info */}
      <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 text-xs text-slate-700 space-y-2">
        <div className="font-bold text-emerald-900 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>열람실 운영 시간 안내</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-mono">
          <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
            <span className="text-[11px] text-slate-400 block font-sans">평일 (월~금)</span>
            <span className="font-bold text-slate-800">06:00 ~ 23:00</span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
            <span className="text-[11px] text-slate-400 block font-sans">주말 및 공휴일</span>
            <span className="font-bold text-slate-800">08:00 ~ 21:00</span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-emerald-100 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-slate-400 block font-sans">휴관일</span>
            <span className="font-bold text-slate-800">매월 둘째/넷째 월요일</span>
          </div>
        </div>
      </div>
    </div>
  );
};
