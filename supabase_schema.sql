-- 1. Create the orders table
CREATE TABLE IF NOT EXISTS orders (
    order_id VARCHAR(100) PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    raffle_name VARCHAR(255),
    nombre VARCHAR(255) NOT NULL,
    cedula VARCHAR(50),
    telefono VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    referencia VARCHAR(255) NOT NULL,
    numbers TEXT[] NOT NULL,
    total NUMERIC NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    receipt_url TEXT
);

-- 2. Create the tickets table
CREATE TABLE IF NOT EXISTS tickets (
    number VARCHAR(4) PRIMARY KEY,
    status VARCHAR(20) NOT NULL DEFAULT 'reservado', -- 'reservado', 'vendido', 'bloqueado'
    session_id VARCHAR(100),
    order_id VARCHAR(100),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.5 Create the order_logs table for auditing
CREATE TABLE IF NOT EXISTS order_logs (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(100) REFERENCES orders(order_id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    details JSONB,
    performed_by VARCHAR(50) DEFAULT 'sistema',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Atomic reservation function
CREATE OR REPLACE FUNCTION reserve_tickets(p_numbers text[], p_session_id text, p_expires_at timestamptz)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
    num text;
    existing_status text;
    existing_expires timestamptz;
BEGIN
    DELETE FROM tickets WHERE status = 'reservado' AND expires_at < NOW() AND session_id != p_session_id;
    DELETE FROM tickets WHERE session_id = p_session_id AND status = 'reservado' AND NOT (number = ANY(p_numbers));

    FOREACH num IN ARRAY p_numbers
    LOOP
        SELECT status, expires_at INTO existing_status, existing_expires
        FROM tickets WHERE number = num FOR UPDATE;
        
        IF FOUND THEN
            IF existing_status = 'vendido' OR existing_status = 'bloqueado' THEN
                RETURN FALSE;
            END IF;
            IF existing_status = 'reservado' AND existing_expires > NOW() THEN
                IF (SELECT session_id FROM tickets WHERE number = num) != p_session_id THEN
                    RETURN FALSE;
                END IF;
            END IF;
            
            UPDATE tickets
            SET status = 'reservado',
                session_id = p_session_id,
                order_id = NULL,
                expires_at = p_expires_at
            WHERE number = num;
        ELSE
            INSERT INTO tickets (number, status, session_id, expires_at)
            VALUES (num, 'reservado', p_session_id, p_expires_at);
        END IF;
    END LOOP;
    
    RETURN TRUE;
END;
$$;

-- 4. Atomic checkout validation function
CREATE OR REPLACE FUNCTION confirm_order_tickets(p_numbers text[], p_session_id text, p_order_id text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
    num text;
    t_session_id text;
    t_status text;
    t_expires timestamptz;
BEGIN
    FOREACH num IN ARRAY p_numbers
    LOOP
        SELECT session_id, status, expires_at INTO t_session_id, t_status, t_expires
        FROM tickets WHERE number = num FOR UPDATE;
        
        IF NOT FOUND OR t_session_id != p_session_id OR t_status != 'reservado' OR t_expires < NOW() THEN
            RETURN FALSE;
        END IF;
    END LOOP;
    
    FOREACH num IN ARRAY p_numbers
    LOOP
        UPDATE tickets
        SET status = 'vendido',
            order_id = p_order_id,
            expires_at = NULL
        WHERE number = num;
    END LOOP;
    
    RETURN TRUE;
END;
$$;

-- 5. Helper function to completely clear reservations for a session
CREATE OR REPLACE FUNCTION release_session_tickets(p_session_id text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM tickets WHERE session_id = p_session_id AND status = 'reservado';
END;
$$;

-- 6. Setup Storage for receipts
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', true) ON CONFLICT DO NOTHING;

-- Storage Policies for receipts bucket
-- Allow public read access to receipts
CREATE POLICY "Public Access to Receipts" ON storage.objects FOR SELECT USING (bucket_id = 'receipts');

-- Allow anon to upload receipts
CREATE POLICY "Anon Upload Receipts" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'receipts');

-- Security Policies (RLS)
-- You can enable RLS on orders and tickets if you wish to restrict access to authenticated users:
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
