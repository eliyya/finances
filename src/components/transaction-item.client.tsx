'use client'
import { getTransactions } from '@/actions/transactions.actions'
import { SelectContext } from '@/contexts/select.context'
import { cn } from '@/lib/utils'
import { TableTd, TableTr } from '@mantine/core'
import { use, useState } from 'react'

interface TransactionItemProps {
    transaction: Awaited<
        ReturnType<typeof getTransactions>
    >['transactions'][number]
}
export function TransactionItem({
    transaction: {
        date,
        description,
        amount,
        limit,
        closing,
        is_actual_closing,
        is_actual_limit,
        balance,
        debt,
        id,
    },
}: TransactionItemProps) {
    const [checked, setChecked] = useState(false)
    const { select } = use(SelectContext)
    return (
        <TableTr>
            <TableTd>
                <input
                    type='checkbox'
                    checked={checked}
                    onChange={e => {
                        setChecked(e.target.checked)
                        select(id, e.target.checked)
                    }}
                />
            </TableTd>
            <TableTd>{new Date(date).toLocaleDateString('es-MX')}</TableTd>
            <TableTd
                className={cn({
                    'text-yellow-600': debt,
                })}
            >
                {description}
            </TableTd>
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
                {closing.month_name}
            </TableTd>
            <TableTd
                className={cn({
                    'text-yellow-600': is_actual_limit,
                })}
            >
                {limit.date}
            </TableTd>
            <TableTd>
                {balance.toLocaleString('es-MX', {
                    style: 'currency',
                    currency: 'MXN',
                })}
            </TableTd>
        </TableTr>
    )
}
