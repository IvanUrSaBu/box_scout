import { 
  User, 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  ApiResponse,
  UserRole,
  Club,
  Boxer,
  Tournament,
  Fight,
  DashboardStats,
  WeightClass,
  TournamentStatus
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Mock data for development
const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'admin@boxeoapp.com',
    role: UserRole.ADMINISTRADOR_GENERAL,
    nombre: 'Administrador General',
    activo: true
  },
  {
    id: '2',
    email: 'club1@boxeoapp.com',
    role: UserRole.ADMINISTRADOR_CLUB,
    nombre: 'Carlos García',
    activo: true
  },
  {
    id: '3',
    email: 'boxer1@boxeoapp.com',
    role: UserRole.BOXEADOR,
    nombre: 'Miguel Rodríguez',
    activo: true
  }
];

const MOCK_CLUBS: Club[] = [
  {
    id: '1',
    nombre: 'Club Boxeo Madrid',
    ubicacion: 'Madrid, España',
    descripcion: 'Club de boxeo amateur más antiguo de Madrid',
    admin_user_id: '2',
    activo: true
  },
  {
    id: '2',
    nombre: 'Athletic Barcelona',
    ubicacion: 'Barcelona, España',
    descripcion: 'Club profesional con grandes instalaciones',
    admin_user_id: '2',
    activo: true
  },
  {
    id: '3',
    nombre: 'Valencia Boxing Club',
    ubicacion: 'Valencia, España',
    descripcion: 'Especialistas en formación de jóvenes talentos',
    admin_user_id: '2',
    activo: true
  },
  {
    id: '4',
    nombre: 'Sevilla Fight Club',
    ubicacion: 'Sevilla, España',
    descripcion: 'Club con tradición en competiciones nacionales',
    admin_user_id: '2',
    activo: true
  }
];

const MOCK_BOXERS: Boxer[] = [
  {
    id: '1',
    user_id: '3',
    club_id: '1',
    nombre: 'Miguel \"El Rayo\" Rodríguez',
    fecha_nacimiento: new Date('2000-03-15'),
    peso_categoria: WeightClass.PESO_WELTER,
    altura: 175,
    alcance: 180,
    victorias: 8,
    derrotas: 2,
    empates: 1,
    activo: true
  }
];

const MOCK_TOURNAMENTS: Tournament[] = [
  {
    id: '1',
    nombre: 'Campeonato Nacional 2024',
    descripcion: 'Torneo nacional de boxeo amateur',
    organizador_club_id: '1',
    fecha_inicio: new Date('2024-03-15'),
    fecha_fin: new Date('2024-03-17'),
    ubicacion: 'Madrid',
    estado: TournamentStatus.PROGRAMADO,
    publico: true,
    max_participantes: 32
  },
  {
    id: '2',
    nombre: 'Copa Primavera Barcelona',
    descripcion: 'Torneo de primavera para categorías juveniles y senior',
    organizador_club_id: '2',
    fecha_inicio: new Date('2024-02-20'),
    fecha_fin: new Date('2024-02-22'),
    ubicacion: 'Barcelona',
    estado: TournamentStatus.ACTIVO,
    publico: true,
    max_participantes: 16
  },
  {
    id: '3',
    nombre: 'Torneo Valencia Open',
    descripcion: 'Competición abierta para todas las categorías',
    organizador_club_id: '3',
    fecha_inicio: new Date('2024-01-15'),
    fecha_fin: new Date('2024-01-17'),
    ubicacion: 'Valencia',
    estado: TournamentStatus.COMPLETADO,
    publico: true,
    max_participantes: 24
  }
];

const MOCK_STATS: DashboardStats = {
  usuarios_total: 248,
  clubes_total: 32,
  boxeadores_total: 156,
  torneos_activos: 8,
  combates_recientes: 24
};

// Helper function to simulate API calls
function simulateApiCall<T>(data: T, delay = 200): Promise<ApiResponse<T>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data,
        message: 'Success'
      });
    }, delay);
  });
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // For demo purposes, always use mock data in this version
    // Real API integration will be implemented when backend is deployed
    console.log('Using mock API for BoxeoApp demo - endpoint:', endpoint);
    return this.getMockResponse<T>(endpoint, options);
  }

  private getMockResponse<T>(endpoint: string, options: RequestInit): Promise<ApiResponse<T>> {
    console.log('Using mock API for:', endpoint);
    
    // Mock responses based on endpoint
    if (endpoint === '/auth/login' && options.method === 'POST') {
      const body = JSON.parse(options.body as string) as LoginRequest;
      const user = MOCK_USERS.find(u => u.email === body.email);
      
      // Accept any password for demo purposes
      if (user) {
        const response: LoginResponse = {
          user,
          token: 'mock-jwt-token-' + user.id,
          expires_in: 7 * 24 * 60 * 60
        };
        return simulateApiCall(response as T);
      } else {
        return Promise.reject(new Error('Usuario no encontrado'));
      }
    }

    if (endpoint === '/auth/register' && options.method === 'POST') {
      const body = JSON.parse(options.body as string) as RegisterRequest;
      const newUser: User = {
        id: String(MOCK_USERS.length + 1),
        email: body.email,
        role: body.role || UserRole.BOXEADOR,
        nombre: body.nombre,
        activo: true
      };
      
      MOCK_USERS.push(newUser);
      
      const response: LoginResponse = {
        user: newUser,
        token: 'mock-jwt-token-' + newUser.id,
        expires_in: 7 * 24 * 60 * 60
      };
      return simulateApiCall(response as T);
    }

    if (endpoint === '/auth/profile') {
      const user = MOCK_USERS[0]; // Return first user as mock
      return simulateApiCall(user as T);
    }

    if (endpoint === '/clubs') {
      return simulateApiCall(MOCK_CLUBS as T);
    }

    if (endpoint === '/boxers') {
      return simulateApiCall(MOCK_BOXERS as T);
    }

    if (endpoint === '/tournaments') {
      return simulateApiCall(MOCK_TOURNAMENTS as T);
    }

    if (endpoint === '/fights') {
      return simulateApiCall([] as T); // Empty fights array for now
    }

    if (endpoint === '/dashboard/stats') {
      return simulateApiCall(MOCK_STATS as T);
    }

    return Promise.reject(new Error('Endpoint not implemented in mock: ' + endpoint));
  }

  // Auth methods
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data) {
      this.token = response.data.token;
      localStorage.setItem('auth_token', this.token);
    }

    return response;
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data) {
      this.token = response.data.token;
      localStorage.setItem('auth_token', this.token);
    }

    return response;
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/profile');
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Data methods
  async getClubs(): Promise<ApiResponse<Club[]>> {
    return this.request<Club[]>('/clubs');
  }

  async getBoxers(): Promise<ApiResponse<Boxer[]>> {
    return this.request<Boxer[]>('/boxers');
  }

  async getTournaments(): Promise<ApiResponse<Tournament[]>> {
    return this.request<Tournament[]>('/tournaments');
  }

  async getFights(): Promise<ApiResponse<Fight[]>> {
    return this.request<Fight[]>('/fights');
  }

  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request<DashboardStats>('/dashboard/stats');
  }
}

export const apiClient = new ApiClient();