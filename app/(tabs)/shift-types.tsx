import { useMemo, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';

import { useAppStore } from '@/src/store/useAppStore';

type Draft = { name: string; shortName: string };

export default function ShiftTypesScreen() {
  const shiftTypesEntity = useAppStore((s) => s.entities.shiftTypes);

  const items = useMemo(() => {
    return shiftTypesEntity.allIds.map((id) => shiftTypesEntity.byId[id]).filter(Boolean);
  }, [shiftTypesEntity]);

  const [drafts, setDrafts] = useState<Record<string, Draft>>({});

  const getDraft = (id: string, name: string, shortName: string): Draft => {
    return drafts[id] ?? { name, shortName };
  };

  const setDraft = (id: string, next: Draft) => {
    setDrafts((prev) => ({ ...prev, [id]: next }));
  };

  const onSave = (id: string, name: string, shortName: string) => {
    const nextName = name.trim();
    const nextShort = shortName.trim().slice(0, 2);
    if (!nextName || !nextShort) {
      Alert.alert('請填寫', '班次名稱與簡稱都要有。');
      return;
    }
    useAppStore.getState().actions.updateShiftType({ shiftTypeId: id, name: nextName, shortName: nextShort });
  };

  return (
    <View className="flex-1 bg-background px-4 py-6">
      <Text className="text-foreground text-2xl font-semibold">班次設定</Text>
      <Text className="text-muted-foreground mt-2">你可以把系統預設班次改成你想要的名稱與簡稱。</Text>

      <View className="mt-6 gap-3">
        {items.map((it) => {
          const d = getDraft(it.id, it.name, it.shortName);
          return (
            <View key={it.id} className="bg-card rounded-2xl p-4">
              <Text className="text-muted-foreground text-sm">名稱</Text>
              <TextInput
                value={d.name}
                onChangeText={(t) => setDraft(it.id, { ...d, name: t })}
                className="text-foreground mt-2 rounded-xl border border-border px-3 py-3"
              />

              <Text className="text-muted-foreground mt-4 text-sm">簡稱（最多 2 字）</Text>
              <TextInput
                value={d.shortName}
                onChangeText={(t) => setDraft(it.id, { ...d, shortName: t })}
                className="text-foreground mt-2 rounded-xl border border-border px-3 py-3"
              />

              <Pressable className="bg-primary mt-5 rounded-xl px-4 py-3" onPress={() => onSave(it.id, d.name, d.shortName)}>
                <Text className="text-primary-foreground font-semibold text-center">儲存</Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

