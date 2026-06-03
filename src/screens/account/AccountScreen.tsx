// ============================================================
// TourOS POS — Ecrã de Conta
// ============================================================

import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';
import { getInitials } from '../../utils/helpers';

type AccountNavProp = NativeStackNavigationProp<AuthStackParamList>;

/**
 * Gera uma cor a partir do hash do email para o avatar.
 */
function getAvatarColor(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    '#E94560',
    '#1A1A2E',
    '#0F3460',
    '#16213E',
    '#533483',
    '#E94560',
    '#F5A623',
    '#7ED321',
  ];
  return colors[Math.abs(hash) % colors.length];
}

export default function AccountScreen() {
  const navigation = useNavigation<AccountNavProp>();
  const { user, session, logout } = useAuthStore();

  const name = user?.name ?? session.userName ?? 'Utilizador';
  const email = user?.email ?? session.userEmail ?? '';
  const initials = getInitials(name);
  const avatarColor = getAvatarColor(email || 'default@email.com');
  const hasPin = !!session.pinHash;

  // ── Terminar Sessão ──────────────────────────────────────────────────

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Terminar Sessão',
      'Tens a certeza que queres terminar a sessão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Terminar',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ],
    );
  }, [logout, navigation]);

  // ── Alterar Balcão ───────────────────────────────────────────────────

  const handleChangeBalcao = useCallback(() => {
    navigation.navigate('SelectBalcao');
  }, [navigation]);

  // ── Alterar PIN ──────────────────────────────────────────────────────

  const handleChangePin = useCallback(() => {
    navigation.navigate('ChangePin');
  }, [navigation]);

  // ── Render ───────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar + Nome + Email */}
        <View style={styles.profileSection}>
          <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        {/* ── Secção: Informação da Conta ───────────────────────────────── */}
        <Text style={styles.sectionTitle}>Informação da Conta</Text>
        <View style={styles.sectionCard}>
          {/* Balcão */}
          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Text style={styles.infoLabel}>Balcão</Text>
              <Text style={styles.infoValue}>{session.balcao || '—'}</Text>
            </View>
            <TouchableOpacity
              style={styles.smallButton}
              onPress={handleChangeBalcao}
            >
              <Text style={styles.smallButtonText}>Alterar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* PIN */}
          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Text style={styles.infoLabel}>PIN</Text>
              {hasPin ? (
                <Text style={styles.pinConfigured}>Configurado ✓</Text>
              ) : (
                <Text style={styles.pinNotConfigured}>Não configurado</Text>
              )}
            </View>
          </View>
        </View>

        {/* ── Secção: Segurança ─────────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Segurança</Text>
        <View style={styles.sectionCard}>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleChangePin}
            activeOpacity={0.7}
          >
            <Text style={styles.actionLabel}>Alterar PIN</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Text style={styles.actionLabelDanger}>Terminar Sessão</Text>
            <Text style={styles.actionArrowDanger}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Estilos ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666666',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 8,
    marginTop: 8,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLeft: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  pinConfigured: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4CAF50',
  },
  pinNotConfigured: {
    fontSize: 15,
    color: '#999999',
  },
  smallButton: {
    backgroundColor: '#1A1A2E',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  smallButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  actionLabel: {
    fontSize: 16,
    color: '#1A1A2E',
  },
  actionLabelDanger: {
    fontSize: 16,
    color: '#E94560',
  },
  actionArrow: {
    fontSize: 22,
    color: '#999',
  },
  actionArrowDanger: {
    fontSize: 22,
    color: '#E94560',
  },
});
