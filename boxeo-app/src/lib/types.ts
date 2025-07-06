// ===== ENUMS =====
export enum UserRole {
  ADMINISTRADOR_GENERAL = 'administrador_general',
  ADMINISTRADOR_CLUB = 'administrador_club', 
  BOXEADOR = 'boxeador'
}

export enum WeightClass {
  PESO_MOSCA = 'peso_mosca',
  PESO_GALLO = 'peso_gallo',
  PESO_PLUMA = 'peso_pluma', 
  PESO_LIGERO = 'peso_ligero',
  PESO_WELTER = 'peso_welter',
  PESO_MEDIANO = 'peso_mediano',
  PESO_PESADO = 'peso_pesado'
}

export enum FightResult {
  BOXER1_GANA = 'boxer1_gana',
  BOXER2_GANA = 'boxer2_gana',
  EMPATE = 'empate',
  PENDIENTE = 'pendiente'
}

export enum TournamentStatus {
  PROGRAMADO = 'programado',
  ACTIVO = 'activo', 
  COMPLETADO = 'completado',
  CANCELADO = 'cancelado'
}

// ===== CORE INTERFACES =====
export interface User {
  id: string;
  email: string;
  role: UserRole;
  nombre: string;
  activo: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface Club {
  id: string;
  nombre: string;
  ubicacion: string;
  descripcion?: string;
  admin_user_id: string;
  activo: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface Boxer {
  id: string;
  user_id?: string;
  club_id?: string;
  nombre: string;
  fecha_nacimiento: Date;
  peso_categoria: WeightClass;
  altura?: number;
  alcance?: number;
  victorias: number;
  derrotas: number;
  empates: number;
  activo: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface Tournament {
  id: string;
  nombre: string;
  descripcion?: string;
  organizador_club_id: string;
  fecha_inicio: Date;
  fecha_fin: Date;
  ubicacion?: string;
  estado: TournamentStatus;
  publico: boolean;
  max_participantes?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface Fight {
  id: string;
  tournament_id?: string;
  boxer1_id: string;
  boxer2_id: string;
  fecha: Date;
  ubicacion?: string;
  peso_categoria: WeightClass;
  resultado: FightResult;
  ganador_id?: string;
  notas?: string;
  created_at?: Date;
  updated_at?: Date;
}

// ===== AUTH INTERFACES =====
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  expires_in: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nombre: string;
  role?: UserRole;
}

// ===== API RESPONSE WRAPPERS =====
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ===== DASHBOARD/STATS INTERFACES =====
export interface DashboardStats {
  usuarios_total: number;
  clubes_total: number;
  boxeadores_total: number;
  torneos_activos: number;
  combates_recientes: number;
}

// ===== CONSTANTS =====
export const WEIGHT_CLASS_LABELS: Record<WeightClass, string> = {
  [WeightClass.PESO_MOSCA]: 'Peso Mosca',
  [WeightClass.PESO_GALLO]: 'Peso Gallo',
  [WeightClass.PESO_PLUMA]: 'Peso Pluma',
  [WeightClass.PESO_LIGERO]: 'Peso Ligero',
  [WeightClass.PESO_WELTER]: 'Peso Welter',
  [WeightClass.PESO_MEDIANO]: 'Peso Mediano',
  [WeightClass.PESO_PESADO]: 'Peso Pesado'
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMINISTRADOR_GENERAL]: 'Administrador General',
  [UserRole.ADMINISTRADOR_CLUB]: 'Administrador de Club',
  [UserRole.BOXEADOR]: 'Boxeador'
};

export const TOURNAMENT_STATUS_LABELS: Record<TournamentStatus, string> = {
  [TournamentStatus.PROGRAMADO]: 'Programado',
  [TournamentStatus.ACTIVO]: 'Activo',
  [TournamentStatus.COMPLETADO]: 'Completado',
  [TournamentStatus.CANCELADO]: 'Cancelado'
};

export const FIGHT_RESULT_LABELS: Record<FightResult, string> = {
  [FightResult.BOXER1_GANA]: 'Victoria Boxeador 1',
  [FightResult.BOXER2_GANA]: 'Victoria Boxeador 2',
  [FightResult.EMPATE]: 'Empate',
  [FightResult.PENDIENTE]: 'Pendiente'
};