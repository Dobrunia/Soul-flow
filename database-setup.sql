-- Создание таблиц для чата

-- Таблица профилей пользователей (дополняет auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  avatar_url TEXT,
  status TEXT
      CHECK (status IN ('online', 'offline', 'dnd', 'invisible'))
      NOT NULL DEFAULT 'offline',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Таблица чатов
CREATE TABLE IF NOT EXISTS chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('direct', 'group')) NOT NULL DEFAULT 'direct',
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Таблица участников чата
CREATE TABLE IF NOT EXISTS chat_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(chat_id, user_id)
);

-- Таблица сообщений
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('text', 'image', 'file', 'audio')) NOT NULL DEFAULT 'text',
  status TEXT CHECK (status IN ('unread', 'read', 'error')) NOT NULL DEFAULT 'unread',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Таблица реакций на сообщения
CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(message_id, user_id, emoji)
);

-- Включаем Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

-- Политики безопасности для profiles
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Политики безопасности для chats
CREATE POLICY "Users can view chats they participate in" ON chats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_participants 
      WHERE chat_id = chats.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Chat creator can view own chat" ON chats
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can create chats" ON chats
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Chat creators can update their chats" ON chats
  FOR UPDATE USING (auth.uid() = created_by);

-- ❶ Функция, которая проверяет, состоит ли текущий юзер в чате
CREATE OR REPLACE FUNCTION public.is_chat_member(_chat_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM chat_participants
    WHERE chat_id = _chat_id
      AND user_id = auth.uid()
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_chat_member(uuid) TO anon, authenticated;

DROP POLICY IF EXISTS "Users can view participants of their chats" ON chat_participants;
CREATE POLICY "Users can view participants of their chats" ON chat_participants
  FOR SELECT USING ( public.is_chat_member(chat_id) );

CREATE POLICY "Chat creators can add participants" ON chat_participants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chats 
      WHERE id = chat_id AND created_by = auth.uid()
    )
  );

-- Политики безопасности для messages
CREATE POLICY "Users can view messages in their chats" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_participants 
      WHERE chat_id = messages.chat_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their chats" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM chat_participants 
      WHERE chat_id = messages.chat_id AND user_id = auth.uid()
    )
  );

-- Политики безопасности для message_reactions
CREATE POLICY "Users can view reactions in their chats" ON message_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN chat_participants cp ON m.chat_id = cp.chat_id
      WHERE m.id = message_reactions.message_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add reactions to messages in their chats" ON message_reactions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM messages m
      JOIN chat_participants cp ON m.chat_id = cp.chat_id
      WHERE m.id = message_reactions.message_id AND cp.user_id = auth.uid()
    )
  );

-- Даем права authenticated пользователям
GRANT INSERT, SELECT, UPDATE, DELETE ON chats TO authenticated;
GRANT INSERT, SELECT, UPDATE, DELETE ON profiles TO authenticated;
GRANT INSERT, SELECT, UPDATE, DELETE ON chat_participants TO authenticated;
GRANT INSERT, SELECT, UPDATE, DELETE ON messages TO authenticated;
GRANT INSERT, SELECT, UPDATE, DELETE ON message_reactions TO authenticated;

-- Функция для автоматического создания профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  _username TEXT;
  _avatar_url TEXT;
BEGIN
  _username := COALESCE(
    new.raw_user_meta_data->>'preferred_username',
    split_part(new.email, '@', 1)
  );
  _avatar_url := COALESCE(
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'picture',
    NULL
  );

  INSERT INTO public.profiles (id, email, username, avatar_url)
  VALUES (
    new.id,
    new.email,
    _username,
    NULLIF(_avatar_url, '')
  );
  RETURN new;
END;
$$;

-- Триггер для создания профиля
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

-- Триггеры для обновления updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON chats
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Добавляем таблицы в публикацию supabase_realtime (безопасно)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'chat_participants'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE chat_participants;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'chats'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE chats;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
  END IF;
END $$;  