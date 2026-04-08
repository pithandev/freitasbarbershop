// @ts-nocheck
import { createClient } from '@/lib/supabase/server';

export async function createPaymentPreference(appointmentId: string) {
  const supabase = await createClient();

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
    notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
    back_urls: {
      success: `${process.env.NEXT_PUBLIC_APP_URL}/booking/success?appointment=${appointmentId}&status=success`,
      failure: `${process.env.NEXT_PUBLIC_APP_URL}/booking/success?appointment=${appointmentId}&status=failure`,
      pending: `${process.env.NEXT_PUBLIC_APP_URL}/booking/success?appointment=${appointmentId}&status=pending`,
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