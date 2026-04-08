// @ts-nocheck
const REAL_SUPABASE_URL = 'https://emrjanuxmmgctjhctaty.supabase.co';
const REAL_SUPABASE_KEY = 'sb_publishable_EhILy3hsiRItmhZpXPiHKg_YWE1JPIC';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || REAL_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || REAL_SUPABASE_KEY;

export async function createPaymentPreference(appointmentId: string) {
  const { createServerClient } = await import('@supabase/ssr');
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
      },
    },
  });

  const { data: appointment, error } = await supabase
    .from('appointments')
    .select(`
      *,
      service:services(*),
      barber:barbers(*),
      client:profiles(*)
    `)
    .eq('id', appointmentId)
    .single();

  if (error || !appointment) {
    throw new Error('Appointment not found');
  }

  const body = {
    items: [
      {
        title: appointment.service.name,
        quantity: 1,
        unit_price: Number(appointment.total_price),
        currency: 'BRL',
      }
    ],
    payer: {
      name: appointment.client.full_name,
      email: appointment.client.email || `${appointment.client.phone}@freitas.com`,
    },
    external_reference: appointment.id,
    notification_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://freitasbarbershop.vercel.app'}/api/payments/webhook`,
    back_urls: {
      success: `${process.env.NEXT_PUBLIC_APP_URL || 'https://freitasbarbershop.vercel.app'}/booking/success?appointment=${appointmentId}&status=success`,
      failure: `${process.env.NEXT_PUBLIC_APP_URL || 'https://freitasbarbershop.vercel.app'}/booking/success?appointment=${appointmentId}&status=failure`,
      pending: `${process.env.NEXT_PUBLIC_APP_URL || 'https://freitasbarbershop.vercel.app'}/booking/success?appointment=${appointmentId}&status=pending`,
    },
  };

  const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create payment preference');
  }

  const data = await response.json();

  await supabase
    .from('appointments')
    .update({
      mercadopago_preference_id: data.id,
    })
    .eq('id', appointmentId);

  return data;
}

export async function getPaymentStatus(paymentId: string) {
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: {
      'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get payment status');
  }

  return response.json();
}