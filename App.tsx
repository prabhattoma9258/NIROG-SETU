import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SignupScreen from './src/screens/SignupScreen';
import HealthProfileScreen from './src/screens/HealthProfileScreen';
import LoginScreen from './src/screens/LoginScreen';
// 🟢 NAYA FIX: Apna naya Bottom Nav Bar yahan import kiya
import MainTabNavigator from './src/screens/MainTabNavigator'; 

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      {/* 🟢 YAHAN FIX KIYA HAI: initialRouteName ko 'Login' kar diya */}
      <Stack.Navigator initialRouteName="Login">
        
        {/* Screens ko thoda line se laga diya hai */}
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        
        <Stack.Screen name="Signup" component={SignupScreen} options={{ title: 'Create Account' }} />
        <Stack.Screen name="HealthProfile" component={HealthProfileScreen} options={{ title: 'Health Profile' }} />
        
        {/* 🟢 NAYA FIX: Dashboard ki jagah yahan MainTabs laga diya, jiske andar sab kuch hai */}
        <Stack.Screen name="MainTabs" component={MainTabNavigator} options={{ headerShown: false }} />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}