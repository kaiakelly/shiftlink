import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View, useColorScheme } from 'react-native';

import type { Shift, ShiftType } from '@/src/types';
import { getCurrentUser, useAppStore } from '@/src/store/useAppStore';
import { addDays, buildMonthGrid, formatDate, formatMonth, monthLabel, parseDate, startOfMonth } from '@/src/utils/date';

const weekdayLabels = ['一', '二', '三', '四', '五', '六', '日'];

const shiftColor: Record<string, { bg: string; text: string }> = {
  emerald: { bg: 'bg-emerald-500/15', text: 'text-emerald-700 dark:text-emerald-200' },
  sky: { bg: 'bg-sky-500/15', text: 'text-sky-700 dark:text-sky-200' },
  violet: { bg: 'bg-violet-500/15', text: 'text-violet-700 dark:text-violet-200' },
  amber: { bg: 'bg-amber-500/15', text: 'text-amber-700 dark:text-amber-200' },
  zinc: { bg: 'bg-zinc-500/15', text: 'text-zinc-700 dark:text-zinc-200' },
};

const emojiOptions = ['😀', '😴', '💪', '🔥', '🎉', '❤️'];

export default function CalendarScreen() {
  const scheme = useColorScheme();
  const iconColor = scheme === 'dark' ? 'white' : 'black';
  const user = useAppStore((s) => getCurrentUser(s));
  const isGuest = useAppStore((s) => s.session.isGuest);
  const shiftTypesEntity = useAppStore((s) => s.entities.shiftTypes);
  const shiftsEntity = useAppStore((s) => s.entities.shifts);
  const monthSavesEntity = useAppStore((s) => s.entities.monthSaves);

  const [monthStart, setMonthStart] = useState(() => startOfMonth(new Date()));
  const [focusedDate, setFocusedDate] = useState(() => formatDate(new Date()));

  const monthKey = useMemo(() => formatMonth(monthStart), [monthStart]);

  const cells = useMemo(() => buildMonthGrid(monthStart), [monthKey]);

  const shiftTypes = useMemo(() => {
    return shiftTypesEntity.allIds
      .map((id) => shiftTypesEntity.byId[id])
      .filter((st) => st && st.id !== 'shift_none');
  }, [shiftTypesEntity]);

  const shiftTypeById = useMemo(() => {
    const map: Record<string, ShiftType> = {};
    for (const id of shiftTypesEntity.allIds) {
      const st = shiftTypesEntity.byId[id];
      if (st) map[id] = st;
    }
    return map;
  }, [shiftTypesEntity]);

  const shiftsByDate = useMemo(() => {
    if (!user) return {};
    const map: Record<string, Shift> = {};
    for (const id of shiftsEntity.allIds) {
      const shift = shiftsEntity.byId[id];
      if (!shift) continue;
      if (shift.userId !== user.id) continue;
      map[shift.date] = shift;
    }
    return map;
  }, [shiftsEntity, user]);

  const monthSave = useMemo(() => {
    if (!user) return null;
    const id = `month_${user.id}_${monthKey}`;
    return monthSavesEntity.byId[id] ?? null;
  }, [monthKey, monthSavesEntity, user]);

  const isMonthDirty = useMemo(() => {
    if (!user) return false;
    const prefix = `${monthKey}-`;
    let latest = '';
    for (const id of shiftsEntity.allIds) {
      const shift = shiftsEntity.byId[id];
      if (!shift) continue;
      if (shift.userId !== user.id) continue;
      if (!shift.date.startsWith(prefix)) continue;
      if (!latest || shift.updatedAt > latest) latest = shift.updatedAt;
    }
    if (!latest) return false;
    if (!monthSave?.savedAt) return true;
    return latest > monthSave.savedAt;
  }, [monthKey, monthSave, shiftsEntity, user]);

  const goMonth = (delta: number) => {
    const next = new Date(monthStart.getFullYear(), monthStart.getMonth() + delta, 1);
    setMonthStart(next);
    const fd = parseDate(focusedDate);
    if (fd.getFullYear() !== next.getFullYear() || fd.getMonth() !== next.getMonth()) {
      setFocusedDate(formatDate(next));
    }
  };

  const advanceFocus = () => {
    const next = addDays(parseDate(focusedDate), 1);
    setFocusedDate(formatDate(next));
    const nextMonthStart = startOfMonth(next);
    if (formatMonth(nextMonthStart) !== monthKey) {
      setMonthStart(nextMonthStart);
    }
  };

  const onPickShiftType = (shiftTypeId: string) => {
    if (isGuest) {
      router.push('/(auth)/login');
      return;
    }
    if (!user) return;

    useAppStore.getState().actions.setShift({ date: focusedDate, shiftTypeId });
    advanceFocus();
  };

  const onPickEmoji = (emoji: string | null) => {
    if (isGuest) {
      router.push('/(auth)/login');
      return;
    }
    const result = useAppStore.getState().actions.setShiftEmoji({ date: focusedDate, emoji });
    if (!result.ok && result.error === 'VIP_REQUIRED') {
      Alert.alert('需要 VIP', 'VIP 才可以設定每日 emoji。');
    }
    if (result.ok) {
      advanceFocus();
    }
  };

  const onClearShift = () => {
    const result = useAppStore.getState().actions.clearShift({ date: focusedDate });
    if (!result.ok) router.push('/(auth)/login');
    if (result.ok) advanceFocus();
  };

  const onSaveMonth = () => {
    if (!isMonthDirty) return;
    const result = useAppStore.getState().actions.saveMonth({ month: monthKey });
    if (!result.ok) {
      router.push('/(auth)/login');
      return;
    }
  };

  if (isGuest) {
    return (
      <View className="flex-1 bg-background px-4 py-6">
        <Text className="text-foreground text-2xl font-semibold">日曆</Text>
        <Text className="text-muted-foreground mt-2">遊客模式只可瀏覽廣場。</Text>
        <Pressable className="bg-primary mt-6 rounded-xl px-4 py-3" onPress={() => router.push('/(auth)/login')}>
          <Text className="text-primary-foreground font-semibold text-center">去登入</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="px-4 pt-6">
        <View className="flex-row items-center justify-between">
          <Pressable className="bg-card rounded-xl px-3 py-2" onPress={() => goMonth(-1)}>
            <FontAwesome name="chevron-left" size={16} color={iconColor} />
          </Pressable>
          <Text className="text-foreground text-lg font-semibold">{monthLabel(monthStart)}</Text>
          <Pressable className="bg-card rounded-xl px-3 py-2" onPress={() => goMonth(1)}>
            <FontAwesome name="chevron-right" size={16} color={iconColor} />
          </Pressable>
        </View>

        <View className="mt-4 flex-row">
          {weekdayLabels.map((label) => (
            <View key={label} style={{ width: `${100 / 7}%` }} className="items-center">
              <Text className="text-muted-foreground text-xs">{label}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView className="flex-1 px-2" contentContainerStyle={{ paddingBottom: 96 }}>
        <View className="mt-2 flex-row flex-wrap">
          {cells.map((cell) => {
            const isFocused = cell.date === focusedDate;
            const shift = user ? shiftsByDate[cell.date] : undefined;
            const shiftType = shift && shift.shiftTypeId !== 'shift_none' ? shiftTypeById[shift.shiftTypeId] : undefined;
            const badge = shiftType ? shiftColor[shiftType.colorTag] : undefined;
            const borderCls = isFocused ? 'border-primary' : 'border-transparent';

            return (
              <Pressable
                key={cell.date}
                style={{ width: `${100 / 7}%` }}
                onPress={() => setFocusedDate(cell.date)}
                className="p-1">
                <View className={`rounded-xl bg-card p-2 border ${borderCls}`}>
                  <Text className={cell.inMonth ? 'text-foreground text-xs' : 'text-muted-foreground text-xs'}>{cell.day}</Text>
                  {shiftType ? (
                    <View className="mt-1 flex-row items-center justify-between">
                      <View className={`rounded-md px-2 py-0.5 ${badge?.bg ?? 'bg-card'}`}>
                        <Text className={`text-xs font-semibold ${badge?.text ?? 'text-foreground'}`}>{shiftType.shortName}</Text>
                      </View>
                      {shift?.emoji ? <Text className="text-xs">{shift.emoji}</Text> : null}
                    </View>
                  ) : (
                    <View className="mt-1 h-5" />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-background px-4 py-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-foreground font-semibold">{focusedDate}</Text>
          <Pressable className={isMonthDirty ? 'bg-primary rounded-xl px-4 py-2' : 'bg-card rounded-xl px-4 py-2'} onPress={onSaveMonth}>
            <Text className={isMonthDirty ? 'text-primary-foreground font-semibold' : 'text-foreground font-semibold'}>
              {isMonthDirty ? '儲存' : '已儲存'}
            </Text>
          </Pressable>
        </View>

        <View className="mt-3 flex-row gap-2">
          {shiftTypes.map((st) => {
            const color = shiftColor[st.colorTag];
            return (
              <Pressable key={st.id} className={`rounded-xl px-3 py-2 ${color?.bg ?? 'bg-card'}`} onPress={() => onPickShiftType(st.id)}>
                <Text className={`font-semibold ${color?.text ?? 'text-foreground'}`}>{st.name}</Text>
              </Pressable>
            );
          })}
          <Pressable
            className={shiftsByDate[focusedDate] && shiftsByDate[focusedDate]?.shiftTypeId !== 'shift_none' ? 'bg-card rounded-xl px-3 py-2' : 'bg-card rounded-xl px-3 py-2 opacity-50'}
            disabled={!shiftsByDate[focusedDate] || shiftsByDate[focusedDate]?.shiftTypeId === 'shift_none'}
            onPress={onClearShift}>
            <Text className="text-muted-foreground font-semibold">🗑</Text>
          </Pressable>
        </View>

        {user?.isVip ? (
          <View className="mt-3 flex-row items-center justify-between">
            <View className="flex-row gap-2">
              {emojiOptions.map((emoji) => (
                <Pressable key={emoji} className="bg-card rounded-xl px-3 py-2" onPress={() => onPickEmoji(emoji)}>
                  <Text className="text-base">{emoji}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable className="bg-card rounded-xl px-3 py-2" onPress={() => onPickEmoji(null)}>
              <Text className="text-muted-foreground font-semibold">清除</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </View>
  );
}
