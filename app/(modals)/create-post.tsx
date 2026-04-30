import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';

import { getCurrentUser, useAppStore } from '@/src/store/useAppStore';

type Params = {
  boardType?: 'swap' | 'square';
};

export default function CreatePostModal() {
  const params = useLocalSearchParams<Params>();
  const boardType = (params.boardType ?? 'square') as 'swap' | 'square';

  const user = useAppStore((s) => getCurrentUser(s));
  const isGuest = useAppStore((s) => s.session.isGuest);

  const titleLabel = useMemo(() => (boardType === 'swap' ? '換班牆發帖' : '廣場發帖'), [boardType]);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const onSubmit = () => {
    if (isGuest) {
      router.replace('/(auth)/login');
      return;
    }
    if (!user) return;

    const nextTitle = title.trim();
    const nextContent = content.trim();
    if (!nextTitle || !nextContent) {
      Alert.alert('請填寫', '標題與內容都要有。');
      return;
    }

    const result = useAppStore.getState().actions.createPost({
      boardType,
      title: nextTitle,
      content: nextContent,
      skillIds: [],
    });

    if (!result.ok) {
      Alert.alert('發帖失敗', '請先登入或稍後再試。');
      return;
    }

    router.back();
  };

  return (
    <View className="flex-1 bg-background px-4 py-6">
      <Text className="text-foreground text-2xl font-semibold">{titleLabel}</Text>
      <Text className="text-muted-foreground mt-2">{boardType === 'swap' ? '只會顯示比同公司同事' : '全局公開'}</Text>

      <View className="bg-card mt-6 rounded-2xl p-4">
        <Text className="text-muted-foreground text-sm">標題</Text>
        <TextInput value={title} onChangeText={setTitle} className="text-foreground mt-2 rounded-xl border border-border px-3 py-3" />

        <Text className="text-muted-foreground mt-4 text-sm">內容</Text>
        <TextInput
          value={content}
          onChangeText={setContent}
          multiline
          className="text-foreground mt-2 h-32 rounded-xl border border-border px-3 py-3"
        />

        <Pressable className="bg-primary mt-5 rounded-xl px-4 py-3" onPress={onSubmit}>
          <Text className="text-primary-foreground font-semibold text-center">發佈</Text>
        </Pressable>
        <Pressable className="mt-4" onPress={() => router.back()}>
          <Text className="text-muted-foreground font-semibold text-center">取消</Text>
        </Pressable>
      </View>
    </View>
  );
}

