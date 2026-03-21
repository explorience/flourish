export type PostType = 'need' | 'offer';
export type Category = 'items' | 'services' | 'skills' | 'space' | 'other';
export type Urgency = 'flexible' | 'this_week' | 'today';
export type ContactMethod = 'app' | 'phone' | 'email';
export type PostSource = 'web' | 'sms';
export type PostStatus = 'active' | 'fulfilled' | 'expired';

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
  location_lat: number | null;
  location_lng: number | null;
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
