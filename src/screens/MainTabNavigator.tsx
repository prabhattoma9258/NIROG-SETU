import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import all your screens
import DashboardScreen from './DashboardScreen';
import ExploreScreen from './ExploreScreen';
import TestScreen from './TestScreen';
import PremiumPlanScreen from './PremiumPlanScreen';
import CaloriesCountScreen from './CaloriesCountScreen';

const Tab = createBottomTabNavigator();

// Same palette as the Login screen
const TEAL = '#14A394';
const TEAL_SOFT = '#DFF5F1';
const BORDER = '#BFE6E1';
const INACTIVE = '#9CA3AF';

export default function MainTabNavigator({ route }: any) {
  const userId = route.params?.userId || 'DUMMY_ID';
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: any }) => ({
        tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
          let iconName: any = 'help-circle-outline';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Explore') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'Test') {
            iconName = focused ? 'flask' : 'flask-outline';
          } else if (route.name === 'Premium') {
            iconName = focused ? 'star' : 'star-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: TEAL,
        tabBarInactiveTintColor: INACTIVE,
        tabBarActiveBackgroundColor: TEAL_SOFT,
        tabBarItemStyle: { borderRadius: 16, marginHorizontal: 4 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 2 },
        headerShown: false,
        tabBarStyle: {
          // keeps the bar clear of the home indicator on newer phones
          height: 62 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          backgroundColor: '#fff',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderTopWidth: 1.5,
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderColor: BORDER,
          elevation: 14,
          shadowColor: TEAL,
          shadowOpacity: 0.14,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -3 },
        },
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} initialParams={{ userId: userId }} />

      <Tab.Screen name="Explore" component={ExploreScreen} />

      <Tab.Screen name="Test" component={TestScreen} initialParams={{ userId: userId }} />

      <Tab.Screen name="Premium" component={PremiumPlanScreen} />

      {/* Hidden tab: reachable by navigation only, takes no space in the bar */}
      <Tab.Screen
        name="Calories"
        component={CaloriesCountScreen}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' }, // removes the extra gap
        }}
      />
    </Tab.Navigator>
  );
}