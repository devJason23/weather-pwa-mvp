import { EventType, ReviewReason, type ConfidencePolicy, type DraftEvent } from "@prisma/client";

type PolicyMap = Record<string, ConfidencePolicy>;

export function buildPolicyMap(policies: ConfidencePolicy[]): PolicyMap {
  return Object.fromEntries(policies.map((policy) => [`${policy.eventType}:${policy.policyKey}`, policy]));
}

function threshold(map: PolicyMap, eventType: EventType, key: string, fallback: number) {
  return map[`${eventType}:${key}`]?.threshold ?? fallback;
}

export function evaluateDraftEvent(
  draftEvent: Pick<
    DraftEvent,
    | "eventType"
    | "confidenceTeam"
    | "confidenceAttempt"
    | "confidenceResult"
    | "confidencePlayer"
    | "confidenceShotType"
    | "confidenceFreeThrow"
  >,
  policies: ConfidencePolicy[]
) {
  const map = buildPolicyMap(policies);

  if ((draftEvent.confidenceTeam ?? 0) < threshold(map, draftEvent.eventType, "team_assignment", 0.9)) {
    return { autoAccepted: false, reviewReason: ReviewReason.LOW_CONFIDENCE_TEAM };
  }
  if ((draftEvent.confidenceAttempt ?? 0) < threshold(map, draftEvent.eventType, "shot_attempt", 0.85)) {
    return { autoAccepted: false, reviewReason: ReviewReason.LOW_CONFIDENCE_ATTEMPT };
  }
  if ((draftEvent.confidenceResult ?? 0) < threshold(map, draftEvent.eventType, "made_missed", 0.9)) {
    return { autoAccepted: false, reviewReason: ReviewReason.LOW_CONFIDENCE_RESULT };
  }
  if ((draftEvent.confidencePlayer ?? 0) < threshold(map, draftEvent.eventType, "player_identity", 0.92)) {
    return { autoAccepted: false, reviewReason: ReviewReason.LOW_CONFIDENCE_PLAYER };
  }
  if ((draftEvent.confidenceShotType ?? 0) < threshold(map, draftEvent.eventType, "shot_type", 0.9)) {
    return { autoAccepted: false, reviewReason: ReviewReason.LOW_CONFIDENCE_SHOT_TYPE };
  }
  if (
    draftEvent.eventType === EventType.FREE_THROW &&
    (draftEvent.confidenceFreeThrow ?? 0) < threshold(map, draftEvent.eventType, "free_throw", 0.88)
  ) {
    return { autoAccepted: false, reviewReason: ReviewReason.LOW_CONFIDENCE_FREE_THROW };
  }

  return { autoAccepted: true, reviewReason: null };
}
