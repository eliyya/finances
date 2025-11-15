"use server";

import { PrismaLive } from "@/layers/db.layer";
import { getTransactionsEffect } from "@/services/transactions.service";
import { Effect } from "effect";

export async function getTransactionsAction() {
  return await Effect.runPromise(
    Effect.scoped(
      getTransactionsEffect()
        .pipe(Effect.provide(PrismaLive))
        .pipe(
          Effect.catchAll((error) => {
            console.error(error);
            return Effect.succeed([]);
          })
        )
    )
  );
}
