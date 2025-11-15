import { db } from "@/prisma/db";
import { PrismaClient } from "@/prisma/generated/client";
import { Context, Layer } from "effect";

export class PrismaService extends Context.Tag("PrismaService")<
  PrismaService,
  PrismaClient
>() {}

export const PrismaLive = Layer.succeed(PrismaService, db);
