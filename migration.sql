-- Copia y pega esto en el SQL Editor de Supabase para añadir la nueva tabla de bitácora

CREATE TABLE IF NOT EXISTS order_logs (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(100) REFERENCES orders(order_id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    details JSONB,
    performed_by VARCHAR(50) DEFAULT 'sistema',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
