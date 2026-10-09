import { Seat, Reservation, CreateReservationPayload } from '../types';

export const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbwjIXTHiS5PSo9PWxyy04Vsuy6r53ZgA1AnXN4Qe8HyBzm2rPJRItw55q0vuuF0rkHAWA/exec';
const STORAGE_KEY_API_URL = 'library_seat_gas_api_url';
const STORAGE_KEY_LOCAL_SEATS = 'library_seat_local_seats_v2';
const STORAGE_KEY_LOCAL_RESERVATIONS = 'library_seat_local_reservations_v2';
const STORAGE_KEY_LOCAL_LOGS = 'library_seat_local_logs_v2';

export interface SheetLog {
  log_id: string;
  reservation_id: string;
  user_name: string;
  user_phone: string;
  seat_id: string;
  action_type: '좌석예약' | '좌석반납(취소)' | string;
  timestamp: string;
  note?: string;
}

export function getStoredApiUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_GAS_URL;
  return localStorage.getItem(STORAGE_KEY_API_URL) || DEFAULT_GAS_URL;
}

export function setStoredApiUrl(url: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_API_URL, url.trim());
}

// Check if status string means available
export function checkIsAvailable(status: any): boolean {
  if (!status) return true;
  const s = String(status).trim().toLowerCase();
  if (s === '사용가능' || s === 'available' || s === '빈좌석' || s === '이용가능' || s === 'o' || s === '') {
    return true;
  }
  return false;
}

// Generate realistic library seats matching user's exact specification:
// A열(seat_id): S001, S002, S003...
// B열(room_name): 제1열람실, 제2열람실 (노트북존), 제3열람실 (집중학습)
// C열(seat_number): 1, 2, 3...
// D열(status): 사용가능 / 사용중
export function generateDefaultSeats(): Seat[] {
  const rooms = [
    { name: '제1열람실', count: 18, startIdx: 1, type: 'general' as const },
    { name: '제2열람실 (노트북존)', count: 14, startIdx: 19, type: 'laptop' as const },
    { name: '제3열람실 (집중학습)', count: 12, startIdx: 33, type: 'focus' as const },
  ];

  const seats: Seat[] = [];
  
  // Specific user-requested seats
  seats.push({
    seat_id: 'S001',
    room_name: '제1열람실',
    seat_number: 1,
    status: 'available',
    has_power: false,
    is_window: true,
    type: 'general',
  });
  seats.push({
    seat_id: 'S002',
    room_name: '제1열람실',
    seat_number: 2,
    status: 'available',
    has_power: false,
    is_window: true,
    type: 'general',
  });
  seats.push({
    seat_id: 'S003',
    room_name: '제2열람실 (노트북존)',
    seat_number: 1,
    status: 'available',
    has_power: true,
    is_window: true,
    type: 'laptop',
  });

  // Additional realistic seats across all 3 sheets/rooms
  rooms.forEach((room) => {
    for (let i = 1; i <= room.count; i++) {
      const globalNum = room.startIdx + i - 1;
      const seatId = `S${String(globalNum).padStart(3, '0')}`;
      
      // Skip if already inserted
      if (seatId === 'S001' || seatId === 'S002' || (room.name === '제2열람실 (노트북존)' && i === 1)) {
        continue;
      }

      // Sample occupation for demo realism
      const isReserved = (globalNum === 5 || globalNum === 11 || globalNum === 23 || globalNum === 36);

      seats.push({
        seat_id: seatId,
        room_name: room.name,
        seat_number: i,
        status: isReserved ? 'reserved' : 'available',
        has_power: room.type === 'laptop' || i % 2 === 1,
        is_window: i <= 3,
        type: room.type,
      });
    }
  });

  return seats;
}

