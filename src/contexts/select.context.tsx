'use client'
import { createContext, useCallback, useState } from 'react'

export const SelectContext = createContext<{
    selected: Set<string>
    select(id: string, selected: boolean): void
    clear(): void
}>({
    selected: new Set<string>(),
    select: () => {},
    clear: () => {},
})

export function SelectProvider({ children }: { children: React.ReactNode }) {
    const [selected, setSelected] = useState(new Set<string>())
    const select = useCallback((id: string, selected: boolean) => {
        setSelected(prev => {
            if (selected) prev.add(id)
            else prev.delete(id)
            return new Set(prev)
        })
    }, [])
    const clear = useCallback(() => setSelected(new Set()), [])
    return (
        <SelectContext.Provider value={{ selected, select, clear }}>
            {children}
        </SelectContext.Provider>
    )
}
