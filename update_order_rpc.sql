CREATE OR REPLACE FUNCTION update_order_tickets(
    p_order_id text, 
    p_new_numbers text[], 
    p_new_total numeric
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
    num text;
    t_status text;
BEGIN
    -- 1. Eliminar los tickets viejos asociados a esta orden
    -- Al borrarlos de la tabla de tickets quedan libres
    DELETE FROM tickets WHERE order_id = p_order_id;

    -- 2. Intentar asignar los nuevos números
    FOREACH num IN ARRAY p_new_numbers
    LOOP
        -- Revisar si ya existe
        SELECT status INTO t_status
        FROM tickets WHERE number = num FOR UPDATE;

        IF FOUND THEN
            -- Si existe (alguien lo tiene reservado, vendido o bloqueado)
            RAISE EXCEPTION 'El número % ya está ocupado o reservado por alguien más', num;
        ELSE
            -- Si no existe, lo insertamos como vendido a esta orden
            INSERT INTO tickets (number, status, order_id)
            VALUES (num, 'vendido', p_order_id);
        END IF;
    END LOOP;

    -- 3. Actualizar la tabla de órdenes
    UPDATE orders
    SET numbers = p_new_numbers,
        total = p_new_total
    WHERE order_id = p_order_id;

    RETURN TRUE;
END;
$$;
