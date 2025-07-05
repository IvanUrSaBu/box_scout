import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarInitials } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Users,
  Calendar,
  Target,
  Shield,
  BarChart3,
  Settings,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Bell,
  LogOut,
  Menu,
  Home,
  Activity
} from "lucide-react";

// Tipos de datos
type UserRole = 'administrador_general' | 'administrador_club' | 'boxeador';
type WeightClass = 'peso_mosca' | 'peso_gallo' | 'peso_pluma' | 'peso_ligero' | 'peso_welter' | 'peso_mediano' | 'peso_pesado';
type FightResult = 'boxer1_gana' | 'boxer2_gana' | 'empate' | 'pendiente';
type TournamentStatus = 'programado' | 'activo' | 'completado' | 'cancelado';

interface User {
  id: string;
  email: string;
  role: UserRole;
  nombre: string;
  activo: boolean;
}

interface Club {
  id: string;
  nombre: string;
  ubicacion: string;
  admin: string;
  boxeadores: number;
  torneos: number;
}

interface Boxer {
  id: string;
  nombre: string;
  club: string;
  peso_categoria: WeightClass;
  edad: number;
  victorias: number;
  derrotas: number;
  empates: number;
}

interface Tournament {
  id: string;
  nombre: string;
  organizador: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: TournamentStatus;
  participantes: number;
}

interface Fight {
  id: string;
  boxeador1: string;
  boxeador2: string;
  torneo: string;
  fecha: string;
  resultado: FightResult;
  peso_categoria: WeightClass;
}

// Datos de ejemplo
const mockStats = {
  usuarios_total: 248,
  clubes_total: 32,
  boxeadores_total: 156,
  torneos_activos: 8,
  combates_recientes: 24
};

const mockClubs: Club[] = [
  { id: '1', nombre: 'Club Boxeo Madrid', ubicacion: 'Madrid', admin: 'Carlos García', boxeadores: 23, torneos: 5 },
  { id: '2', nombre: 'Athletic Barcelona', ubicacion: 'Barcelona', admin: 'María López', boxeadores: 18, torneos: 3 },
  { id: '3', nombre: 'Valencia Boxing', ubicacion: 'Valencia', admin: 'José Martín', boxeadores: 15, torneos: 2 },
  { id: '4', nombre: 'Sevilla Fight Club', ubicacion: 'Sevilla', admin: 'Ana Ruiz', boxeadores: 20, torneos: 4 },
];

const mockBoxers: Boxer[] = [
  { id: '1', nombre: 'Miguel "El Rayo" Rodríguez', club: 'Club Boxeo Madrid', peso_categoria: 'peso_welter', edad: 24, victorias: 8, derrotas: 2, empates: 1 },
  { id: '2', nombre: 'Ana "La Pantera" Martínez', club: 'Club Boxeo Madrid', peso_categoria: 'peso_ligero', edad: 22, victorias: 6, derrotas: 1, empates: 0 },
  { id: '3', nombre: 'David "El Martillo" Sánchez', club: 'Athletic Barcelona', peso_categoria: 'peso_mediano', edad: 26, victorias: 12, derrotas: 3, empates: 2 },
  { id: '4', nombre: 'Laura "La Reina" Fernández', club: 'Valencia Boxing', peso_categoria: 'peso_pluma', edad: 21, victorias: 4, derrotas: 0, empates: 1 },
  { id: '5', nombre: 'Carlos "El Toro" Jiménez', club: 'Sevilla Fight Club', peso_categoria: 'peso_pesado', edad: 28, victorias: 15, derrotas: 4, empates: 0 },
];

const mockTournaments: Tournament[] = [
  { id: '1', nombre: 'Campeonato Nacional 2024', organizador: 'Club Boxeo Madrid', fecha_inicio: '2024-03-15', fecha_fin: '2024-03-17', estado: 'programado', participantes: 32 },
  { id: '2', nombre: 'Copa Primavera Barcelona', organizador: 'Athletic Barcelona', fecha_inicio: '2024-02-20', fecha_fin: '2024-02-22', estado: 'activo', participantes: 16 },
  { id: '3', nombre: 'Torneo Valencia Open', organizador: 'Valencia Boxing', fecha_inicio: '2024-01-15', fecha_fin: '2024-01-17', estado: 'completado', participantes: 24 },
];

