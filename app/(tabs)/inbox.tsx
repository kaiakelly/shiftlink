import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { useAppStore } from '@/src/store/useAppStore';

export default function InboxScreen() {
  const session = useAppStore((s) => s.session);

  return (
    <View className="flex-1 bg-background px-4 py-6">
      <Text className="text-foreground text-2xl font-semibold">私訊</Text>
      <Text className="text-muted-foreground mt-2">
        {session.isGuest ? '請先登入以使用私訊與換更協商。' : '私訊功能將在下一步接入 Thread/Message。'}
      </Text>
      {session.isGuest ? (
        <Pressable className="bg-primary mt-6 rounded-xl px-4 py-3" onPress={() => router.push('/(auth)/login')}>
          <Text className="text-primary-foreground font-semibold text-center">去登入</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
