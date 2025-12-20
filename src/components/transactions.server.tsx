import { getTransactions } from '@/actions/transactions.actions'
import { TransactionItem } from './transaction-item.client'

interface TransactionsProps {
    params: Promise<{ card_name: string }>
}
export async function Transactions({ params }: TransactionsProps) {
    const { card_name } = await params
    const { transactions } = await getTransactions(card_name)

    return transactions.map(transaction => (
        <TransactionItem key={transaction.id} transaction={transaction} />
    ))
}
