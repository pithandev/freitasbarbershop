import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Appointment, Service, Barber } from '@/types/database';
import AdminDashboard from './admin-dashboard';

async function getData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') redirect('/');

  const [appointmentsResult, servicesResult, barbersResult, statsResult] = await Promise.all([
    supabase
      .from('appointments')
      .select(`
        *,
        client:profiles!appointments_client_id_fkey(*),
        service:services(*),
        barber:barbers(*)
      `)
      .order('scheduled_at', { ascending: false })
      .limit(50),
    supabase.from('services').select('*').order('name'),
    supabase.from('barbers').select('*').order('display_order'),
    supabase
      .from('appointments')
      .select('status, payment_status, total_price')
  ]);

  const appointments = appointmentsResult.data as Appointment[] || [];
  const services = servicesResult.data as Service[] || [];
  const barbers = barbersResult.data as Barber[] || [];

  const stats = {
    totalAppointments: appointmentsResult.data?.length || 0,
    totalRevenue: statsResult.data?.reduce((sum, a) => sum + (a.payment_status === 'paid' ? Number(a.total_price) : 0), 0) || 0,
    pendingPayments: statsResult.data?.filter(a => a.payment_status === 'pending').length || 0,
    completedToday: appointments.filter(a => 
      a.status === 'completed' && 
      new Date(a.scheduled_at).toDateString() === new Date().toDateString()
    ).length,
  };

  return { appointments, services, barbers, stats };
}

export default async function AdminPage() {
  const { appointments, services, barbers, stats } = await getData();

  return (
    <AdminDashboard 
      appointments={appointments}
      services={services}
      barbers={barbers}
      stats={stats}
    />
  );
}