import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type ModalMode = "create" | "join" | null;

export interface JoinRoomForm {
  roomCode: string;
}

export interface CreateRoomResponse {
  roomCode: string;
}
