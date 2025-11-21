import { getTransactions } from '@/actions/transactions.actions'
import { cn } from '@/lib/utils'
import { TableTd, TableTr } from '@mantine/core'

interface TransactionsProps {
    params: Promise<{ card_name: string }>
}
export async function Transactions({ params }: TransactionsProps) {
    const { card_name } = await params
    const { transactions } = await getTransactions(card_name)

    return transactions.map(
        ({
            id,
            date,
            description,
            amount,
            limit,
            closing,
            is_actual_closing,
            is_actual_limit,
            balance,
            debt,
        }) => (
            <TableTr key={id}>
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
        ),
    )
}
