export type UserRole = 'admin' | 'editor';

export type EventStatus = 'draft' | 'published' | 'registration_open' | 'registration_closed' | 'completed' | 'cancelled';

export type RegistrationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export type NewsStatus = 'draft' | 'published' | 'archived';

export type CertificateStatus = 'valid' | 'revoked';

export type FieldType = 'text' | 'textarea' | 'email' | 'phone' | 'number' | 'date' | 'dropdown' | 'radio' | 'checkbox' | 'file' | 'image';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  banner_url: string | null;
  start_date: string | null;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  venue: string | null;
  address: string | null;
  registration_start: string | null;
  registration_end: string | null;
  max_participants: number | null;
  registration_enabled: boolean;
  certificate_enabled: boolean;
  status: EventStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventForm {
  id: string;
  event_id: string;
  title: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FormField {
  id: string;
  form_id: string;
  field_type: FieldType;
  field_key: string;
  label: string;
  description: string | null;
  placeholder: string | null;
  is_required: boolean;
  validation_rules: Record<string, unknown>;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  form_field_options?: FormFieldOption[];
}

export interface FormFieldOption {
  id: string;
  field_id: string;
  label: string;
  value: string;
  sort_order: number;
}

export interface Registration {
  id: string;
  registration_number: string;
  event_id: string;
  form_id: string;
  status: RegistrationStatus;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface RegistrationValue {
  id: string;
  registration_id: string;
  field_id: string;
  value_text: string | null;
  value_json: unknown;
  file_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewsCategory {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface News {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image_url: string | null;
  category_id: string | null;
  status: NewsStatus;
  published_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  news_categories?: NewsCategory | null;
}

export interface PhotoAlbum {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  event_id: string | null;
  status: NewsStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  album_id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

export interface Video {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  category: string | null;
  status: NewsStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  description: string | null;
  background_url: string | null;
  width: number;
  height: number;
  orientation: string;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CertificateTemplateField {
  id: string;
  template_id: string;
  field_key: string;
  label: string;
  x_position: number;
  y_position: number;
  width: number;
  height: number;
  font_family: string;
  font_size: number;
  font_weight: string;
  text_align: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Certificate {
  id: string;
  certificate_number: string;
  registration_id: string;
  event_id: string;
  template_id: string;
  participant_name: string;
  pdf_url: string | null;
  verification_token: string;
  status: CertificateStatus;
  issued_at: string;
  revoked_at: string | null;
  revocation_reason: string | null;
  created_at: string;
  updated_at: string;
  events?: Event;
  registrations?: Registration;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: unknown;
  updated_by: string | null;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  profiles?: Profile | null;
}

export interface RegistrationWithValues extends Registration {
  events?: Event;
  registration_values?: (RegistrationValue & { form_fields?: FormField })[];
}
