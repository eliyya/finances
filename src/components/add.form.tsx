'use client'

import { addTransactionAction } from '@/actions/transactions.actions'
import { useActionState } from 'react'

export function AddForm() {
    const [state, formAction, dispose] = useActionState(addTransactionAction, {
        inputs: {
            date: new Date().toISOString().slice(0, 10),
            description: '',
            amount: 0,
            card_id: '62215335226376193',
        },
    })
    return (
        <form action={formAction} className='flex flex-wrap justify-center'>
            <input type='date' name='date' defaultValue={state.inputs.date} />
            <input
                type='text'
                name='description'
                placeholder='Descripción'
                className='m-2 rounded border p-2'
                defaultValue={state.inputs.description}
            />
            <input
                type='number'
                name='amount'
                step='0.01'
                placeholder='Monto'
                className='m-2 rounded border p-2'
                defaultValue={state.inputs.amount}
            />
            <button
                type='submit'
                className='m-2 rounded bg-blue-500 p-2 text-white'
                disabled={dispose}
            >
                Agregar
            </button>
        </form>
    )
}
