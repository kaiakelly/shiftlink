import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';

import type { Company, Position } from '@/src/types';
import { getCurrentUser, useAppStore } from '@/src/store/useAppStore';

export default function AdminPositionsScreen() {
  const me = useAppStore((s) => getCurrentUser(s));
  const companiesEntity = useAppStore((s) => s.entities.companies);
  const positionsEntity = useAppStore((s) => s.entities.positions);

  const companies = useMemo(() => {
    return companiesEntity.allIds.map((id) => companiesEntity.byId[id]).filter(Boolean);
  }, [companiesEntity]);

  const items = useMemo(() => {
    return positionsEntity.allIds.map((id) => positionsEntity.byId[id]).filter(Boolean);
  }, [positionsEntity]);

  const [newCompanyId, setNewCompanyId] = useState('');
  const [newName, setNewName] = useState('');
  const [drafts, setDrafts] = useState<Record<string, { companyId: string; name: string }>>({});

  if (!me || me.role !== 'admin') {
    return (
      <View className="flex-1 bg-background px-4 py-6">
        <Stack.Screen options={{ title: '職位管理' }} />
        <Text className="text-muted-foreground">你無權限。</Text>
      </View>
    );
  }

  const getCompanyName = (companyId: string) => {
    return companiesEntity.byId[companyId]?.name ?? '';
  };

  const getDraft = (p: Position) => drafts[p.id] ?? { companyId: p.companyId, name: p.name };

  const cycleCompany = (current: string) => {
    if (companies.length === 0) return current;
    const idx = companies.findIndex((c) => c.id === current);
    const next = companies[(idx + 1 + companies.length) % companies.length]!;
    return next.id;
  };

  const onCreate = () => {
    const companyId = newCompanyId || companies[0]?.id || '';
    const name = newName.trim();
    if (!companyId || !name) return;
    const result = useAppStore.getState().actions.adminCreatePosition({ companyId, name });
    if (!result.ok) return;
    setNewCompanyId('');
    setNewName('');
  };

  const onSave = (p: Position) => {
    const d = getDraft(p);
    const name = d.name.trim();
    if (!d.companyId || !name) return;
    const result = useAppStore.getState().actions.adminUpdatePosition({ positionId: p.id, companyId: d.companyId, name });
    if (!result.ok) return;
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[p.id];
      return next;
    });
  };

  const onDelete = (p: Position) => {
    Alert.alert('刪除職位', `確定刪除「${p.name}」？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '刪除',
        style: 'destructive',
        onPress: () => {
          const result = useAppStore.getState().actions.adminDeletePosition({ positionId: p.id });
          if (!result.ok && result.error === 'IN_USE') Alert.alert('無法刪除', '仍有技能或用戶正在使用。');
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-background px-4 py-6">
      <Stack.Screen options={{ title: '職位管理' }} />

      <View className="bg-card rounded-2xl p-4">
        <Text className="text-foreground font-semibold">新增職位</Text>
        <Pressable
          className="bg-background mt-3 rounded-xl border border-border px-3 py-3"
          onPress={() => setNewCompanyId((prev) => cycleCompany(prev || companies[0]?.id || ''))}>
          <Text className="text-foreground font-semibold">{getCompanyName(newCompanyId || companies[0]?.id || '') || '未選公司'}</Text>
        </Pressable>
        <TextInput value={newName} onChangeText={setNewName} className="text-foreground mt-3 rounded-xl border border-border px-3 py-3" />
        <Pressable className="bg-primary mt-4 rounded-xl px-4 py-3" onPress={onCreate}>
          <Text className="text-primary-foreground font-semibold text-center">新增</Text>
        </Pressable>
      </View>

      <View className="mt-6 gap-3">
        {items.map((p) => {
          const d = getDraft(p);
          return (
            <View key={p.id} className="bg-card rounded-2xl p-4">
              <Pressable
                className="bg-background rounded-xl border border-border px-3 py-3"
                onPress={() => setDrafts((prev) => ({ ...prev, [p.id]: { ...d, companyId: cycleCompany(d.companyId) } }))}>
                <Text className="text-foreground font-semibold">{getCompanyName(d.companyId) || '未選公司'}</Text>
              </Pressable>
              <TextInput
                value={d.name}
                onChangeText={(t) => setDrafts((prev) => ({ ...prev, [p.id]: { ...d, name: t } }))}
                className="text-foreground mt-3 rounded-xl border border-border px-3 py-3"
              />
              <View className="mt-4 flex-row gap-2">
                <Pressable className="bg-primary flex-1 rounded-xl px-4 py-3" onPress={() => onSave(p)}>
                  <Text className="text-primary-foreground font-semibold text-center">儲存</Text>
                </Pressable>
                <Pressable className="bg-destructive flex-1 rounded-xl px-4 py-3" onPress={() => onDelete(p)}>
                  <Text className="text-destructive-foreground font-semibold text-center">刪除</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

