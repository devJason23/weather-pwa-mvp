import {
  CorrectionReason,
  EventType,
  ReviewStatus,
  ShotType,
  TeamSide,
  type Opponent,
  type Player,
  type ReviewItem,
  type Team
} from "@prisma/client";
import {
  createGameAction,
  createOpponentAction,
  createPlayerAction,
  createTeamAction,
  submitReviewDecisionAction,
  triggerProcessingAction
} from "@/lib/actions";
import { reviewDefaults } from "@/lib/review-defaults";
import { correctionReasonLabel, eventTypeLabel, reviewReasonLabel } from "@/lib/types";

export function TeamForm() {
  return (
    <form action={createTeamAction} className="grid gap-3 md:grid-cols-[1.2fr_0.8fr_0.9fr_auto]">
      <input name="name" placeholder="Team name" required />
      <input name="ageGroup" placeholder="Age group" required />
      <input name="season" placeholder="Season" required />
      <button className="hs-button whitespace-nowrap">Add team</button>
    </form>
  );
}

export function PlayerForm({ teams }: { teams: Team[] }) {
  return (
    <form action={createPlayerAction} className="grid gap-3 md:grid-cols-5">
      <select name="teamId" required>
        <option value="">Select team</option>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>
      <input name="firstName" placeholder="First name" required />
      <input name="lastName" placeholder="Last name" required />
      <input name="jerseyNumber" placeholder="Jersey #" type="number" min="0" max="99" required />
      <button className="hs-button whitespace-nowrap">Add player</button>
    </form>
  );
}

export function OpponentForm() {
  return (
    <form action={createOpponentAction} className="flex flex-col gap-3 sm:flex-row">
      <input name="name" placeholder="Opponent name" required />
      <button className="hs-button whitespace-nowrap">Add opponent</button>
    </form>
  );
}

export function GameForm({
  teams,
  opponents,
  players
}: {
  teams: Team[];
  opponents: Opponent[];
  players: Player[];
}) {
  return (
    <form action={createGameAction} className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        <select name="teamId" required>
          <option value="">Select team</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
        <select name="opponentId" required>
          <option value="">Select opponent</option>
          {opponents.map((opponent) => (
            <option key={opponent.id} value={opponent.id}>
              {opponent.name}
            </option>
          ))}
        </select>
        <input name="gameDate" type="datetime-local" required />
        <input name="location" placeholder="Location (optional)" />
        <input name="teamColor" placeholder="Home/team color" required />
        <input name="opponentColor" placeholder="Opponent color" required />
      </div>

      <div className="hs-subtle p-5">
        <p className="text-sm font-semibold text-brand-ink">Roster snapshot</p>
        <p className="mt-1 text-sm text-brand-muted">Freeze the active players for this game before processing begins.</p>
        <div className="mt-4 grid gap-2 md:grid-cols-3">
          {players.map((player) => (
            <label key={player.id} className="flex items-center gap-2 rounded-2xl border border-brand-green/10 bg-white px-3 py-3 text-sm text-brand-ink">
              <input className="h-4 w-4" type="checkbox" name="rosterPlayerIds" value={player.id} />
              <span>
                #{player.jerseyNumber} {player.firstName} {player.lastName}
              </span>
            </label>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-brand-muted">
        <input className="h-4 w-4" type="checkbox" name="shadowMode" defaultChecked />
        Enable shadow mode for this game
      </label>

      <button className="hs-button w-fit">Create game</button>
    </form>
  );
}

export function TriggerProcessingForm({ gameId }: { gameId: string }) {
  return (
    <form action={triggerProcessingAction}>
      <input type="hidden" name="gameId" value={gameId} />
      <button className="hs-button">Run mock processing</button>
    </form>
  );
}

export function ReviewDecisionForm({
  item,
  players,
  nextItemId,
  previousItemId
}: {
  item: ReviewItem & {
    game: { id: string };
    proposedPlayer: Player | null;
  };
  players: Player[];
  nextItemId?: string;
  previousItemId?: string;
}) {
  const defaultEvent =
    item.aiEventType === EventType.SHOT_MADE || item.aiEventType === EventType.SHOT_MISSED || item.aiEventType === EventType.FREE_THROW
      ? item.aiEventType
      : reviewDefaults.shotMade;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="hs-subtle p-6">
        <p className="text-sm font-semibold text-brand-ink">Clip preview</p>
        <div className="mt-4 flex min-h-72 items-center justify-center rounded-[1.25rem] border border-dashed border-brand-line bg-white text-sm text-brand-muted">
          {item.clipUrl || "No clip extracted"}
        </div>
      </div>

      <form action={submitReviewDecisionAction} className="grid gap-4">
        <input type="hidden" name="reviewItemId" value={item.id} />
        <div className="grid gap-3 md:grid-cols-2">
          <select name="status" defaultValue={item.status}>
            {Object.values(ReviewStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select name="finalEventType" defaultValue={defaultEvent}>
            {Object.values(EventType).map((eventType) => (
              <option key={eventType} value={eventType}>
                {eventTypeLabel[eventType]}
              </option>
            ))}
          </select>
          <select name="finalPlayerId" defaultValue={item.proposedPlayerId ?? ""}>
            <option value="">No player</option>
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                #{player.jerseyNumber} {player.firstName} {player.lastName}
              </option>
            ))}
          </select>
          <select name="finalTeamSide" defaultValue={item.proposedTeamSide}>
            {Object.values(TeamSide).map((side) => (
              <option key={side} value={side}>
                {side}
              </option>
            ))}
          </select>
          <select
            name="finalShotMade"
            defaultValue={item.proposedShotMade === null ? "" : String(item.proposedShotMade)}
          >
            <option value="">Not applicable</option>
            <option value="true">Made</option>
            <option value="false">Missed</option>
          </select>
          <select name="finalShotType" defaultValue={item.proposedShotType}>
            {Object.values(ShotType).map((shotType) => (
              <option key={shotType} value={shotType}>
                {shotType}
              </option>
            ))}
          </select>
          <select name="correctionReason" defaultValue="">
            <option value="">Correction reason</option>
            {Object.values(CorrectionReason).map((reason) => (
              <option key={reason} value={reason}>
                {correctionReasonLabel[reason]}
              </option>
            ))}
          </select>
          <input value={reviewReasonLabel[item.reviewReason]} readOnly />
        </div>
        <textarea name="note" rows={4} defaultValue={item.note ?? ""} placeholder="Reviewer note" />
        <div className="flex flex-wrap items-center gap-3">
          <button className="hs-button">Save and move next</button>
          {previousItemId ? (
            <a className="hs-button-secondary text-brand-ink-soft" href={`/review?item=${previousItemId}`}>
              Previous
            </a>
          ) : null}
          {nextItemId ? (
            <a className="hs-button-secondary text-brand-ink-soft" href={`/review?item=${nextItemId}`}>
              Next
            </a>
          ) : null}
          <p className="text-xs text-brand-muted">Shortcut: use tab plus enter for faster desktop review.</p>
        </div>
      </form>
    </div>
  );
}
