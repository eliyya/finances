import { getCardWithTransactionsInACicleAction } from '@/actions/transactions.actions'
import { AddForm } from '@/components/add.form'
import { cn } from '@/lib/utils'
import { Temporal } from '@js-temporal/polyfill'
import {
    Table,
    TableThead,
    TableTbody,
    TableTh,
    TableTr,
    TableTd,
} from '@mantine/core'
import { cacheTag } from 'next/cache'
import { Suspense } from 'react'

async function getTransactions() {
    'use cache'
    cacheTag('transactions')
    const card = await getCardWithTransactionsInACicleAction(
        '62215335226376193',
        Temporal.Now.zonedDateTimeISO('America/Monterrey').subtract({
            months: 2,
        }).epochMilliseconds,
    )
    if (!card) return []
    return card.transactions
}

export default async function Home() {
    const elements = await getTransactions()

    const rows = elements.map(
        ({
            id,
            date,
            description,
            amount,
            limit,
            closing,
            is_actual_closing,
            is_actual_limit,
        }) => (
            <TableTr key={id}>
                <TableTd>{new Date(date).toLocaleDateString('es-MX')}</TableTd>
                <TableTd>{description}</TableTd>
                <TableTd
                    className={cn({
                        'text-red-500': amount > 0,
                        'text-green-600': amount < 0,
                    })}
                >
                    {amount.toLocaleString('es-MX', {
                        style: 'currency',
                        currency: 'MXN',
                    })}
                </TableTd>
                <TableTd
                    className={cn({
                        'text-yellow-600': is_actual_closing,
                    })}
                >
                    {closing.month}
                </TableTd>
                <TableTd
                    className={cn({
                        'text-yellow-600': is_actual_limit,
                    })}
                >
                    {limit.date}
                </TableTd>
            </TableTr>
        ),
    )

    return (
        <div className='flex min-h-screen justify-center align-middle'>
            <div className='container flex flex-col p-4'>
                <Suspense>
                    <AddForm />
                </Suspense>
                <Table highlightOnHover striped>
                    <TableThead>
                        <TableTr>
                            <TableTh>Fecha</TableTh>
                            <TableTh>Concepto</TableTh>
                            <TableTh>Monnto</TableTh>
                            <TableTh>Mes (Corte)</TableTh>
                            <TableTh>Fecha Límite</TableTh>
                        </TableTr>
                    </TableThead>
                    <TableTbody>{rows}</TableTbody>
                </Table>
            </div>
        </div>
    )
}
