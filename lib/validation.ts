import { EventType, ReviewStatus } from "@prisma/client";
import { z } from "zod";

export const teamSchema = z.object({
  name: z.string().min(2),
  ageGroup: z.string().min(2),
  season: z.string().min(2)
});

export const playerSchema = z.object({
  teamId: z.string().cuid(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  jerseyNumber: z.coerce.number().int().min(0).max(99)
});

export const opponentSchema = z.object({
  name: z.string().min(2)
});

export const createGameSchema = z.object({
  teamId: z.string().cuid(),
  opponentId: z.string().cuid(),
  gameDate: z.string().min(1),
  location: z.string().optional(),
  teamColor: z.string().min(2),
  opponentColor: z.string().min(2),
  rosterPlayerIds: z.array(z.string().cuid()).min(1),
  shadowMode: z.boolean().default(true)
});

export const uploadVideoSchema = z.object({
  gameId: z.string().cuid(),
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  sizeBytes: z.number().int().nonnegative()
});

export const reviewDecisionSchema = z.object({
  reviewItemId: z.string().cuid(),
  status: z.nativeEnum(ReviewStatus),
  finalEventType: z.nativeEnum(EventType),
  finalPlayerId: z.string().cuid().nullable(),
  finalTeamSide: z.enum(["HOME", "AWAY", "NONE"]),
  finalShotMade: z.boolean().nullable(),
  finalShotType: z.enum(["TWO", "THREE", "FREE_THROW", "NONE"]),
  note: z.string().max(500).optional(),
  correctionReason: z.string().optional()
});
