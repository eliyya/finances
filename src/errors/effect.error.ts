import { Data } from 'effect'

export class PrismaError<T> extends Data.TaggedError('PrismaError')<{
    cause: T
}> {}

export class BetterAuthError<T> extends Data.TaggedError('BetterAuthError')<{
    cause: T
}> {}