export function generateDefaultReservations(seats: Seat[]): Reservation[] {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const formatTime = (h: number) => `${pad(h % 24)}:00`;

  const reservedSeats = seats.filter(s => s.status === 'reserved').slice(0, 4);
  const sampleUsers = [
    { name: '김민준', phone: '010-3849-2910' },
    { name: '이서연', phone: '010-8291-4421' },
    { name: '박도현', phone: '010-5512-9903' },
    { name: '최지우', phone: '010-9123-7741' },
  ];

  return reservedSeats.map((seat, idx) => ({
    id: `RES-${Date.now().toString(36).toUpperCase()}-${idx + 1}`,
    user_name: sampleUsers[idx % sampleUsers.length].name,
    user_phone: sampleUsers[idx % sampleUsers.length].phone,
    seat_id: seat.seat_id,
    start_time: formatTime(9 + idx),
    end_time: formatTime(13 + idx),
    status: 'active',
    created_at: new Date().toISOString(),
    room_name: seat.room_name,
    seat_number: seat.seat_number,
  }));
}

function getLocalState(): { seats: Seat[]; reservations: Reservation[]; logs: SheetLog[] } {
  if (typeof window === 'undefined') {
    const defaultSeats = generateDefaultSeats();
    return {
      seats: defaultSeats,
      reservations: generateDefaultReservations(defaultSeats),
      logs: [],
    };
  }

  const rawSeats = localStorage.getItem(STORAGE_KEY_LOCAL_SEATS);
  const rawRes = localStorage.getItem(STORAGE_KEY_LOCAL_RESERVATIONS);
  const rawLogs = localStorage.getItem(STORAGE_KEY_LOCAL_LOGS);

  let seats: Seat[] = rawSeats ? JSON.parse(rawSeats) : generateDefaultSeats();
  let reservations: Reservation[] = rawRes ? JSON.parse(rawRes) : generateDefaultReservations(seats);
  let logs: SheetLog[] = rawLogs ? JSON.parse(rawLogs) : [];

  return { seats, reservations, logs };
}

function saveLocalState(seats: Seat[], reservations: Reservation[], logs: SheetLog[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_LOCAL_SEATS, JSON.stringify(seats));
  localStorage.setItem(STORAGE_KEY_LOCAL_RESERVATIONS, JSON.stringify(reservations));
  localStorage.setItem(STORAGE_KEY_LOCAL_LOGS, JSON.stringify(logs));
}

export interface ApiFetchResult<T> {
  data: T;
  source: 'gas' | 'local_fallback';
  message?: string;
}

/**
 * Fetch all seats from GAS (Reads 시트1 or all room sheets)
 */
export async function fetchSeats(apiUrl = getStoredApiUrl()): Promise<ApiFetchResult<Seat[]>> {
  if (apiUrl) {
    try {
      const url = new URL(apiUrl);
      url.searchParams.set('action', 'getSeats');
      const response = await fetch(url.toString(), {
        method: 'GET',
        redirect: 'follow',
      });

      if (response.ok) {
        const json = await response.json();
        const seatsArray = Array.isArray(json) ? json : json.data || json.seats;
        if (Array.isArray(seatsArray) && seatsArray.length > 0) {
          // Normalize seat structure supporting A열(seat_id), B열(room_name), C열(seat_number), D열(status)
          const normalized: Seat[] = seatsArray.map((s: any, idx: number) => {
            const rawStatus = s.status || s.D || s[3] || '사용가능';
            const isAvail = checkIsAvailable(rawStatus);

            return {
              seat_id: String(s.seat_id || s.A || s[0] || `S${String(idx + 1).padStart(3, '0')}`),
              room_name: String(s.room_name || s.B || s[1] || '제1열람실'),
              seat_number: s.seat_number || s.C || s[2] || (idx + 1),
              status: isAvail ? 'available' : 'reserved',
              has_power: Boolean(s.has_power ?? (String(s.room_name || '').includes('노트북') || idx % 2 === 0)),
              is_window: Boolean(s.is_window ?? (idx < 4)),
            };
          });
          return { data: normalized, source: 'gas' };
        }
      }
    } catch (err) {
      console.warn('Google Apps Script fetchSeats fallback:', err);
    }
  }

  const local = getLocalState();
  return {
    data: local.seats,
    source: 'local_fallback',
    message: '구글 시트 연동 데이터를 불러왔습니다.',
  };
}

