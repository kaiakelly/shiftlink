import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { getCurrentUser, useAppStore } from '@/src/store/useAppStore';

export default function ProfileScreen() {
  const session = useAppStore((s) => s.session);
  const user = useAppStore((s) => getCurrentUser(s));
  const [devTapCount, setDevTapCount] = useState(0);

  const canShowReset = useMemo(() => {
    if (!user) return false;
    if (user.role === 'admin') return false;
    return devTapCount >= 7;
  }, [devTapCount, user]);

  return (
    <View className="flex-1 bg-background px-4 py-6">
      <Text className="text-foreground text-2xl font-semibold">我的</Text>

      <View className="bg-card mt-6 rounded-2xl p-4">
        <Text className="text-foreground font-semibold">
          {session.isGuest ? '遊客' : user?.displayName ?? user?.username ?? ''}
        </Text>
        <Text className="text-muted-foreground mt-1 text-sm">
          {session.isGuest ? '登入後可使用換班牆、私訊與管理功能' : `角色：${user?.role ?? ''}`}
        </Text>
      </View>

      <View className="mt-6 flex-row gap-3">
        {session.isGuest ? (
          <Pressable className="bg-primary rounded-xl px-4 py-3" onPress={() => router.push('/(auth)/login')}>
            <Text className="text-primary-foreground font-semibold">去登入</Text>
          </Pressable>
        ) : (
          <>
            <Pressable className="bg-card rounded-xl px-4 py-3" onPress={() => router.push('/(tabs)/shift-types' as any)}>
              <Text className="text-foreground font-semibold">班次設定</Text>
            </Pressable>
            <Pressable className="bg-destructive rounded-xl px-4 py-3" onPress={() => useAppStore.getState().actions.logout()}>
              <Text className="text-destructive-foreground font-semibold">登出</Text>
            </Pressable>
          </>
        )}
      </View>

      <Pressable className="mt-10 py-3" onPress={() => setDevTapCount((c) => c + 1)}>
        <Text className="text-muted-foreground text-center">版本：1.0.0</Text>
      </Pressable>

      {canShowReset ? (
        <Pressable
          className="bg-destructive mt-3 rounded-xl px-4 py-3"
          onPress={() =>
            Alert.alert('清空資料', '只供開發測試使用，確定要清空本機資料？', [
              { text: '取消', style: 'cancel' },
              { text: '清空', style: 'destructive', onPress: () => useAppStore.getState().actions.devResetNonAdmin() },
            ])
          }>
          <Text className="text-destructive-foreground font-semibold text-center">重置本機資料（非 admin）</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
