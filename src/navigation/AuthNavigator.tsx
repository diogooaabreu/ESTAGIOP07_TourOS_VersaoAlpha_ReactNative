// ============================================================
// TourOS POS — Auth Navigator (Stack)
// ============================================================

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParamList } from './types';

import LoginScreen from '../screens/auth/LoginScreen';
import PinLoginScreen from '../screens/auth/PinLoginScreen';
import PinUnlockScreen from '../screens/auth/PinUnlockScreen';
import SetPinScreen from '../screens/auth/SetPinScreen';
import SelectBalcaoScreen from '../screens/auth/SelectBalcaoScreen';
import ChangePinScreen from '../screens/account/ChangePinScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="PinLogin" component={PinLoginScreen} />
      <Stack.Screen name="PinUnlock" component={PinUnlockScreen} />
      <Stack.Screen name="SetPin" component={SetPinScreen} />
      <Stack.Screen name="SelectBalcao" component={SelectBalcaoScreen} />
      <Stack.Screen name="ChangePin" component={ChangePinScreen} />
    </Stack.Navigator>
  );
}