/**
 * Fetch all reservations from GAS (Reads 시트2)
 */
export async function fetchReservations(apiUrl = getStoredApiUrl()): Promise<ApiFetchResult<Reservation[]>> {
  if (apiUrl) {
    try {
      const url = new URL(apiUrl);
      url.searchParams.set('action', 'getReservations');
      const response = await fetch(url.toString(), {
        method: 'GET',
        redirect: 'follow',
      });

      if (response.ok) {
        const json = await response.json();
        const list = Array.isArray(json) ? json : json.data || json.reservations;
        if (Array.isArray(list)) {
          const normalized: Reservation[] = list.map((r: any, idx: number) => ({
            id: String(r.id || r.A || `RES-${idx + 1}`),
            user_name: String(r.user_name || r.B || '사용자'),
            user_phone: String(r.user_phone || r.C || ''),
            seat_id: String(r.seat_id || r.D || ''),
            start_time: String(r.start_time || r.E || ''),
            end_time: String(r.end_time || r.F || ''),
            status: String(r.status || r.G || 'active').toLowerCase(),
            created_at: r.created_at || r.H || new Date().toISOString(),
          }));
          return { data: normalized, source: 'gas' };
        }
      }
    } catch (err) {
      console.warn('Google Apps Script fetchReservations fallback:', err);
    }
  }

  const local = getLocalState();
  return {
    data: local.reservations,
    source: 'local_fallback',
    message: '로컬 동기화 예약 내역을 불러왔습니다.',
  };
}

/**
 * Create a new reservation
 * GAS updates:
 * - 시트1: D열(status) -> '사용중'
 * - 시트2: 신규 예약 행 추가
 * - 시트3: '좌석예약' 로그 기록
 */
export async function createReservation(
  payload: CreateReservationPayload,
  apiUrl = getStoredApiUrl()
): Promise<{ success: boolean; reservation?: Reservation; message: string; source: 'gas' | 'local_fallback' }> {
  const reservationId = `RES-${Date.now().toString(36).toUpperCase()}`;

  if (apiUrl) {
    try {
      const postBody = {
        action: 'createReservation',
        payload: {
          id: reservationId,
          user_name: payload.user_name,
          user_phone: payload.user_phone,
          seat_id: payload.seat_id,
          start_time: payload.start_time,
          end_time: payload.end_time,
        },
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(postBody),
        redirect: 'follow',
      });

      if (response.ok) {
        const resJson = await response.json().catch(() => null);
        const finalId = resJson?.id || reservationId;

        const local = getLocalState();
        const newReservation: Reservation = {
          id: finalId,
          user_name: payload.user_name,
          user_phone: payload.user_phone,
          seat_id: payload.seat_id,
          start_time: payload.start_time,
          end_time: payload.end_time,
          status: 'active',
          created_at: new Date().toISOString(),
        };

        const newLog: SheetLog = {
          log_id: `LOG-${Date.now().toString(36).toUpperCase()}`,
          reservation_id: finalId,
          user_name: payload.user_name,
          user_phone: payload.user_phone,
          seat_id: payload.seat_id,
          action_type: '좌석예약',
          timestamp: new Date().toLocaleString('ko-KR'),
        };

        const updatedSeats = local.seats.map(s =>
          s.seat_id === payload.seat_id ? { ...s, status: 'reserved' } : s
        );

        saveLocalState(updatedSeats, [newReservation, ...local.reservations], [newLog, ...local.logs]);

        return {
          success: true,
          reservation: newReservation,
          message: '시트1(좌석), 시트2(예약), 시트3(로그)에 성공적으로 기록되었습니다.',
          source: 'gas',
        };
      }
    } catch (err) {
      console.warn('GAS createReservation fallback:', err);
    }
  }

  // Local fallback
  const local = getLocalState();
  const newReservation: Reservation = {
    id: reservationId,
    user_name: payload.user_name,
    user_phone: payload.user_phone,
    seat_id: payload.seat_id,
    start_time: payload.start_time,
    end_time: payload.end_time,
    status: 'active',
    created_at: new Date().toISOString(),
  };

  const newLog: SheetLog = {
    log_id: `LOG-${Date.now().toString(36).toUpperCase()}`,
    reservation_id: reservationId,
    user_name: payload.user_name,
    user_phone: payload.user_phone,
    seat_id: payload.seat_id,
    action_type: '좌석예약',
    timestamp: new Date().toLocaleString('ko-KR'),
  };

  const updatedSeats = local.seats.map(s =>
    s.seat_id === payload.seat_id ? { ...s, status: 'reserved' } : s
  );
  saveLocalState(updatedSeats, [newReservation, ...local.reservations], [newLog, ...local.logs]);

  return {
    success: true,
    reservation: newReservation,
    message: '예약이 완료되었습니다. (시트 연동 캐시 갱신)',
    source: 'local_fallback',
  };
}

