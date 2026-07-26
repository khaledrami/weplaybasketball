import { Tabs } from 'expo-router';
import { useTranslation } from '../../lib/i18n';
import { Map, Users, User, UsersRound } from 'lucide-react';

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#E76F51',
        tabBarInactiveTintColor: '#6C757D',
        headerStyle: { backgroundColor: '#1D3557' },
        headerShadowVisible: false,
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { color: '#FFFFFF', fontWeight: '700' },
        tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: '#DEE2E6', height: 88, paddingBottom: 24 },
      }}
    >
      <Tabs.Screen
        name="map"
        options={{
          title: t('tabs.map'),
          tabBarIcon: ({ color, size }) => <Map size={size} color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: t('tabs.matches'),
          tabBarIcon: ({ color, size }) => <Users size={size} color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: t('tabs.social'),
          tabBarIcon: ({ color, size }) => <UsersRound size={size} color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => <User size={size} color={color as string} />,
        }}
      />
    </Tabs>
  );
}