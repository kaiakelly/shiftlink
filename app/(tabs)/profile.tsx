import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { getCurrentUser, useAppStore } from '@/src/store/useAppStore';

export default function ProfileScreen() {
  const session = useAppStore((s) => s.session);
  const user = useAppStore((s) => getCurrentUser(s));
  const fontScale = useAppStore((s) => s.preferences.fontScale);
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
            {user?.role === 'admin' ? (
              <Pressable className="bg-card rounded-xl px-4 py-3" onPress={() => router.push('/admin' as any)}>
                <Text className="text-foreground font-semibold">Admin</Text>
              </Pressable>
            ) : null}
            <Pressable className="bg-destructive rounded-xl px-4 py-3" onPress={() => useAppStore.getState().actions.logout()}>
              <Text className="text-destructive-foreground font-semibold">登出</Text>
            </Pressable>
          </>
        )}
      </View>

      <View className="bg-card mt-6 rounded-2xl p-4">
        <Text className="text-foreground font-semibold">字體大小</Text>
        <View className="mt-3 flex-row gap-2">
          <Pressable
            className={fontScale <= 0.92 ? 'bg-primary rounded-xl px-4 py-3' : 'bg-background rounded-xl px-4 py-3 border border-border'}
            onPress={() => useAppStore.getState().actions.setFontScale({ fontScale: 0.9 })}>
            <Text className={fontScale <= 0.92 ? 'text-primary-foreground font-semibold' : 'text-foreground font-semibold'}>小</Text>
          </Pressable>
          <Pressable
            className={fontScale > 0.92 && fontScale < 1.08 ? 'bg-primary rounded-xl px-4 py-3' : 'bg-background rounded-xl px-4 py-3 border border-border'}
            onPress={() => useAppStore.getState().actions.setFontScale({ fontScale: 1 })}>
            <Text className={fontScale > 0.92 && fontScale < 1.08 ? 'text-primary-foreground font-semibold' : 'text-foreground font-semibold'}>中</Text>
          </Pressable>
          <Pressable
            className={fontScale >= 1.08 ? 'bg-primary rounded-xl px-4 py-3' : 'bg-background rounded-xl px-4 py-3 border border-border'}
            onPress={() => useAppStore.getState().actions.setFontScale({ fontScale: 1.15 })}>
            <Text className={fontScale >= 1.08 ? 'text-primary-foreground font-semibold' : 'text-foreground font-semibold'}>大</Text>
          </Pressable>
        </View>
        <Text className="text-muted-foreground mt-3 text-sm">只影響 App 內字體顯示。</Text>
      </View>

      <Pressable className="mt-10 py-3" onPress={() => setDevTapCount((c) => c + 1)}>
        <Text className="text-muted-foreground text-center">版本：1.0.0</Text>
      </Pressable>

      {canShowReset ? (
        <View className="mt-3" style={{ gap: 10 }}>
          <Pressable className="bg-card rounded-xl px-4 py-3" onPress={() => router.push('/(modals)/ecai-keyboard' as any)}>
            <Text className="text-foreground font-semibold text-center">ECAIKeyboard 原型</Text>
          </Pressable>
          <Pressable
            className="bg-destructive rounded-xl px-4 py-3"
            onPress={() =>
              Alert.alert('清空資料', '只供開發測試使用，確定要清空本機資料？', [
                { text: '取消', style: 'cancel' },
                { text: '清空', style: 'destructive', onPress: () => useAppStore.getState().actions.devResetNonAdmin() },
              ])
            }>
            <Text className="text-destructive-foreground font-semibold text-center">重置本機資料（非 admin）</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
