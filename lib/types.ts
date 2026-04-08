import {
  CorrectionReason,
  EventType,
  GameStatus,
  ProcessingStatus,
  ReviewReason,
  ReviewStatus
} from "@prisma/client";

export type NavItem = {
  href: string;
  label: string;
};

export const gameStatusTone: Record<GameStatus, string> = {
  DRAFT: "bg-slate/10 text-slate",
  IN_REVIEW: "bg-warning/10 text-warning",
  OFFICIAL: "bg-success/10 text-success"
};

export const processingStatusTone: Record<ProcessingStatus, string> = {
  UPLOADED: "bg-slate/10 text-slate",
  QUEUED: "bg-warning/10 text-warning",
  PROCESSING: "bg-warning/10 text-warning",
  DRAFT_READY: "bg-accent/10 text-accent",
  REVIEW_NEEDED: "bg-danger/10 text-danger",
  OFFICIAL: "bg-success/10 text-success",
  FAILED: "bg-danger/10 text-danger"
};

export const reviewStatusTone: Record<ReviewStatus, string> = {
  PENDING: "bg-warning/10 text-warning",
  CONFIRMED: "bg-success/10 text-success",
  CORRECTED: "bg-accent/10 text-accent",
  SKIPPED: "bg-slate/10 text-slate"
};

export const eventTypeLabel: Record<EventType, string> = {
  SHOT_ATTEMPT: "Shot attempt",
  SHOT_MADE: "Shot made",
  SHOT_MISSED: "Shot missed",
  FREE_THROW: "Free throw",
  TEAM_SCORE_UPDATE: "Team score update",
  NO_EVENT: "No event"
};

export const reviewReasonLabel: Record<ReviewReason, string> = {
  LOW_CONFIDENCE_TEAM: "Team assignment confidence",
  LOW_CONFIDENCE_ATTEMPT: "Attempt detection confidence",
  LOW_CONFIDENCE_RESULT: "Made vs missed confidence",
  LOW_CONFIDENCE_PLAYER: "Player identity confidence",
  LOW_CONFIDENCE_SHOT_TYPE: "Shot type confidence",
  LOW_CONFIDENCE_FREE_THROW: "Free throw confidence",
  SCORE_MISMATCH: "Score mismatch",
  IDENTITY_CONFLICT: "Identity conflict",
  MANUAL_QA: "Manual QA"
};

export const correctionReasonLabel: Record<CorrectionReason, string> = {
  AI_FALSE_POSITIVE: "False positive",
  PLAYER_MISIDENTIFIED: "Player misidentified",
  TEAM_MISASSIGNED: "Team misassigned",
  SHOT_RESULT_FIXED: "Shot result fixed",
  SHOT_TYPE_FIXED: "Shot type fixed",
  SCORE_RECONCILED: "Score reconciled",
  REVIEWER_JUDGMENT: "Reviewer judgment"
};
