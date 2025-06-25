-- ПОЛНАЯ ОЧИСТКА И ПЕРЕСОЗДАНИЕ

-- 1. Удаляем триггеры
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_updated_at ON profiles;
DROP TRIGGER IF EXISTS handle_updated_at ON chats;
DROP TRIGGER IF EXISTS handle_updated_at ON messages;

-- 2. Удаляем функции
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS handle_updated_at();
DROP FUNCTION IF EXISTS public.handle_updated_at();

-- 3. Удаляем политики
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view chats they participate in" ON chats;
DROP POLICY IF EXISTS "Users can create chats" ON chats;
DROP POLICY IF EXISTS "Chat creators can update their chats" ON chats;
DROP POLICY IF EXISTS "Users can view participants of their chats" ON chat_participants;
DROP POLICY IF EXISTS "Chat creators can add participants" ON chat_participants;
DROP POLICY IF EXISTS "Users can view messages in their chats" ON messages;
DROP POLICY IF EXISTS "Users can send messages to their chats" ON messages;

-- 4. Отключаем RLS
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS chats DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS chat_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages DISABLE ROW LEVEL SECURITY;

-- 5. Удаляем таблицы (в правильном порядке из-за foreign keys)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS chat_participants CASCADE;
DROP TABLE IF EXISTS chats CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
