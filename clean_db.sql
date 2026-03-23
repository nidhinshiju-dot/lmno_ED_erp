DO $$ 
DECLARE 
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename NOT IN ('users', 'school_settings', 'attendance_status_types', 'whatsapp_config')) 
  LOOP
    EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE';
  END LOOP;
  DELETE FROM users WHERE email != 'admin@tella.com';
END $$;
