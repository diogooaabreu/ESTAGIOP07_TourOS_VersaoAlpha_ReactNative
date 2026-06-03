// ============================================================
// TourOS POS — Detalhe da Reserva
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import { useRoute, type RouteProp } from '@react-navigation/native';
import type { ReservasStackParamList } from '../../navigation/types';
import { getReservaByCodigo } from '../../db/reservaRepository';
import { getPassageirosByReserva } from '../../db/passageiroRepository';
import { useReservasStore } from '../../store/reservasStore';
import type { Reserva, ReservaPassageiro } from '../../types';
import { useNavigation } from '@react-navigation/native';

type ReservaDetailRouteProp = RouteProp<
  ReservasStackParamList,
  'ReservaDetail'
>;

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function formatCurrency(value: number): string {
  return `${value.toFixed(2).replace('.', ',')}€`;
}

function getEstadoStyle(estado: string): { label: string; color: string } {
  switch (estado) {
    case 'confirmada':
      return { label: 'Confirmada', color: '#4CAF50' };
    case 'cancelada':
      return { label: 'Cancelada', color: '#E94560' };
    default:
      return { label: estado, color: '#666666' };
  }
}

export default function ReservaDetailScreen() {
  const navigation = useNavigation();

  const route = useRoute<ReservaDetailRouteProp>();
  const { codigo } = route.params;
  const { cancelarReserva, remarcarReserva } = useReservasStore();

  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [passageiros, setPassageiros] = useState<ReservaPassageiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // ── Carregar dados ───────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getReservaByCodigo(codigo);
      setReserva(r);

      if (r?.id) {
        const p = await getPassageirosByReserva(r.id);
        setPassageiros(p);
      }
    } catch (err) {
      console.error('[ReservaDetail] Erro ao carregar:', err);
    } finally {
      setLoading(false);
    }
  }, [codigo]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Cancelar reserva ─────────────────────────────────────────────────

  const handleCancelar = useCallback(() => {
    Alert.alert(
      'Cancelar Reserva',
      `Tens a certeza que queres cancelar a reserva ${codigo}?`,
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelarReserva(codigo);
              await loadData();
              Toast.show({
                type: 'success',
                text1: 'Reserva cancelada com sucesso',
              });
            } catch {
              Toast.show({
                type: 'error',
                text1: 'Erro ao cancelar reserva',
              });
            }
          },
        },
      ],
    );
  }, [codigo, cancelarReserva, loadData]);

  // ── Remarcar reserva ─────────────────────────────────────────────────

  const handleDateChange = useCallback(
    async (_event: DateTimePickerEvent, date?: Date) => {
      setShowDatePicker(Platform.OS === 'ios');
      if (!date) return;

      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const novaData = `${yyyy}-${mm}-${dd}`;

      try {
        await remarcarReserva(codigo, novaData);
        await loadData();
        Toast.show({
          type: 'success',
          text1: 'Reserva remarcada com sucesso',
          text2: `Nova data: ${formatDate(novaData)}`,
        });
      } catch {
        Toast.show({
          type: 'error',
          text1: 'Erro ao remarcar reserva',
        });
      }
    },
    [codigo, remarcarReserva, loadData],
  );

  const handleRemarcar = useCallback(() => {
    setShowDatePicker(true);
  }, []);

  // ── Reenviar vouchers ────────────────────────────────────────────────

  const handleReenviarVouchers = useCallback(() => {
    Toast.show({
      type: 'info',
      text1: 'Funcionalidade em desenvolvimento',
    });
  }, []);

  // ── Loading ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#E94560" />
      </View>
    );
  }

  if (!reserva) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Reserva não encontrada</Text>
      </View>
    );
  }

  const estado = getEstadoStyle(reserva.estado);
  const isConfirmada = reserva.estado === 'confirmada';

  // ── Render ───────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      {/* Header com botão voltar */}
      <View style={styles.navHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Reservas</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* Código + Estado */}
        <View style={styles.headerRow}>
          <Text style={styles.codigo}>{reserva.codigo}</Text>
          <View style={[styles.estadoBadge, { backgroundColor: estado.color }]}>
            <Text style={styles.estadoText}>{estado.label}</Text>
          </View>
        </View>

        {/* ── Secção Geral ──────────────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Geral</Text>
        <View style={styles.sectionCard}>
          <DetailRow label="Tour" value={reserva.tourNome} />
          <DetailRow label="Data" value={formatDate(reserva.dataReserva)} />
          <DetailRow label="Hora" value={reserva.horaPartida || '—'} />
          <DetailRow label="Idioma" value={reserva.idioma || '—'} />
          <DetailRow
            label="Passageiros"
            value={`${reserva.adultos} Adulto${
              reserva.adultos !== 1 ? 's' : ''
            }${
              reserva.criancas > 0
                ? `, ${reserva.criancas} Criança${
                    reserva.criancas !== 1 ? 's' : ''
                  }`
                : ''
            }${
              reserva.bebes > 0
                ? `, ${reserva.bebes} Bebé${reserva.bebes !== 1 ? 's' : ''}`
                : ''
            }`}
          />
          <DetailRow
            label="Total"
            value={formatCurrency(reserva.total)}
            isHighlight
          />
          <DetailRow label="Método Pagamento" value={reserva.metodoPagamento} />
          <DetailRow label="Estado Pagamento" value={reserva.estadoPagamento} />
          {reserva.pickupTipo && (
            <DetailRow label="Pickup" value={reserva.pickupTipo} />
          )}
          {reserva.pickupLocal && (
            <DetailRow label="Local Pickup" value={reserva.pickupLocal} />
          )}
          {reserva.alergias && (
            <DetailRow label="Alergias" value={reserva.alergias} />
          )}
          {reserva.balcao && (
            <DetailRow label="Balcão" value={reserva.balcao} />
          )}
        </View>

        {/* ── Secção Passageiros ─────────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Passageiros</Text>
        <View style={styles.sectionCard}>
          {passageiros.length === 0 ? (
            <Text style={styles.emptyText}>Sem passageiros registados</Text>
          ) : (
            passageiros.map((p, index) => (
              <View key={p.id ?? index} style={styles.passageiroRow}>
                <View style={styles.passageiroInfo}>
                  <Text style={styles.passageiroOrdem}>#{p.ordem}</Text>
                  <Text style={styles.passageiroTipo}>
                    {p.tipo === 'adulto'
                      ? 'Adulto'
                      : p.tipo === 'crianca'
                      ? 'Criança'
                      : 'Bebé'}
                  </Text>
                </View>
                <Text style={styles.passageiroVoucher}>
                  {p.voucherCodigo
                    ? `Voucher: ${p.voucherCodigo}`
                    : 'Sem voucher'}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* ── Secção Contacto ────────────────────────────────────────────── */}
        {reserva.incluirContacto && (
          <>
            <Text style={styles.sectionTitle}>Contacto</Text>
            <View style={styles.sectionCard}>
              {reserva.contactoNome && (
                <DetailRow
                  label="Nome"
                  value={`${reserva.contactoNome} ${
                    reserva.contactoApelido || ''
                  }`}
                />
              )}
              {reserva.contactoEmail && (
                <DetailRow label="Email" value={reserva.contactoEmail} />
              )}
              {reserva.contactoTelefone && (
                <DetailRow label="Telefone" value={reserva.contactoTelefone} />
              )}
            </View>
          </>
        )}

        {/* ── Secção Faturação ───────────────────────────────────────────── */}
        {reserva.incluirFaturacao && (
          <>
            <Text style={styles.sectionTitle}>Faturação</Text>
            <View style={styles.sectionCard}>
              {reserva.faturacaoNome && (
                <DetailRow
                  label="Nome"
                  value={`${reserva.faturacaoNome} ${
                    reserva.faturacaoApelido || ''
                  }`}
                />
              )}
              {reserva.faturacaoEmpresa && (
                <DetailRow label="Empresa" value={reserva.faturacaoEmpresa} />
              )}
              {reserva.faturacaoNif && (
                <DetailRow label="NIF" value={reserva.faturacaoNif} />
              )}
              {reserva.faturacaoMorada && (
                <DetailRow label="Morada" value={reserva.faturacaoMorada} />
              )}
              {reserva.faturacaoCidade && (
                <DetailRow label="Cidade" value={reserva.faturacaoCidade} />
              )}
              {reserva.faturacaoDistrito && (
                <DetailRow label="Distrito" value={reserva.faturacaoDistrito} />
              )}
              {reserva.faturacaoCodigoPostal && (
                <DetailRow
                  label="Código Postal"
                  value={reserva.faturacaoCodigoPostal}
                />
              )}
              {reserva.faturacaoPais && (
                <DetailRow label="País" value={reserva.faturacaoPais} />
              )}
              {reserva.faturacaoTelefone && (
                <DetailRow label="Telefone" value={reserva.faturacaoTelefone} />
              )}
            </View>
          </>
        )}

        {/* ── Secção Nota ────────────────────────────────────────────────── */}
        {reserva.nota && (
          <>
            <Text style={styles.sectionTitle}>Nota interna</Text>
            <View style={styles.sectionCard}>
              <Text style={styles.notaText}>{reserva.nota}</Text>
            </View>
          </>
        )}

        {/* ── Botões de acção ────────────────────────────────────────────── */}
        {isConfirmada && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButtonDanger}
              onPress={handleCancelar}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonDangerText}>
                Cancelar Reserva
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleRemarcar}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonText}>Remarcar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButtonOutline}
              onPress={handleReenviarVouchers}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonOutlineText}>
                Reenviar Vouchers
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* DatePicker para remarcar */}
        {showDatePicker && (
          <DateTimePicker
            value={
              reserva.dataReserva
                ? new Date(reserva.dataReserva + 'T00:00:00')
                : new Date()
            }
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            minimumDate={new Date()}
            onChange={handleDateChange}
            locale="pt-PT"
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Componente auxiliar: linha de detalhe ────────────────────────────────

function DetailRow({
  label,
  value,
  isHighlight = false,
}: {
  label: string;
  value: string;
  isHighlight?: boolean;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text
        style={[styles.detailValue, isHighlight && styles.detailValueHighlight]}
      >
        {value}
      </Text>
    </View>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  codigo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A2E',
    letterSpacing: 1,
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  estadoText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
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
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#1A1A2E',
    fontWeight: '500',
    flex: 1.5,
    textAlign: 'right',
  },
  detailValueHighlight: {
    color: '#E94560',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 8,
  },
  passageiroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  passageiroInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  passageiroOrdem: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  passageiroTipo: {
    fontSize: 14,
    color: '#666666',
  },
  passageiroVoucher: {
    fontSize: 12,
    color: '#999',
  },
  notaText: {
    fontSize: 14,
    color: '#1A1A2E',
    lineHeight: 20,
  },
  actionsContainer: {
    gap: 12,
    marginTop: 16,
  },
  actionButtonDanger: {
    backgroundColor: '#E94560',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionButtonDangerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonOutline: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1A1A2E',
  },
  actionButtonOutlineText: {
    color: '#1A1A2E',
    fontSize: 16,
    fontWeight: '600',
  },
  navHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
});
