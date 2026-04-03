export type PostType = 'need' | 'offer';
export type Category = 'items' | 'services' | 'skills' | 'space' | 'other';
export type Urgency = 'flexible' | 'this_week' | 'today';
export type ContactMethod = 'app' | 'phone' | 'email';
export type PostSource = 'web' | 'sms';
export type PostStatus = 'active' | 'fulfilled' | 'expired';

export type ModerationStatus = 'pending' | 'approved' | 'rejected';

export interface Post {
  id: string;
  type: PostType;
  title: string;
  details: string | null;
  category: Category;
  urgency: Urgency;
  contact_name: string;
  contact_method: ContactMethod;
  contact_value: string | null;
  source: PostSource;
  source_phone: string | null;
  status: PostStatus;
  user_id: string | null;
  location_label: string | null;
  location_crossstreet: string | null;
  location_lat: number | null;
  location_lng: number | null;
  moderation_status: ModerationStatus | null;
  created_at: string;
  updated_at: string;
}

export interface Response {
  id: string;
  post_id: string;
  responder_name: string;
  responder_contact: string | null;
  message: string | null;
  created_at: string;
}

export interface PostWithResponses extends Post {
  responses: Response[];
}

export interface Thread {
  id: string;
  post_id: string;
  poster_id: string;
  responder_id: string;
  created_at: string;
  last_message_at: string;
}

export interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  display_name: string;
  neighbourhood: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostWithProfile extends Post {
  profiles: Pick<Profile, 'display_name' | 'neighbourhood'> | null;
}

export interface PostWithResponsesAndProfile extends PostWithResponses {
  profiles: Pick<Profile, 'display_name' | 'neighbourhood'> | null;
}

export interface Database {
  public: {
    Tables: {
      posts: {
        Row: Post;
        Insert: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'status'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          status?: PostStatus;
        };
        Update: Partial<Post>;
      };
      responses: {
        Row: Response;
        Insert: Omit<Response, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Response>;
      };
    };
  };
}
