'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Scissors, Calendar, Clock, Star, User } from 'lucide-react';

export default function HomePage() {
  const { user, profile, signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="h-6 w-6" />
            <span className="font-bold text-xl">Freitas Barbershop</span>
          </div>
          <nav className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/profile">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Meu Perfil
                  </Button>
                </Link>
                {profile?.role === 'barber' && (
                  <Link href="/barber">
                    <Button variant="outline" size="sm">Dashboard</Button>
                  </Link>
                )}
                {profile?.role === 'admin' && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm">Admin</Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                  Sair
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button size="sm">Entrar</Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-background to-muted">
        <div className="container mx-auto px-4 text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Estilo que define
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Experimente o melhor atendimento da região. Agende agora mesmo pelo WhatsApp ou nosso sistema online.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/booking">
              <Button size="lg" className="w-full sm:w-auto">
                <Calendar className="mr-2 h-4 w-4" />
                Agendar Agora
              </Button>
            </Link>
            <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Falar no WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">Agendamento Rápido</h3>
              <p className="text-sm text-muted-foreground">
                Escolha o serviço, horário e confirme em poucos cliques
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">Profissionais Qualificados</h3>
              <p className="text-sm text-muted-foreground">
                Nossa equipe tem anos de experiência
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Star className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">Qualidade Garantida</h3>
              <p className="text-sm text-muted-foreground">
                Satisfação dos clientes é nossa prioridade
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Nossos Serviços</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              { name: 'Corte Masculino', price: 'R$ 45', duration: '30min' },
              { name: 'Barba', price: 'R$ 30', duration: '20min' },
              { name: 'Corte + Barba', price: 'R$ 70', duration: '50min' },
              { name: 'Pezinho', price: 'R$ 20', duration: '15min' },
              { name: 'Acabamento', price: 'R$ 15', duration: '10min' },
              { name: 'Tratamento', price: 'R$ 55', duration: '40min' },
            ].map((service) => (
              <div key={service.name} className="bg-background p-4 rounded-lg border">
                <h3 className="font-semibold">{service.name}</h3>
                <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                  <span>{service.duration}</span>
                  <span className="font-medium text-foreground">{service.price}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/booking">
              <Button>Ver Todos os Serviços</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Freitas Barbershop © {new Date().getFullYear()}</p>
          <p className="mt-1">Rua Example, 123 - São Paulo, SP</p>
        </div>
      </footer>
    </div>
  );
}