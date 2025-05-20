import GamePageWidget from "@/components/game-page-widget";
import { Suspense } from "react";

const GamePage = () => {
  return (
    <Suspense>
      <GamePageWidget />
    </Suspense>
  );
};

export default GamePage;
