import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { getCurrentUser, useAppStore } from '@/src/store/useAppStore';

export default function CalendarScreen() {
  const session = useAppStore((s) => s.session);
  const user = useAppStore((s) => getCurrentUser(s));
  const postsCount = useAppStore((s) => s.entities.posts.allIds.length);
  const companiesCount = useAppStore((s) => s.entities.companies.allIds.length);

  return (
    <View className="flex-1 bg-background px-4 py-6">
      <Text className="text-foreground text-2xl font-semibold">日曆</Text>
      <Text className="text-muted-foreground mt-2">
        {session.isGuest ? '遊客模式（只可瀏覽廣場）' : `已登入：${user?.displayName ?? user?.username ?? ''}`}
      </Text>

      <View className="bg-card mt-6 rounded-2xl p-4">
        <Text className="text-foreground text-base">Seed 狀態</Text>
        <Text className="text-muted-foreground mt-1">公司：{companiesCount}</Text>
        <Text className="text-muted-foreground mt-1">帖子：{postsCount}</Text>
      </View>

      <View className="mt-6 flex-row gap-3">
        {session.isGuest ? (
          <>
            <Pressable className="bg-primary rounded-xl px-4 py-3" onPress={() => router.push('/(auth)/login')}>
              <Text className="text-primary-foreground font-semibold">登入</Text>
            </Pressable>
            <Pressable className="bg-card rounded-xl px-4 py-3" onPress={() => router.push('/(auth)/register')}>
              <Text className="text-foreground font-semibold">註冊</Text>
            </Pressable>
          </>
        ) : (
          <Pressable className="bg-destructive rounded-xl px-4 py-3" onPress={() => useAppStore.getState().actions.logout()}>
            <Text className="text-destructive-foreground font-semibold">登出</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
