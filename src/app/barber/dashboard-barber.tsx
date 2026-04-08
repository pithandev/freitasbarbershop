'use client';

import { useState } from 'react';
import { Appointment } from '@/types/database';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, X, Clock, User, Scissors, Phone, MoreVertical } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface DashboardBarberProps {
  appointments: Appointment[];
}

export default function DashboardBarber({ appointments: initialAppointments }: DashboardBarberProps) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const updateStatus = async (id: string, status: 'completed' | 'cancelled' | 'confirmed') => {
    setLoading(true);
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id);

    if (!error) {
      setAppointments(prev => 
        prev.map(apt => apt.id === id ? { ...apt, status } : apt)
      );
    }
    setLoading(false);
  };

  const stats = {
    total: appointments.length,
    completed: appointments.filter(a => a.status === 'completed').length,
    pending: appointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-xl font-bold">Dashboard - Agenda do Dia</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-muted p-4 rounded-lg text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </div>
          <div className="bg-muted p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-sm text-muted-foreground">Concluídos</p>
          </div>
          <div className="bg-muted p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">Pendentes</p>
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum agendamento para hoje</p>
            </div>
          ) : (
            appointments.map((appointment) => (
              <div
                key={appointment.id}
                className={cn(
                  'bg-card border rounded-lg p-4',
                  appointment.status === 'completed' && 'opacity-60',
                  appointment.status === 'cancelled' && 'opacity-60'
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">
                        {format(new Date(appointment.scheduled_at), 'HH:mm')}
                      </span>
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        appointment.status === 'completed' && 'bg-green-100 text-green-700',
                        appointment.status === 'pending' && 'bg-yellow-100 text-yellow-700',
                        appointment.status === 'confirmed' && 'bg-blue-100 text-blue-700',
                        appointment.status === 'cancelled' && 'bg-red-100 text-red-700'
                      )}>
                        {appointment.status === 'pending' && 'Pendente'}
                        {appointment.status === 'confirmed' && 'Confirmado'}
                        {appointment.status === 'completed' && 'Concluído'}
                        {appointment.status === 'cancelled' && 'Cancelado'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{appointment.client?.full_name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{appointment.client?.phone}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Scissors className="h-4 w-4 text-muted-foreground" />
                      <span>{appointment.service?.name}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateStatus(appointment.id, 'completed')}
                          disabled={loading}
                          className="w-full"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Concluir
                        </Button>
                        {appointment.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(appointment.id, 'confirmed')}
                            disabled={loading}
                            className="w-full"
                          >
                            Confirmar
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateStatus(appointment.id, 'cancelled')}
                          disabled={loading}
                          className="w-full text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancelar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}