import { Temporal } from '@js-temporal/polyfill'
import { twMerge } from 'tailwind-merge'
import clsx from 'clsx'

export function nearEdge(day: number, edge: number) {
    return day <= edge ? -1 : 0
}

export function getLimitDate(
    date: Date,
    closing_day: number,
    grace_days: number,
) {
    const now = Temporal.Instant.from(date.toISOString())
        .toZonedDateTimeISO('America/Monterrey')
        .toPlainDate()

    // Elegimos el cierre del mes actual y si ya pasó el cierre de este mes, saltamos al siguiente
    const closing = now
        .with({ day: closing_day })
        .add({ months: nearEdge(now.day, closing_day) + 1 })

    // Fecha límite = cierre + días de gracia
    const limit = closing.add({ days: grace_days })

    return {
        month: limit.toLocaleString('es-MX', {
            month: 'long',
        }),
        year: limit.year,
        day: limit.day,
        date: limit.toLocaleString('es-MX', {
            month: 'long',
            day: 'numeric',
        }),
    }
}

export function getClosingDate(date: Date, closing_day: number) {
    const now = Temporal.Instant.from(date.toISOString())
        .toZonedDateTimeISO('America/Monterrey')
        .toPlainDate()

    // Elegimos el cierre del mes actual y si ya pasó el cierre de este mes, saltamos al siguiente
    const closing = now
        .with({ day: closing_day })
        .add({ months: nearEdge(now.day, closing_day) })

    return {
        month: closing.toLocaleString('es-MX', {
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
}

export function cn(...inputs: Parameters<typeof clsx>) {
    return twMerge(clsx(inputs))
}
