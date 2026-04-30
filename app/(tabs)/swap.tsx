import { router } from 'expo-router';
import { useMemo } from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';

import { getCurrentUser, useAppStore } from '@/src/store/useAppStore';

export default function SwapScreen() {
  const user = useAppStore((s) => getCurrentUser(s));
  const isGuest = useAppStore((s) => s.session.isGuest);
  const postsEntity = useAppStore((s) => s.entities.posts);

  const posts = useMemo(() => {
    if (isGuest || !user) return [];
    return postsEntity.allIds
      .map((id) => postsEntity.byId[id])
      .filter((p) => p && p.boardType === 'swap' && p.companyId === user.companyId);
  }, [isGuest, postsEntity, user]);

  if (isGuest || !user) {
    return (
      <View className="flex-1 bg-background px-4 py-6">
        <Text className="text-foreground text-2xl font-semibold">換班牆</Text>
        <Text className="text-muted-foreground mt-2">請先登入以查看同公司換更帖子。</Text>
        <Pressable className="bg-primary mt-6 rounded-xl px-4 py-3" onPress={() => router.push('/(auth)/login')}>
          <Text className="text-primary-foreground font-semibold text-center">去登入</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background px-4 py-6">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-foreground text-2xl font-semibold">換班牆</Text>
          <Text className="text-muted-foreground mt-2">只顯示與你同公司之帖子</Text>
        </View>
        <Pressable className="bg-primary rounded-xl px-4 py-3" onPress={() => router.push({ pathname: '/(modals)/create-post', params: { boardType: 'swap' } } as any)}>
          <Text className="text-primary-foreground font-semibold">發帖</Text>
        </Pressable>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        className="mt-4"
        ItemSeparatorComponent={() => <View className="h-3" />}
        renderItem={({ item }) => (
          <View className="bg-card rounded-2xl p-4">
            <View className="flex-row items-start justify-between">
              <Text className="text-foreground font-semibold flex-1 pr-3">{item.title}</Text>
              <Pressable onPress={() => Alert.alert('檢舉', 'MVP 先預留入口，稍後會接入。')}>
                <Text className="text-muted-foreground font-semibold">⋯</Text>
              </Pressable>
            </View>
            <Text className="text-muted-foreground mt-1">{item.content}</Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <View className="mt-8">
            <Text className="text-muted-foreground text-center">暫時未有帖子</Text>
          </View>
        )}
      />
    </View>
  );
}
