import { Alert, Platform } from 'react-native';

export async function copyText(text: string): Promise<boolean> {
  const value = text ?? '';
  if (!value) return false;

  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return true;
  }

  try {
    const mod: any = await import('react-native/Libraries/Components/Clipboard/Clipboard');
    const clipboard = mod?.default ?? mod?.Clipboard ?? mod;
    if (typeof clipboard?.setString === 'function') {
      clipboard.setString(value);
      return true;
    }
    throw new Error('clipboard unavailable');
  } catch {
    Alert.alert('無法複製', '目前環境不支援一鍵複製。');
    return false;
  }
}