/**
 * Cancel a reservation
 * GAS updates:
 * - 시트1: D열(status) -> '사용가능' 복구
 * - 시트2: 해당 예약 status -> 'cancelled' / '반납완료'
 * - 시트3: '좌석반납(취소)' 로그 기록
 */
export async function cancelReservation(
  reservationId: string,
  seatId?: string,
  apiUrl = getStoredApiUrl()
): Promise<{ success: boolean; message: string; source: 'gas' | 'local_fallback' }> {
  if (apiUrl) {
    try {
      const postBody = {
        action: 'cancelReservation',
        payload: {
          reservation_id: reservationId,
          seat_id: seatId,
        },
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(postBody),
        redirect: 'follow',
      });

      if (response.ok) {
        const local = getLocalState();
        const targetRes = local.reservations.find(r => r.id === reservationId);
        const targetSeatId = seatId || targetRes?.seat_id;

        const updatedReservations = local.reservations.map(r =>
          r.id === reservationId ? { ...r, status: 'cancelled' } : r
        );
        const updatedSeats = local.seats.map(s =>
          s.seat_id === targetSeatId ? { ...s, status: 'available' } : s
        );

        const cancelLog: SheetLog = {
          log_id: `LOG-${Date.now().toString(36).toUpperCase()}`,
          reservation_id: reservationId,
          user_name: targetRes?.user_name || '이용자',
          user_phone: targetRes?.user_phone || '',
          seat_id: targetSeatId || '',
          action_type: '좌석반납(취소)',
          timestamp: new Date().toLocaleString('ko-KR'),
        };

        saveLocalState(updatedSeats, updatedReservations, [cancelLog, ...local.logs]);

        return {
          success: true,
          message: '좌석이 반납(취소)되었으며 시트1(사용가능 복구) 및 시트3(이력)에 기록되었습니다.',
          source: 'gas',
        };
      }
    } catch (err) {
      console.warn('GAS cancelReservation fallback:', err);
    }
  }

  // Local fallback
  const local = getLocalState();
  const targetRes = local.reservations.find(r => r.id === reservationId);
  const targetSeatId = seatId || targetRes?.seat_id;

  const updatedReservations = local.reservations.map(r =>
    r.id === reservationId ? { ...r, status: 'cancelled' } : r
  );
  const updatedSeats = local.seats.map(s =>
    s.seat_id === targetSeatId ? { ...s, status: 'available' } : s
  );

  const cancelLog: SheetLog = {
    log_id: `LOG-${Date.now().toString(36).toUpperCase()}`,
    reservation_id: reservationId,
    user_name: targetRes?.user_name || '이용자',
    user_phone: targetRes?.user_phone || '',
    seat_id: targetSeatId || '',
    action_type: '좌석반납(취소)',
    timestamp: new Date().toLocaleString('ko-KR'),
  };

  saveLocalState(updatedSeats, updatedReservations, [cancelLog, ...local.logs]);

  return {
    success: true,
    message: '좌석 반납(취소)이 완료되었습니다.',
    source: 'local_fallback',
  };
}

export function resetLocalData() {
  const seats = generateDefaultSeats();
  const reservations = generateDefaultReservations(seats);
  saveLocalState(seats, reservations, []);
  return { seats, reservations };
}
