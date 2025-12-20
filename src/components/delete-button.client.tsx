'use client'
import { deleteTransactionAction } from '@/actions/transactions.actions'
import { SelectContext } from '@/contexts/select.context'
import { Button } from '@mantine/core'
import { use } from 'react'
import { useRouter } from 'next/navigation'

export function DeleteButton() {
    const { selected, clear } = use(SelectContext)
    const { refresh } = useRouter()
    return (
        <Button
            disabled={!selected.size}
            onClick={() => {
                selected.forEach(id => deleteTransactionAction(id))
                refresh()
                clear()
            }}
        >
            Delete
        </Button>
    )
}
