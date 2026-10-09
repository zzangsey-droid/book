import React, { useState } from 'react';
import { X, Copy, Check, FileCode, Table2 } from 'lucide-react';

interface GasScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GasScriptModal: React.FC<GasScriptModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const gasCode = `/**
 * ====================================================================
 * Google Apps Script (Code.gs) - 시트1, 시트2, 시트3 실시간 연동 백엔드
 * ====================================================================
 * 
 * [구글 스프레드시트 구성 구조]
 * 1. 시트1 (좌석 관리)
 *    - A열: seat_id     (예: S001, S002, S003)
 *    - B열: room_name   (예: 제1열람실, 제2열람실 (노트북존))
 *    - C열: seat_number (예: 1, 2, 3)
 *    - D열: status      (예: 사용가능 / 사용중)
 * 
 * 2. 시트2 (예약 현황)
 *    - A열: id (예약ID), B열: user_name, C열: user_phone, D열: seat_id
 *    - E열: start_time, F열: end_time, G열: status (active/cancelled), H열: created_at
 * 
 * 3. 시트3 (이용 이력 및 반납 로그)
 *    - A열: log_id, B열: reservation_id, C열: user_name, D열: user_phone
 *    - E열: seat_id, F열: action_type (좌석예약/좌석반납), G열: timestamp
 *
 * [배포 방법]
 * 1. 구글 스프레드시트 > 확장 프로그램 > Apps Script 열기
 * 2. 아래 코드를 전체 붙여넣기 후 저장 (Ctrl+S)
 * 3. 배포 > 새 배포 > 유형: '웹 앱'
 *    - 다음 사용자 권한으로 실행: '나' (me)
 *    - 액세스 권한: '모든 사용자' (Anyone)  <-- 필수!
 * 4. 생성된 웹 앱 URL(/exec)을 복사하여 시스템에 연결
 */

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "getSeats";
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. 좌석 목록 조회 (시트1 연동)
  if (action === "getSeats") {
    var sheet1 = getOrInitSheet1(ss);
    var data = sheet1.getDataRange().getValues();
    var seats = [];
    
    // 2행(인덱스 1)부터 데이터 읽기 (1행은 헤더)
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (!row[0]) continue; // 빈 행 스킵
      
      var seatId = String(row[0]).trim();
      var roomName = String(row[1] || "제1열람실").trim();
      var seatNum = row[2] || (i);
      var rawStatus = String(row[3] || "사용가능").trim();
      
      // 상태 표준화: '사용가능' / 'available' -> available, 그 외(사용중/예약됨) -> reserved
      var isAvailable = (rawStatus === "사용가능" || rawStatus.toLowerCase() === "available" || rawStatus === "빈좌석" || rawStatus === "");
      
      seats.push({
        seat_id: seatId,
        room_name: roomName,
        seat_number: seatNum,
        status: isAvailable ? "available" : "reserved"
      });
    }
    
    return ContentService.createTextOutput(JSON.stringify(seats))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  // 2. 예약 목록 조회 (시트2 연동)
  if (action === "getReservations") {
    var sheet2 = getOrInitSheet2(ss);
    var data = sheet2.getDataRange().getValues();
    var reservations = [];
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (!row[0]) continue;
      
      reservations.push({
        id: String(row[0]).trim(),
        user_name: String(row[1] || "").trim(),
        user_phone: String(row[2] || "").trim(),
        seat_id: String(row[3] || "").trim(),
        start_time: String(row[4] || "").trim(),
        end_time: String(row[5] || "").trim(),
        status: String(row[6] || "active").trim(),
        created_at: String(row[7] || "").trim()
      });
    }
    
    return ContentService.createTextOutput(JSON.stringify(reservations))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // 3. 로그 목록 조회 (시트3 연동 - 선택사항)
  if (action === "getLogs") {
    var sheet3 = getOrInitSheet3(ss);
    var data = sheet3.getDataRange().getValues();
    var logs = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (!row[0]) continue;
      logs.push({
        log_id: row[0],
        reservation_id: row[1],
        user_name: row[2],
        user_phone: row[3],
        seat_id: row[4],
        action_type: row[5],
        timestamp: row[6]
      });
    }
    return ContentService.createTextOutput(JSON.stringify(logs))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ status: "OK", message: "Library Seat API" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var request = JSON.parse(e.postData.contents);
    var action = request.action;
    var payload = request.payload;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    var sheet1 = getOrInitSheet1(ss); // 좌석
    var sheet2 = getOrInitSheet2(ss); // 예약
    var sheet3 = getOrInitSheet3(ss); // 로그
    
    var nowKST = Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm:ss");
    
    // [기능 1] 좌석 예약 신청
    if (action === "createReservation") {
      var resId = payload.id || ("RES-" + Utilities.getUuid().substring(0, 8).toUpperCase());
      
      // 1) 시트2에 예약 데이터 행 추가
      sheet2.appendRow([
        resId,
        payload.user_name,
        payload.user_phone,
        payload.seat_id,
        payload.start_time,
        payload.end_time,
        "active",
        nowKST
      ]);
      
      // 2) 시트1에서 해당 seat_id의 D열(status)을 '사용중'으로 변경
      var seatsData = sheet1.getDataRange().getValues();
      var seatUpdated = false;
      for (var i = 1; i < seatsData.length; i++) {
        if (String(seatsData[i][0]).trim() === String(payload.seat_id).trim()) {
          sheet1.getRange(i + 1, 4).setValue("사용중"); // D열 업데이트
          seatUpdated = true;
          break;
        }
      }
      
      // 3) 시트3에 '좌석예약' 로그 기록
      var logId = "LOG-" + Utilities.getUuid().substring(0, 8).toUpperCase();
      sheet3.appendRow([
        logId,
        resId,
        payload.user_name,
        payload.user_phone,
        payload.seat_id,
        "좌석예약",
        nowKST
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        id: resId,
        message: "예약 완료 (시트1 상태 변경 및 시트2, 시트3 기록 완료)"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // [기능 2] 좌석 예약 취소 (반납)
    if (action === "cancelReservation") {
      var reservationId = String(payload.reservation_id).trim();
      var targetSeatId = payload.seat_id ? String(payload.seat_id).trim() : null;
      var targetUserName = "";
      var targetUserPhone = "";
      
      // 1) 시트2에서 예약 찾아서 status를 'cancelled'로 변경
      var resData = sheet2.getDataRange().getValues();
      for (var i = 1; i < resData.length; i++) {
        if (String(resData[i][0]).trim() === reservationId) {
          sheet2.getRange(i + 1, 7).setValue("cancelled"); // G열
          if (!targetSeatId) targetSeatId = String(resData[i][3]).trim();
          targetUserName = resData[i][1];
          targetUserPhone = resData[i][2];
          break;
        }
      }
      
      // 2) 시트1에서 해당 seat_id의 D열(status)을 '사용가능'으로 복구
      if (targetSeatId) {
        var seatsData = sheet1.getDataRange().getValues();
        for (var j = 1; j < seatsData.length; j++) {
          if (String(seatsData[j][0]).trim() === targetSeatId) {
            sheet1.getRange(j + 1, 4).setValue("사용가능"); // D열 복원
            break;
          }
        }
      }
      
      // 3) 시트3에 '좌석반납(취소)' 로그 기록
      var logId = "LOG-" + Utilities.getUuid().substring(0, 8).toUpperCase();
      sheet3.appendRow([
        logId,
        reservationId,
        targetUserName,
        targetUserPhone,
        targetSeatId || "",
        "좌석반납(취소)",
        nowKST
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "예약 취소 및 반납 완료 (시트1 사용가능 복구 및 시트3 기록)"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Helper: 시트1(좌석) 가져오기 또는 기본 생성
function getOrInitSheet1(ss) {
  var sheet = ss.getSheetByName("시트1") || ss.getSheetByName("Seats") || ss.getSheets()[0];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["seat_id", "room_name", "seat_number", "status"]);
    sheet.appendRow(["S001", "제1열람실", 1, "사용가능"]);
    sheet.appendRow(["S002", "제1열람실", 2, "사용가능"]);
    sheet.appendRow(["S003", "제2열람실 (노트북존)", 1, "사용가능"]);
    sheet.appendRow(["S004", "제2열람실 (노트북존)", 2, "사용가능"]);
  }
  return sheet;
}

// Helper: 시트2(예약) 가져오기 또는 기본 생성
function getOrInitSheet2(ss) {
  var sheet = ss.getSheetByName("시트2") || ss.getSheetByName("Reservations");
  if (!sheet) {
    sheet = ss.insertSheet("시트2");
    sheet.appendRow(["id", "user_name", "user_phone", "seat_id", "start_time", "end_time", "status", "created_at"]);
  }
  return sheet;
}

// Helper: 시트3(로그) 가져오기 또는 기본 생성
function getOrInitSheet3(ss) {
  var sheet = ss.getSheetByName("시트3") || ss.getSheetByName("Logs");
  if (!sheet) {
    sheet = ss.insertSheet("시트3");
    sheet.appendRow(["log_id", "reservation_id", "user_name", "user_phone", "seat_id", "action_type", "timestamp"]);
  }
  return sheet;
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(gasCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full h-[85vh] p-5 sm:p-6 shadow-2xl border border-slate-100 flex flex-col transform transition-all animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Table2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                시트1 · 시트2 · 시트3 연동 Google Apps Script (Code.gs)
              </h3>
              <p className="text-xs text-slate-500">
                시트1(좌석 현황), 시트2(실시간 예약), 시트3(이용 이력 및 반납 로그) 삼중 연동 지원
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sheet Mapping Summary Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-3 border-b border-slate-100 text-xs shrink-0">
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-emerald-800 block mb-0.5">📌 시트1: 좌석 관리</span>
            <span className="text-slate-500 text-[11px] block">A: seat_id | B: room_name</span>
            <span className="text-slate-500 text-[11px] block">C: seat_number | D: status</span>
            <span className="text-emerald-600 text-[10px] mt-0.5 block font-semibold">→ '사용가능' ⇄ '사용중' 자동 전환</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-800 block mb-0.5">📋 시트2: 예약 현황</span>
            <span className="text-slate-500 text-[11px] block">A: id | B: name | C: phone</span>
            <span className="text-slate-500 text-[11px] block">D: seat_id | E: 시작 | F: 종료</span>
            <span className="text-slate-600 text-[10px] mt-0.5 block font-semibold">→ active / cancelled 관리</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-800 block mb-0.5">📜 시트3: 이력/반납 로그</span>
            <span className="text-slate-500 text-[11px] block">A: log_id | B: res_id</span>
            <span className="text-slate-500 text-[11px] block">C~E: 고객정보 | F: 작업구분</span>
            <span className="text-slate-600 text-[10px] mt-0.5 block font-semibold">→ 예약/반납 실시간 타임스탬프</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100 shrink-0">
          <span className="text-xs text-slate-500">
            * Apps Script 웹 앱 배포 시 <strong>'액세스 권한: 모든 사용자(Anyone)'</strong>로 설정해야 연동됩니다.
          </span>
          <button
            onClick={handleCopy}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Code.gs 복사 완료!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Code.gs 전체 복사</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content Box */}
        <div className="flex-1 overflow-hidden my-2 rounded-xl border border-slate-200 bg-slate-950 text-slate-100">
          <pre className="h-full overflow-auto p-4 text-xs font-mono leading-relaxed select-all">
            <code>{gasCode}</code>
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
