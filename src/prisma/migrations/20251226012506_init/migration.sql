-- ! Migration customized for snowflake
-- ! This migration is not compatible with the default migration
-- ! You need to run this migration first

-- Fecha base: 01/06/2025
CREATE OR REPLACE FUNCTION snowflake(node_id int DEFAULT 0)
RETURNS text AS $$
DECLARE
    our_epoch bigint := 1748736000000; -- milisegundos desde 01/06/2025
    seq_id bigint;
    now_millis bigint;
    safe_node_id int;
    snowflake_id bigint;
BEGIN
    -- Asegurar que node_id esté entre 0 y 1023 (10 bits)
    safe_node_id := GREATEST(0, LEAST(node_id, 1023));

    -- Usar la secuencia para obtener un número siempre único
    SELECT nextval('snowflake_seq') % 4096 INTO seq_id; -- 12 bits
    SELECT FLOOR(EXTRACT(EPOCH FROM clock_timestamp()) * 1000) INTO now_millis;

    snowflake_id := ((now_millis - our_epoch) << 22)  -- timestamp (41 bits)
                  | ((safe_node_id & 1023) << 12)     -- node id (10 bits)
                  | (seq_id & 4095);                  -- secuencia (12 bits)

    RETURN snowflake_id::text; -- Convertir a string
END;
$$ LANGUAGE plpgsql;

-- Crear secuencia si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'snowflake_seq') THEN
        CREATE SEQUENCE snowflake_seq;
    END IF;
END$$;

-- CreateEnum
CREATE TYPE "transaction_type" AS ENUM ('PURCHASE', 'PAYMENT', 'INSTALLMENT', 'REFUND', 'TRANSFER');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('PENDING', 'PARTIALLY_PAID', 'PAID');

-- CreateEnum
CREATE TYPE "currency" AS ENUM ('MXN', 'USD', 'EUR');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL DEFAULT snowflake(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "two_factor_enabled" BOOLEAN DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL DEFAULT snowflake(),
    "expires_at" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL DEFAULT snowflake(),
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "id_token" TEXT,
    "access_token_expires_at" TIMESTAMP(3),
    "refresh_token_expires_at" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verifications" (
    "id" TEXT NOT NULL DEFAULT snowflake(),
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "two_factor" (
    "id" TEXT NOT NULL DEFAULT snowflake(),
    "secret" TEXT NOT NULL,
    "backup_codes" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "two_factor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_cards" (
    "id" TEXT NOT NULL DEFAULT snowflake(),
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuer" TEXT,
    "last_four" TEXT NOT NULL,
    "credit_limit" DECIMAL(12,2) NOT NULL,
    "credit_used" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "currency" "currency" NOT NULL DEFAULT 'MXN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL DEFAULT snowflake(),
    "card_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "transaction_type" NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" "currency" NOT NULL DEFAULT 'MXN',
    "happened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "affects_credit" BOOLEAN NOT NULL DEFAULT true,
    "credit_used_after" DECIMAL(12,2),
    "is_deferred" BOOLEAN NOT NULL DEFAULT false,
    "deferred_purchase_id" TEXT,
    "outstanding_amount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "payment_status" "payment_status" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deferred_purchases" (
    "id" TEXT NOT NULL DEFAULT snowflake(),
    "original_transaction_id" TEXT NOT NULL,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "months" INTEGER NOT NULL,
    "monthly_amount" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deferred_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_allocations" (
    "id" TEXT NOT NULL DEFAULT snowflake(),
    "payment_transaction_id" TEXT NOT NULL,
    "target_transaction_id" TEXT NOT NULL,
    "amount_allocated" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "accounts_user_id_idx" ON "accounts"("user_id");

-- CreateIndex
CREATE INDEX "verifications_identifier_idx" ON "verifications"("identifier");

-- CreateIndex
CREATE INDEX "two_factor_secret_idx" ON "two_factor"("secret");

-- CreateIndex
CREATE INDEX "two_factor_user_id_idx" ON "two_factor"("user_id");

-- CreateIndex
CREATE INDEX "idx_credit_cards_user_id" ON "credit_cards"("user_id");

-- CreateIndex
CREATE INDEX "idx_transactions_card_id" ON "transactions"("card_id");

-- CreateIndex
CREATE INDEX "idx_transactions_user_id" ON "transactions"("user_id");

-- CreateIndex
CREATE INDEX "idx_transactions_deferred_purchase_id" ON "transactions"("deferred_purchase_id");

-- CreateIndex
CREATE UNIQUE INDEX "deferred_purchases_original_transaction_id_key" ON "deferred_purchases"("original_transaction_id");

-- CreateIndex
CREATE INDEX "idx_allocations_payment_tx" ON "payment_allocations"("payment_transaction_id");

-- CreateIndex
CREATE INDEX "idx_allocations_target_tx" ON "payment_allocations"("target_transaction_id");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "two_factor" ADD CONSTRAINT "two_factor_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_cards" ADD CONSTRAINT "credit_cards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "credit_cards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_deferred_purchase_id_fkey" FOREIGN KEY ("deferred_purchase_id") REFERENCES "deferred_purchases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deferred_purchases" ADD CONSTRAINT "deferred_purchases_original_transaction_id_fkey" FOREIGN KEY ("original_transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_payment_transaction_id_fkey" FOREIGN KEY ("payment_transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_target_transaction_id_fkey" FOREIGN KEY ("target_transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
