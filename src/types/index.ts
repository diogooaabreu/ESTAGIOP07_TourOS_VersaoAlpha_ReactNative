// ============================================================
// TourOS POS — Tipos TypeScript
// ============================================================

// ---- Utilizador ----
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  pinHash?: string;
  createdAt: string;
  password?: string;
}

// ---- Tour (vem da API TourOS) ----
export interface Tour {
  id: number;
  name: string;
  status: string; // 'active' | 'inactive'
  type: { id: number }; // 1=tour completo, 2=simples (transfer/tuk-tuk)
  duration: string;
  price: { adult: number; child: number; baby: number };
  images: { url: string }[];
  description: string;
  languages: string[];
}

// ---- Reserva ----
export interface Reserva {
  id?: number;
  codigo: string; // formato TOS-XXXXXXXXX
  tourId: number;
  tourNome: string;
  tourTipo: string; // 'tour' | 'transfer'
  dataReserva: string; // yyyy-MM-dd
  horaPartida?: string;
  idioma?: string;
  opcao?: string;
  adultos: number;
  criancas: number;
  bebes: number;
  pickupTipo?: string;
  pickupLocal?: string;
  alergias?: string;
  metodoPagamento: string;
  total: number;
  estadoPagamento: string; // 'pendente' | 'pago' | 'reembolsado'
  incluirContacto: boolean;
  incluirFaturacao: boolean;
  observacoes?: string;
  estado: string; // 'confirmada' | 'cancelada'
  processada: boolean;
  userId: number;
  balcao?: string;
  canalVenda: string;
  nota?: string;
  dataOriginal?: string;
  dataRemarcada?: string;
  // Contacto
  contactoNome?: string;
  contactoApelido?: string;
  contactoEmail?: string;
  contactoTelefone?: string;
  // Faturação
  faturacaoNome?: string;
  faturacaoApelido?: string;
  faturacaoEmpresa?: string;
  faturacaoNif?: string;
  faturacaoMorada?: string;
  faturacaoCidade?: string;
  faturacaoDistrito?: string;
  faturacaoCodigoPostal?: string;
  faturacaoPais?: string;
  faturacaoTelefone?: string;
  createdAt?: string;
}

// ---- Passageiro ----
export interface ReservaPassageiro {
  id?: number;
  reservaId: number;
  nome?: string;
  tipo: 'adulto' | 'crianca' | 'bebe';
  ordem: number;
  voucherCodigo?: string;
  voucherUsado: boolean;
}

// ---- Pagamento ----
export interface Pagamento {
  id?: number;
  reservaId: number;
  metodo: string;
  valor: number;
  referencia?: string;
  createdAt: string;
}

// ---- Estado de sessão ----
export interface Session {
  userId: number | null;
  userName: string;
  userEmail: string;
  pinHash: string;
  balcao: string;
  lastActivityAt: number;
  isPinLocked: boolean;
}

// ---- Resultado de rede ----
export type NetworkResult<T> =
  | { status: 'success'; data: T }
  | { status: 'error'; message: string; code?: number }
  | { status: 'loading' };
