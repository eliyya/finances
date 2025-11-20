'use server'

import { PrismaLive } from '@/layers/db.layer'
import { db } from '@/prisma/db'
import { getCardWithTransactionsInACicleEffect } from '@/services/transactions.service'
import { Temporal } from '@js-temporal/polyfill'
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
    inputs: {
        date: string
        description: string
        amount: number
        card_id: string
    }
    errors?: { date?: string; description?: string; amount?: string }
}> = async function (prevState, data) {
    const date = data.get('date') as string
    const description = data.get('description') as string
    const amount = parseFloat(data.get('amount') as string)

    await db.transaction.create({
        data: {
            date: new Date(
                Temporal.ZonedDateTime.from({
                    timeZone: 'America/Monterrey',
                    day: parseInt(date.split('-')[2]),
                    month: parseInt(date.split('-')[1]),
                    year: parseInt(date.split('-')[0]),
                }).epochMilliseconds,
            ),
            description,
            amount,
            card_id: prevState.inputs.card_id,
        },
    })

    updateTag('transactions')
    return {
        inputs: {
            date: new Date().toISOString().slice(0, 10),
            description: '',
            amount: 0,
            card_id: prevState.inputs.card_id,
        },
    }
}
