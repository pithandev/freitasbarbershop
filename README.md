# FREITAS BARBERSHOP - Micro-SaaS para Barbearias

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth + PostgreSQL)
- **Payments**: Mercado Pago (PIX/Cartão)
- **Deploy**: Vercel

## Configuração

### 1. Supabase

1. Criar projeto em [supabase.com](https://supabase.com)
2. Executar SQL em `sql/schema.sql` no SQL Editor
3. Criar usuário admin manualmente via Dashboard

### 2. Variáveis de Ambiente

Criar `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=your_mp_public_key
MERCADO_PAGO_ACCESS_TOKEN=your_mp_access_token
MERCADO_PAGO_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Mercado Pago

1. Criar conta em [mercadopago.com.br](https://www.mercadopago.com.br)
2. Criar aplicação em Dev Center
3. Configurar webhook:
   - URL: `https://seudominio.com/api/payments/webhook`
   - Eventos: `payment`

## Deploy na Vercel

### Passo 1: Preparar repositório

```bash
cd freitas-barbershop
git init
git add .
git commit -m "Initial commit: FREITAS BARBERSHOP"
```

### Passo 2: Vercel

1. Acessar [vercel.com](https://vercel.com)
2. "Add New..." → Project
3. Importar do GitHub
4. Framework Preset: Next.js
5. Environment Variables (copiar do .env.local):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY`
   - `MERCADO_PAGO_ACCESS_TOKEN`
   - `MERCADO_PAGO_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_APP_URL` (alterar para URL da Vercel)
6. Deploy

### Passo 3: Supabase

1. Executar `sql/schema.sql` no SQL Editor do Supabase
2. Criar primeiro usuário admin via Dashboard

### Passo 4: Mercado Pago

1. Atualizar `NEXT_PUBLIC_APP_URL` na Vercel
2. Configurar webhook no painel do Mercado Pago

## Estrutura do Projeto

```
freitas-barbershop/
├── sql/
│   └── schema.sql          # Banco de dados
├── src/
│   ├── app/
│   │   ├── (auth)/         # Login/Registro
│   │   ├── admin/          # Dashboard Admin
│   │   ├── barber/         # Dashboard Barbeiro
│   │   ├── booking/        # Agendamento
│   │   ├── profile/       # Perfil Cliente
│   │   └── api/           # API Routes
│   ├── components/ui/     # Componentes UI
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Supabase + Utils
│   └── types/             # TypeScript types
├── .env.example
└── README.md
```

## Scripts

```bash
npm run dev      # Desenvolvimento local
npm run build    # Build produção
npm run lint     # Verificar código
```

## Funcionalidades

| Módulo | Descrição |
|--------|-----------|
| **Landing** | Homepage com CTA |
| **Auth** | Login/Registro com email |
| **Booking** | Wizard 5 etapas |
| **Profile** | Meus agendamentos |
| **Barber** | Agenda do dia |
| **Admin** | CRUD serviços/barbeiros |
| **Payment** | PIX/Cartão via Mercado Pago |