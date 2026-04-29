import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';

import { useAppStore } from '@/src/store/useAppStore';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = () => {
    const result = useAppStore.getState().actions.login(username.trim(), password);
    if (!result.ok) {
      Alert.alert('登入失敗', result.error === 'USER_NOT_FOUND' ? '找不到帳號' : '密碼不正確');
      return;
    }
    router.replace('/(tabs)');
  };

  return (
    <View className="flex-1 bg-background px-4 py-6">
      <Text className="text-foreground text-2xl font-semibold">登入</Text>
      <Text className="text-muted-foreground mt-2">MVP 階段帳號密碼只存本機</Text>

      <View className="bg-card mt-6 rounded-2xl p-4">
        <Text className="text-muted-foreground text-sm">帳號</Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          className="text-foreground mt-2 rounded-xl border border-border px-3 py-3"
        />

        <Text className="text-muted-foreground mt-4 text-sm">密碼</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="text-foreground mt-2 rounded-xl border border-border px-3 py-3"
        />

        <Pressable className="bg-primary mt-5 rounded-xl px-4 py-3" onPress={onLogin}>
          <Text className="text-primary-foreground font-semibold text-center">登入</Text>
        </Pressable>

        <Pressable className="mt-4" onPress={() => router.push('/(auth)/register')}>
          <Text className="text-primary text-center font-semibold">沒有帳號？註冊</Text>
        </Pressable>
      </View>
    </View>
  );
}

