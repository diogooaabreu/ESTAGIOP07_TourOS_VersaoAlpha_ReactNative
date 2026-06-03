// ============================================================
// TourOS POS — Ecrã Dashboard (lista de tours)
// ============================================================

import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
//import type { BookingStackParamList } from '../../navigation/types';
import { useTours } from '../../hooks/useTours';
import { useAuthStore } from '../../store/authStore';
import { useBookingStore } from '../../store/bookingStore';
import TourCard from '../../components/TourCard';
import type { Tour } from '../../types';
import type { BookingStackParamList } from '../../navigation/types';

type DashboardNavProp = NativeStackNavigationProp<
  BookingStackParamList,
  'DashboardHome'
>;

//type DashboardNavProp = NativeStackNavigationProp<
//BookingStackParamList,
//'BookingStep1'
//>;

export default function DashboardScreen() {
  const navigation = useNavigation<DashboardNavProp>();
  const { tours, loading, error, refresh } = useTours();
  const { session } = useAuthStore();
  const { setTour } = useBookingStore();

  // ── Navegar para reserva ─────────────────────────────────────────────

  const handleTourPress = useCallback(
    (tour: Tour) => {
      setTour(tour.id, tour);
      navigation.navigate('BookingStep1', { tourId: tour.id });
    },
    [setTour, navigation],
  );

  // ── Renderizar cada tour ─────────────────────────────────────────────

  const renderTour = useCallback(
    ({ item }: { item: Tour }) => (
      <TourCard tour={item} onPress={() => handleTourPress(item)} />
    ),
    [handleTourPress],
  );

  // ── Header da FlatList ───────────────────────────────────────────────

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>TourOS POS</Text>
        <Text style={styles.headerBalcao}>
          {session.balcao || 'Seleciona um balcão'}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={refresh}
        activeOpacity={0.7}
      >
        <Icon name="refresh" size={24} color="#1A1A2E" />
      </TouchableOpacity>
    </View>
  );

  // ── Estado de erro ───────────────────────────────────────────────────

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.centerContainer}>
          <Icon name="error-outline" size={48} color="#E94560" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={refresh}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Render principal ─────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}

      {loading && tours.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#E94560" />
          <Text style={styles.loadingText}>A carregar tours...</Text>
        </View>
      ) : tours.length === 0 ? (
        <View style={styles.centerContainer}>
          <Icon name="info-outline" size={48} color="#666666" />
          <Text style={styles.emptyText}>Sem tours disponíveis</Text>
        </View>
      ) : (
        <FlatList
          data={tours}
          renderItem={renderTour}
          keyExtractor={item => String(item.id)}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refresh}
              tintColor="#E94560"
              colors={['#E94560']}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

// ── Estilos ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  headerBalcao: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#666666',
  },
  errorText: {
    marginTop: 16,
    fontSize: 15,
    color: '#E94560',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#E94560',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 24,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
});
