import type { Presence } from 'dobruniaui';

/* =======================================================================
   Типы таблиц Supabase (соответствуют именам таблиц в БД)
   ────────────────────────────────────────────────────────────────────── */

/** profiles */
export interface Profile {
  id: string; // UUID PK
  email: string; // TEXT UNIQUE NOT NULL
  username: string; // TEXT NOT NULL
  avatar_url: string | null; // TEXT
  status: Presence; // CHECK IN ('online','offline','dnd','invisible')
  created_at: string; // TIMESTAMPTZ NOT NULL
  updated_at: string; // TIMESTAMPTZ NOT NULL
}

/** chats */
export type ChatType = 'direct' | 'group';

export interface Chat {
  id: string; // UUID PK
  name: string; // TEXT NOT NULL
  type: ChatType; // CHECK IN ('direct','group')
  created_by: string; // UUID FK → profiles.id
  created_at: string; // TIMESTAMPTZ NOT NULL
  updated_at: string; // TIMESTAMPTZ NOT NULL
}

/** chat_participants */
export interface ChatParticipant {
  id: string; // UUID PK
  chat_id: string; // UUID FK → chats.id
  user_id: string; // UUID FK → profiles.id
  joined_at: string; // TIMESTAMPTZ NOT NULL
}

/** messages */
export type MessageType = 'text' | 'image' | 'file' | 'audio';
export type MessageStatus = 'unread' | 'read' | 'error';

export interface Message {
  id: string; // UUID PK
  chat_id: string; // UUID FK → chats.id
  sender_id: string; // UUID FK → profiles.id
  content: string; // TEXT NOT NULL
  message_type: MessageType; // CHECK IN ('text','image','file','audio')
  status: MessageStatus; // CHECK IN ('unread','read','error')
  created_at: string; // TIMESTAMPTZ NOT NULL
  updated_at: string; // TIMESTAMPTZ NOT NULL
}

/** message_reactions */
export interface MessageReaction {
  id: string; // UUID PK
  message_id: string; // UUID FK → messages.id
  user_id: string; // UUID FK → profiles.id
  emoji: string; // TEXT NOT NULL
  created_at: string; // TIMESTAMPTZ NOT NULL
}
