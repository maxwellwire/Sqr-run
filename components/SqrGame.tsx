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

export default function SqrGame({
  username,
  best: initialBest,
  season
}: SqrGameProps) {
  const canvasRef =
    useRef<HTMLCanvasElement>(null);

  const gameRef =
    useRef<any>(null);

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

    function resizeCanvas() {
      const rect =
        canvas.getBoundingClientRect();

      const ratio =
        window.devicePixelRatio || 1;

      canvas.width =
        rect.width * ratio;

      canvas.height =
        rect.height * ratio;

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

    function jumpPlayer() {
      if (!gameRef.current) {
        return;
      }

      jump = 1;
    }

    function slidePlayer() {
      if (!gameRef.current) {
        return;
      }

      slide = 0.5;
    }

    function keyboardHandler(
      event: KeyboardEvent
    ) {
      if (
        event.code === "Space" ||
        event.code === "ArrowUp"
      ) {
        event.preventDefault();

        jumpPlayer();
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

    function startGame() {
      gameRef.current = {
        start: Date.now(),

        distance: 0,

        collectibles: 0,

        speed: 4.5,

        obstacles: [],

        items: [],

        lastObstacleSpawn: 0,

        lastItemSpawn: 0,

        dead: false
      };

      setDistance(0);

      setCollectibles(0);

      setGameOver(false);

      setNewBest(false);

      setRunning(true);

      lastTime =
        performance.now();

      animationFrame =
        requestAnimationFrame(
          gameLoop
        );
    }

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
          (currentTime - lastTime) /
            1000
        );

      lastTime =
        currentTime;

      /*
       * Difficulty increases as distance grows.
       */
      game.speed =
        Math.min(
          12.5,
          4.5 +
            game.distance / 1800
        );

      game.distance +=
        game.speed *
        delta *
        10;

      jump =
        Math.max(
          0,
          jump - delta * 2.3
        );

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
          (item: any) => {
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
              game.collectibles += 1;

              return false;
            }

            return true;
          }
        );

      /*
       * Remove objects that have left
       * the screen.
       */
      game.obstacles =
        game.obstacles.filter(
          (obstacle: any) =>
            obstacle.x > -80
        );

      drawGame(
        width,
        height,
        ground,
        playerX,
        playerY,
        game
      );

      setDistance(
        Math.floor(
          game.distance
        )
      );

      setCollectibles(
        game.collectibles
      );

      animationFrame =
        requestAnimationFrame(
          gameLoop
        );
    }

    function drawGame(
      width: number,
      height: number,
      ground: number,
      playerX: number,
      playerY: number,
      game: any
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
        let x = 0;
        x < width;
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
        x < width;
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
      }

      /*
       * Obstacles.
       */
      for (
        const obstacle of
        game.obstacles
      ) {
        if (
          obstacle.type ===
          "log"
        ) {
          ctx.fillStyle =
            "#5b3a24";

          ctx.fillRect(
            obstacle.x - 28,
            ground - 34,
            56,
            34
          );
        } else {
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
       * Tail.
       */
      ctx.beginPath();

      ctx.arc(
        playerX - 22,
        playerY - 8,
        26,
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
        playerX + 10,
        playerY - 7,
        8,
        0,
        Math.PI * 2
      );

      ctx.fill();

      ctx.fillStyle =
        "#111111";

      ctx.beginPath();

      ctx.arc(
        playerX + 12,
        playerY - 7,
        3,
        0,
        Math.PI * 2
      );

      ctx.fill();

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
        endedAt -
        game.start;

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
                  Math.floor(
                    game.distance
                  ),

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

        const result =
          await response.json();

        if (result.newBest) {
          setBest(
            Math.floor(
              game.distance
            )
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

    (
      window as any
    ).sqrStart =
      startGame;

    (
      window as any
    ).sqrJump =
      jumpPlayer;

    (
      window as any
    ).sqrSlide =
      slidePlayer;

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
    };
  }, []);

  function startGame() {
    setNewBest(false);

    (
      window as any
    ).sqrStart?.();
  }

  function jump() {
    (
      window as any
    ).sqrJump?.();
  }

  function slide() {
    (
      window as any
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
            {username} · Best {best}m
          </div>
        </div>

        <div className="canvas">
          <canvas ref={canvasRef} />

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
                    Run. Collect. Survive.
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
                      {collectibles}
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
                        "_blank"
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
            onClick={jump}
            onTouchStart={jump}
          >
            JUMP
          </button>

          <button
            onClick={slide}
            onTouchStart={slide}
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