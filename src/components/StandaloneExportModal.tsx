import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Download, ExternalLink, Code2 } from 'lucide-react';

interface StandaloneExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StandaloneExportModal: React.FC<StandaloneExportModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [htmlCode, setHtmlCode] = useState<string>('로딩 중...');

  useEffect(() => {
    if (!isOpen) return;
    // Fetch standalone.html content
    fetch('/standalone.html')
      .then(res => res.text())
      .then(text => setHtmlCode(text))
      .catch(() => {
        setHtmlCode('코드 로딩에 실패했습니다. /public/standalone.html 파일을 확인해주세요.');
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(htmlCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback copy
      const ta = document.createElement('textarea');
      ta.value = htmlCode;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([htmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full h-[85vh] p-5 sm:p-6 shadow-2xl border border-slate-100 flex flex-col transform transition-all animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                단일 index.html 전체 소스코드
              </h3>
              <p className="text-xs text-slate-500">
                Tailwind CSS CDN 및 Fetch API 기반의 무설치 독립 실행형 파일입니다.
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

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 py-3 border-b border-slate-100 shrink-0">
          <div className="text-xs text-slate-500">
            * 복사하여 <code>index.html</code>로 저장하거나 더블 클릭하여 브라우저에서 바로 열 수 있습니다.
          </div>

          <div className="flex items-center space-x-2">
            <a
              href="/standalone.html"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>미리보기 열기</span>
            </a>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold text-emerald-800 flex items-center gap-1 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>index.html 다운로드</span>
            </button>

            <button
              onClick={handleCopy}
              className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>복사 완료!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>전체 코드 복사</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code Content Box */}
        <div className="flex-1 overflow-hidden my-3 rounded-xl border border-slate-200 bg-slate-950 text-slate-100">
          <pre className="h-full overflow-auto p-4 text-xs font-mono leading-relaxed select-all">
            <code>{htmlCode}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
};
