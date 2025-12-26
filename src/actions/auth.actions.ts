'use server'

import { BetterAuthError } from '@/errors/effect.error'
import { registerEffect } from '@/services/auth.services'
import { Effect } from 'effect'
import { status } from 'effect/Fiber'

type RegisterParams = Parameters<typeof registerEffect>[0]
export async function registerAction(data: RegisterParams) {
    return Effect.runPromise(
        Effect.scoped(
            registerEffect(data).pipe(
                Effect.match({
                    onFailure(error) {
                        if (error instanceof BetterAuthError) {
                            return {
                                status: 'error',
                                type: 'unknown',
                            } as const
                        }
                        return {
                            status: 'error',
                            type: 'unknown',
                        } as const
                    },
                    onSuccess() {
                        return { status: 'success' } as const
                    },
                }),
            ),
        ),
    )
}
