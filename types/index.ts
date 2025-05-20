import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type ModalMode = "create" | "join" | null;

export interface JoinRoomForm {
  roomCode: string;
  maxStepGap?: number;
  cooldownSeconds?: number;
  difficulty?: string;
}

export interface CreateRoomResponse {
  roomCode: string;
}

export type Cell = {
  value: number;
  status: string;
  cooldownUntil?: number; // timestamp in ms, optional
};

export type BoardsListMessage = {
  boards: Record<string, Cell[][]>; // sessionId -> board
  playerCount: number;
  filledCounts: Record<string, number>;
  stepsAhead: Record<string, number>;
  canRemoveOpponentCell?: boolean;
  removeCooldownUntil?: number;
  canRemoveOpponentCellMap?: Record<string, boolean>;
  removeCooldownUntilMap?: Record<string, number>;
  maxStepGap?: number;
  cooldownSeconds?: number;
  difficulty?: string;
};
