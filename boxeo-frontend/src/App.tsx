import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Users, 
  Calendar, 
  Target, 
  Shield, 
  BarChart3,
  ArrowRight,
  LogIn,
  UserPlus,
  Zap
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-background to-amber-50 dark:from-red-950/20 dark:via-background dark:to-amber-950/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-transparent to-amber-600/10" />
        
        <div className="container relative z-10 mx-auto px-4 py-16 md:py-24">
          <div className="text-center space-y-8">
            <div className="flex items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50/50 px-4 py-1.5 text-sm text-red-700 backdrop-blur-sm dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
              <Zap size={16} />
              <span>Gestión Profesional de Boxeo</span>
            </div>

            <div className="space-y-6">
              <h1 className="font-serif text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl md:text-7xl lg:text-8xl">
                <span className="bg-gradient-to-r from-red-600 via-red-500 to-amber-500 bg-clip-text text-transparent">
                  BoxeoApp
                </span>
              </h1>
              <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300 md:text-2xl">
                La plataforma completa para gestionar competiciones de boxeo amateur en España
              </p>
              <p className="mx-auto max-w-lg text-lg text-gray-500 dark:text-gray-400">
                Organiza torneos, gestiona boxeadores, administra clubes y lleva el control de todos los combates en una sola aplicación.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="group bg-red-600 hover:bg-red-700 text-white">
                <LogIn size={20} />
                <span>Iniciar Sesión</span>
                <ArrowRight className="transition-transform group-hover:translate-x-0.5" size={20} />
              </Button>
              <Button variant="outline" size="lg" className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950/20">
                <UserPlus size={20} />
                <span>Registrarse</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
              Funcionalidades Principales
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              Todo lo que necesitas para gestionar el mundo del boxeo amateur de forma profesional
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Gestión de Clubes */}
            <Card className="group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-red-100 dark:border-red-900/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg dark:bg-red-900/20">
                    <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Gestión de Clubes</CardTitle>
                    <CardDescription>Administra clubes y sus miembros</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                    Registro y administración de clubes
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                    Control de membresías y roles
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                    Estadísticas del club
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Perfiles de Boxeadores */}
            <Card className="group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-amber-100 dark:border-amber-900/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg dark:bg-amber-900/20">
                    <Users className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Perfiles de Boxeadores</CardTitle>
                    <CardDescription>Gestiona la información de cada atleta</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                    Historial completo de combates
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                    Categorías de peso y estadísticas
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                    Seguimiento de rendimiento
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Torneos y Competiciones */}
            <Card className="group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-green-100 dark:border-green-900/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900/20">
                    <Trophy className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Torneos y Competiciones</CardTitle>
                    <CardDescription>Organiza y gestiona eventos</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Creación de torneos públicos y privados
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Gestión de brackets y eliminatorias
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Resultados en tiempo real
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Programación de Combates */}
            <Card className="group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-blue-100 dark:border-blue-900/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/20">
                    <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Programación de Combates</CardTitle>
                    <CardDescription>Organiza enfrentamientos</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Emparejamiento por categoría de peso
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Calendario de eventos
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Control de resultados
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Sistema de Roles */}
            <Card className="group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-purple-100 dark:border-purple-900/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg dark:bg-purple-900/20">
                    <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Sistema de Roles</CardTitle>
                    <CardDescription>Control de acceso granular</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Badge variant="outline" className="border-purple-300 text-purple-700">
                    Administrador General
                  </Badge>
                  <Badge variant="outline" className="border-blue-300 text-blue-700">
                    Administrador de Club
                  </Badge>
                  <Badge variant="outline" className="border-green-300 text-green-700">
                    Boxeador
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas y Reportes */}
            <Card className="group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-indigo-100 dark:border-indigo-900/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg dark:bg-indigo-900/20">
                    <BarChart3 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Estadísticas y Reportes</CardTitle>
                    <CardDescription>Análisis completo de datos</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                    Dashboards personalizados
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                    Métricas de rendimiento
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                    Exportación de datos
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-amber-600">
        <div className="container mx-auto px-4 text-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              ¿Listo para revolucionar la gestión del boxeo?
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-red-100">
              Únete a BoxeoApp y lleva tu club o competición al siguiente nivel con herramientas profesionales.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" variant="secondary" className="bg-white text-red-600 hover:bg-red-50">
                <UserPlus size={20} />
                Crear Cuenta Gratis
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Ver Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-amber-400 bg-clip-text text-transparent">
              BoxeoApp
            </h3>
            <p className="text-gray-400">
              Plataforma profesional para la gestión de competiciones de boxeo amateur
            </p>
            <div className="text-sm text-gray-500">
              © 2024 BoxeoApp. Desarrollado para la comunidad del boxeo español.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
