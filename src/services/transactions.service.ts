import { PrismaError } from "@/errors/effect.error";
import { PrismaService } from "@/layers/db.layer";
import { Effect } from "effect";

export function getTransactionsEffect() {
  return Effect.gen(function* (_) {
    const prisma = yield* _(PrismaService);

    const transactions = yield* _(
      Effect.tryPromise({
        try: () => prisma.transaction.findMany(),
        catch: (error) => new PrismaError({ cause: error }),
      })
    );

    return transactions;
  });
}
