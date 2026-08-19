-- PostgreSQL initialization script
-- This file is executed when the PostgreSQL container starts for the first time

-- Create additional databases if needed
-- CREATE DATABASE app_data;
-- CREATE DATABASE logs;

-- Create sample tables (optional)
-- \c app_data;
-- CREATE TABLE IF NOT EXISTS users (
--   id SERIAL PRIMARY KEY,
--   name VARCHAR(255) NOT NULL,
--   email VARCHAR(255) NOT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- Grant permissions
-- GRANT ALL PRIVILEGES ON DATABASE app_data TO postgres;
