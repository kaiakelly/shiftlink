import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';

import type { Position, Skill } from '@/src/types';
import { getCurrentUser, useAppStore } from '@/src/store/useAppStore';

export default function AdminSkillsScreen() {
  const me = useAppStore((s) => getCurrentUser(s));
  const positionsEntity = useAppStore((s) => s.entities.positions);
  const companiesById = useAppStore((s) => s.entities.companies.byId);
  const skillsEntity = useAppStore((s) => s.entities.skills);

  const positions = useMemo(() => {
    return positionsEntity.allIds.map((id) => positionsEntity.byId[id]).filter(Boolean);
  }, [positionsEntity]);

  const items = useMemo(() => {
    return skillsEntity.allIds.map((id) => skillsEntity.byId[id]).filter(Boolean);
  }, [skillsEntity]);

  const [newPositionId, setNewPositionId] = useState('');
  const [newName, setNewName] = useState('');
  const [drafts, setDrafts] = useState<Record<string, { positionId: string; name: string }>>({});

  if (!me || me.role !== 'admin') {
    return (
      <View className="flex-1 bg-background px-4 py-6">
        <Stack.Screen options={{ title: '技能管理' }} />
        <Text className="text-muted-foreground">你無權限。</Text>
      </View>
    );
  }

  const getPositionLabel = (positionId: string) => {
    const p = positionsEntity.byId[positionId];
    if (!p) return '';
    const company = companiesById[p.companyId];
    return `${company?.name ?? ''} · ${p.name}`;
  };

  const getDraft = (s: Skill) => drafts[s.id] ?? { positionId: s.positionId, name: s.name };

  const cyclePosition = (current: string) => {
    if (positions.length === 0) return current;
    const idx = positions.findIndex((p) => p.id === current);
    const next = positions[(idx + 1 + positions.length) % positions.length]!;
    return next.id;
  };

  const onCreate = () => {
    const positionId = newPositionId || positions[0]?.id || '';
    const name = newName.trim();
    if (!positionId || !name) return;
    const result = useAppStore.getState().actions.adminCreateSkill({ positionId, name });
    if (!result.ok) return;
    setNewPositionId('');
    setNewName('');
  };

  const onSave = (s: Skill) => {
    const d = getDraft(s);
    const name = d.name.trim();
    if (!d.positionId || !name) return;
    const result = useAppStore.getState().actions.adminUpdateSkill({ skillId: s.id, positionId: d.positionId, name });
    if (!result.ok) return;
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[s.id];
      return next;
    });
  };

  const onDelete = (s: Skill) => {
    Alert.alert('刪除技能', `確定刪除「${s.name}」？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '刪除',
        style: 'destructive',
        onPress: () => {
          const result = useAppStore.getState().actions.adminDeleteSkill({ skillId: s.id });
          if (!result.ok && result.error === 'IN_USE') Alert.alert('無法刪除', '仍有用戶或帖子正在使用。');
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-background px-4 py-6">
      <Stack.Screen options={{ title: '技能管理' }} />

      <View className="bg-card rounded-2xl p-4">
        <Text className="text-foreground font-semibold">新增技能</Text>
        <Pressable
          className="bg-background mt-3 rounded-xl border border-border px-3 py-3"
          onPress={() => setNewPositionId((prev) => cyclePosition(prev || positions[0]?.id || ''))}>
          <Text className="text-foreground font-semibold">{getPositionLabel(newPositionId || positions[0]?.id || '') || '未選職位'}</Text>
        </Pressable>
        <TextInput value={newName} onChangeText={setNewName} className="text-foreground mt-3 rounded-xl border border-border px-3 py-3" />
        <Pressable className="bg-primary mt-4 rounded-xl px-4 py-3" onPress={onCreate}>
          <Text className="text-primary-foreground font-semibold text-center">新增</Text>
        </Pressable>
      </View>

      <View className="mt-6 gap-3">
        {items.map((s) => {
          const d = getDraft(s);
          return (
            <View key={s.id} className="bg-card rounded-2xl p-4">
              <Pressable
                className="bg-background rounded-xl border border-border px-3 py-3"
                onPress={() => setDrafts((prev) => ({ ...prev, [s.id]: { ...d, positionId: cyclePosition(d.positionId) } }))}>
                <Text className="text-foreground font-semibold">{getPositionLabel(d.positionId) || '未選職位'}</Text>
              </Pressable>
              <TextInput
                value={d.name}
                onChangeText={(t) => setDrafts((prev) => ({ ...prev, [s.id]: { ...d, name: t } }))}
                className="text-foreground mt-3 rounded-xl border border-border px-3 py-3"
              />
              <View className="mt-4 flex-row gap-2">
                <Pressable className="bg-primary flex-1 rounded-xl px-4 py-3" onPress={() => onSave(s)}>
                  <Text className="text-primary-foreground font-semibold text-center">儲存</Text>
                </Pressable>
                <Pressable className="bg-destructive flex-1 rounded-xl px-4 py-3" onPress={() => onDelete(s)}>
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

