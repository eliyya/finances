import { PrismaError } from '@/errors/effect.error'
import { PrismaService } from '@/layers/db.layer'
import { Temporal } from '@js-temporal/polyfill'
import { Effect } from 'effect'

const nearEdge = (day: number, edge: number) =>
    Effect.succeed(day <= edge ? -1 : 0)

const getClosingDate = (date: number, closing_day: number) =>
    Effect.gen(function* (_) {
        const now = Temporal.Instant.fromEpochMilliseconds(date)
            .toZonedDateTimeISO('America/Monterrey')
            .toPlainDate()

        // Elegimos el cierre del mes actual y si ya pasó el cierre de este mes, saltamos al siguiente
        const closing = now
            .with({ day: closing_day })
            .add({ months: yield* _(nearEdge(now.day, closing_day)) })

        return {
            month: closing.month,
            month_name: closing.toLocaleString('es-MX', {
                month: 'long',
            }),
            year: closing.year,
            day: closing.day,
            date: closing.toLocaleString('es-MX', {
                month: 'long',
                day: 'numeric',
            }),
            timestamp:
                closing.toZonedDateTime('America/Monterrey').epochMilliseconds,
        }
    })

const getLimitDate = (date: number, closing_day: number, grace_days: number) =>
    Effect.gen(function* (_) {
        const now = Temporal.Instant.fromEpochMilliseconds(date)
            .toZonedDateTimeISO('America/Monterrey')
            .toPlainDate()

        // Elegimos el cierre del mes actual y si ya pasó el cierre de este mes, saltamos al siguiente
        const closing = now
            .with({ day: closing_day })
            .add({ months: (yield* _(nearEdge(now.day, closing_day))) + 1 })

        // Fecha límite = cierre + días de gracia
        const limit = closing.add({ days: grace_days })

        return {
            month: limit.month,
            month_name: limit.toLocaleString('es-MX', {
                month: 'long',
            }),
            year: limit.year,
            day: limit.day,
            date: limit.toLocaleString('es-MX', {
                month: 'long',
                day: 'numeric',
            }),
            timestamp:
                limit.toZonedDateTime('America/Monterrey').epochMilliseconds,
        }
    })

export function getCardWithTransactionsEffect(card_id: string) {
    return Effect.gen(function* (_) {
        const prisma = yield* _(PrismaService)

        const transactions = yield* _(
            Effect.tryPromise({
                try: () =>
                    prisma.card.findUnique({
                        where: {
                            id: card_id,
                        },
                        include: {
                            transactions: {
                                orderBy: { date: 'desc' },
                            },
                        },
                    }),
                catch: error => new PrismaError({ cause: error }),
            }),
        )

        return transactions
    })
}

type TransactionMapped = {
    id: string
    createdAt: number
    updatedAt: number
    date: number
    card_id: string
    amount: number
    description: string
    limit: {
        month: number
        month_name: string
        year: number
        day: number
        date: string
        timestamp: number
    }
    closing: {
        month: number
        month_name: string
        year: number
        day: number
        date: string
        timestamp: number
    }
    is_actual_limit: boolean
    is_actual_closing: boolean
}
export function getCardWithTransactionsInACicleEffect(
    card_id: string,
    timestamp: number,
) {
    return Effect.gen(function* (_) {
        const prisma = yield* _(PrismaService)

        const card = yield* _(
            Effect.tryPromise({
                try: () =>
                    prisma.card.findUnique({
                        where: {
                            id: card_id,
                        },
                    }),
                catch: error => new PrismaError({ cause: error }),
            }),
        )

        if (!card) return null

        const closing = yield* _(getClosingDate(timestamp, card.closing_day))
        const transactions = yield* _(
            Effect.tryPromise({
                try: () =>
                    prisma.transaction.findMany({
                        where: {
                            card_id: card.id,
                            date: {
                                gt: new Date(
                                    Temporal.Instant.fromEpochMilliseconds(
                                        closing.timestamp,
                                    ).toZonedDateTimeISO(
                                        'America/Monterrey',
                                    ).epochMilliseconds,
                                ),
                            },
                        },
                        orderBy: { date: 'desc' },
                    }),
                catch: error => new PrismaError({ cause: error }),
            }),
        )
        let transformed: TransactionMapped[] = []
        if (card) {
            transformed = yield* _(
                Effect.forEach(transactions, transaction =>
                    Effect.gen(function* (_) {
                        const limit = yield* _(
                            getLimitDate(
                                transaction.date.getTime(),
                                card.closing_day,
                                card.grace_days,
                            ),
                        )
                        const closing = yield* _(
                            getClosingDate(
                                transaction.date.getTime(),
                                card.closing_day,
                            ),
                        )
                        const newTransaction: TransactionMapped = {
                            ...transaction,
                            createdAt: transaction.createdAt.getTime(),
                            updatedAt: transaction.updatedAt.getTime(),
                            date: transaction.date.getTime(),
                            limit,
                            closing,
                            is_actual_limit:
                                limit.month ===
                                Temporal.Now.zonedDateTimeISO(
                                    'America/Monterrey',
                                ).add({ days: card.grace_days }).month,
                            is_actual_closing:
                                closing.month ===
                                Temporal.Now.zonedDateTimeISO(
                                    'America/Monterrey',
                                ).month,
                        }
                        return newTransaction
                    }),
                ),
            )
        }
        return {
            ...card,
            transactions: transformed,
        }
    })
}
