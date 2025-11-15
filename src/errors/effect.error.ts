import { Data } from "effect";

export class PrismaError<T> extends Data.TaggedError("PrismaError")<{
  cause: T;
}> {}
