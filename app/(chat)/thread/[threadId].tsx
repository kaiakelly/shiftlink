import { router, Stack, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, FlatList, Image, Pressable, Text, TextInput, View } from 'react-native';

import { getCurrentUser, useAppStore } from '@/src/store/useAppStore';

function ConfettiOverlay({ visible }: { visible: boolean }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    progress.setValue(0);
    Animated.timing(progress, { toValue: 1, duration: 900, useNativeDriver: true }).start();
  }, [progress, visible]);

  if (!visible) return null;

  const pieces = Array.from({ length: 14 }).map((_, i) => {
    const delay = (i % 7) * 60;
    const left = 12 + ((i * 28) % 320);
    const rotate = progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '540deg'] });
    const opacity = progress.interpolate({ inputRange: [0, 0.9, 1], outputRange: [1, 1, 0] });
    const translateYDelayed = progress.interpolate({
      inputRange: [0, delay / 900, 1],
      outputRange: [-20, -20, 520],
    });
    return (
      <Animated.View
        key={String(left)}
        style={{
          position: 'absolute',
          top: 0,
          left,
          opacity,
          transform: [{ translateY: translateYDelayed }, { rotate }],
        }}>
        <Text className="text-2xl">{i % 3 === 0 ? '✨' : i % 3 === 1 ? '🎉' : '🎊'}</Text>
      </Animated.View>
    );
  });

  return (
    <View className="absolute inset-0 pointer-events-none">
      <View className="absolute inset-0">{pieces}</View>
    </View>
  );
}

