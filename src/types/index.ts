// ─── Auth & User ───────────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  document: string | null;
  birth: string | null;
  gender: 'M' | 'F' | 'O' | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  email_verified_at: string | null;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ─── API Responses ─────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  meta: PaginationMeta;
}

// ─── Parish ────────────────────────────────────────────────────

export interface Parish {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  address: string;
  city: string;
  state: string;
  phone: string | null;
  email: string | null;
  banner_url: string | null;
  is_active: boolean;
  mass_schedules: MassSchedule[];
  priests: User[];
}

// ─── Events ────────────────────────────────────────────────────

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  max_participants: number | null;
  registrations_count: number;
  image_url: string | null;
  parish: Parish;
}

export interface EventRegistration {
  id: number;
  event_id: number;
  user_id: number;
  status: 'confirmed' | 'cancelled' | 'pending';
  registered_at: string;
  event?: Event;
}

// ─── Tithing ───────────────────────────────────────────────────

export interface TitheContribution {
  id: number;
  amount: number;
  month: number;
  year: number;
  paid_at: string | null;
  status: 'pending' | 'paid' | 'overdue';
}

export interface TitheSummary {
  total_paid: number;
  total_pending: number;
  months_paid: number;
  current_year: number;
  contributions: TitheContribution[];
}

// ─── Prayers ───────────────────────────────────────────────────

export interface PrayerCategory {
  id: number;
  name: string;
  slug: string;
  prayers_count: number;
}

export interface Prayer {
  id: number;
  title: string;
  content: string;
  category: PrayerCategory;
  is_favorite: boolean;
}

// ─── Novenas ───────────────────────────────────────────────────

export interface Novena {
  id: number;
  title: string;
  description: string;
  total_days: number;
  image_url: string | null;
}

export interface NovenaDay {
  id: number;
  novena_id: number;
  day_number: number;
  title: string;
  content: string;
  prayer: string;
}

export interface UserNovena {
  id: number;
  novena_id: number;
  current_day: number;
  started_at: string;
  completed_at: string | null;
  novena: Novena;
}

// ─── Liturgy & Bible ───────────────────────────────────────────

export interface DailyLiturgy {
  date: string;
  first_reading: string;
  psalm: string;
  second_reading: string | null;
  gospel: string;
  liturgical_color: 'verde' | 'roxo' | 'branco' | 'vermelho' | 'rosa';
}

export interface BibleMeditation {
  id: number;
  title: string;
  content: string;
  author: string;
  published_at: string;
}

// ─── Gamification ──────────────────────────────────────────────

export interface GamificationProfile {
  points: number;
  level: number;
  level_name: string;
  next_level_points: number;
  rank: number;
}

export interface PointLog {
  id: number;
  points: number;
  reason: string;
  created_at: string;
}

export interface Level {
  id: number;
  level: number;
  name: string;
  min_points: number;
  icon_url: string | null;
}

export interface Prize {
  id: number;
  name: string;
  description: string;
  points_cost: number;
  image_url: string | null;
  available: boolean;
}

// ─── Pastorals ─────────────────────────────────────────────────

export interface Pastoral {
  id: number;
  name: string;
  description: string;
  image_url: string | null;
  members_count: number;
}

// ─── Spiritual Direction ───────────────────────────────────────

export interface SpiritualDirection {
  id: number;
  priest_id: number;
  member_id: number;
  notes: string;
  scheduled_at: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  priest?: User;
}

// ─── Community ─────────────────────────────────────────────────

export interface CommunityMember {
  id: number;
  user: User;
  parish: Parish;
  joined_at: string;
}

export interface Connection {
  id: number;
  user_id: number;
  connected_user_id: number;
  status: 'pending' | 'accepted' | 'rejected';
  connected_user?: User;
}

// ─── Courses ───────────────────────────────────────────────────

export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  image_url: string | null;
  lessons_count: number;
  duration: string;
}

export interface Enrollment {
  id: number;
  course_id: number;
  user_id: number;
  progress: number;
  enrolled_at: string;
  completed_at: string | null;
  course?: Course;
}

export interface Lesson {
  id: number;
  course_id: number;
  title: string;
  content: string;
  video_url: string | null;
  order: number;
  duration: string;
  is_completed: boolean;
}

export interface Certificate {
  id: number;
  course_id: number;
  user_id: number;
  issued_at: string;
  certificate_url: string;
  course?: Course;
}

// ─── Notifications ─────────────────────────────────────────────

export interface Notification {
  id: number;
  title: string;
  body: string;
  type: string;
  read_at: string | null;
  created_at: string;
}

// ─── Campaigns & Raffles ───────────────────────────────────────

export interface Campaign {
  id: number;
  title: string;
  description: string;
  goal: number;
  raised: number;
  starts_at: string;
  ends_at: string;
  image_url: string | null;
}

export interface Raffle {
  id: number;
  title: string;
  description: string;
  price_per_ticket: number;
  draw_date: string;
  image_url: string | null;
}

// ─── Announcements ─────────────────────────────────────────────

export interface Announcement {
  id: number;
  title: string;
  content: string;
  expires_at: string | null;
}

// ─── Messaging ─────────────────────────────────────────────────

export interface Conversation {
  id: number;
  participant: User;
  last_message: Message | null;
  unread_count: number;
  updated_at: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  body: string;
  read_at: string | null;
  created_at: string;
}

// ─── Documents ─────────────────────────────────────────────────

export interface DocumentType {
  id: number;
  name: string;
  description: string;
  required_fields: string[];
}

export interface DocumentRequest {
  id: number;
  document_type_id: number;
  user_id: number;
  status: 'pending' | 'processing' | 'ready' | 'rejected';
  requested_at: string;
  completed_at: string | null;
  document_type?: DocumentType;
}

// ─── Schedules ─────────────────────────────────────────────────

export interface ConfessionSchedule {
  id: number;
  parish_id: number;
  priest_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  priest?: User;
}

export interface MassSchedule {
  id: number;
  parish_id: number;
  day_of_week: number;
  time: string;
  location: string | null;
  description: string | null;
}
