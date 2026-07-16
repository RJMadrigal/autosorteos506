-- 1. Create the tickets table (Single source of truth for concurrency)
CREATE TABLE IF NOT EXISTS tickets (
    number VARCHAR(4) PRIMARY KEY,
    status VARCHAR(20) NOT NULL DEFAULT 'reservado', -- 'reservado', 'vendido', 'bloqueado'
    session_id VARCHAR(100),
    order_id VARCHAR(50),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Drop the old number_reservations (we won't use it anymore)
DROP TABLE IF EXISTS number_reservations;

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
    -- Clean up any expired reservations globally just in case (optional, helps keep table clean)
    DELETE FROM tickets WHERE status = 'reservado' AND expires_at < NOW() AND session_id != p_session_id;

    -- Delete old reservations for this specific session so they don't get stuck
    DELETE FROM tickets WHERE session_id = p_session_id AND status = 'reservado' AND NOT (number = ANY(p_numbers));

    -- Loop through each number to reserve
    FOREACH num IN ARRAY p_numbers
    LOOP
        -- Lock the row if it exists
        SELECT status, expires_at INTO existing_status, existing_expires
        FROM tickets WHERE number = num FOR UPDATE;
        
        IF FOUND THEN
            -- If it's already 'vendido' or 'bloqueado', fail immediately
            IF existing_status = 'vendido' OR existing_status = 'bloqueado' THEN
                RETURN FALSE;
            END IF;
            
            -- If it's 'reservado', check if it's expired
            IF existing_status = 'reservado' AND existing_expires > NOW() THEN
                -- If it's reserved by someone else and hasn't expired, fail
                IF (SELECT session_id FROM tickets WHERE number = num) != p_session_id THEN
                    RETURN FALSE;
                END IF;
            END IF;
            
            -- Overwrite with new reservation time
            UPDATE tickets
            SET status = 'reservado',
                session_id = p_session_id,
                order_id = NULL,
                expires_at = p_expires_at
            WHERE number = num;
        ELSE
            -- Insert new reservation
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
    -- Verify all numbers belong to this session and haven't expired
    FOREACH num IN ARRAY p_numbers
    LOOP
        SELECT session_id, status, expires_at INTO t_session_id, t_status, t_expires
        FROM tickets WHERE number = num FOR UPDATE;
        
        IF NOT FOUND OR t_session_id != p_session_id OR t_status != 'reservado' OR t_expires < NOW() THEN
            -- Rollback! Someone else took it or it expired
            RETURN FALSE;
        END IF;
    END LOOP;
    
    -- Update all to vendido
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
