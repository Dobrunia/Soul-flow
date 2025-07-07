import { useEffect } from 'react';
import { realtimeService } from './realtimeService';

/**
 * Хук для подписки на изменения чатов пользователя
 * @param userId - ID пользователя
 * @param onChatsChange - колбэк при изменении чатов
 * @param enabled - включена ли подписка
 */
export function useUserChatsSubscription(
  userId: string | undefined,
  onChatsChange: () => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!userId || !enabled) return;

    const unsubscribe = realtimeService.subscribeToUserChats(userId, onChatsChange);
    
    return unsubscribe;
  }, [userId, onChatsChange, enabled]);
}

/**
 * Хук для подписки на сообщения в чате
 * @param chatId - ID чата
 * @param onNewMessage - колбэк при новом сообщении
 * @param enabled - включена ли подписка
 */
export function useChatMessagesSubscription(
  chatId: string | undefined,
  onNewMessage: () => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!chatId || !enabled) return;

    const unsubscribe = realtimeService.subscribeToChatMessages(chatId, onNewMessage);
    
    return unsubscribe;
  }, [chatId, onNewMessage, enabled]);
} 