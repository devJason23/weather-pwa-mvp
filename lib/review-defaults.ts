import { EventType, ReviewStatus, ShotType, TeamSide } from "@prisma/client";

export const reviewDefaults = {
  pending: ReviewStatus.PENDING,
  confirmed: ReviewStatus.CONFIRMED,
  corrected: ReviewStatus.CORRECTED,
  skipped: ReviewStatus.SKIPPED,
  shotMade: EventType.SHOT_MADE,
  shotMissed: EventType.SHOT_MISSED,
  freeThrow: EventType.FREE_THROW,
  noEvent: EventType.NO_EVENT,
  home: TeamSide.HOME,
  away: TeamSide.AWAY,
  none: TeamSide.NONE,
  two: ShotType.TWO,
  three: ShotType.THREE,
  ft: ShotType.FREE_THROW,
  noShot: ShotType.NONE
};
