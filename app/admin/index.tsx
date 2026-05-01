import { router, Stack } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { getCurrentUser, useAppStore } from '@/src/store/useAppStore';

function NavButton({ title, to }: { title: string; to: string }) {
  return (
    <Pressable className="bg-card rounded-2xl px-4 py-4" onPress={() => router.push(to as any)}>
      <Text className="text-foreground font-semibold">{title}</Text>
    </Pressable>
  );
}

export default function AdminHomeScreen() {
  const me = useAppStore((s) => getCurrentUser(s));
  const entities = useAppStore((s) => s.entities);

  const counts = useMemo(() => {
    return {
      users: entities.users.allIds.length,
      companies: entities.companies.allIds.length,
      positions: entities.positions.allIds.length,
      skills: entities.skills.allIds.length,
      shiftTypes: entities.shiftTypes.allIds.filter((id) => id !== 'shift_none').length,
      posts: entities.posts.allIds.length,
      threads: entities.threads.allIds.length,
      messages: entities.messages.allIds.length,
    };
  }, [entities]);

  if (!me || me.role !== 'admin') {
    return (
      <View className="flex-1 bg-background px-4 py-6">
        <Stack.Screen options={{ title: 'Admin' }} />
        <Text className="text-foreground text-xl font-semibold">Admin</Text>
        <Text className="text-muted-foreground mt-2">你無權限。</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background px-4 py-6">
      <Stack.Screen options={{ title: 'Admin' }} />
      <Text className="text-foreground text-2xl font-semibold">Admin</Text>
      <Text className="text-muted-foreground mt-2">
        用戶 {counts.users} · 公司 {counts.companies} · 職位 {counts.positions} · 技能 {counts.skills}
      </Text>

      <View className="mt-6 gap-3">
        <NavButton title="App 設定" to="/admin/config" />
        <NavButton title="用戶管理" to="/admin/users" />
        <NavButton title="公司管理" to="/admin/companies" />
        <NavButton title="職位管理" to="/admin/positions" />
        <NavButton title="技能管理" to="/admin/skills" />
        <NavButton title="班次類型" to="/admin/shift-types" />
      </View>
    </View>
  );
}

