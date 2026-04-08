-- =====================================================
-- FREITAS BARBERSHOP - Banco de Dados Supabase
-- =====================================================

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE user_role AS ENUM ('client', 'barber', 'admin');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded', 'failed');
CREATE TYPE payment_method AS ENUM ('pix', 'card', 'cash');

-- =====================================================
-- TABELA: PROFILES (usuários/clientes)
-- =====================================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email TEXT,
    role user_role DEFAULT 'client',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: BARBERS (barbeiros/funcionários)
-- =====================================================

CREATE TABLE barbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    specialty TEXT,
    bio TEXT,
    phone VARCHAR(20),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: SERVICES (serviços disponíveis)
-- =====================================================

CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    is_active BOOLEAN DEFAULT true,
    category TEXT DEFAULT 'general',
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: APPOINTMENTS (agendamentos)
-- =====================================================

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    barber_id UUID NOT NULL REFERENCES barbers(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    scheduled_at TIMESTAMPTZ NOT NULL,
    scheduled_end_at TIMESTAMPTZ NOT NULL,
    status appointment_status DEFAULT 'pending',
    payment_status payment_status DEFAULT 'pending',
    payment_method payment_method,
    payment_id TEXT,
    mercadopago_preference_id TEXT,
    total_price DECIMAL(10,2) NOT NULL,
    notes TEXT,
    cancel_reason TEXT,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: AVAILABILITY (horários de funcionamento)
-- =====================================================

CREATE TABLE availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barber_id UUID REFERENCES barbers(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL CHECK (end_time > start_time),
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: SPECIFIC AVAILABILITY (datas específicas - folgas/feriados)
-- =====================================================

CREATE TABLE specific_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barber_id UUID REFERENCES barbers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    is_available BOOLEAN DEFAULT false,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX idx_appointments_client ON appointments(client_id);
CREATE INDEX idx_appointments_barber ON appointments(barber_id);
CREATE INDEX idx_appointments_scheduled ON appointments(scheduled_at);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_availability_barber_day ON availability(barber_id, day_of_week);
CREATE INDEX idx_specific_availability_date ON specific_availability(date);

-- =====================================================
-- TRIGGER: ATUALIZAR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_barbers_updated_at
    BEFORE UPDATE ON barbers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_availability_updated_at
    BEFORE UPDATE ON availability
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- 1. PROFILES - usuários veem apenas seus próprios dados
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Admins podem ver todos os perfis
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    );

-- 2. BARBERS - todos podem ver barbeiros ativos
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active barbers" ON barbers
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage barbers" ON barbers
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    );

-- 3. SERVICES - clientes veem serviços ativos, admins gerenciam
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active services" ON services
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage services" ON services
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    );

-- 4. APPOINTMENTS - Regra principal
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Clientes veem apenas seus próprios agendamentos
CREATE POLICY "Clients see own appointments" ON appointments
    FOR SELECT USING (
        client_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM barbers b 
            WHERE b.user_id = auth.uid() 
            AND b.id = barber_id
        ) OR
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin'
        )
    );

-- Clientes podem criar agendamentos
CREATE POLICY "Clients can create appointments" ON appointments
    FOR INSERT WITH CHECK (client_id = auth.uid());

-- Clientes podem cancelar seus próprios agendamentos (se pendentes)
CREATE POLICY "Clients can cancel own appointments" ON appointments
    FOR UPDATE USING (
        client_id = auth.uid() 
        AND status IN ('pending', 'confirmed')
    );

-- Barbeiros podem ver e atualizar todos os agendamentos da loja
CREATE POLICY "Barbers can manage their appointments" ON appointments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM barbers b 
            WHERE b.user_id = auth.uid() 
            AND b.id = barber_id
        )
    );

-- Admins podem fazer tudo
CREATE POLICY "Admins can manage all appointments" ON appointments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin'
        )
    );

-- 5. AVAILABILITY - Barbeiros gerenciam seus próprios horários
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view availability" ON availability
    FOR SELECT USING (is_available = true);

CREATE POLICY "Barbers can manage own availability" ON availability
    FOR ALL USING (
        barber_id IN (
            SELECT id FROM barbers WHERE user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin'
        )
    );

-- 6. SPECIFIC AVAILABILITY
ALTER TABLE specific_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view specific availability" ON specific_availability
    FOR SELECT USING (is_available = true);

CREATE POLICY "Barbers can manage own specific availability" ON specific_availability
    FOR ALL USING (
        barber_id IN (
            SELECT id FROM barbers WHERE user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin'
        )
    );

-- =====================================================
-- FUNÇÕES AUXILIARES
-- =====================================================

-- Buscar perfil do usuário atual
CREATE OR REPLACE FUNCTION get_current_profile()
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    phone VARCHAR(20),
    email TEXT,
    role user_role,
    avatar_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.full_name, p.phone, p.email, p.role, p.avatar_url
    FROM profiles p
    WHERE p.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar se usuário é barbeiro
CREATE OR REPLACE FUNCTION is_barber()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM barbers b 
        WHERE b.user_id = auth.uid() 
        AND b.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar se usuário é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles p 
        WHERE p.id = auth.uid() 
        AND p.role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- DADOS INICIAIS (SEED)
-- =====================================================

--OBSERVAÇÃO: Execute após criar o banco via Dashboard do Supabase ou linha de comando
-- Estes dados são exemplos, ajuste conforme necessidade

/*
-- Inserir serviços padrão
INSERT INTO services (name, description, duration_minutes, price, category) VALUES
    ('Corte Masculino', 'Corte tradicional com máquinas e tesoura', 30, 45.00, 'haircut'),
    ('Barba', 'Modelagem e acabamento de barba', 20, 30.00, 'beard'),
    ('Corte + Barba', 'Corte masculino completo com barba', 50, 70.00, 'combo'),
    ('Pezinho', 'Aparar os lados e nuca', 15, 20.00, 'maintenance'),
    ('Acabamento', 'Sombrancelha e bigode', 10, 15.00, 'maintenance'),
    ('Tratamento Capilar', 'Hidratação ou maturação', 40, 55.00, 'treatment');

-- Inserir horário padrão (segunda a sábado)
INSERT INTO availability (day_of_week, start_time, end_time, is_available) VALUES
    (1, '09:00', '19:00', true),  -- Segunda
    (2, '09:00', '19:00', true),  -- Terça
    (3, '09:00', '19:00', true),  -- Quarta
    (4, '09:00', '19:00', true),  -- Quinta
    (5, '09:00', '19:00', true),  -- Sexta
    (6, '09:00', '18:00', true);  -- Sábado

-- Domingo fechado (não inserir registro)
*/