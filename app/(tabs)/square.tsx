import { FlatList, Text, View } from 'react-native';

import { useAppStore } from '@/src/store/useAppStore';

export default function SquareScreen() {
  const posts = useAppStore((s) =>
    s.entities.posts.allIds
      .map((id) => s.entities.posts.byId[id])
      .filter((p) => p && p.boardType === 'square'),
  );
  const companiesById = useAppStore((s) => s.entities.companies.byId);
  const usersById = useAppStore((s) => s.entities.users.byId);

  return (
    <View className="flex-1 bg-background px-4 py-6">
      <Text className="text-foreground text-2xl font-semibold">廣場</Text>
      <Text className="text-muted-foreground mt-2">全局公開</Text>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        className="mt-4"
        ItemSeparatorComponent={() => <View className="h-3" />}
        renderItem={({ item }) => {
          const author = usersById[item.authorId];
          const company = companiesById[item.companyId];
          return (
            <View className="bg-card rounded-2xl p-4">
              <Text className="text-foreground font-semibold">{item.title}</Text>
              <Text className="text-muted-foreground mt-1">{item.content}</Text>
              <Text className="text-muted-foreground mt-2 text-xs">
                {author?.displayName ?? author?.username ?? ''} · {company?.name ?? ''}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
}

