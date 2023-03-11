/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { type BirdVoteOption } from "~/interfaces/birds";
import { BirdVoteResult, type VoteResult } from "~/interfaces/votes";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const getBirdsDbUrlsInputSchema = z.object({
  limit: z.number(),
  skip: z.array(z.number()),
});

export const upsertVoteInputSchema = z.object({
  birdId: z.number(),
  voteFor: z.number(),
  voteAgainst: z.number(),
});

export const exampleRouter = createTRPCRouter({
  birdOptions: publicProcedure.input(getBirdsDbUrlsInputSchema).query(({ ctx, input }) => {
        const ids: number[] = input.skip;
        const limit: number = input.limit;
        return ctx.prisma.$queryRaw<BirdVoteOption[]>`
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
}),
  upsertVote: publicProcedure
      .input(upsertVoteInputSchema)
      .mutation(async ({ input, ctx }) => {
        const { birdId, voteFor, voteAgainst } = input;
        const entry = {
          voteAgainst: voteAgainst,
          voteFor: voteFor,
        };
        const existingBird: VoteResult | null = await ctx.prisma.bird_votes.findFirst({
          where: { birdId },
        });
        if (existingBird) {
          entry.voteAgainst =
            entry.voteAgainst + (Number(existingBird?.voteAgainst) || 0);
          entry.voteFor = entry.voteFor + (Number(existingBird?.voteFor) || 0);
          await ctx.prisma.bird_votes.update({
            where: { id: existingBird.id },
            data: { ...entry },
          });
        } else {
          await ctx.prisma.bird_votes.create({
            data: { ...entry, birdId: birdId },
          });
        }
      }),
  invalidateBird: publicProcedure
  .input(z.number())
  .mutation(async ({ input, ctx }) => {
    await ctx.prisma.bird_taxonomy.update({
      where: { id: input },
      data: { hasInvalidPhoto: true },
    });
    await ctx.prisma.bird_photos.delete({
      where: { id: input },
    });
  }),
  fetchVotesPagination: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        offset: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50;
      const offset = input.offset ?? 0;
      const totalRows = await ctx.prisma.bird_votes.count();
      const rows: BirdVoteResult[] = await ctx.prisma.$queryRaw`
      SELECT
        bVotes.vote_for AS "voteFor",
        bVotes.vote_against AS "voteAgainst",
        bVotes.bird_id AS "birdId",
        bPhotos.common_name AS "commonName",
        bPhotos.scientific_name AS "scientificName",
        bPhotos.photo_urls AS "photoUrls",
        CASE 
          WHEN (bVotes.vote_for + bVotes.vote_against) = 0 THEN 0
          ELSE ((bVotes.vote_for/(bVotes.vote_for + bVotes.vote_against))* 100)
        END AS "percentFor"
      FROM bird_votes AS bVotes
      JOIN bird_photos AS bPhotos ON bPhotos.id = bVotes.bird_id
      WHERE bPhotos.photo_urls IS NOT NULL and coalesce(array_length(bPhotos.photo_urls, 1), 0) != 0
      ORDER BY "percentFor" DESC, bVotes.vote_for DESC
      LIMIT ${limit} OFFSET ${offset}
      `;
      return { rows, totalRows };
    }),
});
