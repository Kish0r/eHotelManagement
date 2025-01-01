export interface FormData {
  name: string;
  email: string;
  password: string;
  user_type: "staff" | "customer";
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_type: string;
}

export interface Booking {
  booking_id: string;
  room_id: string;
  user_id: string;
  number_of_guests: number;
  special_requests?: string;
  check_in_date: string;
  check_out_date: string;
  status: "confirmed" | "pending" | "cancelled";
  created_at: string;
}

export interface ComplaintData {
  booking_id: string;
  user_id: string;
  message: string;
}

export interface Complaint {
  complaint_id: string;
  booking_id: string;
  user_id: string;
  message: string;
  status: string;
  created_at: string;
}

export interface ComplaintsResponse {
  complaints: Complaint[];
  total: number;
}

export interface UserData {
  user_id: string;
  name: string;
  email: string;
  user_type: string;
}

export interface Room {
  room_id: string;
  title: string;
  amenities: string[];
  description: string;
  image: string;
  status: string;
  price_per_night: number;
  created_at: string;
}

export interface RoomsResponse {
  rooms: Room[];
  total: number;
}

export interface RoomDetail {
  room_id: string;
  title: string;
  amenities: string[];
  description: string;
  image: string;
  status: string;
  price_per_night: number;
  created_at: string;
}