import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';

import { useAppStore } from '@/src/store/useAppStore';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');

  const onRegister = () => {
    const result = useAppStore.getState().actions.register({
      username: username.trim(),
      displayName: displayName.trim() || username.trim(),
      password,
    });

    if (!result.ok) {
      Alert.alert('註冊失敗', '帳號已存在');
      return;
    }

    router.replace('/(auth)/onboarding');
  };

  return (
    <View className="flex-1 bg-background px-4 py-6">
      <Text className="text-foreground text-2xl font-semibold">註冊</Text>
      <Text className="text-muted-foreground mt-2">註冊後需先完成公司/職位綁定</Text>

      <View className="bg-card mt-6 rounded-2xl p-4">
        <Text className="text-muted-foreground text-sm">帳號</Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          className="text-foreground mt-2 rounded-xl border border-border px-3 py-3"
        />

        <Text className="text-muted-foreground mt-4 text-sm">顯示名稱</Text>
        <TextInput value={displayName} onChangeText={setDisplayName} className="text-foreground mt-2 rounded-xl border border-border px-3 py-3" />

        <Text className="text-muted-foreground mt-4 text-sm">密碼</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="text-foreground mt-2 rounded-xl border border-border px-3 py-3"
        />

        <Pressable className="bg-primary mt-5 rounded-xl px-4 py-3" onPress={onRegister}>
          <Text className="text-primary-foreground font-semibold text-center">下一步</Text>
        </Pressable>

        <Pressable className="mt-4" onPress={() => router.replace('/(auth)/login')}>
          <Text className="text-primary text-center font-semibold">已有帳號？登入</Text>
        </Pressable>
      </View>
    </View>
  );
}

