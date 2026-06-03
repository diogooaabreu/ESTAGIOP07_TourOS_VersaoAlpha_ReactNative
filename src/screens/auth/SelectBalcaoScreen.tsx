// ============================================================
// TourOS POS — Ecrã de Selecção de Balcão
// ============================================================

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';

type SelectBalcaoNavProp = NativeStackNavigationProp<
  AuthStackParamList,
  'SelectBalcao'
>;

interface BalcaoOption {
  id: string;
  nome: string;
  icon: string;
}

const BALCOES: BalcaoOption[] = [
  { id: 'Balcão Principal', nome: 'Balcão Principal', icon: 'store' },
  { id: 'Guimarães Centro', nome: 'Guimarães Centro', icon: 'location-city' },
  { id: 'Braga', nome: 'Braga', icon: 'location-city' },
  { id: 'Online', nome: 'Online', icon: 'laptop' },
];

export default function SelectBalcaoScreen() {
  const navigation = useNavigation<SelectBalcaoNavProp>();
  const { setBalcao } = useAuthStore();

  const handleSelect = async (balcao: string) => {
    await setBalcao(balcao);
    // O RootNavigator detecta a autenticação e mostra o MainNavigator
    // Como já estamos autenticados, navegamos para fora do Auth stack
    // Na prática, o reset para o MainNavigator é feito pelo RootNavigator
    // Mas como o AuthNavigator está dentro do RootNavigator, precisamos
    // de sair do stack de auth. Usamos reset para a raiz.
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    // Nota: o RootNavigator vai detectar isAuthenticated=true e mostrar MainNavigator
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>Selecionar Balcão</Text>
        <Text style={styles.subtitle}>
          Escolhe o balcão onde estás a trabalhar
        </Text>

        {/* Cards de balcões */}
        <View style={styles.cardsContainer}>
          {BALCOES.map(balcao => (
            <TouchableOpacity
              key={balcao.id}
              style={styles.card}
              onPress={() => handleSelect(balcao.id)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Icon name={balcao.icon} size={32} color="#007AFF" />
              </View>
              <Text style={styles.cardTitle}>{balcao.nome}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

// ── Estilos ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  card: {
    width: '45%',
    aspectRatio: 1.2,
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8F0FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'center',
  },
});
