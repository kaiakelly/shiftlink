import { router } from 'expo-router';
import { FlatList, Pressable, Text, View } from 'react-native';

import { getCurrentUser, useAppStore } from '@/src/store/useAppStore';

export default function SwapScreen() {
  const session = useAppStore((s) => s.session);
  const user = useAppStore((s) => getCurrentUser(s));
  const posts = useAppStore((s) => {
    const all = s.entities.posts.allIds.map((id) => s.entities.posts.byId[id]).filter(Boolean);
    if (session.isGuest || !user) return [];
    return all.filter((p) => p.boardType === 'swap' && p.companyId === user.companyId);
  });

  if (session.isGuest || !user) {
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
      <Text className="text-foreground text-2xl font-semibold">換班牆</Text>
      <Text className="text-muted-foreground mt-2">只顯示與你同公司之帖子</Text>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        className="mt-4"
        ItemSeparatorComponent={() => <View className="h-3" />}
        renderItem={({ item }) => (
          <View className="bg-card rounded-2xl p-4">
            <Text className="text-foreground font-semibold">{item.title}</Text>
            <Text className="text-muted-foreground mt-1">{item.content}</Text>
          </View>
        )}
      />
    </View>
  );
}
