import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { getCurrentUser, useAppStore } from '@/src/store/useAppStore';

export default function OnboardingScreen() {
  const session = useAppStore((s) => s.session);
  const user = useAppStore((s) => getCurrentUser(s));
  const companies = useAppStore((s) => s.entities.companies.allIds.map((id) => s.entities.companies.byId[id]).filter(Boolean));
  const positionsAll = useAppStore((s) => s.entities.positions.allIds.map((id) => s.entities.positions.byId[id]).filter(Boolean));
  const skillsAll = useAppStore((s) => s.entities.skills.allIds.map((id) => s.entities.skills.byId[id]).filter(Boolean));

  const [companyId, setCompanyId] = useState<string>('');
  const [positionId, setPositionId] = useState<string>('');
  const [skillIds, setSkillIds] = useState<string[]>([]);

  useEffect(() => {
    if (session.isGuest) router.replace('/(auth)/login');
  }, [session.isGuest]);

  useEffect(() => {
    if (user?.role === 'admin') router.replace('/(tabs)');
  }, [user?.role]);

  useEffect(() => {
    if (user && user.companyId && user.positionId) router.replace('/(tabs)');
  }, [user]);

  const positions = useMemo(() => positionsAll.filter((p) => p.companyId === companyId), [companyId, positionsAll]);
  const skills = useMemo(() => skillsAll.filter((s) => s.positionId === positionId), [positionId, skillsAll]);

  const toggleSkill = (id: string) => {
    setSkillIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const canSubmit = !!companyId && !!positionId;

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 py-6" contentContainerClassName="pb-10">
        <Text className="text-foreground text-2xl font-semibold">完善資料</Text>
        <Text className="text-muted-foreground mt-2">公司與職位一旦選定不可自行修改（需申請轉調）</Text>

        <View className="mt-6">
          <Text className="text-foreground font-semibold">公司</Text>
          <View className="mt-3 gap-2">
            {companies.map((c) => (
              <Pressable
                key={c.id}
                className={companyId === c.id ? 'bg-primary rounded-xl px-4 py-3' : 'bg-card rounded-xl px-4 py-3'}
                onPress={() => {
                  setCompanyId(c.id);
                  setPositionId('');
                  setSkillIds([]);
                }}>
                <Text className={companyId === c.id ? 'text-primary-foreground font-semibold' : 'text-foreground font-semibold'}>{c.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="mt-8">
          <Text className="text-foreground font-semibold">職位</Text>
          <View className="mt-3 gap-2">
            {positions.map((p) => (
              <Pressable
                key={p.id}
                className={positionId === p.id ? 'bg-primary rounded-xl px-4 py-3' : 'bg-card rounded-xl px-4 py-3'}
                onPress={() => {
                  setPositionId(p.id);
                  setSkillIds([]);
                }}>
                <Text className={positionId === p.id ? 'text-primary-foreground font-semibold' : 'text-foreground font-semibold'}>{p.name}</Text>
              </Pressable>
            ))}
            {!companyId ? <Text className="text-muted-foreground">請先選公司</Text> : null}
          </View>
        </View>

        <View className="mt-8">
          <Text className="text-foreground font-semibold">技能（可隨時修改）</Text>
          <View className="mt-3 gap-2">
            {skills.map((s) => (
              <Pressable
                key={s.id}
                className={skillIds.includes(s.id) ? 'bg-primary rounded-xl px-4 py-3' : 'bg-card rounded-xl px-4 py-3'}
                onPress={() => toggleSkill(s.id)}>
                <Text className={skillIds.includes(s.id) ? 'text-primary-foreground font-semibold' : 'text-foreground font-semibold'}>{s.name}</Text>
              </Pressable>
            ))}
            {positionId && skills.length === 0 ? <Text className="text-muted-foreground">此職位暫無技能標籤</Text> : null}
            {!positionId ? <Text className="text-muted-foreground">請先選職位</Text> : null}
          </View>
        </View>

        <Pressable
          className={canSubmit ? 'bg-primary mt-10 rounded-xl px-4 py-3' : 'bg-card mt-10 rounded-xl px-4 py-3'}
          disabled={!canSubmit}
          onPress={() => {
            useAppStore.getState().actions.completeOnboarding({ companyId, positionId, skillIds });
            router.replace('/(tabs)');
          }}>
          <Text className={canSubmit ? 'text-primary-foreground font-semibold text-center' : 'text-muted-foreground font-semibold text-center'}>
            完成
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

