import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { UserRole, Club, Boxer, Tournament, DashboardStats, USER_ROLE_LABELS, WEIGHT_CLASS_LABELS } from '@/lib/types';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Trophy, 
  Users, 
  Shield, 
  Target, 
  BarChart3, 
  LogOut, 
  Plus,
  Activity,
  Home
} from 'lucide-react';

export function Dashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [boxers, setBoxers] = useState<Boxer[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, clubsRes, boxersRes, tournamentsRes] = await Promise.all([
        apiClient.getDashboardStats(),
        apiClient.getClubs(),
        apiClient.getBoxers(),
        apiClient.getTournaments()
      ]);

      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (clubsRes.success && clubsRes.data) setClubs(clubsRes.data);
      if (boxersRes.success && boxersRes.data) setBoxers(boxersRes.data);
      if (tournamentsRes.success && tournamentsRes.data) setTournaments(tournamentsRes.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const Header = () => (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent">
            🥊 BoxeoApp
          </h1>
          <p className="text-sm text-muted-foreground">
            Sistema de gestión de boxeo amateur
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(user.nombre)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{user.nombre}</p>
              <p className="text-xs text-muted-foreground">
                {USER_ROLE_LABELS[user.role]}
              </p>
            </div>
          </div>
          
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );

  const StatsCards = () => {
    if (!stats) return null;

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.usuarios_total}</div>
            <p className="text-xs text-muted-foreground">+12% desde el mes pasado</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clubes Activos</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.clubes_total}</div>
            <p className="text-xs text-muted-foreground">+2 nuevos este mes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Boxeadores</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.boxeadores_total}</div>
            <p className="text-xs text-muted-foreground">+8% de crecimiento</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Torneos Activos</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.torneos_activos}</div>
            <p className="text-xs text-muted-foreground">3 este fin de semana</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Combates Recientes</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.combates_recientes}</div>
            <p className="text-xs text-muted-foreground">En los últimos 30 días</p>
          </CardContent>
        </Card>
      </div>
    );
  };

  const ClubsTable = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Clubes</CardTitle>
          {user.role === UserRole.ADMINISTRADOR_GENERAL && (
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Club
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clubs.map((club) => (
              <TableRow key={club.id}>
                <TableCell className="font-medium">{club.nombre}</TableCell>
                <TableCell>{club.ubicacion}</TableCell>
                <TableCell>
                  <Badge variant={club.activo ? "default" : "secondary"}>
                    {club.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const BoxersTable = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Boxeadores</CardTitle>
          {user.role !== UserRole.BOXEADOR && (
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Boxeador
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Record</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {boxers.map((boxer) => (
              <TableRow key={boxer.id}>
                <TableCell className="font-medium">{boxer.nombre}</TableCell>
                <TableCell>
                  <Badge variant="outline">{WEIGHT_CLASS_LABELS[boxer.peso_categoria]}</Badge>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  <span className="text-green-600">{boxer.victorias}</span>-
                  <span className="text-red-600">{boxer.derrotas}</span>-
                  <span className="text-gray-600">{boxer.empates}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={boxer.activo ? "default" : "secondary"}>
                    {boxer.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const TournamentsTable = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Torneos</CardTitle>
          {user.role !== UserRole.BOXEADOR && (
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Torneo
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Participantes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tournaments.map((tournament) => (
              <TableRow key={tournament.id}>
                <TableCell className="font-medium">{tournament.nombre}</TableCell>
                <TableCell>{new Date(tournament.fecha_inicio).toLocaleDateString('es-ES')}</TableCell>
                <TableCell>
                  <Badge variant="outline">{tournament.estado}</Badge>
                </TableCell>
                <TableCell>{tournament.max_participantes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
            <Badge variant="outline" className="text-sm">
              Versión Demo
            </Badge>
          </div>

          <StatsCards />

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Resumen
              </TabsTrigger>
              <TabsTrigger value="clubs" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Clubes
              </TabsTrigger>
              <TabsTrigger value="boxers" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Boxeadores
              </TabsTrigger>
              <TabsTrigger value="tournaments" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Torneos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <ClubsTable />
                <BoxersTable />
              </div>
            </TabsContent>

            <TabsContent value="clubs">
              <ClubsTable />
            </TabsContent>

            <TabsContent value="boxers">
              <BoxersTable />
            </TabsContent>

            <TabsContent value="tournaments">
              <TournamentsTable />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}