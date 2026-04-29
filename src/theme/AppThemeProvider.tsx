import { vars } from 'nativewind';
import type { PropsWithChildren } from 'react';
import { useColorScheme, View } from 'react-native';

const lightVars = {
  '--background': '0 0% 100%',
  '--card': '0 0% 100%',
  '--border': '240 5.9% 90%',
  '--foreground': '240 10% 3.9%',
  '--muted-foreground': '240 3.8% 46.1%',
  '--primary': '221 83% 53%',
  '--primary-foreground': '210 40% 98%',
  '--destructive': '0 84.2% 60.2%',
  '--destructive-foreground': '210 40% 98%',
};

const darkVars = {
  '--background': '240 10% 3.9%',
  '--card': '240 10% 3.9%',
  '--border': '240 3.7% 15.9%',
  '--foreground': '210 40% 98%',
  '--muted-foreground': '240 5% 64.9%',
  '--primary': '217 91% 60%',
  '--primary-foreground': '240 10% 3.9%',
  '--destructive': '0 62.8% 30.6%',
  '--destructive-foreground': '210 40% 98%',
};

export function AppThemeProvider({ children }: PropsWithChildren) {
  const scheme = useColorScheme();
  const themeVars = scheme === 'dark' ? darkVars : lightVars;

  return (
    <View style={vars(themeVars)} className="flex-1 bg-background">
      {children}
    </View>
  );
}
