import { AddForm } from '@/components/add.form'
import { Balance, BalanceFallback } from '@/components/balance.server'
import { DeleteButton } from '@/components/delete-button.client'
import { Table } from '@/components/table.client'
import { Transactions } from '@/components/transactions.server'
import { SelectProvider } from '@/contexts/select.context'
import { TableThead, TableTbody, TableTh, TableTr } from '@mantine/core'
import { Suspense } from 'react'

export default function Home({ params }: PageProps<'/[card_name]'>) {
    return (
        <SelectProvider>
            <div className='flex min-h-screen justify-center align-middle'>
                <div className='container flex flex-col p-4'>
                    <div className='flex flex-wrap items-center justify-between gap-2'>
                        <div className='flex flex-wrap items-end gap-4'>
                            <Suspense fallback={<BalanceFallback />}>
                                <Balance params={params} />
                            </Suspense>
                        </div>
                        <DeleteButton />
                        <Suspense>
                            <AddForm />
                        </Suspense>
                    </div>
                    <div className='flex overflow-x-scroll'>
                        <Table>
                            <TableThead>
                                <TableTr>
                                    <TableTh>Select</TableTh>
                                    <TableTh>Fecha</TableTh>
                                    <TableTh>Concepto</TableTh>
                                    <TableTh>Monto</TableTh>
                                    <TableTh>Mes (Corte)</TableTh>
                                    <TableTh>Fecha Límite</TableTh>
                                    <TableTh>Acumulado</TableTh>
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
            </div>
        </SelectProvider>
    )
}
