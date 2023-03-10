import { Prisma, PrismaClient } from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// export const getBirdsDbUrlsInputSchema = z.object({
//   limit: z.number(),
//   skip: z.array(z.number()),
// });
// type BirdsDbUrlsInput = z.infer<typeof getBirdsDbUrlsInputSchema>;

export const exampleRouter = createTRPCRouter({
  birdOptions: publicProcedure.query(({ ctx }) => {
        const ids: [] = [];
        const limit = 100;
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
      //   const allBirds: Array<BirdVoteOption> = await ctx.prisma.$queryRaw`
      // SELECT
      //   id,
      //   updated_at AS "updatedAt",
      //   common_name AS "commonName",
      //   scientific_name AS "scientificName",
      //   photo_urls AS "photoUrls"
      // FROM bird_photos
      // ${
      //   ids.length
      //     ? Prisma.sql`WHERE id NOT IN (${Prisma.join(ids)})`
      //     : Prisma.empty
      // }
      // ORDER BY RANDOM()
      // LIMIT ${input.limit};
      // `;
      // return allBirds.map((result) => ({
      //   id: result.id,
      //   commonName: result.commonName,
      //   scientificName: result.scientificName,
      //   photoUrls: result.photoUrls,
      // }));

})
});