export default function ThreadScreen() {
  const params = useLocalSearchParams<{ threadId?: string }>();
  const threadId = params.threadId ?? '';

  const session = useAppStore((s) => s.session);
  const me = useAppStore((s) => getCurrentUser(s));
  const threadsEntity = useAppStore((s) => s.entities.threads);
  const messagesEntity = useAppStore((s) => s.entities.messages);
  const usersById = useAppStore((s) => s.entities.users.byId);

  const thread = threadId ? threadsEntity.byId[threadId] : undefined;

  const peer = useMemo(() => {
    if (!thread || !me) return null;
    const [a, b] = thread.participantIds;
    const peerId = a === me.id ? b : a;
    return usersById[peerId] ?? null;
  }, [me, thread, usersById]);

  const title = peer?.displayName || peer?.username || '私訊';

  const messages = useMemo(() => {
    if (!threadId) return [];
    const list = messagesEntity.allIds.map((id) => messagesEntity.byId[id]).filter((m) => m && m.threadId === threadId);
    list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return list;
  }, [messagesEntity, threadId]);

  const [text, setText] = useState('');
  const [celebrate, setCelebrate] = useState(false);

  const canSend = !!text.trim();
  const isReady = !session.isGuest && !!me && !!thread;

  const onSend = () => {
    if (!isReady) return;
    const next = text.trim();
    if (!next) return;
    useAppStore.getState().actions.sendMessage({ threadId, text: next });
    setText('');
  };

  const onPickImage = async (source: 'library' | 'camera') => {
    if (!isReady) return;
    try {
      if (source === 'camera') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) return;
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) return;
      }

      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 })
          : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });

      if (result.canceled) return;
      const uri = result.assets?.[0]?.uri;
      if (!uri) return;

      useAppStore.getState().actions.sendImageMessage({ threadId, imageUri: uri });
    } catch {
      Alert.alert('不支援', '此裝置暫時無法選取圖片。');
    }
  };

  const onOpenProposal = () => {
    if (!isReady) return;
    router.push({ pathname: '/(modals)/swap-proposal', params: { threadId } } as any);
  };

  const onRespondProposal = (messageId: string, status: 'accepted' | 'rejected') => {
    const result = useAppStore.getState().actions.respondSwapProposal({ messageId, status });
    if (!result.ok) {
      Alert.alert('操作失敗', '請稍後再試。');
      return;
    }
    if (status === 'accepted') {
      Alert.alert('更新日曆？', '是否即時更新雙方日曆？', [
        { text: '暫不更新', style: 'cancel' },
        {
          text: '更新',
          onPress: () => {
            const apply = useAppStore.getState().actions.applySwapProposal({ messageId });
            if (!apply.ok) {
              Alert.alert('更新失敗', '請稍後再試。');
              return;
            }
            setCelebrate(true);
            setTimeout(() => setCelebrate(false), 900);
          },
        },
      ]);
    }
  };

  const onApplyProposal = (messageId: string) => {
    const result = useAppStore.getState().actions.applySwapProposal({ messageId });
    if (!result.ok) {
      Alert.alert('更新失敗', '請稍後再試。');
      return;
    }
    setCelebrate(true);
    setTimeout(() => setCelebrate(false), 900);
  };

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title }} />
      <ConfettiOverlay visible={celebrate} />

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        className="flex-1 px-4 py-4"
        ItemSeparatorComponent={() => <View className="h-2" />}
        renderItem={({ item }) => {
          const isMe = item.senderId === me?.id;
          if (item.type === 'proposal' && item.proposal) {
            const p = item.proposal;
            const statusLabel = p.status === 'pending' ? '等待回覆' : p.status === 'accepted' ? '已同意' : '已拒絕';
            const canAct = !!me && p.toUserId === me.id && p.status === 'pending';
            const canApply = p.status === 'accepted' && !p.appliedAt && !!me && (p.fromUserId === me.id || p.toUserId === me.id);
            return (
              <View className={isMe ? 'items-end' : 'items-start'}>
                <View className="bg-card rounded-2xl p-4 max-w-[90%]">
                  <Text className="text-foreground font-semibold">換更提議</Text>
                  <Text className="text-muted-foreground mt-2">
                    {p.fromDate} ⇄ {p.toDate}
                  </Text>
                  <Text className="text-muted-foreground mt-2 text-xs">{p.appliedAt ? `${statusLabel} · 已更新日曆` : statusLabel}</Text>
                  {canAct ? (
                    <View className="mt-4 flex-row gap-2">
                      <Pressable className="bg-primary rounded-xl px-4 py-2" onPress={() => onRespondProposal(item.id, 'accepted')}>
                        <Text className="text-primary-foreground font-semibold">同意</Text>
                      </Pressable>
                      <Pressable className="bg-card rounded-xl px-4 py-2 border border-border" onPress={() => onRespondProposal(item.id, 'rejected')}>
                        <Text className="text-foreground font-semibold">拒絕</Text>
                      </Pressable>
                    </View>
                  ) : null}
                  {canApply ? (
                    <View className="mt-4">
                      <Pressable className="bg-primary rounded-xl px-4 py-2" onPress={() => onApplyProposal(item.id)}>
                        <Text className="text-primary-foreground font-semibold text-center">更新日曆</Text>
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              </View>
            );
          }

          if (item.type === 'system') {
            return (
              <View className="items-center">
                <View className="bg-card rounded-xl px-4 py-2">
                  <Text className="text-muted-foreground text-xs">{item.text ?? ''}</Text>
                </View>
              </View>
            );
          }

          if (item.type === 'image' && item.imageUri) {
            return (
              <View className={isMe ? 'items-end' : 'items-start'}>
                <View className="bg-card rounded-2xl p-2 max-w-[90%]">
                  <Image source={{ uri: item.imageUri }} style={{ width: 220, height: 220, borderRadius: 12 }} />
                </View>
              </View>
            );
          }

          return (
            <View className={isMe ? 'items-end' : 'items-start'}>
              <View className={isMe ? 'bg-primary rounded-2xl px-4 py-2 max-w-[80%]' : 'bg-card rounded-2xl px-4 py-2 max-w-[80%]'}>
                <Text className={isMe ? 'text-primary-foreground' : 'text-foreground'}>{item.text ?? ''}</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={() => (
          <View className="mt-10">
            <Text className="text-muted-foreground text-center">開始對話吧</Text>
          </View>
        )}
      />

      <View className="border-t border-border bg-background px-4 py-3">
        <View className="flex-row items-center gap-2">
          <Pressable disabled={!isReady} className={!isReady ? 'bg-card rounded-xl px-3 py-3 opacity-50' : 'bg-card rounded-xl px-3 py-3'} onPress={onOpenProposal}>
            <Text className="text-foreground font-semibold">換更</Text>
          </Pressable>
          <Pressable disabled={!isReady} className={!isReady ? 'bg-card rounded-xl px-3 py-3 opacity-50' : 'bg-card rounded-xl px-3 py-3'} onPress={() => onPickImage('library')}>
            <Text className="text-foreground font-semibold">相簿</Text>
          </Pressable>
          <Pressable disabled={!isReady} className={!isReady ? 'bg-card rounded-xl px-3 py-3 opacity-50' : 'bg-card rounded-xl px-3 py-3'} onPress={() => onPickImage('camera')}>
            <Text className="text-foreground font-semibold">相機</Text>
          </Pressable>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="輸入訊息…"
            placeholderTextColor="#999"
            className="flex-1 bg-card rounded-xl border border-border px-3 py-3 text-foreground"
          />
          <Pressable
            disabled={!isReady || !canSend}
            className={!isReady || !canSend ? 'bg-card rounded-xl px-4 py-3 opacity-50' : 'bg-primary rounded-xl px-4 py-3'}
            onPress={onSend}>
            <Text className={!isReady || !canSend ? 'text-muted-foreground font-semibold' : 'text-primary-foreground font-semibold'}>
              發送
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
