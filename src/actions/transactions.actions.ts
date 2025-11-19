'use server'

import { PrismaLive } from '@/layers/db.layer'
import { getCardWithTransactionsInACicleEffect } from '@/services/transactions.service'
import { Effect } from 'effect'
import { updateTag } from 'next/cache'

export async function getCardWithTransactionsInACicleAction(
    card_id: string,
    timestamp: number,
) {
    return await Effect.runPromise(
        Effect.scoped(
            getCardWithTransactionsInACicleEffect(card_id, timestamp)
                .pipe(Effect.provide(PrismaLive))
                .pipe(
                    Effect.catchAll(error => {
                        console.error(error)
                        return Effect.succeed(null)
                    }),
                ),
        ),
    )
}

type FormAction<T> = (state: T, data: FormData) => Promise<T>

export const addTransactionAction: FormAction<{
    inputs: { date: string; description: string; amount: number }
    errors?: { date?: string; description?: string; amount?: string }
}> = async function (prevState, data) {
    const date = data.get('date') as string
    const description = data.get('description') as string
    const amount = parseFloat(data.get('amount') as string)

    updateTag('transactions')
    return { inputs: { date, description, amount } }
}
