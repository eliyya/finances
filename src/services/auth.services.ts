import { BetterAuthError } from '@/errors/effect.error'
import { auth } from '@/lib/auth'
import { Effect } from 'effect'

interface RegisterParams {
    name: string
    email: string
    password: string
}
export function registerEffect({ email, name, password }: RegisterParams) {
    return Effect.gen(function* (_) {
        // const res =
        yield* _(
            Effect.tryPromise({
                try() {
                    return auth.api.signUpEmail({
                        body: {
                            email,
                            name,
                            password,
                        },
                    })
                },
                catch(error) {
                    return new BetterAuthError({ cause: error })
                },
            }),
        )
    })
}
