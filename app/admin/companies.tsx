import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';

import type { Company } from '@/src/types';
import { getCurrentUser, useAppStore } from '@/src/store/useAppStore';

export default function AdminCompaniesScreen() {
  const me = useAppStore((s) => getCurrentUser(s));
  const companiesEntity = useAppStore((s) => s.entities.companies);

  const items = useMemo(() => {
    return companiesEntity.allIds.map((id) => companiesEntity.byId[id]).filter(Boolean);
  }, [companiesEntity]);

  const [newName, setNewName] = useState('');
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  if (!me || me.role !== 'admin') {
    return (
      <View className="flex-1 bg-background px-4 py-6">
        <Stack.Screen options={{ title: '公司管理' }} />
        <Text className="text-muted-foreground">你無權限。</Text>
      </View>
    );
  }

  const getDraft = (c: Company) => drafts[c.id] ?? c.name;

  const onCreate = () => {
    const name = newName.trim();
    if (!name) return;
    const result = useAppStore.getState().actions.adminCreateCompany({ name });
    if (!result.ok) return;
    setNewName('');
  };

  const onSave = (c: Company) => {
    const name = getDraft(c).trim();
    if (!name) return;
    const result = useAppStore.getState().actions.adminUpdateCompany({ companyId: c.id, name });
    if (!result.ok) return;
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[c.id];
      return next;
    });
  };

  const onDelete = (c: Company) => {
    Alert.alert('刪除公司', `確定刪除「${c.name}」？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '刪除',
        style: 'destructive',
        onPress: () => {
          const result = useAppStore.getState().actions.adminDeleteCompany({ companyId: c.id });
          if (!result.ok && result.error === 'IN_USE') Alert.alert('無法刪除', '仍有職位或用戶正在使用。');
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-background px-4 py-6">
      <Stack.Screen options={{ title: '公司管理' }} />

      <View className="bg-card rounded-2xl p-4">
        <Text className="text-foreground font-semibold">新增公司</Text>
        <TextInput value={newName} onChangeText={setNewName} className="text-foreground mt-3 rounded-xl border border-border px-3 py-3" />
        <Pressable className="bg-primary mt-4 rounded-xl px-4 py-3" onPress={onCreate}>
          <Text className="text-primary-foreground font-semibold text-center">新增</Text>
        </Pressable>
      </View>

      <View className="mt-6 gap-3">
        {items.map((c) => (
          <View key={c.id} className="bg-card rounded-2xl p-4">
            <TextInput
              value={getDraft(c)}
              onChangeText={(t) => setDrafts((prev) => ({ ...prev, [c.id]: t }))}
              className="text-foreground rounded-xl border border-border px-3 py-3"
            />
            <View className="mt-4 flex-row gap-2">
              <Pressable className="bg-primary flex-1 rounded-xl px-4 py-3" onPress={() => onSave(c)}>
                <Text className="text-primary-foreground font-semibold text-center">儲存</Text>
              </Pressable>
              <Pressable className="bg-destructive flex-1 rounded-xl px-4 py-3" onPress={() => onDelete(c)}>
                <Text className="text-destructive-foreground font-semibold text-center">刪除</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

