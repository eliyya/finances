process.loadEnvFile()
import { Temporal } from '@js-temporal/polyfill'
import { db } from './prisma/db.ts'

const to: [string, string, number][] = [
    ['21/10/25', 'Pago', -105.2],
    ['22/10/25', 'Pizza', 73.0],
    ['22/10/25', 'Netflix', 119.0],
    ['23/10/25', 'Dominio', 225.0],
    ['24/10/25', 'Comida', 211.98],
    ['7/11/25', 'Bebidas cena', 46.0],
    ['7/11/25', 'pizza', 193.0],
    ['9/11/25', 'Pago', -762.78],
    ['9/11/25', 'Pastel', 499.0],
    ['12/11/25', 'Recarga', 100.0],
    ['13/11/25', 'Pago', -100.0],
    ['13/11/25', 'pizza', 138.0],
    ['14/11/25', 'Kurai', 314.0],
    ['14/11/25', 'Temu Proyecto', 451.12],
    ['14/11/25', 'Temu Accidente', 67.44],
    ['14/11/25', 'Pago Pastel', -499.0],
    ['14/11/25', 'Pago Temu', -400.0],
    ['14/11/25', 'Pago Temu 2', -51.12],
    ['14/11/25', 'Pago kurai', -314.0],
    ['15/11/25', 'Pago Pizza', -138.0],
]

db.$transaction(async p => {
    const card = await p.card.create({
        data: {
            name: 'Stori',
            closing_day: 12,
            grace_days: 21,
        },
    })
    for (const [date, description, amount] of to) {
        const [day, month, year] = date.split('/').map(Number)
        const milis = Temporal.PlainDate.from({
            day,
            month,
            year: year + 2000,
        }).toZonedDateTime({
            timeZone: 'America/Mexico_City',
        }).epochMilliseconds
        console.log({
            data: {
                card_id: card.id,
                date: new Date(milis),
                description,
                amount,
            },
        })

        await p.transaction.create({
            data: {
                card_id: card.id,
                date: new Date(milis),
                description,
                amount,
            },
        })
    }
})

// const t = await db.transaction.findMany({
//     where: {
//         card_id: '62206372971806721',
//         date: {
//             lte: new Date(1762927200000),
//         },
//     },
// })
// console.log(t)
