'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Appointment, Profile } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  User, Phone, Mail, Calendar, Scissors, Clock, CheckCircle, XCircle,
  LogOut, Pencil, X, ChevronRight
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

interface ProfileViewProps {
  profile: Profile;
  upcoming: Appointment[];
  past: Appointment[];
}

export default function ProfileView({ profile, upcoming, past }: ProfileViewProps) {
  const { signOut } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const supabase = createClient();

  const nextAppointment = upcoming[0];

  const handleCancelAppointment = async () => {
    if (!selectedAppointment || !cancelReason) return;

    await supabase
      .from('appointments')
      .update({ 
        status: 'cancelled', 
        cancel_reason: cancelReason,
        cancelled_at: new Date().toISOString()
      })
      .eq('id', selectedAppointment.id);

    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Meu Perfil</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowEditModal(true)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Profile Info */}
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{profile?.full_name}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{profile?.phone}</span>
              </div>
              {profile?.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{profile?.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Next Appointment */}
        {nextAppointment && (
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Próximo Agendamento
            </h3>
            <div className="bg-muted rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Serviço</span>
                <span className="font-medium">{nextAppointment.service?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Barbeiro</span>
                <span className="font-medium">{nextAppointment.barber?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data</span>
                <span className="font-medium">
                  {format(new Date(nextAppointment.scheduled_at), "dd 'de' MMMM", { locale: ptBR })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Horário</span>
                <span className="font-medium">
                  {format(new Date(nextAppointment.scheduled_at), 'HH:mm')}
                </span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold">R$ {nextAppointment.total_price?.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setSelectedAppointment(nextAppointment);
                  setShowCancelModal(true);
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Link href="/booking" className="flex-1">
                <Button variant="default" className="w-full">
                  Novo Agendamento
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Upcoming Appointments */}
        {upcoming.length > 1 && (
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Próximos Agendamentos</h3>
            <div className="space-y-3">
              {upcoming.slice(1).map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{apt.service?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(apt.scheduled_at), "dd/MM 'às' HH:mm")}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past Appointments */}
        {past.length > 0 && (
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Histórico</h3>
            <div className="space-y-3">
              {past.slice(0, 10).map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    {apt.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{apt.service?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(apt.scheduled_at), "dd/MM/yyyy")}
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full',
                    apt.status === 'completed' && 'bg-green-100 text-green-700',
                    apt.status === 'cancelled' && 'bg-red-100 text-red-700'
                  )}>
                    {apt.status === 'completed' && 'Concluído'}
                    {apt.status === 'cancelled' && 'Cancelado'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <Link href="/booking">
          <Button className="w-full" size="lg">
            <Scissors className="h-4 w-4 mr-2" />
            Novo Agendamento
          </Button>
        </Link>
      </main>

      {/* Edit Modal */}
      {showEditModal && (
        <EditProfileModal 
          profile={profile} 
          onClose={() => setShowEditModal(false)} 
        />
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <CancelAppointmentModal
          appointment={selectedAppointment}
          reason={cancelReason}
          setReason={setCancelReason}
          onConfirm={handleCancelAppointment}
          onClose={() => setShowCancelModal(false)}
        />
      )}
    </div>
  );
}

function EditProfileModal({ profile, onClose }: { profile: Profile; onClose: () => void }) {
  const [fullName, setFullName] = useState(profile.full_name);
  const [phone, setPhone] = useState(profile.phone);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await supabase
      .from('profiles')
      .update({ full_name: fullName, phone })
      .eq('id', profile.id);

    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg border p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Editar Perfil</h2>
          <Button variant="ghost" size="sm" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nome</label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm font-medium">WhatsApp</label>
            <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </form>
      </div>
    </div>
  );
}

function CancelAppointmentModal({
  appointment,
  reason,
  setReason,
  onConfirm,
  onClose
}: {
  appointment: Appointment | null;
  reason: string;
  setReason: (r: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg border p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Cancelar Agendamento</h2>
          <Button variant="ghost" size="sm" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja cancelar o agendamento de {appointment?.service?.name}?
          </p>
          <div>
            <label className="text-sm font-medium">Motivo do cancelamento</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="">Selecione um motivo</option>
              <option value="changed_mind">Mudei de ideia</option>
              <option value="schedule_conflict">Conflito de horário</option>
              <option value="illness">Problema de saúde</option>
              <option value="other">Outro</option>
            </select>
          </div>
          <Button 
            onClick={handleConfirm} 
            disabled={!reason || loading} 
            className="w-full"
            variant="destructive"
          >
            {loading ? 'Cancelando...' : 'Confirmar Cancelamento'}
          </Button>
        </div>
      </div>
    </div>
  );
}