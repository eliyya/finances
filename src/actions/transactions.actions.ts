'use server'

import { PrismaLive } from '@/layers/db.layer'
import { getClosingDate } from '@/lib/utils'
import { db } from '@/prisma/db'
import { getCardWithTransactionsInACicleEffect } from '@/services/transactions.service'
import { Temporal } from '@js-temporal/polyfill'
import { Effect } from 'effect'

export async function getCardWithTransactionsInACicleAction(
    card_name: string,
    timestamp: number,
) {
    return await Effect.runPromise(
        Effect.scoped(
            getCardWithTransactionsInACicleEffect(card_name, timestamp)
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
    errors?: {
        date?: string
        description?: string
        amount?: string
        card_id?: string
    }
}> = async function (prevState, data) {
    const date = data.get('date') as string
    const description = data.get('description') as string
    const amount = parseFloat(data.get('amount') as string)
    const card = await db.card.findUnique({
        where: {
            id: prevState.inputs.card_id,
        },
    })
    if (!card)
        return {
            inputs: {
                date,
                description,
                amount,
                card_id: prevState.inputs.card_id,
            },
            errors: {
                card_id: 'Card not found',
            },
        }
    const date_timestamp = Temporal.ZonedDateTime.from({
        timeZone: 'America/Monterrey',
        day: parseInt(date.split('-')[2]),
        month: parseInt(date.split('-')[1]),
        year: parseInt(date.split('-')[0]),
    }).epochMilliseconds
    const closing = getClosingDate(new Date(date_timestamp), card.closing_day)
    await db.$transaction(async db => {
        await db.transaction.create({
            data: {
                date: new Date(date_timestamp),
                description,
                amount,
                card_id: prevState.inputs.card_id,
                debt: amount < 0 ? 0 : amount,
                balance: card.balance + amount,
                period: new Date(closing.timestamp),
            },
        })
        await db.card.update({
            where: {
                id: prevState.inputs.card_id,
            },
            data: {
                balance: {
                    increment: amount,
                },
            },
        })
        if (amount > 0) return
        const transactions = await db.transaction.findMany({
            where: { debt: { gt: 0 } },
            orderBy: { date: 'asc' },
        })
        for (
            let rest = Math.abs(amount), i = 0;
            rest > 0 && i < transactions.length;
            i++
        ) {
            const tx = transactions[i]
            const amountToPay = Math.min(tx.debt, rest)
            const debt = tx.debt - amountToPay
            rest -= amountToPay
            await db.transaction.update({
                where: { id: tx.id },
                data: { debt },
            })
        }
    })

    return {
        inputs: {
            date: new Date().toISOString().slice(0, 10),
            description: '',
            amount: 0,
            card_id: prevState.inputs.card_id,
        },
    }
}

export async function getTransactions(card_name: string) {
    const card = await getCardWithTransactionsInACicleAction(
        card_name,
        Temporal.Now.zonedDateTimeISO('America/Monterrey').subtract({
            months: 1,
        }).epochMilliseconds,
    )
    if (!card) return { card: null, transactions: [] }
    return { card, transactions: card.transactions }
}
