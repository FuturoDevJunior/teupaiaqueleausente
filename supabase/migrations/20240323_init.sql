-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE email_status AS ENUM ('active', 'deleted', 'expired');
CREATE TYPE rate_limit_type AS ENUM ('email_generation', 'email_fetch', 'email_delete');

-- Create sessions table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address TEXT NOT NULL,
    user_agent TEXT,
    is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
    blocked_until TIMESTAMPTZ
);

-- Create rate_limits table
CREATE TABLE rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    limit_type rate_limit_type NOT NULL,
    request_count INTEGER NOT NULL DEFAULT 1,
    first_request_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_request_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (session_id, limit_type)
);

-- Create temporary_emails table
CREATE TABLE temporary_emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    status email_status NOT NULL DEFAULT 'active',
    UNIQUE (email)
);

-- Create emails table
CREATE TABLE emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient TEXT NOT NULL,
    sender TEXT NOT NULL,
    subject TEXT NOT NULL,
    preview TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read BOOLEAN NOT NULL DEFAULT FALSE,
    encrypted BOOLEAN NOT NULL DEFAULT TRUE,
    temporary_email_id UUID REFERENCES temporary_emails(id) ON DELETE CASCADE
);

-- Create error_logs table
CREATE TABLE error_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    error_stack TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create performance_metrics table
CREATE TABLE performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    operation TEXT NOT NULL,
    duration INTEGER NOT NULL, -- in milliseconds
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create security_events table
CREATE TABLE security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_sessions_ip_address ON sessions(ip_address);
CREATE INDEX idx_rate_limits_session_type ON rate_limits(session_id, limit_type);
CREATE INDEX idx_temporary_emails_email ON temporary_emails(email);
CREATE INDEX idx_temporary_emails_session ON temporary_emails(session_id);
CREATE INDEX idx_emails_recipient ON emails(recipient);
CREATE INDEX idx_emails_created_at ON emails(created_at);
CREATE INDEX idx_error_logs_session ON error_logs(session_id);
CREATE INDEX idx_performance_metrics_session ON performance_metrics(session_id);
CREATE INDEX idx_security_events_session ON security_events(session_id);

-- Create functions
CREATE OR REPLACE FUNCTION cleanup_expired_data() RETURNS void AS $$
BEGIN
    -- Delete expired temporary emails
    UPDATE temporary_emails
    SET status = 'expired'
    WHERE expires_at < NOW()
    AND status = 'active';

    -- Delete old error logs (keep last 30 days)
    DELETE FROM error_logs
    WHERE created_at < NOW() - INTERVAL '30 days';

    -- Delete old performance metrics (keep last 7 days)
    DELETE FROM performance_metrics
    WHERE created_at < NOW() - INTERVAL '7 days';

    -- Delete old security events (keep last 90 days)
    DELETE FROM security_events
    WHERE created_at < NOW() - INTERVAL '90 days';

    -- Delete old sessions (keep last 24 hours)
    DELETE FROM sessions
    WHERE last_active_at < NOW() - INTERVAL '24 hours'
    AND NOT EXISTS (
        SELECT 1 FROM temporary_emails
        WHERE temporary_emails.session_id = sessions.id
        AND temporary_emails.status = 'active'
    );
END;
$$ LANGUAGE plpgsql;

-- Create function to update session activity
CREATE OR REPLACE FUNCTION update_session_activity(p_session_id UUID) RETURNS void AS $$
BEGIN
    UPDATE sessions
    SET last_active_at = NOW()
    WHERE id = p_session_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to check rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_session_id UUID,
    p_limit_type rate_limit_type,
    p_max_requests INTEGER,
    p_window_seconds INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
    v_count INTEGER;
    v_first_request TIMESTAMPTZ;
BEGIN
    -- Get current count and first request time
    SELECT request_count, first_request_at
    INTO v_count, v_first_request
    FROM rate_limits
    WHERE session_id = p_session_id
    AND limit_type = p_limit_type;

    -- If no existing record, create one
    IF v_count IS NULL THEN
        INSERT INTO rate_limits (session_id, limit_type)
        VALUES (p_session_id, p_limit_type)
        RETURNING request_count, first_request_at
        INTO v_count, v_first_request;
    END IF;

    -- Check if window has expired
    IF NOW() - v_first_request > make_interval(secs := p_window_seconds) THEN
        -- Reset counter
        UPDATE rate_limits
        SET request_count = 1,
            first_request_at = NOW(),
            last_request_at = NOW()
        WHERE session_id = p_session_id
        AND limit_type = p_limit_type;
        RETURN TRUE;
    END IF;

    -- Check if limit exceeded
    IF v_count >= p_max_requests THEN
        RETURN FALSE;
    END IF;

    -- Increment counter
    UPDATE rate_limits
    SET request_count = request_count + 1,
        last_request_at = NOW()
    WHERE session_id = p_session_id
    AND limit_type = p_limit_type;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create scheduled job for cleanup
SELECT cron.schedule(
    'cleanup-expired-data',
    '0 * * * *', -- Run every hour
    'SELECT cleanup_expired_data()'
); 