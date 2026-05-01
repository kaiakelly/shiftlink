import { useMemo } from 'react';
import { router } from 'expo-router';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';

import { getCurrentUser, useAppStore } from '@/src/store/useAppStore';

export default function SquareScreen() {
  const user = useAppStore((s) => getCurrentUser(s));
  const isGuest = useAppStore((s) => s.session.isGuest);
  const postsEntity = useAppStore((s) => s.entities.posts);
  const companiesById = useAppStore((s) => s.entities.companies.byId);
  const usersById = useAppStore((s) => s.entities.users.byId);

  const posts = useMemo(() => {
    return postsEntity.allIds
      .map((id) => postsEntity.byId[id])
      .filter((p) => p && p.boardType === 'square');
  }, [postsEntity]);

  const startChat = (authorId: string) => {
    if (isGuest) {
      router.push('/(auth)/login');
      return;
    }
    if (!user) return;
    if (authorId === user.id) return;
    const result = useAppStore.getState().actions.startThread({ peerUserId: authorId });
    if (result.ok) {
      router.push({ pathname: '/(chat)/thread/[threadId]', params: { threadId: result.threadId } } as any);
    }
  };

  return (
    <View className="flex-1 bg-background px-4 py-6">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-foreground text-2xl font-semibold">廣場</Text>
          <Text className="text-muted-foreground mt-2">全局公開</Text>
        </View>
        {!isGuest && user ? (
          <Pressable className="bg-primary rounded-xl px-4 py-3" onPress={() => router.push({ pathname: '/(modals)/create-post', params: { boardType: 'square' } } as any)}>
            <Text className="text-primary-foreground font-semibold">發帖</Text>
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        className="mt-4"
        ItemSeparatorComponent={() => <View className="h-3" />}
        renderItem={({ item }) => {
          const author = usersById[item.authorId];
          const company = companiesById[item.companyId];
          return (
            <View className="bg-card rounded-2xl p-4">
              <View className="flex-row items-start justify-between">
                <Text className="text-foreground font-semibold flex-1 pr-3">{item.title}</Text>
                <Pressable onPress={() => Alert.alert('檢舉', 'MVP 先預留入口，稍後會接入。')}>
                  <Text className="text-muted-foreground font-semibold">⋯</Text>
                </Pressable>
              </View>
              <Text className="text-muted-foreground mt-1">{item.content}</Text>
              <Pressable className="mt-2" onPress={() => startChat(item.authorId)}>
                <Text className="text-muted-foreground text-xs">
                  {author?.displayName ?? author?.username ?? ''} · {company?.name ?? ''} {isGuest ? '' : '· 私訊'}
                </Text>
              </Pressable>
            </View>
          );
        }}
        ListEmptyComponent={() => (
          <View className="mt-8">
            <Text className="text-muted-foreground text-center">暫時未有帖子</Text>
          </View>
        )}
      />
    </View>
  );
}
