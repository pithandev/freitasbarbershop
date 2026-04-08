'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Service, Barber } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format, addMinutes, setHours, setMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Scissors, CreditCard, QrCode } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookingFormProps {
  services: Service[];
  barbers: Barber[];
}

type Step = 'service' | 'barber' | 'datetime' | 'confirm' | 'payment';

export default function BookingForm({ services, barbers }: BookingFormProps) {
  const router = useRouter();
  const supabase = createClient();
  
  const [step, setStep] = useState<Step>('service');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<'pix' | 'card' | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [appointmentId, setAppointmentId] = useState<string | null>(null);

  const steps: Step[] = step === 'payment' 
    ? ['service', 'barber', 'datetime', 'confirm', 'payment']
    : ['service', 'barber', 'datetime', 'confirm'];
  const currentStepIndex = steps.indexOf(step);

  const generateTimeSlots = () => {
    if (!selectedDate) return [];
    const slots: string[] = [];
    const baseDate = selectedDate;
    let current = setHours(setMinutes(baseDate, 0), 9);
    const end = setHours(setMinutes(baseDate, 0), 19);
    
    while (current < end) {
      slots.push(format(current, 'HH:mm'));
      current = addMinutes(current, 30);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleNext = () => {
    if (step === 'service' && !selectedService) {
      setError('Selecione um serviço');
      return;
    }
    if (step === 'barber' && !selectedBarber) {
      setError('Selecione um barbeiro');
      return;
    }
    if (step === 'datetime' && (!selectedDate || !selectedTime)) {
      setError('Selecione data e horário');
      return;
    }
    if (step === 'confirm' && (!clientName || !clientPhone)) {
      setError('Preencha seu nome e WhatsApp');
      return;
    }
    setError('');
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setStep(steps[nextIndex]);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setStep(steps[prevIndex]);
    }
  };

  const handleSubmit = async () => {
    if (!clientName || !clientPhone) {
      setError('Preencha seu nome e WhatsApp');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const scheduledAt = selectedDate 
        ? new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}:00`)
        : new Date();
      const scheduledEnd = addMinutes(scheduledAt, selectedService!.duration_minutes);

      const { data: { user } } = await supabase.auth.getUser();
      
      let clientId = user?.id;
      
      if (!clientId) {
        const { data: newUser, error: signUpError } = await supabase.auth.signUp({
          email: `${clientPhone}@freitas.com`,
          password: Math.random().toString(36).slice(-8),
        });
        
        if (signUpError) {
          const { data: existingUser } = await supabase.from('profiles')
            .select('id')
            .eq('phone', clientPhone)
            .single();
          
          if (existingUser) {
            clientId = existingUser.id;
          } else {
            throw signUpError;
          }
        } else if (newUser.user) {
          clientId = newUser.user.id;
          
          await supabase.from('profiles').insert({
            id: clientId,
            full_name: clientName,
            phone: clientPhone,
            role: 'client',
          });
        }
      }

      const { data: appointment, error: apptError } = await supabase
        .from('appointments')
        .insert({
          client_id: clientId,
          barber_id: selectedBarber!.id,
          service_id: selectedService!.id,
          scheduled_at: scheduledAt.toISOString(),
          scheduled_end_at: scheduledEnd.toISOString(),
          total_price: selectedService!.price,
          status: 'pending',
          payment_status: 'pending',
          payment_method: 'cash',
        })
        .select()
        .single();

      if (apptError) throw apptError;

      setAppointmentId(appointment.id);
      setStep('payment');
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar agendamento');
      setLoading(false);
    }
  };

  const handlePayment = async (method: 'pix' | 'card') => {
    if (!appointmentId) return;
    
    setLoading(true);
    setSelectedPayment(method);

    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId }),
      });

      const data = await response.json();
      
      if (data.initPoint) {
        window.location.href = data.initPoint;
      } else {
        throw new Error('Failed to get payment URL');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar pagamento');
      setLoading(false);
    }
  };

  const handleCashPayment = async () => {
    if (!appointmentId) return;
    
    setLoading(true);
    
    try {
      router.push(`/booking/success?appointment=${appointmentId}&payment=cash`);
    } catch (err: any) {
      setError(err.message || 'Erro ao confirmar');
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'service':
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Scissors className="h-5 w-5" />
              Escolha o Serviço
            </h2>
            <div className="grid gap-3">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className={cn(
                    'flex items-center justify-between p-4 rounded-lg border text-left transition-all',
                    selectedService?.id === service.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary/50'
                  )}
                >
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-muted-foreground">{service.duration_minutes} min</p>
                  </div>
                  <span className="font-semibold">R$ {service.price.toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'barber':
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Escolha o Barbeiro
            </h2>
            <div className="grid gap-3">
              {barbers.map((barber) => (
                <button
                  key={barber.id}
                  onClick={() => setSelectedBarber(barber)}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-lg border text-left transition-all',
                    selectedBarber?.id === barber.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary/50'
                  )}
                >
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{barber.name}</p>
                    {barber.specialty && (
                      <p className="text-sm text-muted-foreground">{barber.specialty}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'datetime':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Escolha Data e Horário
            </h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Data</label>
              <Input
                type="date"
                value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>

            {selectedDate && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Horário</label>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={cn(
                        'p-2 rounded-md border text-sm font-medium transition-all',
                        selectedTime === time
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'hover:border-primary'
                      )}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'confirm':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Confirmar Agendamento</h2>
            
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Serviço</span>
                <span className="font-medium">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Barbeiro</span>
                <span className="font-medium">{selectedBarber?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data</span>
                <span className="font-medium">
                  {selectedDate && format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Horário</span>
                <span className="font-medium">{selectedTime}</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-lg">
                <span className="font-semibold">Total</span>
                <span className="font-bold">R$ {selectedService?.price.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Seu Nome</label>
                <Input
                  placeholder="Seu nome completo"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">WhatsApp</label>
                <Input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Escolha a Forma de Pagamento
            </h2>

            <div className="bg-muted p-4 rounded-lg space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Serviço</span>
                <span>{selectedService?.name}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>R$ {selectedService?.price.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid gap-3">
              <button
                onClick={() => handlePayment('pix')}
                disabled={loading}
                className="flex items-center gap-4 p-4 rounded-lg border hover:border-primary/50 transition-all text-left"
              >
                <QrCode className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium">PIX</p>
                  <p className="text-sm text-muted-foreground">Pagamento instantâneo</p>
                </div>
              </button>
              
              <button
                onClick={() => handlePayment('card')}
                disabled={loading}
                className="flex items-center gap-4 p-4 rounded-lg border hover:border-primary/50 transition-all text-left"
              >
                <CreditCard className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-medium">Cartão de Crédito</p>
                  <p className="text-sm text-muted-foreground">Parcele em até 12x</p>
                </div>
              </button>

              <button
                onClick={handleCashPayment}
                disabled={loading}
                className="flex items-center gap-4 p-4 rounded-lg border hover:border-primary/50 transition-all text-left"
              >
                <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center">
                  <span className="text-lg">R$</span>
                </div>
                <div>
                  <p className="font-medium">Dinheiro</p>
                  <p className="text-sm text-muted-foreground">Pague na barbearia</p>
                </div>
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-6 overflow-x-auto">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center flex-shrink-0">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                i <= currentStepIndex
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {i < currentStepIndex ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className={cn(
                'w-6 h-0.5 mx-1',
                i < currentStepIndex ? 'bg-primary' : 'bg-muted'
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 text-sm bg-destructive/10 text-destructive rounded-md">
          {error}
        </div>
      )}

      {/* Content */}
      <div className="bg-card rounded-lg border p-6">
        {step === 'payment' && loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Redirecionando para pagamento...</p>
          </div>
        ) : (
          renderStepContent()
        )}
      </div>

      {/* Navigation */}
      {step !== 'payment' && (
        <div className="flex gap-3 mt-6">
          {currentStepIndex > 0 && (
            <Button variant="outline" onClick={handleBack} className="flex-1">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          )}
          {step === 'confirm' ? (
            <Button onClick={handleSubmit} disabled={loading} className="flex-1">
              {loading ? 'Confirmando...' : 'Escolher Pagamento'}
            </Button>
          ) : (
            <Button onClick={handleNext} className="flex-1">
              Próximo
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}