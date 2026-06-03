// ============================================================
// TourOS POS — Tipos de navegação (React Navigation)
// ============================================================

// ── Auth Stack ──────────────────────────────────────────────────────────

export type AuthStackParamList = {
  Login: undefined;
  PinLogin: undefined;
  PinUnlock: undefined;
  SetPin: undefined;
  SelectBalcao: undefined;
  ChangePin: undefined;
};

// ── Main Bottom Tabs ────────────────────────────────────────────────────

export type MainTabParamList = {
  Dashboard: undefined;
  Reservas: undefined;
  Account: undefined;
};

// ── Booking Stack (nested dentro do Dashboard tab) ──────────────────────

export type BookingStackParamList = {
  DashboardHome: undefined;
  BookingStep1: { tourId: number };
  BookingStep2: undefined;
  BookingStep3: undefined;
  BookingStep4: undefined;
  BookingSuccess: undefined;
};

// ── Reservas Stack (nested dentro do Reservas tab) ──────────────────────

export type ReservasStackParamList = {
  ReservasList: undefined;
  ReservaDetail: { codigo: string };
};
