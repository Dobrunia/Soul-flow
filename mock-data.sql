-- Мок данные для тестирования чатов

-- Профили пользователей (привязанные к существующим auth.users)
INSERT INTO profiles (id, email, full_name, avatar_url) VALUES 
  -- Первый пользователь
  ('4907c7ba-ff50-4b11-bde8-6822438d7226', 'dobruniak@rambler.ru', 'Добрыня', 'https://api.dicebear.com/7.x/avataaars/svg?seed=dobruniak'),
  -- Второй пользователь
  ('6dd315e4-6901-4780-b830-d7c105f5ee5f', 'dobruniaqwerty@gmail.com', 'Добрыня Альт', 'https://api.dicebear.com/7.x/avataaars/svg?seed=dobruniaqwerty')
ON CONFLICT (id) DO NOTHING;

-- Чаты
INSERT INTO chats (id, name, type, created_by, created_at, updated_at) VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Общий чат', 'group', '4907c7ba-ff50-4b11-bde8-6822438d7226', NOW() - INTERVAL '2 days', NOW() - INTERVAL '5 minutes'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Рабочие вопросы', 'group', '4907c7ba-ff50-4b11-bde8-6822438d7226', NOW() - INTERVAL '1 day', NOW() - INTERVAL '15 minutes'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Личная переписка', 'direct', '4907c7ba-ff50-4b11-bde8-6822438d7226', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 minutes'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Проектные идеи', 'group', '6dd315e4-6901-4780-b830-d7c105f5ee5f', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 minute'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Быстрые заметки', 'group', '4907c7ba-ff50-4b11-bde8-6822438d7226', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '30 minutes')
ON CONFLICT (id) DO NOTHING;

-- Участники чатов
INSERT INTO chat_participants (chat_id, user_id, joined_at) VALUES 
  -- Общий чат
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '4907c7ba-ff50-4b11-bde8-6822438d7226', NOW() - INTERVAL '2 days'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '6dd315e4-6901-4780-b830-d7c105f5ee5f', NOW() - INTERVAL '2 days'),
  
  -- Рабочие вопросы
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '4907c7ba-ff50-4b11-bde8-6822438d7226', NOW() - INTERVAL '1 day'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '6dd315e4-6901-4780-b830-d7c105f5ee5f', NOW() - INTERVAL '1 day'),
  
  -- Личная переписка
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '4907c7ba-ff50-4b11-bde8-6822438d7226', NOW() - INTERVAL '3 hours'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '6dd315e4-6901-4780-b830-d7c105f5ee5f', NOW() - INTERVAL '3 hours'),
  
  -- Проектные идеи
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '6dd315e4-6901-4780-b830-d7c105f5ee5f', NOW() - INTERVAL '1 hour'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '4907c7ba-ff50-4b11-bde8-6822438d7226', NOW() - INTERVAL '1 hour'),
  
  -- Быстрые заметки
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '4907c7ba-ff50-4b11-bde8-6822438d7226', NOW() - INTERVAL '6 hours'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '6dd315e4-6901-4780-b830-d7c105f5ee5f', NOW() - INTERVAL '6 hours')
ON CONFLICT (chat_id, user_id) DO NOTHING;

-- Сообщения
INSERT INTO messages (chat_id, sender_id, content, message_type, status, created_at) VALUES 
  -- Общий чат
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '4907c7ba-ff50-4b11-bde8-6822438d7226', 'Привет! Как дела? 👋', 'text', 'read', NOW() - INTERVAL '2 hours'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '6dd315e4-6901-4780-b830-d7c105f5ee5f', 'Отлично! Работаю над новым проектом', 'text', 'delivered', NOW() - INTERVAL '1 hour'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '4907c7ba-ff50-4b11-bde8-6822438d7226', 'Звучит интересно! Расскажешь подробнее?', 'text', 'read', NOW() - INTERVAL '5 minutes'),
  
  -- Рабочие вопросы
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '4907c7ba-ff50-4b11-bde8-6822438d7226', 'Нужно обсудить техническое решение', 'text', 'delivered', NOW() - INTERVAL '30 minutes'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '6dd315e4-6901-4780-b830-d7c105f5ee5f', 'Согласен, давайте созвонимся завтра', 'text', 'read', NOW() - INTERVAL '15 minutes'),
  
  -- Личная переписка
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '6dd315e4-6901-4780-b830-d7c105f5ee5f', 'Можешь помочь с багом в коде?', 'text', 'delivered', NOW() - INTERVAL '10 minutes'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '4907c7ba-ff50-4b11-bde8-6822438d7226', 'Конечно! Скинь описание проблемы', 'text', 'sent', NOW() - INTERVAL '2 minutes'),
  
  -- Проектные идеи
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '6dd315e4-6901-4780-b830-d7c105f5ee5f', 'У меня есть идея для нового фичера', 'text', 'read', NOW() - INTERVAL '3 minutes'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '4907c7ba-ff50-4b11-bde8-6822438d7226', 'Слушаю внимательно! 🎯', 'text', 'delivered', NOW() - INTERVAL '1 minute'),
  
  -- Быстрые заметки
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '4907c7ba-ff50-4b11-bde8-6822438d7226', 'Заметка: не забыть обновить документацию', 'text', 'read', NOW() - INTERVAL '45 minutes'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '6dd315e4-6901-4780-b830-d7c105f5ee5f', 'Добавил в список задач ✅', 'text', 'delivered', NOW() - INTERVAL '30 minutes')
ON CONFLICT DO NOTHING; 