// ============================================================
// TourOS POS — Passo 1: Data, Horário e Idioma
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Image } from 'react-native';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BookingStackParamList } from '../../navigation/types';
import { getExperience } from '../../api/tourService';
import { useBookingStore } from '../../store/bookingStore';
import type { Tour } from '../../types';

type Step1NavProp = NativeStackNavigationProp<
  BookingStackParamList,
  'BookingStep1'
>;
type Step1RouteProp = RouteProp<BookingStackParamList, 'BookingStep1'>;

const SLOTS = ['09:00', '11:00', '14:00', '16:00'];
const IDIOMAS = [
  { code: 'pt', label: 'PT' },
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
  { code: 'fr', label: 'FR' },
];

export default function BookingStep1Screen() {
  const navigation = useNavigation<Step1NavProp>();
  const route = useRoute<Step1RouteProp>();
  const { tourId } = route.params;
  const { tourData, setStep1 } = useBookingStore();

  const [tour, setTour] = useState<Tour | null>(tourData);
  const [loading, setLoading] = useState(!tourData);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedIdioma, setSelectedIdioma] = useState('pt');
  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === 'ios');

  // ── Carregar tour se não veio do store ───────────────────────────────

  useEffect(() => {
    if (tourData && tourData.id === tourId) {
      setTour(tourData);
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const data = await getExperience(tourId, 'pt');
        setTour(data);
      } catch (err) {
        console.error('[Step1] Erro ao carregar tour:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tourId, tourData]);

  // ── Date change ──────────────────────────────────────────────────────

  const onDateChange = useCallback(
    (_event: DateTimePickerEvent, date?: Date) => {
      if (Platform.OS === 'android') {
        setShowDatePicker(false);
      }
      if (date) {
        setSelectedDate(date);
      }
    },
    [],
  );

  // ── Formatar data para yyyy-MM-dd ────────────────────────────────────

  const formatDate = (d: Date): string => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatDateDisplay = (d: Date): string => {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  // ── Continuar ────────────────────────────────────────────────────────

  const handleContinue = useCallback(() => {
    if (!selectedSlot) return;

    setStep1(formatDate(selectedDate), selectedSlot, selectedIdioma);

    // Se type.id === 2 (transfer/tuk-tuk), vai directo para Step4
    if (tour?.type.id === 2) {
      navigation.navigate('BookingStep4');
    } else {
      navigation.navigate('BookingStep2');
    }
  }, [selectedDate, selectedSlot, selectedIdioma, tour, navigation, setStep1]);

  // ── Loading ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#E94560" />
      </View>
    );
  }

  if (!tour) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Tour não encontrado</Text>
      </View>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Imagem + Nome do Tour */}
      <View style={styles.tourHeader}>
        {tour.images?.[0]?.url ? (
          <Image
            style={styles.tourImage}
            source={{ uri: tour.images[0].url }}
            resizeMode="cover"
          />
        ) : null}
        <Text style={styles.tourName}>{tour.name}</Text>
      </View>

      {/* Data */}
      <Text style={styles.sectionTitle}>Data</Text>
      {Platform.OS === 'android' && (
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>
            {formatDateDisplay(selectedDate)}
          </Text>
        </TouchableOpacity>
      )}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          minimumDate={new Date()}
          onChange={onDateChange}
          locale="pt-PT"
        />
      )}

      {/* Horários */}
      <Text style={styles.sectionTitle}>Horário</Text>
      <View style={styles.slotsContainer}>
        {SLOTS.map(slot => (
          <TouchableOpacity
            key={slot}
            style={[
              styles.slotChip,
              selectedSlot === slot && styles.slotChipSelected,
            ]}
            onPress={() => setSelectedSlot(slot)}
          >
            <Text
              style={[
                styles.slotText,
                selectedSlot === slot && styles.slotTextSelected,
              ]}
            >
              {slot}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Idioma */}
      <Text style={styles.sectionTitle}>Idioma</Text>
      <View style={styles.idiomasContainer}>
        {IDIOMAS.map(idi => (
          <TouchableOpacity
            key={idi.code}
            style={[
              styles.idiomaChip,
              selectedIdioma === idi.code && styles.idiomaChipSelected,
            ]}
            onPress={() => setSelectedIdioma(idi.code)}
          >
            <Text
              style={[
                styles.idiomaText,
                selectedIdioma === idi.code && styles.idiomaTextSelected,
              ]}
            >
              {idi.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Botão Continuar */}
      <TouchableOpacity
        style={[
          styles.continueButton,
          !selectedSlot && styles.continueButtonDisabled,
        ]}
        onPress={handleContinue}
        disabled={!selectedSlot}
        activeOpacity={0.8}
      >
        <Text style={styles.continueButtonText}>Continuar</Text>
      </TouchableOpacity>
    </ScrollView>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    fontSize: 16,
    color: '#E94560',
  },
  tourHeader: {
    marginBottom: 24,
  },
  tourImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
  },
  tourName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 12,
    marginTop: 8,
  },
  dateButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dateButtonText: {
    fontSize: 17,
    color: '#1A1A2E',
    fontWeight: '500',
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  slotChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  slotChipSelected: {
    backgroundColor: '#1A1A2E',
    borderColor: '#1A1A2E',
  },
  slotText: {
    fontSize: 15,
    color: '#1A1A2E',
    fontWeight: '500',
  },
  slotTextSelected: {
    color: '#FFFFFF',
  },
  idiomasContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  idiomaChip: {
    width: 56,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  idiomaChipSelected: {
    backgroundColor: '#E94560',
    borderColor: '#E94560',
  },
  idiomaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  idiomaTextSelected: {
    color: '#FFFFFF',
  },
  continueButton: {
    backgroundColor: '#E94560',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
