-- Quantara Supabase Schema
-- Run this in the Supabase SQL Editor

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  plan TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Datasets table
CREATE TABLE IF NOT EXISTS datasets (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  s3_key TEXT NOT NULL,
  rows INTEGER DEFAULT 0,
  columns JSONB DEFAULT '[]'::jsonb,
  size INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'processing',
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_datasets_owner ON datasets(owner_id);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  razorpay_subscription_id TEXT,
  razorpay_customer_id TEXT,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);

-- Predictions log table for tracking usage
CREATE TABLE IF NOT EXISTS predictions_log (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_predictions_user ON predictions_log(user_id);
CREATE INDEX idx_predictions_created ON predictions_log(created_at);