const mockFights: Fight[] = [
  { id: '1', boxeador1: 'Miguel Rodríguez', boxeador2: 'David Sánchez', torneo: 'Copa Primavera', fecha: '2024-02-21', resultado: 'boxer1_gana', peso_categoria: 'peso_welter' },
  { id: '2', boxeador1: 'Ana Martínez', boxeador2: 'Laura Fernández', torneo: 'Copa Primavera', fecha: '2024-02-21', resultado: 'pendiente', peso_categoria: 'peso_ligero' },
  { id: '3', boxeador1: 'Carlos Jiménez', boxeador2: 'Miguel Rodríguez', torneo: 'Torneo Valencia', fecha: '2024-01-16', resultado: 'empate', peso_categoria: 'peso_pesado' },
];

const weightClassLabels = {
  peso_mosca: 'Peso Mosca',
  peso_gallo: 'Peso Gallo',
  peso_pluma: 'Peso Pluma',
  peso_ligero: 'Peso Ligero',
  peso_welter: 'Peso Welter',
  peso_mediano: 'Peso Mediano',
  peso_pesado: 'Peso Pesado'
};

const statusLabels = {
  programado: 'Programado',
  activo: 'Activo',
  completado: 'Completado',
  cancelado: 'Cancelado'
};

const resultLabels = {
  boxer1_gana: 'Victoria Boxeador 1',
  boxer2_gana: 'Victoria Boxeador 2',
  empate: 'Empate',
  pendiente: 'Pendiente'
};

