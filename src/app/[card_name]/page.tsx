import { AddForm } from '@/components/add.form'
import { Balance, BalanceFallback } from '@/components/balance.server'
import { Table } from '@/components/table.client'
import { Transactions } from '@/components/transactions.server'
import { TableThead, TableTbody, TableTh, TableTr } from '@mantine/core'
import { Suspense } from 'react'

export default function Home({ params }: PageProps<'/[card_name]'>) {
    return (
        <div className='flex min-h-screen justify-center align-middle'>
            <div className='container flex flex-col p-4'>
                <div className='flex flex-wrap items-center justify-between gap-2'>
                    <div className='flex flex-wrap items-end gap-4'>
                        <Suspense fallback={<BalanceFallback />}>
                            <Balance params={params} />
                        </Suspense>
                    </div>
                    <Suspense>
                        <AddForm />
                    </Suspense>
                </div>
                <Table>
                    <TableThead>
                        <TableTr>
                            <TableTh>Fecha</TableTh>
                            <TableTh>Concepto</TableTh>
                            <TableTh>Monnto</TableTh>
                            <TableTh>Mes (Corte)</TableTh>
                            <TableTh>Fecha Límite</TableTh>
                        </TableTr>
                    </TableThead>
                    <TableTbody>
                        <Suspense>
                            <Transactions params={params} />
                        </Suspense>
                    </TableTbody>
                </Table>
            </div>
        </div>
    )
}
