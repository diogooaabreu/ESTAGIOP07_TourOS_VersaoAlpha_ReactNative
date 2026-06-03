// ============================================================
// TourOS POS — Reservas Navigator (Stack)
// ============================================================

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ReservasStackParamList } from './types';

import ReservasListScreen from '../screens/reservas/ReservasListScreen';
import ReservaDetailScreen from '../screens/reservas/ReservaDetailScreen';

const Stack = createNativeStackNavigator<ReservasStackParamList>();

export default function ReservasNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="ReservasList"
      screenOptions={{
        headerBackTitle: 'Voltar',
      }}
    >
      <Stack.Screen
        name="ReservasList"
        component={ReservasListScreen}
        options={{ title: 'Reservas' }}
      />
      <Stack.Screen
        name="ReservaDetail"
        component={ReservaDetailScreen}
        options={{ title: 'Detalhe da Reserva' }}
      />
    </Stack.Navigator>
  );
}
