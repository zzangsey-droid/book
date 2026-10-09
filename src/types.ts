export interface Seat {
  seat_id: string;
  room_name: string;
  seat_number: number | string;
  status: 'available' | 'reserved' | 'using' | string;
  has_power?: boolean;
  is_window?: boolean;
  type?: 'general' | 'laptop' | 'focus';
}

export interface Reservation {
  id: string;
  user_name: string;
  user_phone: string;
  seat_id: string;
  start_time: string;
  end_time: string;
  status: 'active' | 'cancelled' | 'completed' | string;
  created_at?: string;
  room_name?: string;
  seat_number?: string | number;
}

export interface CreateReservationPayload {
  user_name: string;
  user_phone: string;
  seat_id: string;
  start_time: string;
  end_time: string;
}

export interface ApiConfig {
  url: string;
  isUsingMockFallback: boolean;
}
