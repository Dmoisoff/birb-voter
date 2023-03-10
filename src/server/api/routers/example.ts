import { Prisma, PrismaClient } from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const getBirdsDbUrlsInputSchema = z.object({
  limit: z.number(),
  skip: z.array(z.number()),
});
type BirdsDbUrlsInput = z.infer<typeof getBirdsDbUrlsInputSchema>;

export const exampleRouter = createTRPCRouter({
  birdOptions: publicProcedure.input(getBirdsDbUrlsInputSchema).query(({ ctx, input }) => {
        const ids: number[] = input.skip;
        const limit = input.limit;
        return ctx.prisma.$queryRaw`
         SELECT
         id,
         updated_at AS "updatedAt",
         common_name AS "commonName",
         scientific_name AS "scientificName",
         photo_urls AS "photoUrls"
       FROM bird_photos
       ${
         ids.length
           ? Prisma.sql`WHERE id NOT IN (${Prisma.join(ids)})`
           : Prisma.empty
       }
       ORDER BY RANDOM()
       LIMIT ${limit};
        `;
})
});
