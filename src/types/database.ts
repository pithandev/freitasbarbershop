export type UserRole = 'client' | 'barber' | 'admin';

export type AppointmentStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

export type PaymentMethod = 'pix' | 'card' | 'cash';

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Barber {
  id: string;
  user_id: string | null;
  name: string;
  specialty: string | null;
  bio: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  category: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  client_id: string;
  barber_id: string;
  service_id: string;
  scheduled_at: string;
  scheduled_end_at: string;
  status: AppointmentStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod | null;
  payment_id: string | null;
  mercadopago_preference_id: string | null;
  total_price: number;
  notes: string | null;
  cancel_reason: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  client?: Profile;
  barber?: Barber;
  service?: Service;
}

export interface Availability {
  id: string;
  barber_id: string | null;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface SpecificAvailability {
  id: string;
  barber_id: string | null;
  date: string;
  is_available: boolean;
  reason: string | null;
  created_at: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}