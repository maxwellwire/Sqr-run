"use client";

import {
  useEffect,
  useRef,
  useState
} from "react";

import { useRouter } from "next/navigation";

interface SqrGameProps {
  username: string;
  best: number;
  season: string;
}

interface Obstacle {
  x: number;
  type: "log" | "bird";
}

interface Collectible {
  x: number;
  y: number;
}

interface GameState {
  start: number;
  distance: number;
  collectibles: number;
  speed: number;
  obstacles: Obstacle[];
  items: Collectible[];
  lastObstacleSpawn: number;
  lastItemSpawn: number;
  dead: boolean;
}

export default function SqrGame({
  username,
  best: initialBest,
  season
}: SqrGameProps) {
  const canvasRef =
    useRef<HTMLCanvasElement>(null);

  const gameRef =
    useRef<GameState | null>(null);

  const [
    running,
    setRunning
  ] = useState(false);

  const [
    gameOver,
    setGameOver
  ] = useState(false);

  const [
    distance,
    setDistance
  ] = useState(0);

  const [
    collectibles,
    setCollectibles
  ] = useState(0);

  const [
    best,
    setBest
  ] = useState(initialBest);

  const [
    newBest,
    setNewBest
  ] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const canvas =
      canvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx =
      canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    let animationFrame = 0;

    let lastTime = 0;

    let jump = 0;

    let slide = 0;

    /*
     * Resize the canvas to match
     * its displayed size.
     */
    function resizeCanvas() {
      /*
       * Extra null check keeps
       * TypeScript happy during
       * production builds.
       */
      if (!canvas) {
        return;
      }

      const rect =
        canvas.getBoundingClientRect();

      const ratio =
        window.devicePixelRatio || 1;

      canvas.width =
        Math.max(
          1,
          Math.floor(
            rect.width * ratio
          )
        );

      canvas.height =
        Math.max(
          1,
          Math.floor(
            rect.height * ratio
          )
        );

      ctx.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
      );
    }

    resizeCanvas();

    window.addEventListener(
      "resize",
      resizeCanvas
    );

    /*
     * Jump action.
     */
    function jumpPlayer() {
      if (!gameRef.current) {
        return;
      }

      if (gameRef.current.dead) {
        return;
      }

      /*
       * Do not allow repeated
       * jumps while already in air.
       */
      if (jump > 0.15) {
        return;
      }

      jump = 1;
    }

    /*
     * Slide action.
     */
    function slidePlayer() {
      if (!gameRef.current) {
        return;
      }

      if (gameRef.current.dead) {
        return;
      }

      slide = 0.5;
    }

    /*
     * Keyboard controls.
     */
    function keyboardHandler(
      event: KeyboardEvent
    ) {
      if (
        event.code === "Space" ||
        event.code === "ArrowUp"
      ) {
        event.preventDefault();

        jumpPlayer();

        return;
      }

      if (
        event.code === "ArrowDown"
      ) {
        event.preventDefault();

        slidePlayer();
      }
    }

    window.addEventListener(
      "keydown",
      keyboardHandler
    );

    /*
     * Finish the current run.
     */
    async function finishGame() {
      const game =
        gameRef.current;

      if (!game || game.dead) {
        return;
      }

      game.dead = true;

      cancelAnimationFrame(
        animationFrame
      );

      setRunning(false);

      setGameOver(true);

      const endedAt =
        Date.now();

      const duration =
        endedAt - game.start;

      const finalDistance =
        Math.floor(
          game.distance
        );

      try {
        const response =
          await fetch(
            "/api/runs",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({
                distance:
                  finalDistance,

                durationMs:
                  duration,

                collectibles:
                  game.collectibles,

                startedAt:
                  new Date(
                    game.start
                  ).toISOString(),

                endedAt:
                  new Date(
                    endedAt
                  ).toISOString()
              })
            }
          );

        if (!response.ok) {
          throw new Error(
            `Run submission failed: ${response.status}`
          );
        }

        const result =
          await response.json();

        if (result.newBest) {
          setBest(
            finalDistance
          );

          setNewBest(true);
        }
      } catch (error) {
        console.error(
          "Run submission failed:",
          error
        );
      }
    }

    /*
     * Draw the complete game.
     */
    function drawGame(
      width: number,
      height: number,
      ground: number,
      playerX: number,
      playerY: number,
      game: GameState
    ) {
      /*
       * Sky.
       */
      ctx.fillStyle =
        "#75c96b";

      ctx.fillRect(
        0,
        0,
        width,
        height
      );

      /*
       * Background hills.
       */
      ctx.fillStyle =
        "#4b9551";

      for (
        let x = -140;
        x < width + 140;
        x += 140
      ) {
        ctx.beginPath();

        ctx.arc(
          x,
          ground - 100,
          100,
          Math.PI,
          0
        );

        ctx.fill();
      }

      /*
       * Forest trunks.
       */
      ctx.fillStyle =
        "#2b6a39";

      for (
        let x = 40;
        x < width + 180;
        x += 180
      ) {
        ctx.fillRect(
          x,
          ground - 170,
          25,
          170
        );

        ctx.beginPath();

        ctx.arc(
          x + 12,
          ground - 185,
          75,
          0,
          Math.PI * 2
        );

        ctx.fill();
      }

      /*
       * Ground.
       */
      ctx.fillStyle =
        "#9b6b3d";

      ctx.fillRect(
        0,
        ground,
        width,
        height - ground
      );

      /*
       * Ground grass line.
       */
      ctx.fillStyle =
        "#3e7c3b";

      ctx.fillRect(
        0,
        ground - 6,
        width,
        6
      );

      /*
       * Collectibles.
       */
      for (
        const item of game.items
      ) {
        ctx.fillStyle =
          "#f4c744";

        ctx.beginPath();

        ctx.arc(
          item.x,
          height * item.y,
          12,
          0,
          Math.PI * 2
        );

        ctx.fill();

        /*
         * Small highlight.
         */
        ctx.fillStyle =
          "#fff3a3";

        ctx.beginPath();

        ctx.arc(
          item.x - 4,
          height * item.y - 4,
          3,
          0,
          Math.PI * 2
        );

        ctx.fill();
      }

      /*
       * Obstacles.
       */
      for (
        const obstacle of
        game.obstacles
      ) {
        if (
          obstacle.type === "log"
        ) {
          /*
           * Fallen log.
           */
          ctx.fillStyle =
            "#5b3a24";

          ctx.fillRect(
            obstacle.x - 28,
            ground - 34,
            56,
            34
          );

          ctx.fillStyle =
            "#8b5a32";

          ctx.beginPath();

          ctx.arc(
            obstacle.x + 25,
            ground - 17,
            17,
            0,
            Math.PI * 2
          );

          ctx.fill();
        } else {
          /*
           * Bird.
           */
          ctx.fillStyle =
            "#26352b";

          ctx.beginPath();

          ctx.arc(
            obstacle.x,
            ground - 100,
            22,
            0,
            Math.PI * 2
          );

          ctx.fill();

          /*
           * Wings.
           */
          ctx.beginPath();

          ctx.arc(
            obstacle.x - 22,
            ground - 94,
            16,
            Math.PI,
            Math.PI * 2
          );

          ctx.fill();

          ctx.beginPath();

          ctx.arc(
            obstacle.x + 22,
            ground - 94,
            16,
            Math.PI,
            Math.PI * 2
          );

          ctx.fill();
        }
      }

      /*
       * Original squirrel body.
       */
      ctx.fillStyle =
        "#a95b28";

      ctx.beginPath();

      ctx.arc(
        playerX,
        playerY,
        24,
        0,
        Math.PI * 2
      );

      ctx.fill();

      /*
       * Squirrel head.
       */
      ctx.beginPath();

      ctx.arc(
        playerX + 14,
        playerY - 8,
        19,
        0,
        Math.PI * 2
      );

      ctx.fill();

      /*
       * Ears.
       */
      ctx.beginPath();

      ctx.arc(
        playerX + 4,
        playerY - 28,
        9,
        0,
        Math.PI * 2
      );

      ctx.fill();

      ctx.beginPath();

      ctx.arc(
        playerX + 23,
        playerY - 28,
        9,
        0,
        Math.PI * 2
      );

      ctx.fill();

      /*
       * Tail.
       */
      ctx.fillStyle =
        "#a95b28";

      ctx.beginPath();

      ctx.arc(
        playerX - 22,
        playerY - 8,
        26,
        0,
        Math.PI * 2
      );

      ctx.fill();

      ctx.beginPath();

      ctx.arc(
        playerX - 30,
        playerY - 28,
        20,
        0,
        Math.PI * 2
      );

      ctx.fill();

      /*
       * Eye.
       */
      ctx.fillStyle =
        "#ffffff";

      ctx.beginPath();

      ctx.arc(
        playerX + 20,
        playerY - 13,
        7,
        0,
        Math.PI * 2
      );

      ctx.fill();

      ctx.fillStyle =
        "#111111";

      ctx.beginPath();

      ctx.arc(
        playerX + 22,
        playerY - 13,
        3,
        0,
        Math.PI * 2
      );

      ctx.fill();

      /*
       * Nose.
       */
      ctx.fillStyle =
        "#201712";

      ctx.beginPath();

      ctx.arc(
        playerX + 31,
        playerY - 5,
        3,
        0,
        Math.PI * 2
      );

      ctx.fill();

      /*
       * Simple running legs.
       */
      ctx.strokeStyle =
        "#713d20";

      ctx.lineWidth = 5;

      ctx.beginPath();

      ctx.moveTo(
        playerX - 8,
        playerY + 18
      );

      ctx.lineTo(
        playerX - 15,
        playerY + 32
      );

      ctx.stroke();

      ctx.beginPath();

      ctx.moveTo(
        playerX + 8,
        playerY + 18
      );

      ctx.lineTo(
        playerX + 15,
        playerY + 32
      );

      ctx.stroke();

      /*
       * Distance HUD.
       */
      ctx.fillStyle =
        "#f4c744";

      ctx.font =
        "900 18px Arial";

      ctx.fillText(
        `${Math.floor(
          game.distance
        )}m`,
        18,
        30
      );
    }

    /*
     * Main game loop.
     */
    function gameLoop(
      currentTime: number
    ) {
      const game =
        gameRef.current;

      if (!game || game.dead) {
        return;
      }

      const delta =
        Math.min(
          0.04,
          Math.max(
            0,
            (currentTime - lastTime) /
              1000
          )
        );

      lastTime =
        currentTime;

      /*
       * Difficulty increases
       * as distance grows.
       *
       * Speed is measured in
       * metres per second.
       */
      game.speed =
        Math.min(
          12.5,
          4.5 +
            game.distance / 1800
        );

      /*
       * IMPORTANT:
       * Distance is now aligned
       * with the server validator.
       */
      game.distance +=
        game.speed * delta;

      /*
       * Jump physics.
       */
      jump =
        Math.max(
          0,
          jump - delta * 2.3
        );

      /*
       * Slide timer.
       */
      slide =
        Math.max(
          0,
          slide - delta
        );

      /*
       * Spawn obstacles.
       */
      if (
        currentTime -
          game.lastObstacleSpawn >
        Math.max(
          480,
          1150 -
            game.speed * 55
        )
      ) {
        game.lastObstacleSpawn =
          currentTime;

        game.obstacles.push({
          x:
            canvas.clientWidth + 50,

          type:
            Math.random() < 0.5
              ? "log"
              : "bird"
        });
      }

      /*
       * Spawn collectibles.
       */
      if (
        currentTime -
          game.lastItemSpawn >
        450
      ) {
        game.lastItemSpawn =
          currentTime;

        game.items.push({
          x:
            canvas.clientWidth + 50,

          y:
            0.45 +
            Math.random() * 0.25
        });
      }

      /*
       * Move obstacles.
       *
       * 60 is used for visual
       * pixel movement, while
       * distance uses metres/sec.
       */
      for (
        const obstacle of
        game.obstacles
      ) {
        obstacle.x -=
          game.speed *
          delta *
          60;
      }

      /*
       * Move collectibles.
       */
      for (
        const item of
        game.items
      ) {
        item.x -=
          game.speed *
          delta *
          60;
      }

      const width =
        canvas.clientWidth;

      const height =
        canvas.clientHeight;

      const ground =
        height * 0.78;

      const playerX =
        width * 0.2;

      const playerY =
        ground -
        jump *
          height *
          0.3;

      /*
       * Collision detection.
       */
      for (
        const obstacle of
        game.obstacles
      ) {
        const closeEnough =
          Math.abs(
            obstacle.x -
              playerX
          ) < 38;

        if (!closeEnough) {
          continue;
        }

        const dangerous =
          obstacle.type === "log"
            ? jump < 0.3
            : slide <= 0;

        if (dangerous) {
          finishGame();

          return;
        }
      }

      /*
       * Collectibles.
       */
      game.items =
        game.items.filter(
          (item) => {
            const hit =
              Math.abs(
                item.x -
                  playerX
              ) < 35 &&
              Math.abs(
                height *
                  item.y -
                  playerY
              ) < 65;

            if (hit) {
              game.collectibles +=
                1;

              return false;
            }

            /*
             * Remove items that
             * have gone off-screen.
             */
            return (
              item.x > -50
            );
          }
        );

      /*
       * Remove obstacles that
       * have left the screen.
       */
      game.obstacles =
        game.obstacles.filter(
          (obstacle) =>
            obstacle.x > -80
        );

      /*
       * Draw everything.
       */
      drawGame(
        width,
        height,
        ground,
        playerX,
        playerY,
        game
      );

      /*
       * Update React HUD.
       */
      setDistance(
        Math.floor(
          game.distance
        )
      );

      setCollectibles(
        game.collectibles
      );

      /*
       * Continue game loop.
       */
      animationFrame =
        requestAnimationFrame(
          gameLoop
        );
    }

    /*
     * Start a new game.
     */
    function startGame() {
      const now =
        Date.now();

      gameRef.current = {
        start: now,

        distance: 0,

        collectibles: 0,

        speed: 4.5,

        obstacles: [],

        items: [],

        lastObstacleSpawn:
          performance.now(),

        lastItemSpawn:
          performance.now(),

        dead: false
      };

      jump = 0;

      slide = 0;

      setDistance(0);

      setCollectibles(0);

      setGameOver(false);

      setNewBest(false);

      setRunning(true);

      lastTime =
        performance.now();

      cancelAnimationFrame(
        animationFrame
      );

      animationFrame =
        requestAnimationFrame(
          gameLoop
        );
    }

    /*
     * Expose controls to the
     * React buttons.
     */
    (
      window as unknown as {
        sqrStart?: () => void;
        sqrJump?: () => void;
        sqrSlide?: () => void;
      }
    ).sqrStart =
      startGame;

    (
      window as unknown as {
        sqrStart?: () => void;
        sqrJump?: () => void;
        sqrSlide?: () => void;
      }
    ).sqrJump =
      jumpPlayer;

    (
      window as unknown as {
        sqrStart?: () => void;
        sqrJump?: () => void;
        sqrSlide?: () => void;
      }
    ).sqrSlide =
      slidePlayer;

    /*
     * Cleanup.
     */
    return () => {
      cancelAnimationFrame(
        animationFrame
      );

      window.removeEventListener(
        "resize",
        resizeCanvas
      );

      window.removeEventListener(
        "keydown",
        keyboardHandler
      );

      const controls =
        window as unknown as {
          sqrStart?: () => void;
          sqrJump?: () => void;
          sqrSlide?: () => void;
        };

      delete controls.sqrStart;
      delete controls.sqrJump;
      delete controls.sqrSlide;
    };
  }, []);

  /*
   * React button:
   * Start game.
   */
  function startGame() {
    setNewBest(false);

    (
      window as unknown as {
        sqrStart?: () => void;
      }
    ).sqrStart?.();
  }

  /*
   * React button:
   * Jump.
   */
  function jump() {
    (
      window as unknown as {
        sqrJump?: () => void;
      }
    ).sqrJump?.();
  }

  /*
   * React button:
   * Slide.
   */
  function slide() {
    (
      window as unknown as {
        sqrSlide?: () => void;
      }
    ).sqrSlide?.();
  }

  return (
    <main className="page">
      <div className="game">

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            padding: "10px 0"
          }}
        >
          <div className="brand">
            $SQR RUN
          </div>

          <div>
            {username} · Best{" "}
            {best}m
          </div>
        </div>

        <div className="canvas">
          <canvas
            ref={canvasRef}
          />

          {!running &&
            !gameOver && (
              <div className="over">
                <div>
                  <h1>
                    SQR RUN
                  </h1>

                  <p>
                    {season}
                  </p>

                  <p className="muted">
                    Run. Collect.
                    Survive.
                  </p>

                  <button
                    className="btn"
                    onClick={
                      startGame
                    }
                  >
                    START RUN
                  </button>
                </div>
              </div>
            )}

          {gameOver && (
            <div className="over">
              <div>
                <h2>
                  RUN OVER
                </h2>

                {newBest && (
                  <p
                    style={{
                      color:
                        "#f4c744",
                      fontWeight:
                        900
                    }}
                  >
                    NEW PERSONAL
                    BEST!
                  </p>
                )}

                <div className="stats">

                  <div className="stat">
                    Distance

                    <strong>
                      {distance}m
                    </strong>
                  </div>

                  <div className="stat">
                    SQR Collected

                    <strong>
                      {
                        collectibles
                      }
                    </strong>
                  </div>

                  <div className="stat">
                    Best

                    <strong>
                      {best}m
                    </strong>
                  </div>

                </div>

                <div
                  style={{
                    display:
                      "flex",
                    gap: 10,
                    justifyContent:
                      "center",
                    flexWrap:
                      "wrap"
                  }}
                >
                  <button
                    className="btn"
                    onClick={
                      startGame
                    }
                  >
                    PLAY AGAIN
                  </button>

                  <button
                    className="btn secondary"
                    onClick={() =>
                      router.push(
                        "/leaderboard"
                      )
                    }
                  >
                    LEADERBOARD
                  </button>

                  <button
                    className="btn secondary"
                    onClick={() =>
                      window.open(
                        `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                          `🐿️ I just survived ${distance}m in SQR RUN! Can you beat me? #SQR #SQRRUN`
                        )}`,
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                  >
                    SHARE ON X
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="touch">
          <button
            type="button"
            onClick={jump}
          >
            JUMP
          </button>

          <button
            type="button"
            onClick={slide}
          >
            SLIDE
          </button>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            marginTop: 12
          }}
        >
          <span className="muted">
            SPACE / ↑ = Jump
          </span>

          <span className="muted">
            ↓ = Slide
          </span>
        </div>
      </div>
    </main>
  );
}