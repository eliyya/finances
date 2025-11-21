import { getTransactions } from '@/actions/transactions.actions'

export async function Balance({
    params,
}: {
    params: Promise<{ card_name: string }>
}) {
    const { card_name } = await params
    const { card } = await getTransactions(card_name)
    return (
        <>
            <h1 className='text-2xl font-bold'>{card_name}</h1>
            <span>
                Balance:{' '}
                {card?.balance.toLocaleString('es-MX', {
                    style: 'currency',
                    currency: 'MXN',
                }) ?? '??'}
            </span>
            <span>
                Disponible:{' '}
                {((card?.limit ?? 0) - (card?.balance ?? 0)).toLocaleString(
                    'es-MX',
                    {
                        style: 'currency',
                        currency: 'MXN',
                    },
                ) ?? '??'}
            </span>
        </>
    )
}

export function BalanceFallback() {
    return (
        <>
            <h1 className='text-2xl font-bold'>??</h1>
            <span>Balance: ??</span>
        </>
    )
}
