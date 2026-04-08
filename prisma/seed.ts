import {
  CorrectionReason,
  EventType,
  GameStatus,
  Prisma,
  ProcessingJobType,
  ProcessingStatus,
  ReviewReason,
  ReviewStatus,
  ShotType,
  TeamSide
} from "@prisma/client";
import { prisma } from "@/lib/prisma";

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.reviewDecision.deleteMany();
  await prisma.reviewItem.deleteMany();
  await prisma.draftEvent.deleteMany();
  await prisma.processingJob.deleteMany();
  await prisma.videoAsset.deleteMany();
  await prisma.officialStatLine.deleteMany();
  await prisma.gameRosterPlayer.deleteMany();
  await prisma.game.deleteMany();
  await prisma.player.deleteMany();
  await prisma.team.deleteMany();
  await prisma.opponent.deleteMany();
  await prisma.confidencePolicy.deleteMany();

  const admin = await prisma.adminUser.upsert({
    where: { email: "admin@courtreview.local" },
    update: {},
    create: { email: "admin@courtreview.local", name: "Admin" }
  });

  const team = await prisma.team.create({
    data: {
      name: "Westfield Sparks",
      ageGroup: "12U",
      season: "2026"
    }
  });

  const rosterSeed: Array<[string, string, number]> = [
    ["Ava", "Cole", 2],
    ["Mia", "Hayes", 3],
    ["Layla", "Ortiz", 4],
    ["Harper", "Reed", 5],
    ["Zoe", "Brooks", 7],
    ["Ella", "Morris", 10],
    ["Nora", "Bennett", 11],
    ["Lily", "Cooper", 12],
    ["Ruby", "Foster", 21]
  ];

  const players = await Promise.all(
    rosterSeed.map(([firstName, lastName, jerseyNumber]) =>
      prisma.player.create({
        data: {
          teamId: team.id,
          firstName,
          lastName,
          jerseyNumber
        }
      })
    )
  );

  const opponent = await prisma.opponent.create({
    data: { name: "Lakeview Storm" }
  });

  await prisma.confidencePolicy.createMany({
    data: ([
      [EventType.SHOT_MADE, "team_assignment", 0.9],
      [EventType.SHOT_MADE, "shot_attempt", 0.85],
      [EventType.SHOT_MADE, "made_missed", 0.9],
      [EventType.SHOT_MADE, "player_identity", 0.92],
      [EventType.SHOT_MADE, "shot_type", 0.9],
      [EventType.SHOT_MISSED, "team_assignment", 0.9],
      [EventType.SHOT_MISSED, "shot_attempt", 0.85],
      [EventType.SHOT_MISSED, "made_missed", 0.9],
      [EventType.SHOT_MISSED, "player_identity", 0.92],
      [EventType.SHOT_MISSED, "shot_type", 0.9],
      [EventType.FREE_THROW, "team_assignment", 0.9],
      [EventType.FREE_THROW, "shot_attempt", 0.85],
      [EventType.FREE_THROW, "made_missed", 0.9],
      [EventType.FREE_THROW, "player_identity", 0.92],
      [EventType.FREE_THROW, "shot_type", 0.9],
      [EventType.FREE_THROW, "free_throw", 0.88]
    ] as Array<[EventType, string, number]>).map(([eventType, policyKey, threshold]) => ({
      eventType,
      policyKey,
      threshold
    }))
  });

  const gameOne = await prisma.game.create({
    data: {
      teamId: team.id,
      opponentId: opponent.id,
      adminUserId: admin.id,
      gameDate: new Date("2026-03-28T18:00:00Z"),
      location: "Northside Gym",
      teamColor: "Navy",
      opponentColor: "White",
      shadowMode: true,
      status: GameStatus.IN_REVIEW,
      processingStatus: ProcessingStatus.REVIEW_NEEDED,
      rosterPlayers: {
        create: players.map((player) => ({
          playerId: player.id,
          jerseyNumber: player.jerseyNumber
        }))
      },
      videoAssets: {
        create: {
          storageKey: "seed-game-1.mp4",
          originalFileName: "game-1.mp4",
          contentType: "video/mp4",
          sizeBytes: 10485760,
          uploadStatus: ProcessingStatus.UPLOADED
        }
      },
      processingJobs: {
        create: {
          jobType: ProcessingJobType.AI_EXTRACTION,
          status: ProcessingStatus.REVIEW_NEEDED,
          detail: "Seeded draft extraction",
          startedAt: new Date("2026-03-29T00:00:00Z"),
          finishedAt: new Date("2026-03-29T00:05:00Z")
        }
      }
    }
  });

  const gameTwo = await prisma.game.create({
    data: {
      teamId: team.id,
      opponentId: opponent.id,
      adminUserId: admin.id,
      gameDate: new Date("2026-04-02T18:00:00Z"),
      location: "Civic Center",
      teamColor: "Navy",
      opponentColor: "Red",
      shadowMode: false,
      status: GameStatus.OFFICIAL,
      processingStatus: ProcessingStatus.OFFICIAL,
      rosterPlayers: {
        create: players.slice(0, 8).map((player) => ({
          playerId: player.id,
          jerseyNumber: player.jerseyNumber
        }))
      }
    }
  });

  const draftEvents = await Promise.all(
    ([
      [44, EventType.SHOT_MADE, TeamSide.HOME, ShotType.TWO, true, players[0].id, 0.95, null],
      [121, EventType.SHOT_MISSED, TeamSide.HOME, ShotType.THREE, false, players[1].id, 0.87, ReviewReason.LOW_CONFIDENCE_RESULT],
      [162, EventType.SHOT_MADE, TeamSide.HOME, ShotType.THREE, true, players[2].id, 0.89, ReviewReason.LOW_CONFIDENCE_PLAYER],
      [245, EventType.SHOT_MADE, TeamSide.AWAY, ShotType.TWO, true, null, 0.94, null],
      [303, EventType.FREE_THROW, TeamSide.HOME, ShotType.FREE_THROW, true, players[3].id, 0.86, ReviewReason.LOW_CONFIDENCE_FREE_THROW]
    ] as Array<[number, EventType, TeamSide, ShotType, boolean, string | null, number, ReviewReason | null]>).map(
      ([timestampSeconds, eventType, teamSide, shotType, shotMade, playerId, aiConfidence, reviewReason], index) =>
      prisma.draftEvent.create({
        data: {
          gameId: gameOne.id,
          playerId,
          sequenceNumber: index + 1,
          timestampSeconds,
          clipUrl: `/clips/seed-${index + 1}.mp4`,
          eventType,
          teamSide,
          shotType,
          shotMade,
          aiConfidence,
          confidenceTeam: 0.94,
          confidenceAttempt: 0.91,
          confidenceResult: index === 1 ? 0.87 : 0.93,
          confidencePlayer: index === 2 ? 0.88 : 0.95,
          confidenceShotType: 0.92,
          confidenceFreeThrow: index === 4 ? 0.86 : null,
          autoAccepted: reviewReason === null,
          reviewRequired: reviewReason !== null,
          reviewReason,
          aiPayload: {
            timestampSeconds,
            eventType,
            teamSide,
            shotType,
            shotMade,
            playerId,
            aiConfidence
          } as Prisma.InputJsonValue
        }
      })
    )
  );

  const reviewItemOne = await prisma.reviewItem.create({
    data: {
      gameId: gameOne.id,
      draftEventId: draftEvents[1].id,
      proposedPlayerId: players[1].id,
      timestampSeconds: 121,
      clipUrl: "/clips/seed-2.mp4",
      aiEventType: EventType.SHOT_MISSED,
      aiConfidence: 0.87,
      proposedTeamSide: TeamSide.HOME,
      proposedShotMade: false,
      proposedShotType: ShotType.THREE,
      reviewReason: ReviewReason.LOW_CONFIDENCE_RESULT,
      status: ReviewStatus.PENDING
    }
  });

  const reviewItemTwo = await prisma.reviewItem.create({
    data: {
      gameId: gameOne.id,
      draftEventId: draftEvents[2].id,
      proposedPlayerId: players[2].id,
      timestampSeconds: 162,
      clipUrl: "/clips/seed-3.mp4",
      aiEventType: EventType.SHOT_MADE,
      aiConfidence: 0.89,
      proposedTeamSide: TeamSide.HOME,
      proposedShotMade: true,
      proposedShotType: ShotType.THREE,
      reviewReason: ReviewReason.LOW_CONFIDENCE_PLAYER,
      status: ReviewStatus.CORRECTED
    }
  });

  const decision = await prisma.reviewDecision.create({
    data: {
      reviewItemId: reviewItemTwo.id,
      reviewerId: admin.id,
      status: ReviewStatus.CORRECTED,
      finalEventType: EventType.SHOT_MADE,
      finalPlayerId: players[4].id,
      finalTeamSide: TeamSide.HOME,
      finalShotMade: true,
      finalShotType: ShotType.THREE,
      correctionReason: CorrectionReason.PLAYER_MISIDENTIFIED,
      note: "Shooter corrected after manual review."
    }
  });

  await prisma.auditLog.create({
    data: {
      gameId: gameOne.id,
      draftEventId: draftEvents[2].id,
      reviewItemId: reviewItemTwo.id,
      reviewDecisionId: decision.id,
      reviewerId: admin.id,
      originalPrediction: (draftEvents[2].aiPayload ?? {}) as Prisma.InputJsonValue,
      confidenceScore: 0.89,
      reviewerAction: "CORRECTED",
      correctedValue: {
        finalPlayerId: players[4].id,
        finalShotType: ShotType.THREE
      },
      correctionReason: CorrectionReason.PLAYER_MISIDENTIFIED,
      note: "Seeded correction"
    }
  });

  await prisma.officialStatLine.createMany({
    data: [
      {
        gameId: gameTwo.id,
        playerId: players[0].id,
        teamSide: TeamSide.HOME,
        points: 8,
        fgm: 4,
        fga: 7,
        threePm: 0,
        threePa: 1,
        ftm: 0,
        fta: 0,
        finalScore: 28,
        timeline: ["44:SHOT_MADE:2", "510:SHOT_MADE:2"]
      },
      {
        gameId: gameTwo.id,
        playerId: players[4].id,
        teamSide: TeamSide.HOME,
        points: 11,
        fgm: 4,
        fga: 8,
        threePm: 1,
        threePa: 3,
        ftm: 2,
        fta: 2,
        finalScore: 28,
        timeline: ["220:SHOT_MADE:3", "470:FREE_THROW:2"]
      },
      {
        gameId: gameTwo.id,
        playerId: null,
        teamSide: TeamSide.AWAY,
        points: 24,
        fgm: 0,
        fga: 0,
        threePm: 0,
        threePa: 0,
        ftm: 0,
        fta: 0,
        finalScore: 24,
        timeline: ["team-total"]
      }
    ]
  });

  console.log(`Seeded team ${team.name}, ${players.length} players, and 2 games.`);
  console.log(`Pending review item: ${reviewItemOne.id}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
