import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';

import type { User } from '@/src/types';
import { getCurrentUser, useAppStore } from '@/src/store/useAppStore';

export default function AdminUsersScreen() {
  const me = useAppStore((s) => getCurrentUser(s));
  const usersEntity = useAppStore((s) => s.entities.users);

  const items = useMemo(() => {
    return usersEntity.allIds.map((id) => usersEntity.byId[id]).filter(Boolean);
  }, [usersEntity]);

  const [drafts, setDrafts] = useState<Record<string, string>>({});

  if (!me || me.role !== 'admin') {
    return (
      <View className="flex-1 bg-background px-4 py-6">
        <Stack.Screen options={{ title: '用戶管理' }} />
        <Text className="text-muted-foreground">你無權限。</Text>
      </View>
    );
  }

  const getDraft = (u: User) => drafts[u.id] ?? u.displayName;

  const onSaveName = (u: User) => {
    const name = getDraft(u).trim();
    if (!name) return;
    const result = useAppStore.getState().actions.adminUpdateUser({ userId: u.id, displayName: name });
    if (!result.ok) return;
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[u.id];
      return next;
    });
  };

  const toggleVip = (u: User) => {
    useAppStore.getState().actions.adminUpdateUser({ userId: u.id, isVip: !u.isVip });
  };

  const toggleMuted = (u: User) => {
    useAppStore.getState().actions.adminUpdateUser({ userId: u.id, isMuted: !u.isMuted });
  };

  const toggleRole = (u: User) => {
    if (u.id === me.id) {
      Alert.alert('不可修改', '不可修改自己角色。');
      return;
    }
    useAppStore.getState().actions.adminUpdateUser({ userId: u.id, role: u.role === 'admin' ? 'user' : 'admin' });
  };

  return (
    <View className="flex-1 bg-background px-4 py-6">
      <Stack.Screen options={{ title: '用戶管理' }} />

      <View className="gap-3">
        {items.map((u) => (
          <View key={u.id} className="bg-card rounded-2xl p-4">
            <Text className="text-muted-foreground text-xs">{u.username}</Text>
            <TextInput
              value={getDraft(u)}
              onChangeText={(t) => setDrafts((prev) => ({ ...prev, [u.id]: t }))}
              className="text-foreground mt-2 rounded-xl border border-border px-3 py-3"
            />
            <Text className="text-muted-foreground mt-2 text-xs">
              角色：{u.role} · VIP：{u.isVip ? '是' : '否'} · 禁言：{u.isMuted ? '是' : '否'}
            </Text>

            <View className="mt-4 flex-row gap-2">
              <Pressable className="bg-primary flex-1 rounded-xl px-4 py-3" onPress={() => onSaveName(u)}>
                <Text className="text-primary-foreground font-semibold text-center">儲存名稱</Text>
              </Pressable>
            </View>

            <View className="mt-3 flex-row gap-2">
              <Pressable className="bg-card flex-1 rounded-xl border border-border px-4 py-3" onPress={() => toggleVip(u)}>
                <Text className="text-foreground font-semibold text-center">{u.isVip ? '取消 VIP' : '設為 VIP'}</Text>
              </Pressable>
              <Pressable className="bg-card flex-1 rounded-xl border border-border px-4 py-3" onPress={() => toggleMuted(u)}>
                <Text className="text-foreground font-semibold text-center">{u.isMuted ? '解除禁言' : '禁言'}</Text>
              </Pressable>
            </View>

            <View className="mt-3">
              <Pressable className="bg-card rounded-xl border border-border px-4 py-3" onPress={() => toggleRole(u)}>
                <Text className="text-foreground font-semibold text-center">{u.role === 'admin' ? '降為 user' : '升為 admin'}</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

