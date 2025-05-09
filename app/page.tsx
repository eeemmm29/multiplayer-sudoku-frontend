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
        <span className={title()}>Multiplayer Sudoku</span>
        {/* <span className={title({ color: "violet" })}>beautiful&nbsp;</span>
        <br />
        <span className={title()}>
          websites regardless of your design experience.
        </span>
        <div className={subtitle({ class: "mt-4" })}>
          Beautiful, fast and modern React UI library.
        </div> */}
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

      {/* <div className="flex gap-3"> */}
      {/* <Link
          isExternal
          className={buttonStyles({
            color: "primary",
            radius: "full",
            variant: "shadow",
          })}
          href={siteConfig.links.docs}
        >
          Documentation
        </Link> */}
      <Link
        isExternal
        className={buttonStyles({ variant: "bordered", radius: "full" })}
        href={siteConfig.links.github}
      >
        <GithubIcon size={20} />
        GitHub
      </Link>
      {/* </div> */}

      {/* <div className="mt-8">
        <Snippet hideCopyButton hideSymbol variant="bordered">
          <span>
            Get started by editing <Code color="primary">app/page.tsx</Code>
          </span>
        </Snippet>
      </div> */}
    </section>
  );
}
