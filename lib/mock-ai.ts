import { EventType, ReviewReason, ShotType, TeamSide, type Player } from "@prisma/client";

type MockEventInput = {
  gameId: string;
  players: Player[];
};

type MockEvent = {
  sequenceNumber: number;
  timestampSeconds: number;
  clipUrl: string;
  eventType: EventType;
  teamSide: TeamSide;
  shotType: ShotType;
  shotMade: boolean | null;
  playerId: string | null;
  aiConfidence: number;
  confidenceTeam: number;
  confidenceAttempt: number;
  confidenceResult: number;
  confidencePlayer: number;
  confidenceShotType: number;
  confidenceFreeThrow: number | null;
  reviewReason: ReviewReason | null;
};

export interface AIEventGenerator {
  generateDraftEvents(input: MockEventInput): Promise<MockEvent[]>;
}

const mockTimeline = [
  { ts: 44, made: true, type: ShotType.TWO, team: TeamSide.HOME },
  { ts: 121, made: false, type: ShotType.THREE, team: TeamSide.HOME },
  { ts: 162, made: true, type: ShotType.THREE, team: TeamSide.HOME },
  { ts: 245, made: true, type: ShotType.TWO, team: TeamSide.AWAY },
  { ts: 303, made: true, type: ShotType.FREE_THROW, team: TeamSide.HOME },
  { ts: 418, made: true, type: ShotType.TWO, team: TeamSide.HOME },
  { ts: 522, made: false, type: ShotType.TWO, team: TeamSide.AWAY },
  { ts: 648, made: true, type: ShotType.THREE, team: TeamSide.AWAY }
];

class MockAIEventGenerator implements AIEventGenerator {
  async generateDraftEvents({ players }: MockEventInput): Promise<MockEvent[]> {
    return mockTimeline.map((item, index) => {
      const player = players[index % players.length] ?? null;
      const confidenceTeam = 0.82 + ((index * 7) % 14) / 100;
      const confidenceAttempt = 0.84 + ((index * 5) % 12) / 100;
      const confidenceResult = 0.85 + ((index * 11) % 13) / 100;
      const confidencePlayer = 0.86 + ((index * 9) % 12) / 100;
      const confidenceShotType = 0.83 + ((index * 13) % 14) / 100;
      const confidenceFreeThrow = item.type === ShotType.FREE_THROW ? 0.87 : null;
      const aiConfidence = Math.min(
        confidenceTeam,
        confidenceAttempt,
        confidenceResult,
        confidencePlayer,
        confidenceShotType
      );

      const reviewReason =
        confidencePlayer < 0.92
          ? ReviewReason.LOW_CONFIDENCE_PLAYER
          : confidenceResult < 0.9
            ? ReviewReason.LOW_CONFIDENCE_RESULT
            : confidenceShotType < 0.9
              ? ReviewReason.LOW_CONFIDENCE_SHOT_TYPE
              : null;

      return {
        sequenceNumber: index + 1,
        timestampSeconds: item.ts,
        clipUrl: `/clips/mock-${index + 1}.mp4`,
        eventType:
          item.type === ShotType.FREE_THROW
            ? EventType.FREE_THROW
            : item.made
              ? EventType.SHOT_MADE
              : EventType.SHOT_MISSED,
        teamSide: item.team,
        shotType: item.type,
        shotMade: item.made,
        playerId: item.team === TeamSide.HOME ? player?.id ?? null : null,
        aiConfidence,
        confidenceTeam,
        confidenceAttempt,
        confidenceResult,
        confidencePlayer,
        confidenceShotType,
        confidenceFreeThrow,
        reviewReason
      };
    });
  }
}

export const aiEventGenerator: AIEventGenerator = new MockAIEventGenerator();
