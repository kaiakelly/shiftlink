import { vars } from 'nativewind';
import type { PropsWithChildren } from 'react';
import { useColorScheme, View } from 'react-native';

const lightVars = {
  '--background': 'hsl(0, 0%, 100%)',
  '--card': 'hsl(0, 0%, 100%)',
  '--border': 'hsl(240, 5.9%, 90%)',
  '--foreground': 'hsl(240, 10%, 3.9%)',
  '--muted-foreground': 'hsl(240, 3.8%, 46.1%)',
  '--primary': 'hsl(221, 83%, 53%)',
  '--primary-foreground': 'hsl(210, 40%, 98%)',
  '--destructive': 'hsl(0, 84.2%, 60.2%)',
  '--destructive-foreground': 'hsl(210, 40%, 98%)',
};

const darkVars = {
  '--background': 'hsl(240, 10%, 3.9%)',
  '--card': 'hsl(240, 10%, 3.9%)',
  '--border': 'hsl(240, 3.7%, 15.9%)',
  '--foreground': 'hsl(210, 40%, 98%)',
  '--muted-foreground': 'hsl(240, 5%, 64.9%)',
  '--primary': 'hsl(217, 91%, 60%)',
  '--primary-foreground': 'hsl(240, 10%, 3.9%)',
  '--destructive': 'hsl(0, 62.8%, 30.6%)',
  '--destructive-foreground': 'hsl(210, 40%, 98%)',
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
