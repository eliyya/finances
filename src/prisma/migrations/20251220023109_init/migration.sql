-- CreateEnum
CREATE TYPE "transaction_type" AS ENUM ('PURCHASE', 'PAYMENT', 'INSTALLMENT', 'REFUND', 'TRANSFER');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('PENDING', 'PARTIALLY_PAID', 'PAID');

-- CreateEnum
CREATE TYPE "currency" AS ENUM ('MXN', 'USD', 'EUR');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_cards" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
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
    "id" SERIAL NOT NULL,
    "card_id" INTEGER,
    "user_id" INTEGER NOT NULL,
    "type" "transaction_type" NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" "currency" NOT NULL DEFAULT 'MXN',
    "happened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "affects_credit" BOOLEAN NOT NULL DEFAULT true,
    "credit_used_after" DECIMAL(12,2),
    "is_deferred" BOOLEAN NOT NULL DEFAULT false,
    "deferred_purchase_id" INTEGER,
    "outstanding_amount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "payment_status" "payment_status" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deferred_purchases" (
    "id" SERIAL NOT NULL,
    "original_transaction_id" INTEGER NOT NULL,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "months" INTEGER NOT NULL,
    "monthly_amount" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deferred_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_allocations" (
    "id" SERIAL NOT NULL,
    "payment_transaction_id" INTEGER NOT NULL,
    "target_transaction_id" INTEGER NOT NULL,
    "amount_allocated" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

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
ALTER TABLE "credit_cards" ADD CONSTRAINT "credit_cards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "credit_cards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
