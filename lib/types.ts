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
  DRAFT: "bg-brand-ink/5 text-brand-ink-soft",
  IN_REVIEW: "bg-brand-green/10 text-brand-green-deep",
  OFFICIAL: "bg-brand-green text-white"
};

export const processingStatusTone: Record<ProcessingStatus, string> = {
  UPLOADED: "bg-brand-ink/5 text-brand-ink-soft",
  QUEUED: "bg-brand-green/10 text-brand-green-deep",
  PROCESSING: "bg-brand-green/15 text-brand-green-deep",
  DRAFT_READY: "bg-brand-green-soft/15 text-brand-green-deep",
  REVIEW_NEEDED: "bg-danger/10 text-danger",
  OFFICIAL: "bg-brand-green text-white",
  FAILED: "bg-danger/10 text-danger"
};

export const reviewStatusTone: Record<ReviewStatus, string> = {
  PENDING: "bg-brand-green/10 text-brand-green-deep",
  CONFIRMED: "bg-brand-green text-white",
  CORRECTED: "bg-brand-green-soft/15 text-brand-green-deep",
  SKIPPED: "bg-brand-ink/5 text-brand-ink-soft"
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
