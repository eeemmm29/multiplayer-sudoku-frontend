"use client";

import ButtonWithLabels from "@/components/button-with-labels";
import { GithubIcon } from "@/components/icons";
import { title } from "@/components/primitives";
import { siteConfig } from "@/config/site";
import { Link } from "@heroui/link";
import { button as buttonStyles } from "@heroui/theme";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-xl text-center justify-center">
        <span className={title()}>マルチプレイヤー数独</span>
        <br />
        <span className={title()}>Multiplayer Sudoku</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-h-48">
        <ButtonWithLabels
          as={Link}
          href={"#"}
          labelJapanese="ルームに入る"
          labelEnglish="Join a Room"
        />

        <ButtonWithLabels
          as={Link}
          href={"#"}
          labelJapanese="ルームを作成する"
          labelEnglish="Create a Room"
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
    </section>
  );
}