export default function BoxeoAdmin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentUser = { nombre: 'Admin General', role: 'administrador_general' as UserRole };

  const StatusBadge = ({ status }: { status: TournamentStatus }) => {
    const colors = {
      programado: 'bg-blue-100 text-blue-800',
      activo: 'bg-green-100 text-green-800',
      completado: 'bg-gray-100 text-gray-800',
      cancelado: 'bg-red-100 text-red-800'
    };
    return <Badge className={colors[status]}>{statusLabels[status]}</Badge>;
  };

  const ResultBadge = ({ resultado }: { resultado: FightResult }) => {
    const colors = {
      boxer1_gana: 'bg-green-100 text-green-800',
      boxer2_gana: 'bg-green-100 text-green-800',
      empate: 'bg-yellow-100 text-yellow-800',
      pendiente: 'bg-gray-100 text-gray-800'
    };
    return <Badge className={colors[resultado]}>{resultLabels[resultado]}</Badge>;
  };

  const Sidebar = () => (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent">
          BoxeoApp
        </h1>
        <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
          ×
        </Button>
      </div>
      
      <nav className="p-4 space-y-2">
        <Button
          variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => setActiveTab('dashboard')}
        >
          <Home className="mr-2 h-4 w-4" />
          Dashboard
        </Button>
        
        <Button
          variant={activeTab === 'clubs' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => setActiveTab('clubs')}
        >
          <Shield className="mr-2 h-4 w-4" />
          Clubes
        </Button>
        
        <Button
          variant={activeTab === 'boxers' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => setActiveTab('boxers')}
        >
          <Users className="mr-2 h-4 w-4" />
          Boxeadores
        </Button>
        
        <Button
          variant={activeTab === 'tournaments' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => setActiveTab('tournaments')}
        >
          <Trophy className="mr-2 h-4 w-4" />
          Torneos
        </Button>
        
        <Button
          variant={activeTab === 'fights' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => setActiveTab('fights')}
        >
          <Target className="mr-2 h-4 w-4" />
          Combates
        </Button>
        
        <Button
          variant={activeTab === 'analytics' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          Analíticas
        </Button>
      </nav>
    </div>
  );

  const Header = () => (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="lg:hidden mr-2" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            <Bell className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <Avatar>
              <AvatarFallback>
                <AvatarInitials>{currentUser.nombre}</AvatarInitials>
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <p className="text-sm font-medium">{currentUser.nombre}</p>
              <p className="text-xs text-gray-500">Administrador General</p>
            </div>
          </div>
          
          <Button variant="ghost" size="sm">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );

  const Dashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo
          </Button>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.usuarios_total}</div>
            <p className="text-xs text-muted-foreground">+12% desde el mes pasado</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clubes Activos</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.clubes_total}</div>
            <p className="text-xs text-muted-foreground">+2 nuevos este mes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Boxeadores</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.boxeadores_total}</div>
            <p className="text-xs text-muted-foreground">+8% de crecimiento</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Torneos Activos</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.torneos_activos}</div>
            <p className="text-xs text-muted-foreground">3 este fin de semana</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Combates Recientes</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.combates_recientes}</div>
            <p className="text-xs text-muted-foreground">En los últimos 30 días</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos y actividad reciente */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimos eventos en la plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockFights.slice(0, 3).map((fight) => (
                <div key={fight.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{fight.boxeador1} vs {fight.boxeador2}</p>
                    <p className="text-sm text-gray-500">{fight.torneo} - {fight.fecha}</p>
                  </div>
                  <ResultBadge resultado={fight.resultado} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Distribución por Categorías</CardTitle>
            <CardDescription>Boxeadores por peso</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Peso Welter</span>
                <span>32%</span>
              </div>
              <Progress value={32} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Peso Ligero</span>
                <span>28%</span>
              </div>
              <Progress value={28} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Peso Mediano</span>
                <span>24%</span>
              </div>
              <Progress value={24} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Peso Pesado</span>
                <span>16%</span>
              </div>
              <Progress value={16} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const ClubsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Clubes</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Club
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Clubes</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filtrar
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Club</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Administrador</TableHead>
                <TableHead>Boxeadores</TableHead>
                <TableHead>Torneos</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockClubs.map((club) => (
                <TableRow key={club.id}>
                  <TableCell className="font-medium">{club.nombre}</TableCell>
                  <TableCell>{club.ubicacion}</TableCell>
                  <TableCell>{club.admin}</TableCell>
                  <TableCell>{club.boxeadores}</TableCell>
                  <TableCell>{club.torneos}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const BoxersTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Boxeadores</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Boxeador
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Boxeadores</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Boxeador</TableHead>
                <TableHead>Club</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Edad</TableHead>
                <TableHead>Record (V-D-E)</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockBoxers.map((boxer) => (
                <TableRow key={boxer.id}>
                  <TableCell className="font-medium">{boxer.nombre}</TableCell>
                  <TableCell>{boxer.club}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{weightClassLabels[boxer.peso_categoria]}</Badge>
                  </TableCell>
                  <TableCell>{boxer.edad} años</TableCell>
                  <TableCell className="font-mono">
                    <span className="text-green-600">{boxer.victorias}</span>-
                    <span className="text-red-600">{boxer.derrotas}</span>-
                    <span className="text-gray-600">{boxer.empates}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const TournamentsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Torneos</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Torneo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Torneos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Torneo</TableHead>
                <TableHead>Organizador</TableHead>
                <TableHead>Fechas</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Participantes</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTournaments.map((tournament) => (
                <TableRow key={tournament.id}>
                  <TableCell className="font-medium">{tournament.nombre}</TableCell>
                  <TableCell>{tournament.organizador}</TableCell>
                  <TableCell>{tournament.fecha_inicio} - {tournament.fecha_fin}</TableCell>
                  <TableCell>
                    <StatusBadge status={tournament.estado} />
                  </TableCell>
                  <TableCell>{tournament.participantes}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const FightsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Combates</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Combate
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Combates</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Enfrentamiento</TableHead>
                <TableHead>Torneo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Resultado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockFights.map((fight) => (
                <TableRow key={fight.id}>
                  <TableCell className="font-medium">
                    {fight.boxeador1} vs {fight.boxeador2}
                  </TableCell>
                  <TableCell>{fight.torneo}</TableCell>
                  <TableCell>{fight.fecha}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{weightClassLabels[fight.peso_categoria]}</Badge>
                  </TableCell>
                  <TableCell>
                    <ResultBadge resultado={fight.resultado} />
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const AnalyticsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Analíticas y Reportes</h1>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Generar Reporte
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Crecimiento de Usuarios</CardTitle>
            <CardDescription>Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-gray-500">
              Gráfico de crecimiento de usuarios
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Actividad por Club</CardTitle>
            <CardDescription>Combates por club este mes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-gray-500">
              Gráfico de actividad por club
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Categorías</CardTitle>
            <CardDescription>Boxeadores por peso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-gray-500">
              Gráfico circular de categorías
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Torneos por Mes</CardTitle>
            <CardDescription>Actividad de torneos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-gray-500">
              Gráfico de barras de torneos
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'clubs': return <ClubsTab />;
      case 'boxers': return <BoxersTab />;
      case 'tournaments': return <TournamentsTab />;
      case 'fights': return <FightsTab />;
      case 'analytics': return <AnalyticsTab />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            {renderContent()}
          </div>
        </main>
      </div>
      
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
