// ============================================================
// TourOS POS — Passo 4: Resumo e Pagamento
// ============================================================

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BookingStackParamList } from '../../navigation/types';
import { useBookingStore } from '../../store/bookingStore';
import { useAuthStore } from '../../store/authStore';
import { createReserva } from '../../db/reservaRepository';
import { createPassageiros } from '../../db/passageiroRepository';
import type { Reserva, ReservaPassageiro } from '../../types';

type Step4NavProp = NativeStackNavigationProp<
  BookingStackParamList,
  'BookingStep4'
>;

const METODOS_PAGAMENTO = [
  { id: 'dinheiro', label: 'Dinheiro', icon: '💵' },
  { id: 'multibanco', label: 'Multibanco', icon: '💳' },
  { id: 'mbway', label: 'MB Way', icon: '📱' },
  { id: 'cartao', label: 'Cartão', icon: '💳' },
];

export default function BookingStep4Screen() {
  const navigation = useNavigation<Step4NavProp>();
  const booking = useBookingStore();
  const { user, session } = useAuthStore();

  const [metodoPagamento, setMetodoPagamento] = useState(
    booking.metodoPagamento || 'dinheiro',
  );
  const [incluirContacto, setIncluirContacto] = useState(
    booking.incluirContacto,
  );
  const [incluirFaturacao, setIncluirFaturacao] = useState(
    booking.incluirFaturacao,
  );
  const [contacto, setContacto] = useState(booking.contacto);
  const [faturacao, setFaturacao] = useState(booking.faturacao);
  const [nota, setNota] = useState(booking.nota);
  const [submitting, setSubmitting] = useState(false);

  const total = booking.calculateTotal();

  // ── Finalizar Reserva ────────────────────────────────────────────────

  const handleFinalizar = useCallback(async () => {
    setSubmitting(true);

    try {
      const codigo = booking.generateCode();

      const reservaData: Reserva = {
        codigo,
        tourId: booking.tourId!,
        tourNome: booking.tourData?.name ?? '',
        tourTipo: booking.tourData?.type.id === 1 ? 'tour' : 'transfer',
        dataReserva: booking.selectedDate,
        horaPartida: booking.selectedSlot,
        idioma: booking.idioma,
        adultos: booking.adultos,
        criancas: booking.criancas,
        bebes: booking.bebes,
        pickupTipo: booking.pickupTipo,
        pickupLocal: booking.pickupLocal,
        alergias: booking.alergias,
        metodoPagamento,
        total,
        estadoPagamento: metodoPagamento === 'dinheiro' ? 'pendente' : 'pago',
        incluirContacto,
        incluirFaturacao,
        estado: 'confirmada',
        processada: false,
        userId: user?.id ?? session.userId ?? 0,
        balcao: session.balcao,
        canalVenda: 'pos',
        nota,
        contactoNome: contacto.nome || undefined,
        contactoApelido: contacto.apelido || undefined,
        contactoEmail: contacto.email || undefined,
        contactoTelefone: contacto.telefone || undefined,
        faturacaoNome: faturacao.nome || undefined,
        faturacaoApelido: faturacao.apelido || undefined,
        faturacaoEmpresa: faturacao.empresa || undefined,
        faturacaoNif: faturacao.nif || undefined,
        faturacaoMorada: faturacao.morada || undefined,
        faturacaoCidade: faturacao.cidade || undefined,
        faturacaoDistrito: faturacao.distrito || undefined,
        faturacaoCodigoPostal: faturacao.codigoPostal || undefined,
        faturacaoPais: faturacao.pais || undefined,
        faturacaoTelefone: faturacao.telefone || undefined,
      };

      // Criar reserva na BD
      const created = await createReserva(reservaData);

      // Criar passageiros
      const passageiros: Omit<ReservaPassageiro, 'id'>[] = [];
      let ordem = 1;
      for (let i = 0; i < booking.adultos; i++) {
        passageiros.push({
          reservaId: created.id!,
          tipo: 'adulto',
          ordem: ordem++,
          voucherUsado: false,
        });
      }
      for (let i = 0; i < booking.criancas; i++) {
        passageiros.push({
          reservaId: created.id!,
          tipo: 'crianca',
          ordem: ordem++,
          voucherUsado: false,
        });
      }
      for (let i = 0; i < booking.bebes; i++) {
        passageiros.push({
          reservaId: created.id!,
          tipo: 'bebe',
          ordem: ordem++,
          voucherUsado: false,
        });
      }

      if (passageiros.length > 0) {
        await createPassageiros(passageiros);
      }

      // Navegar para sucesso
      navigation.reset({
        index: 0,
        routes: [{ name: 'BookingSuccess' }],
      });
    } catch (err) {
      console.error('[Step4] Erro ao finalizar reserva:', err);
    } finally {
      setSubmitting(false);
    }
  }, [
    booking,
    metodoPagamento,
    incluirContacto,
    incluirFaturacao,
    contacto,
    faturacao,
    nota,
    total,
    user,
    session,
    navigation,
  ]);

  // ── Render ───────────────────────────────────────────────────────────

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Card de Resumo */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Resumo da Reserva</Text>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tour</Text>
          <Text style={styles.summaryValue}>
            {booking.tourData?.name ?? '—'}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Data</Text>
          <Text style={styles.summaryValue}>{booking.selectedDate}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Hora</Text>
          <Text style={styles.summaryValue}>{booking.selectedSlot}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Passageiros</Text>
          <Text style={styles.summaryValue}>
            {booking.adultos} Adulto{booking.adultos !== 1 ? 's' : ''}
            {booking.criancas > 0 &&
              `, ${booking.criancas} Criança${
                booking.criancas !== 1 ? 's' : ''
              }`}
            {booking.bebes > 0 &&
              `, ${booking.bebes} Bebé${booking.bebes !== 1 ? 's' : ''}`}
          </Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            {total.toFixed(2).replace('.', ',')}€
          </Text>
        </View>
      </View>

      {/* Método de Pagamento */}
      <Text style={styles.sectionTitle}>Método de Pagamento</Text>
      <View style={styles.paymentMethods}>
        {METODOS_PAGAMENTO.map(metodo => (
          <TouchableOpacity
            key={metodo.id}
            style={[
              styles.paymentOption,
              metodoPagamento === metodo.id && styles.paymentOptionSelected,
            ]}
            onPress={() => setMetodoPagamento(metodo.id)}
          >
            <Text style={styles.paymentIcon}>{metodo.icon}</Text>
            <Text
              style={[
                styles.paymentLabel,
                metodoPagamento === metodo.id && styles.paymentLabelSelected,
              ]}
            >
              {metodo.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Incluir Contacto */}
      <View style={styles.switchRow}>
        <View>
          <Text style={styles.switchLabel}>Incluir contacto</Text>
          <Text style={styles.switchDesc}>
            Nome, email e telefone do cliente
          </Text>
        </View>
        <Switch
          value={incluirContacto}
          onValueChange={setIncluirContacto}
          trackColor={{ false: '#E0E0E0', true: '#1A1A2E' }}
          thumbColor={incluirContacto ? '#E94560' : '#FFFFFF'}
        />
      </View>

      {incluirContacto && (
        <View style={styles.expandedForm}>
          <TextInput
            style={styles.input}
            placeholder="Nome"
            placeholderTextColor="#999"
            value={contacto.nome}
            onChangeText={text =>
              setContacto(prev => ({ ...prev, nome: text }))
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Apelido"
            placeholderTextColor="#999"
            value={contacto.apelido}
            onChangeText={text =>
              setContacto(prev => ({ ...prev, apelido: text }))
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={contacto.email}
            onChangeText={text =>
              setContacto(prev => ({ ...prev, email: text }))
            }
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Telefone"
            placeholderTextColor="#999"
            value={contacto.telefone}
            onChangeText={text =>
              setContacto(prev => ({ ...prev, telefone: text }))
            }
            keyboardType="phone-pad"
          />
        </View>
      )}

      {/* Incluir Faturação */}
      <View style={styles.switchRow}>
        <View>
          <Text style={styles.switchLabel}>Incluir faturação</Text>
          <Text style={styles.switchDesc}>Dados para fatura com NIF</Text>
        </View>
        <Switch
          value={incluirFaturacao}
          onValueChange={setIncluirFaturacao}
          trackColor={{ false: '#E0E0E0', true: '#1A1A2E' }}
          thumbColor={incluirFaturacao ? '#E94560' : '#FFFFFF'}
        />
      </View>

      {incluirFaturacao && (
        <View style={styles.expandedForm}>
          <TextInput
            style={styles.input}
            placeholder="Nome"
            placeholderTextColor="#999"
            value={faturacao.nome}
            onChangeText={text =>
              setFaturacao(prev => ({ ...prev, nome: text }))
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Apelido"
            placeholderTextColor="#999"
            value={faturacao.apelido}
            onChangeText={text =>
              setFaturacao(prev => ({ ...prev, apelido: text }))
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Empresa"
            placeholderTextColor="#999"
            value={faturacao.empresa}
            onChangeText={text =>
              setFaturacao(prev => ({ ...prev, empresa: text }))
            }
          />
          <TextInput
            style={styles.input}
            placeholder="NIF"
            placeholderTextColor="#999"
            value={faturacao.nif}
            onChangeText={text =>
              setFaturacao(prev => ({ ...prev, nif: text }))
            }
            keyboardType="number-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Morada"
            placeholderTextColor="#999"
            value={faturacao.morada}
            onChangeText={text =>
              setFaturacao(prev => ({ ...prev, morada: text }))
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Cidade"
            placeholderTextColor="#999"
            value={faturacao.cidade}
            onChangeText={text =>
              setFaturacao(prev => ({ ...prev, cidade: text }))
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Distrito"
            placeholderTextColor="#999"
            value={faturacao.distrito}
            onChangeText={text =>
              setFaturacao(prev => ({ ...prev, distrito: text }))
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Código Postal"
            placeholderTextColor="#999"
            value={faturacao.codigoPostal}
            onChangeText={text =>
              setFaturacao(prev => ({ ...prev, codigoPostal: text }))
            }
          />
          <TextInput
            style={styles.input}
            placeholder="País"
            placeholderTextColor="#999"
            value={faturacao.pais}
            onChangeText={text =>
              setFaturacao(prev => ({ ...prev, pais: text }))
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Telefone"
            placeholderTextColor="#999"
            value={faturacao.telefone}
            onChangeText={text =>
              setFaturacao(prev => ({ ...prev, telefone: text }))
            }
            keyboardType="phone-pad"
          />
        </View>
      )}

      {/* Nota interna */}
      <Text style={styles.sectionTitle}>Nota interna</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Nota interna (opcional)"
        placeholderTextColor="#999"
        value={nota}
        onChangeText={setNota}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      {/* Botão Finalizar */}
      <TouchableOpacity
        style={[
          styles.finalizarButton,
          submitting && styles.finalizarButtonDisabled,
        ]}
        onPress={handleFinalizar}
        disabled={submitting}
        activeOpacity={0.8}
      >
        {submitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.finalizarButtonText}>Finalizar Reserva</Text>
        )}
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
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1A1A2E',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  totalRow: {
    borderBottomWidth: 0,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#1A1A2E',
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E94560',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 12,
    marginTop: 8,
  },
  paymentMethods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 6,
  },
  paymentOptionSelected: {
    borderColor: '#1A1A2E',
    backgroundColor: '#F0F0F5',
  },
  paymentIcon: {
    fontSize: 18,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#1A1A2E',
    fontWeight: '500',
  },
  paymentLabelSelected: {
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  switchDesc: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  expandedForm: {
    gap: 10,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1A1A2E',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 14,
  },
  finalizarButton: {
    backgroundColor: '#E94560',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  finalizarButtonDisabled: {
    opacity: 0.6,
  },
  finalizarButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
