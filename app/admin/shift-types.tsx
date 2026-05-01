import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';

import type { ShiftType } from '@/src/types';
import { getCurrentUser, useAppStore } from '@/src/store/useAppStore';

const colorOptions = ['emerald', 'sky', 'violet', 'amber', 'zinc'] as const;

export default function AdminShiftTypesScreen() {
  const me = useAppStore((s) => getCurrentUser(s));
  const shiftTypesEntity = useAppStore((s) => s.entities.shiftTypes);

  const items = useMemo(() => {
    return shiftTypesEntity.allIds
      .map((id) => shiftTypesEntity.byId[id])
      .filter((st) => st && st.id !== 'shift_none');
  }, [shiftTypesEntity]);

  const [newName, setNewName] = useState('');
  const [newShortName, setNewShortName] = useState('');
  const [newColor, setNewColor] = useState<(typeof colorOptions)[number]>('zinc');

  const [drafts, setDrafts] = useState<Record<string, { name: string; shortName: string; colorTag: string }>>({});

  if (!me || me.role !== 'admin') {
    return (
      <View className="flex-1 bg-background px-4 py-6">
        <Stack.Screen options={{ title: '班次類型' }} />
        <Text className="text-muted-foreground">你無權限。</Text>
      </View>
    );
  }

  const cycleColor = (current: string) => {
    const idx = Math.max(0, colorOptions.indexOf(current as any));
    return colorOptions[(idx + 1) % colorOptions.length]!;
  };

  const getDraft = (st: ShiftType) => drafts[st.id] ?? { name: st.name, shortName: st.shortName, colorTag: st.colorTag };

  const onCreate = () => {
    const name = newName.trim();
    const shortName = newShortName.trim().slice(0, 2);
    if (!name || !shortName) return;
    const result = useAppStore.getState().actions.adminCreateShiftType({ name, shortName, colorTag: newColor });
    if (!result.ok) return;
    setNewName('');
    setNewShortName('');
    setNewColor('zinc');
  };

  const onSave = (st: ShiftType) => {
    const d = getDraft(st);
    const name = d.name.trim();
    const shortName = d.shortName.trim().slice(0, 2);
    if (!name || !shortName) return;
    const result = useAppStore.getState().actions.adminUpdateShiftType({ shiftTypeId: st.id, name, shortName, colorTag: d.colorTag });
    if (!result.ok) return;
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[st.id];
      return next;
    });
  };

  const onDelete = (st: ShiftType) => {
    Alert.alert('刪除班次類型', `確定刪除「${st.name}」？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '刪除',
        style: 'destructive',
        onPress: () => {
          const result = useAppStore.getState().actions.adminDeleteShiftType({ shiftTypeId: st.id });
          if (!result.ok && result.error === 'IN_USE') Alert.alert('無法刪除', '仍有日曆班表正在使用。');
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-background px-4 py-6">
      <Stack.Screen options={{ title: '班次類型' }} />

      <View className="bg-card rounded-2xl p-4">
        <Text className="text-foreground font-semibold">新增班次類型</Text>
        <TextInput value={newName} onChangeText={setNewName} className="text-foreground mt-3 rounded-xl border border-border px-3 py-3" />
        <TextInput value={newShortName} onChangeText={setNewShortName} className="text-foreground mt-3 rounded-xl border border-border px-3 py-3" />
        <Pressable className="bg-background mt-3 rounded-xl border border-border px-3 py-3" onPress={() => setNewColor((c) => cycleColor(c))}>
          <Text className="text-foreground font-semibold">色：{newColor}</Text>
        </Pressable>
        <Pressable className="bg-primary mt-4 rounded-xl px-4 py-3" onPress={onCreate}>
          <Text className="text-primary-foreground font-semibold text-center">新增</Text>
        </Pressable>
      </View>

      <View className="mt-6 gap-3">
        {items.map((st) => {
          const d = getDraft(st);
          return (
            <View key={st.id} className="bg-card rounded-2xl p-4">
              <TextInput
                value={d.name}
                onChangeText={(t) => setDrafts((prev) => ({ ...prev, [st.id]: { ...d, name: t } }))}
                className="text-foreground rounded-xl border border-border px-3 py-3"
              />
              <TextInput
                value={d.shortName}
                onChangeText={(t) => setDrafts((prev) => ({ ...prev, [st.id]: { ...d, shortName: t } }))}
                className="text-foreground mt-3 rounded-xl border border-border px-3 py-3"
              />
              <Pressable
                className="bg-background mt-3 rounded-xl border border-border px-3 py-3"
                onPress={() => setDrafts((prev) => ({ ...prev, [st.id]: { ...d, colorTag: cycleColor(d.colorTag) } }))}>
                <Text className="text-foreground font-semibold">色：{d.colorTag}</Text>
              </Pressable>

              <View className="mt-4 flex-row gap-2">
                <Pressable className="bg-primary flex-1 rounded-xl px-4 py-3" onPress={() => onSave(st)}>
                  <Text className="text-primary-foreground font-semibold text-center">儲存</Text>
                </Pressable>
                <Pressable className="bg-destructive flex-1 rounded-xl px-4 py-3" onPress={() => onDelete(st)}>
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

