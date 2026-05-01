import { router } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

import type { Message, Thread, User } from '@/src/types';
import { getCurrentUser, useAppStore } from '@/src/store/useAppStore';

export default function InboxScreen() {
  const session = useAppStore((s) => s.session);
  const me = useAppStore((s) => getCurrentUser(s));
  const threadsEntity = useAppStore((s) => s.entities.threads);
  const messagesEntity = useAppStore((s) => s.entities.messages);
  const usersById = useAppStore((s) => s.entities.users.byId);

  return (
    <View className="flex-1 bg-background px-4 py-6">
      <Text className="text-foreground text-2xl font-semibold">私訊</Text>
      {session.isGuest ? (
        <>
          <Text className="text-muted-foreground mt-2">請先登入以使用私訊與換更協商。</Text>
          <Pressable className="bg-primary mt-6 rounded-xl px-4 py-3" onPress={() => router.push('/(auth)/login')}>
            <Text className="text-primary-foreground font-semibold text-center">去登入</Text>
          </Pressable>
        </>
      ) : (
        <ThreadList meId={me?.id ?? ''} threadsEntity={threadsEntity} messagesEntity={messagesEntity} usersById={usersById} />
      )}
    </View>
  );
}

function ThreadList({
  meId,
  threadsEntity,
  messagesEntity,
  usersById,
}: {
  meId: string;
  threadsEntity: { byId: Record<string, Thread | undefined>; allIds: string[] };
  messagesEntity: { byId: Record<string, Message | undefined>; allIds: string[] };
  usersById: Record<string, User | undefined>;
}) {
  const items = useMemo(() => {
    const threads = threadsEntity.allIds
      .map((id) => threadsEntity.byId[id])
      .filter((t): t is Thread => !!t && t.participantIds.includes(meId));
    threads.sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));

    const lastByThread: Record<string, Message | undefined> = {};
    for (const id of messagesEntity.allIds) {
      const m = messagesEntity.byId[id];
      if (!m) continue;
      const prev = lastByThread[m.threadId];
      if (!prev || m.createdAt > prev.createdAt) lastByThread[m.threadId] = m;
    }

    return threads.map((t) => {
      const [a, b] = t.participantIds;
      const peerId = a === meId ? b : a;
      const peer = usersById[peerId];
      const last = lastByThread[t.id];
      const preview =
        last?.type === 'proposal'
          ? '[換更提議]'
          : last?.type === 'image'
            ? '[圖片]'
            : last?.type === 'system'
              ? last.text ?? ''
              : last?.text ?? '';
      return {
        id: t.id,
        title: peer?.displayName ?? peer?.username ?? '未知用戶',
        preview,
        ts: t.lastMessageAt,
      };
    });
  }, [meId, messagesEntity, threadsEntity, usersById]);

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      className="mt-4"
      ItemSeparatorComponent={() => <View className="h-3" />}
      renderItem={({ item }) => (
        <Pressable
          className="bg-card rounded-2xl p-4"
          onPress={() => router.push({ pathname: '/(chat)/thread/[threadId]', params: { threadId: item.id } } as any)}>
          <Text className="text-foreground font-semibold">{item.title}</Text>
          <Text className="text-muted-foreground mt-1" numberOfLines={1}>
            {item.preview || ' '}
          </Text>
        </Pressable>
      )}
      ListEmptyComponent={() => (
        <View className="mt-10">
          <Text className="text-muted-foreground text-center">暫時未有對話</Text>
        </View>
      )}
    />
  );
}
