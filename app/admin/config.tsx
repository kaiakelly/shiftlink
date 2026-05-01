import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { getCurrentUser, useAppStore } from '@/src/store/useAppStore';

export default function AdminConfigScreen() {
  const me = useAppStore((s) => getCurrentUser(s));
  const appConfig = useAppStore((s) => s.appConfig);

  const [vipPrice, setVipPrice] = useState(() => String(appConfig.vipPriceMop));
  const [announcement, setAnnouncement] = useState(() => appConfig.globalAnnouncement);
  const [banned, setBanned] = useState(() => appConfig.bannedWords.join('\n'));

  const parsedPrice = useMemo(() => {
    const n = Number(vipPrice);
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
  }, [vipPrice]);

  if (!me || me.role !== 'admin') {
    return (
      <View className="flex-1 bg-background px-4 py-6">
        <Stack.Screen options={{ title: 'App 設定' }} />
        <Text className="text-muted-foreground">你無權限。</Text>
      </View>
    );
  }

  const onSave = () => {
    const bannedWords = banned
      .split('\n')
      .map((x) => x.trim())
      .filter(Boolean);
    useAppStore.getState().actions.adminUpdateConfig({
      vipPriceMop: parsedPrice,
      globalAnnouncement: announcement,
      bannedWords,
    });
  };

  return (
    <View className="flex-1 bg-background px-4 py-6">
      <Stack.Screen options={{ title: 'App 設定' }} />

      <View className="bg-card rounded-2xl p-4">
        <Text className="text-foreground font-semibold">VIP 價格（MOP）</Text>
        <TextInput value={vipPrice} onChangeText={setVipPrice} keyboardType="numeric" className="text-foreground mt-3 rounded-xl border border-border px-3 py-3" />

        <Text className="text-foreground font-semibold mt-6">公告</Text>
        <TextInput
          value={announcement}
          onChangeText={setAnnouncement}
          multiline
          className="text-foreground mt-3 h-24 rounded-xl border border-border px-3 py-3"
        />

        <Text className="text-foreground font-semibold mt-6">禁詞（每行一個）</Text>
        <TextInput value={banned} onChangeText={setBanned} multiline className="text-foreground mt-3 h-32 rounded-xl border border-border px-3 py-3" />

        <Pressable className="bg-primary mt-6 rounded-xl px-4 py-3" onPress={onSave}>
          <Text className="text-primary-foreground font-semibold text-center">儲存</Text>
        </Pressable>
      </View>
    </View>
  );
}

