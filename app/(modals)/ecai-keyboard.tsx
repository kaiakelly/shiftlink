import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { ecaiPersonas, defaultPersonaId } from '@/src/ecai/personas';
import { copyText } from '@/src/ecai/clipboard';
import { mockGenerate } from '@/src/ecai/mockAi';
import type { EcaiAction, EcaiResult } from '@/src/ecai/types';
import { generateViaApi } from '@/src/ecai/apiClient';
import { useAppStore } from '@/src/store/useAppStore';

const actionLabels: Record<EcaiAction, string> = {
  translate: '翻譯',
  paraphrase: '改寫',
  proofread: '校對',
  rewrite: '人設改寫',
  reply: '回覆建議',
};

export default function EcaiKeyboardPrototypeScreen() {
  const [action, setAction] = useState<EcaiAction>('proofread');
  const [personaId, setPersonaId] = useState(defaultPersonaId);
  const [inputText, setInputText] = useState('我想問一下明天會唔會有空？我想約你食飯。');
  const [selectedText, setSelectedText] = useState('我想問一下明天會唔會有空？我想約你食飯。');
  const [contextText, setContextText] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<EcaiResult[]>([]);
  const [engine, setEngine] = useState<'local' | 'api'>('local');
  const [apiBaseUrl, setApiBaseUrl] = useState('http://localhost:8787');
  const [showCreatePersona, setShowCreatePersona] = useState(false);
  const [newPersonaName, setNewPersonaName] = useState('');
  const [newPersonaInstruction, setNewPersonaInstruction] = useState('');
  const [newPersonaEmoji, setNewPersonaEmoji] = useState<'none' | 'light' | 'more'>('none');
  const [newPersonaBannedWords, setNewPersonaBannedWords] = useState('');

  const customPersonas = useAppStore((s) => s.preferences.ecai.customPersonas);

  const allPersonas = useMemo(() => {
    return [...ecaiPersonas, ...customPersonas];
  }, [customPersonas]);

  const persona = useMemo(() => {
    return allPersonas.find((p) => p.id === personaId) ?? allPersonas[0];
  }, [allPersonas, personaId]);

  const canRun = useMemo(() => {
    if (action === 'reply') return !!(contextText.trim() || selectedText.trim());
    return !!selectedText.trim();
  }, [action, contextText, selectedText]);

  const run = async () => {
    if (!canRun) return;
    setLoading(true);
    setResults([]);
    try {
      if (engine === 'api') {
        const res = await generateViaApi({
          baseUrl: apiBaseUrl,
          request: {
            action,
            input: selectedText,
            context: contextText,
            persona,
          },
        });
        setResults(res.results ?? []);
      } else {
        await new Promise((r) => setTimeout(r, 450));
        const out = mockGenerate({
          action,
          input: selectedText,
          context: contextText,
          persona,
        });
        setResults(out);
      }
    } finally {
      setLoading(false);
    }
  };

  const onInsert = (text: string) => {
    setInputText(text);
    setSelectedText(text);
    Alert.alert('已插入', '已把結果寫入輸入框（原型模式）。');
  };

  const onCopy = async (text: string) => {
    const ok = await copyText(text);
    if (ok) Alert.alert('已複製', '已複製到剪貼簿。');
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 24 }}>
        <Text className="text-foreground text-xl font-semibold mt-4">ECAIKeyboard 原型</Text>
        <Text className="text-muted-foreground mt-2">
          這是可點的 UI 原型。可以用本地 mock 或本地 API server（契約與正式後端一致）。
        </Text>

        <View className="mt-5">
          <Text className="text-foreground font-semibold">引擎</Text>
          <View className="mt-3 flex-row gap-2">
            <Pressable
              className={engine === 'local' ? 'bg-primary rounded-full px-4 py-2' : 'bg-card rounded-full px-4 py-2'}
              onPress={() => setEngine('local')}>
              <Text className={engine === 'local' ? 'text-primary-foreground font-semibold' : 'text-foreground font-semibold'}>
                本地 mock
              </Text>
            </Pressable>
            <Pressable
              className={engine === 'api' ? 'bg-primary rounded-full px-4 py-2' : 'bg-card rounded-full px-4 py-2'}
              onPress={() => setEngine('api')}>
              <Text className={engine === 'api' ? 'text-primary-foreground font-semibold' : 'text-foreground font-semibold'}>
                本地 API
              </Text>
            </Pressable>
          </View>
          {engine === 'api' ? (
            <View className="mt-3">
              <Text className="text-muted-foreground text-sm">Base URL</Text>
              <TextInput
                className="bg-card mt-2 rounded-2xl px-4 py-3 text-foreground"
                value={apiBaseUrl}
                onChangeText={setApiBaseUrl}
                placeholder="http://localhost:8787"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="rgba(120,120,120,0.9)"
              />
            </View>
          ) : null}
        </View>

        <View className="mt-5">
          <Text className="text-foreground font-semibold">輸入框（模擬宿主 App）</Text>
          <TextInput
            className="bg-card mt-2 rounded-2xl px-4 py-3 text-foreground"
            multiline
            value={inputText}
            onChangeText={(t) => {
              setInputText(t);
              if (!selectedText) setSelectedText(t);
            }}
            placeholder="在這裡輸入內容"
            placeholderTextColor="rgba(120,120,120,0.9)"
          />
        </View>

        <View className="mt-4">
          <Text className="text-foreground font-semibold">處理內容（模擬選取文字）</Text>
          <TextInput
            className="bg-card mt-2 rounded-2xl px-4 py-3 text-foreground"
            multiline
            value={selectedText}
            onChangeText={setSelectedText}
            placeholder="貼上或輸入你要處理的文字"
            placeholderTextColor="rgba(120,120,120,0.9)"
          />
        </View>

        <View className="mt-4">
          <Text className="text-foreground font-semibold">附加背景（可選，回覆建議更準）</Text>
          <TextInput
            className="bg-card mt-2 rounded-2xl px-4 py-3 text-foreground"
            multiline
            value={contextText}
            onChangeText={setContextText}
            placeholder="例如：對方剛說『明天可以嗎？』你想要回覆"
            placeholderTextColor="rgba(120,120,120,0.9)"
          />
        </View>

        <View className="mt-5">
          <Text className="text-foreground font-semibold">工具列</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3" contentContainerStyle={{ gap: 10 }}>
            {(Object.keys(actionLabels) as EcaiAction[]).map((k) => {
              const active = k === action;
              return (
                <Pressable
                  key={k}
                  className={active ? 'bg-primary rounded-full px-4 py-2' : 'bg-card rounded-full px-4 py-2'}
                  onPress={() => setAction(k)}>
                  <Text className={active ? 'text-primary-foreground font-semibold' : 'text-foreground font-semibold'}>
                    {actionLabels[k]}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View className="mt-5">
          <Text className="text-foreground font-semibold">Persona（Tone 綁定）</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3" contentContainerStyle={{ gap: 10 }}>
            {allPersonas.map((p) => {
              const active = p.id === personaId;
              return (
                <Pressable
                  key={p.id}
                  className={active ? 'bg-primary rounded-full px-4 py-2' : 'bg-card rounded-full px-4 py-2'}
                  onPress={() => setPersonaId(p.id)}>
                  <Text className={active ? 'text-primary-foreground font-semibold' : 'text-foreground font-semibold'}>{p.name}</Text>
                </Pressable>
              );
            })}
            <Pressable className="bg-card rounded-full px-4 py-2" onPress={() => setShowCreatePersona((v) => !v)}>
              <Text className="text-foreground font-semibold">＋自建</Text>
            </Pressable>
          </ScrollView>
          <Text className="text-muted-foreground mt-2">{persona.instruction}</Text>

          {showCreatePersona ? (
            <View className="bg-card mt-4 rounded-2xl p-4">
              <Text className="text-foreground font-semibold">新增自建 Persona（精簡）</Text>
              <Text className="text-muted-foreground mt-2 text-sm">只會保存在本機。</Text>

              <Text className="text-muted-foreground mt-3 text-sm">名稱</Text>
              <TextInput
                className="bg-background mt-2 rounded-2xl px-4 py-3 text-foreground border border-border"
                value={newPersonaName}
                onChangeText={setNewPersonaName}
                placeholder="例如：我係一個好有禮貌嘅人"
                placeholderTextColor="rgba(120,120,120,0.9)"
              />

              <Text className="text-muted-foreground mt-3 text-sm">語氣指令</Text>
              <TextInput
                className="bg-background mt-2 rounded-2xl px-4 py-3 text-foreground border border-border"
                value={newPersonaInstruction}
                onChangeText={setNewPersonaInstruction}
                placeholder="例如：用更禮貌但不卑微、語句清晰、少量 emoji"
                placeholderTextColor="rgba(120,120,120,0.9)"
                multiline
              />

              <Text className="text-muted-foreground mt-3 text-sm">表情符號</Text>
              <View className="mt-2 flex-row gap-2">
                {(['none', 'light', 'more'] as const).map((v) => {
                  const active = newPersonaEmoji === v;
                  const label = v === 'none' ? '不用' : v === 'light' ? '少量' : '多';
                  return (
                    <Pressable
                      key={v}
                      className={active ? 'bg-primary rounded-full px-4 py-2' : 'bg-background rounded-full px-4 py-2 border border-border'}
                      onPress={() => setNewPersonaEmoji(v)}>
                      <Text className={active ? 'text-primary-foreground font-semibold' : 'text-foreground font-semibold'}>{label}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text className="text-muted-foreground mt-3 text-sm">禁忌詞（逗號分隔，可空）</Text>
              <TextInput
                className="bg-background mt-2 rounded-2xl px-4 py-3 text-foreground border border-border"
                value={newPersonaBannedWords}
                onChangeText={setNewPersonaBannedWords}
                placeholder="例如：垃圾, 廢物"
                placeholderTextColor="rgba(120,120,120,0.9)"
              />

              <View className="mt-4 flex-row gap-2">
                <Pressable
                  className="bg-primary rounded-xl px-4 py-3 flex-1"
                  onPress={() => {
                    const bannedWords = newPersonaBannedWords
                      .split(',')
                      .map((x) => x.trim())
                      .filter(Boolean);
                    const res = useAppStore.getState().actions.ecaiAddPersona({
                      name: newPersonaName,
                      instruction: newPersonaInstruction,
                      emoji: newPersonaEmoji,
                      bannedWords,
                    });
                    setPersonaId(res.personaId);
                    setNewPersonaName('');
                    setNewPersonaInstruction('');
                    setNewPersonaBannedWords('');
                    setNewPersonaEmoji('none');
                    setShowCreatePersona(false);
                  }}>
                  <Text className="text-primary-foreground font-semibold text-center">保存</Text>
                </Pressable>
                <Pressable className="bg-background rounded-xl px-4 py-3 border border-border" onPress={() => setShowCreatePersona(false)}>
                  <Text className="text-foreground font-semibold">取消</Text>
                </Pressable>
              </View>

              {customPersonas.length ? (
                <View className="mt-5" style={{ gap: 10 }}>
                  <Text className="text-foreground font-semibold">已建立</Text>
                  {customPersonas.map((p) => (
                    <View key={p.id} className="bg-background rounded-2xl p-3 border border-border">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-foreground font-semibold">{p.name}</Text>
                        <Pressable
                          className="bg-destructive rounded-xl px-3 py-2"
                          onPress={() => {
                            useAppStore.getState().actions.ecaiRemovePersona({ personaId: p.id });
                            if (personaId === p.id) setPersonaId(defaultPersonaId);
                          }}>
                          <Text className="text-destructive-foreground font-semibold">刪除</Text>
                        </Pressable>
                      </View>
                      <Text className="text-muted-foreground mt-2 text-sm">{p.instruction}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}
        </View>

        <Pressable
          className={canRun && !loading ? 'bg-primary mt-6 rounded-2xl px-4 py-3' : 'bg-card mt-6 rounded-2xl px-4 py-3 opacity-60'}
          disabled={!canRun || loading}
          onPress={async () => {
            try {
              await run();
            } catch (e: any) {
              Alert.alert('生成失敗', e?.message ?? '未知錯誤');
              setLoading(false);
            }
          }}>
          <View className="flex-row items-center justify-center gap-2">
            {loading ? <ActivityIndicator /> : null}
            <Text className={canRun && !loading ? 'text-primary-foreground font-semibold' : 'text-foreground font-semibold'}>
              生成
            </Text>
          </View>
        </Pressable>

        <View className="mt-6">
          <Text className="text-foreground font-semibold">結果</Text>
          {results.length ? (
            <View className="mt-3" style={{ gap: 12 }}>
              {results.map((r) => (
                <View key={r.id} className="bg-card rounded-2xl p-4">
                  <Text className="text-muted-foreground text-sm">{r.title}</Text>
                  <Text className="text-foreground mt-2">{r.text}</Text>
                  <View className="mt-4 flex-row gap-2">
                    <Pressable className="bg-primary rounded-xl px-4 py-2 flex-1" onPress={() => onInsert(r.text)}>
                      <Text className="text-primary-foreground font-semibold text-center">插入/替換</Text>
                    </Pressable>
                    <Pressable className="bg-background rounded-xl px-4 py-2 border border-border" onPress={() => onCopy(r.text)}>
                      <Text className="text-foreground font-semibold">複製</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-muted-foreground mt-3">尚未生成。</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
