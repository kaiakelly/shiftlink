import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';

import { getCurrentUser, useAppStore } from '@/src/store/useAppStore';
import { formatDate } from '@/src/utils/date';

type Params = {
  threadId?: string;
};

function isValidDate(input: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(input);
}

export default function SwapProposalModal() {
  const params = useLocalSearchParams<Params>();
  const threadId = params.threadId ?? '';

  const me = useAppStore((s) => getCurrentUser(s));
  const session = useAppStore((s) => s.session);
  const threadsEntity = useAppStore((s) => s.entities.threads);
  const usersById = useAppStore((s) => s.entities.users.byId);

  const thread = threadId ? threadsEntity.byId[threadId] : undefined;

  const peerName = useMemo(() => {
    if (!me || !thread) return '';
    const [a, b] = thread.participantIds;
    const peerId = a === me.id ? b : a;
    const peer = usersById[peerId];
    return peer?.displayName ?? peer?.username ?? '';
  }, [me, thread, usersById]);

  const today = useMemo(() => formatDate(new Date()), []);
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  const onSubmit = () => {
    if (session.isGuest || !me) {
      router.replace('/(auth)/login');
      return;
    }
    if (!thread) {
      Alert.alert('無法發起', '找不到對話。');
      return;
    }
    const a = fromDate.trim();
    const b = toDate.trim();
    if (!isValidDate(a) || !isValidDate(b)) {
      Alert.alert('格式錯誤', '請輸入 YYYY-MM-DD，例如 2026-05-01。');
      return;
    }
    const result = useAppStore.getState().actions.sendSwapProposal({ threadId: thread.id, fromDate: a, toDate: b });
    if (!result.ok) {
      Alert.alert('發起失敗', '請稍後再試。');
      return;
    }
    router.back();
  };

  return (
    <View className="flex-1 bg-background px-4 py-6">
      <Text className="text-foreground text-2xl font-semibold">換更提議</Text>
      <Text className="text-muted-foreground mt-2">{peerName ? `發給：${peerName}` : ''}</Text>

      <View className="bg-card mt-6 rounded-2xl p-4">
        <Text className="text-muted-foreground text-sm">你的日期（YYYY-MM-DD）</Text>
        <TextInput
          value={fromDate}
          onChangeText={setFromDate}
          autoCapitalize="none"
          className="text-foreground mt-2 rounded-xl border border-border px-3 py-3"
        />

        <Text className="text-muted-foreground mt-4 text-sm">對方日期（YYYY-MM-DD）</Text>
        <TextInput
          value={toDate}
          onChangeText={setToDate}
          autoCapitalize="none"
          className="text-foreground mt-2 rounded-xl border border-border px-3 py-3"
        />

        <Pressable className="bg-primary mt-6 rounded-xl px-4 py-3" onPress={onSubmit}>
          <Text className="text-primary-foreground font-semibold text-center">送出提議</Text>
        </Pressable>

        <Pressable className="mt-4" onPress={() => router.back()}>
          <Text className="text-muted-foreground font-semibold text-center">取消</Text>
        </Pressable>
      </View>
    </View>
  );
}

