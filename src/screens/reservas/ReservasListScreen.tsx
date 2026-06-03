// ============================================================
// TourOS POS — Lista de Reservas
// ============================================================

import React, { useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ReservasStackParamList } from '../../navigation/types';
import { useReservasStore } from '../../store/reservasStore';
import { useAuthStore } from '../../store/authStore';
import ReservaCard from '../../components/ReservaCard';
import type { Reserva } from '../../types';

type ReservasListNavProp = NativeStackNavigationProp<
  ReservasStackParamList,
  'ReservasList'
>;

type ReservasFilter = 'all' | 'today' | 'week' | 'cancelled';

interface FilterChip {
  key: ReservasFilter;
  label: string;
}

const FILTER_CHIPS: FilterChip[] = [
  { key: 'all', label: 'Todas' },
  { key: 'today', label: 'Hoje' },
  { key: 'week', label: 'Esta semana' },
  { key: 'cancelled', label: 'Canceladas' },
];

export default function ReservasListScreen() {
  const navigation = useNavigation<ReservasListNavProp>();
  const { user } = useAuthStore();
  const {
    reservas,
    loading,
    filter,
    searchQuery,
    loadReservas,
    setFilter,
    setSearchQuery,
    getFilteredReservas,
  } = useReservasStore();

  // ── Carregar reservas ao montar e ao focar ───────────────────────────

  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadReservas(user.id);
      }
    }, [user, loadReservas]),
  );

  // ── Reservas filtradas ───────────────────────────────────────────────

  const filteredReservas = getFilteredReservas();

  // ── Navegar para detalhe ─────────────────────────────────────────────

  const handleReservaPress = useCallback(
    (reserva: Reserva) => {
      navigation.navigate('ReservaDetail', { codigo: reserva.codigo });
    },
    [navigation],
  );

  // ── Navegar para nova reserva ────────────────────────────────────────

  const handleNewReservation = useCallback(() => {
    // Navegar para o tab Dashboard
    navigation.getParent()?.navigate('Dashboard');
  }, [navigation]);

  // ── Renderizar cada reserva ──────────────────────────────────────────

  const renderReserva = useCallback(
    ({ item }: { item: Reserva }) => (
      <ReservaCard reserva={item} onPress={() => handleReservaPress(item)} />
    ),
    [handleReservaPress],
  );

  // ── Render ───────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      {/* Barra de pesquisa */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar por código, tour, cliente..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Chips de filtro */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {FILTER_CHIPS.map(chip => (
          <TouchableOpacity
            key={chip.key}
            style={[
              styles.filterChip,
              filter === chip.key && styles.filterChipSelected,
            ]}
            onPress={() => setFilter(chip.key)}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === chip.key && styles.filterChipTextSelected,
              ]}
            >
              {chip.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Loading */}
      {loading && reservas.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#E94560" />
        </View>
      ) : filteredReservas.length === 0 ? (
        /* Estado vazio */
        <View style={styles.centerContainer}>
          <Icon name="receipt-long" size={64} color="#CCCCCC" />
          <Text style={styles.emptyTitle}>Sem reservas</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery || filter !== 'all'
              ? 'Nenhuma reserva encontrada com estes filtros.'
              : 'Ainda não tens reservas. Cria a primeira!'}
          </Text>
        </View>
      ) : (
        /* Lista */
        <FlatList
          data={filteredReservas}
          renderItem={renderReserva}
          keyExtractor={item => item.codigo}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => user && loadReservas(user.id)}
              tintColor="#E94560"
              colors={['#E94560']}
            />
          }
        />
      )}

      {/* FAB — Nova Reserva */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleNewReservation}
        activeOpacity={0.85}
      >
        <Icon name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ── Estilos ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A2E',
    paddingVertical: 0,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
  },
  filterChipSelected: {
    backgroundColor: '#1A1A2E',
    borderColor: '#1A1A2E',
  },
  filterChipText: {
    fontSize: 13,
    color: '#1A1A2E',
    fontWeight: '500',
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 80,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E94560',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
