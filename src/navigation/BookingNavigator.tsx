import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { BookingStackParamList } from './types';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import BookingStep1Screen from '../screens/booking/BookingStep1Screen';
import BookingStep2Screen from '../screens/booking/BookingStep2Screen';
import BookingStep3Screen from '../screens/booking/BookingStep3Screen';
import BookingStep4Screen from '../screens/booking/BookingStep4Screen';
import BookingSuccessScreen from '../screens/booking/BookingSuccessScreen';

const Stack = createNativeStackNavigator<BookingStackParamList>();

export default function BookingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerBackTitle: 'Voltar' }}>
      <Stack.Screen
        name="DashboardHome"
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BookingStep1"
        component={BookingStep1Screen}
        options={{ title: 'Data e Hora' }}
      />
      <Stack.Screen
        name="BookingStep2"
        component={BookingStep2Screen}
        options={{ title: 'Passageiros' }}
      />
      <Stack.Screen
        name="BookingStep3"
        component={BookingStep3Screen}
        options={{ title: 'Pickup' }}
      />
      <Stack.Screen
        name="BookingStep4"
        component={BookingStep4Screen}
        options={{ title: 'Pagamento' }}
      />
      <Stack.Screen
        name="BookingSuccess"
        component={BookingSuccessScreen}
        options={{
          title: 'Confirmado',
          headerBackVisible: false,
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}
