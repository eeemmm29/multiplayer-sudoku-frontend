"use client";

import ButtonWithLabels from "@/components/button-with-labels";
import CreateEnterRoomModal from "@/components/create-room-modal";
import { GithubIcon } from "@/components/icons";
import { title } from "@/components/primitives";
import { siteConfig } from "@/config/site";
import { ModalMode } from "@/types";
import { Link } from "@heroui/link";
import { useDisclosure } from "@heroui/modal";
import { button as buttonStyles } from "@heroui/theme";
import { useState } from "react";

export default function Home() {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [modalMode, setModalMode] = useState<ModalMode>(null);

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-xl text-center justify-center">
        <span className={title()}>マルチプレイヤー数独</span>
        <br />
        <span className={title()}>Multiplayer Sudoku</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-h-48">
        <ButtonWithLabels
          labelJapanese="ルームに入る"
          labelEnglish="Join a Room"
          onPress={() => {
            setModalMode("join");
            onOpen();
          }}
        />

        <ButtonWithLabels
          labelJapanese="ルームを作成する"
          labelEnglish="Create a Room"
          onPress={() => {
            setModalMode("create");
            onOpen();
          }}
        />
      </div>
      <Link
        isExternal
        className={buttonStyles({ variant: "bordered", radius: "full" })}
        href={siteConfig.links.github}
      >
        <GithubIcon size={20} />
        GitHub
      </Link>

      <CreateEnterRoomModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onClose={onClose}
        mode={modalMode}
      />
    </section>
  );
}
