'use client';

import { useState } from 'react';
import { Appointment, Service, Barber } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Users, Scissors, Calendar, DollarSign, Plus, Pencil, Trash2, 
  Search, BarChart3, Settings, ChevronDown, X 
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface AdminDashboardProps {
  appointments: Appointment[];
  services: Service[];
  barbers: Barber[];
  stats: {
    totalAppointments: number;
    totalRevenue: number;
    pendingPayments: number;
    completedToday: number;
  };
}

type Tab = 'appointments' | 'services' | 'barbers' | 'reports';

export default function AdminDashboard({ appointments, services, barbers, stats }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('appointments');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showBarberModal, setShowBarberModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const supabase = createClient();

  const tabs = [
    { id: 'appointments' as Tab, label: 'Agendamentos', icon: Calendar },
    { id: 'services' as Tab, label: 'Serviços', icon: Scissors },
    { id: 'barbers' as Tab, label: 'Barbeiros', icon: Users },
    { id: 'reports' as Tab, label: 'Relatórios', icon: BarChart3 },
  ];

  const filteredAppointments = appointments.filter(a => 
    a.client?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.service?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteService = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      await supabase.from('services').delete().eq('id', id);
      window.location.reload();
    }
  };

  const handleDeleteBarber = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este barbeiro?')) {
      await supabase.from('barbers').delete().eq('id', id);
      window.location.reload();
    }
  };

  const handleToggleServiceActive = async (service: Service) => {
    await supabase.from('services').update({ is_active: !service.is_active }).eq('id', service.id);
    window.location.reload();
  };

  const handleToggleBarberActive = async (barber: Barber) => {
    await supabase.from('barbers').update({ is_active: !barber.is_active }).eq('id', barber.id);
    window.location.reload();
  };

  const renderAppointments = () => (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar agendamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        {filteredAppointments.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">Nenhum agendamento encontrado</p>
        ) : (
          filteredAppointments.map((apt) => (
            <div key={apt.id} className="bg-card border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="font-medium">{apt.client?.full_name}</p>
                  <p className="text-sm text-muted-foreground">{apt.client?.phone}</p>
                  <p className="text-sm">{apt.service?.name} com {apt.barber?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(apt.scheduled_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">R$ {apt.total_price?.toFixed(2)}</p>
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full',
                    apt.payment_status === 'paid' && 'bg-green-100 text-green-700',
                    apt.payment_status === 'pending' && 'bg-yellow-100 text-yellow-700',
                    apt.payment_status === 'failed' && 'bg-red-100 text-red-700'
                  )}>
                    {apt.payment_status === 'paid' && 'Pago'}
                    {apt.payment_status === 'pending' && 'Pendente'}
                    {apt.payment_status === 'failed' && 'Falhou'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderServices = () => (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Button onClick={() => { setEditingService(null); setShowServiceModal(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Serviço
        </Button>
      </div>

      <div className="grid gap-3">
        {services.map((service) => (
          <div key={service.id} className={cn(
            'bg-card border rounded-lg p-4 flex justify-between items-center',
            !service.is_active && 'opacity-60'
          )}>
            <div>
              <p className="font-medium">{service.name}</p>
              <p className="text-sm text-muted-foreground">
                {service.duration_minutes} min • {service.category}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold">R$ {service.price?.toFixed(2)}</span>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => { setEditingService(service); setShowServiceModal(true); }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleToggleServiceActive(service)}
                >
                  {service.is_active ? 'Desativar' : 'Ativar'}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-destructive"
                  onClick={() => handleDeleteService(service.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBarbers = () => (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Button onClick={() => { setEditingBarber(null); setShowBarberModal(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Barbeiro
        </Button>
      </div>

      <div className="grid gap-3">
        {barbers.map((barber) => (
          <div key={barber.id} className={cn(
            'bg-card border rounded-lg p-4 flex justify-between items-center',
            !barber.is_active && 'opacity-60'
          )}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">{barber.name}</p>
                <p className="text-sm text-muted-foreground">{barber.specialty || 'Barbeiro'}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => { setEditingBarber(barber); setShowBarberModal(true); }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleToggleBarberActive(barber)}
              >
                {barber.is_active ? 'Desativar' : 'Ativar'}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-destructive"
                onClick={() => handleDeleteBarber(barber.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-2xl font-bold">{stats.totalAppointments}</p>
          <p className="text-sm text-muted-foreground">Total Agendamentos</p>
        </div>
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-2xl font-bold">R$ {stats.totalRevenue.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground">Receita Total</p>
        </div>
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</p>
          <p className="text-sm text-muted-foreground">Pagamentos Pendentes</p>
        </div>
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-2xl font-bold text-green-600">{stats.completedToday}</p>
          <p className="text-sm text-muted-foreground">Concluídos Hoje</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Painel Admin</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.totalAppointments}</p>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Receita</span>
            </div>
            <p className="text-2xl font-bold mt-1">R$ {stats.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Scissors className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Serviços</span>
            </div>
            <p className="text-2xl font-bold mt-1">{services.length}</p>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Barbeiros</span>
            </div>
            <p className="text-2xl font-bold mt-1">{barbers.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-card rounded-lg border p-6">
          {activeTab === 'appointments' && renderAppointments()}
          {activeTab === 'services' && renderServices()}
          {activeTab === 'barbers' && renderBarbers()}
          {activeTab === 'reports' && renderReports()}
        </div>
      </main>

      {/* Service Modal */}
      {showServiceModal && (
        <ServiceModal 
          service={editingService} 
          onClose={() => setShowServiceModal(false)} 
        />
      )}

      {/* Barber Modal */}
      {showBarberModal && (
        <BarberModal 
          barber={editingBarber} 
          onClose={() => setShowBarberModal(false)} 
        />
      )}
    </div>
  );
}

function ServiceModal({ service, onClose }: { service: Service | null; onClose: () => void }) {
  const [name, setName] = useState(service?.name || '');
  const [description, setDescription] = useState(service?.description || '');
  const [duration, setDuration] = useState(service?.duration_minutes || 30);
  const [price, setPrice] = useState(service?.price || 0);
  const [category, setCategory] = useState(service?.category || 'general');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (service) {
      await supabase.from('services').update({
        name, description, duration_minutes: duration, price, category
      }).eq('id', service.id);
    } else {
      await supabase.from('services').insert({
        name, description, duration_minutes: duration, price, category
      });
    }

    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg border p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{service ? 'Editar' : 'Novo'} Serviço</h2>
          <Button variant="ghost" size="sm" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nome</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm font-medium">Descrição</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Duração (min)</label>
              <Input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} required />
            </div>
            <div>
              <label className="text-sm font-medium">Preço (R$)</label>
              <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(Number(e.target.value))} required />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Categoria</label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="general">Geral</option>
              <option value="haircut">Corte</option>
              <option value="beard">Barba</option>
              <option value="combo">Combo</option>
              <option value="treatment">Tratamento</option>
            </select>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </form>
      </div>
    </div>
  );
}

function BarberModal({ barber, onClose }: { barber: Barber | null; onClose: () => void }) {
  const [name, setName] = useState(barber?.name || '');
  const [specialty, setSpecialty] = useState(barber?.specialty || '');
  const [phone, setPhone] = useState(barber?.phone || '');
  const [bio, setBio] = useState(barber?.bio || '');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (barber) {
      await supabase.from('barbers').update({
        name, specialty, phone, bio
      }).eq('id', barber.id);
    } else {
      await supabase.from('barbers').insert({
        name, specialty, phone, bio
      });
    }

    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg border p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{barber ? 'Editar' : 'Novo'} Barbeiro</h2>
          <Button variant="ghost" size="sm" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nome</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm font-medium">Especialidade</label>
            <Input value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="Ex: Corte masculino, Barba" />
          </div>
          <div>
            <label className="text-sm font-medium">Telefone</label>
            <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Bio</label>
            <Input value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Uma breve descrição" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </form>
      </div>
    </div>
  );
}