'use client'

import { Table as MantineTable } from '@mantine/core'

export function Table({ children }: { children: React.ReactNode }) {
    return (
        <MantineTable highlightOnHover striped>
            {children}
        </MantineTable>
    )
}
