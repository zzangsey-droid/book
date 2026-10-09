import React, { useState } from 'react';
import { X, Globe, Check, AlertCircle, RotateCcw, Link2 } from 'lucide-react';
import { DEFAULT_GAS_URL, getStoredApiUrl, setStoredApiUrl, resetLocalData } from '../services/api';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData: () => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  onRefreshData,
  onToast,
}) => {
  const [url, setUrl] = useState(getStoredApiUrl());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    setStoredApiUrl(url);
    onToast('Google Apps Script API URL이 저장되었습니다.', 'success');
    onRefreshData();
    onClose();
  };

  const handleResetToDefault = () => {
    setUrl(DEFAULT_GAS_URL);
    setStoredApiUrl(DEFAULT_GAS_URL);
    onToast('기본 Google Apps Script URL로 재설정되었습니다.', 'info');
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const pingUrl = new URL(url.trim());
      pingUrl.searchParams.set('action', 'getSeats');

      const res = await fetch(pingUrl.toString(), {
        method: 'GET',
        redirect: 'follow',
      });

      if (res.ok) {
        const json = await res.json().catch(() => null);
        const count = Array.isArray(json) ? json.length : json?.data?.length || 0;
        setTestResult({
          success: true,
          message: `정상 연결되었습니다! (응답 상태: ${res.status}, 좌석 데이터: ${count}개)`,
        });
      } else {
        setTestResult({
          success: false,
          message: `응답 코드: ${res.status}. Google Apps Script 웹앱 배포 상태를 확인해주세요.`,
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `연결 실패: ${err.message || 'CORS 또는 네트워크 오류'}. 배포 시 '액세스 권한: 모든 사용자(Anyone)'로 설정되었는지 확인해주세요.`,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleResetData = () => {
    if (!confirm('로컬 캐시 데이터를 초기 샘플 상태로 되돌리시겠습니까?')) return;
    resetLocalData();
    onToast('로컬 좌석 및 예약 데이터가 초기화되었습니다.', 'success');
    onRefreshData();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-100 transform transition-all animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Google Apps Script API 설정
              </h3>
              <p className="text-xs text-slate-500">
                웹앱과 연동되는 백엔드 Apps Script 엔드포인트 관리
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="my-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>웹앱 URL (API Endpoint)</span>
              <button
                type="button"
                onClick={handleResetToDefault}
                className="text-[11px] text-emerald-600 hover:underline"
              >
                기본 URL로 복원
              </button>
            </label>
            <div className="relative">
              <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              * 새로운 배포 URL로 변경하더라도 즉시 반영됩니다.
            </p>
          </div>

          {/* Test Connection Button */}
          <div>
            <button
              onClick={handleTestConnection}
              disabled={testing || !url}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center space-x-1.5"
            >
              {testing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>엔드포인트 연결 테스트 중...</span>
                </>
              ) : (
                <span>실시간 연결(Ping) 테스트</span>
              )}
            </button>

            {testResult && (
              <div
                className={`mt-2 p-2.5 rounded-xl text-xs flex items-start space-x-2 ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {testResult.success ? (
                  <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Reset Demo Data */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">로컬 샘플 데이터 리셋</span>
            <button
              onClick={handleResetData}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center gap-1 font-medium transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>데이터 초기화</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs"
          >
            설정 저장
          </button>
        </div>

      </div>
    </div>
  );
};
