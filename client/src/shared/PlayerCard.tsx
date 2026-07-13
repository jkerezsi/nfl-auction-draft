import {
  getPositionClass
} from "../utils/playerPosition";


interface PlayerCardProps {
  name: string;
  position: string;
  nflTeam?: string;
  byeWeek?: number;
  rank?: number;
  auctionValue?: number;
  salePrice?: number;
  compact?: boolean;
  result?: "won" | "lost";
}


export default function PlayerCard({
  name,
  position,
  nflTeam,
  byeWeek,
  rank,
  auctionValue,
  salePrice,
  compact = false,
  result
}: PlayerCardProps) {
  const resolvedPosition =
    position || "UNKNOWN";


  const positionClass =
    getPositionClass(
      resolvedPosition
    );


  const classNames = [
    "fantasy-player-card",
    positionClass,
    compact
      ? "fantasy-player-card--compact"
      : "",
    result
      ? `fantasy-player-card--${result}`
      : ""
  ]
    .filter(Boolean)
    .join(" ");


  return (
    <article
      className={classNames}
      style={{
        color: "#111827"
      }}
    >
      <div className="fantasy-player-card__accent" />

      <div className="fantasy-player-card__content">
        <div className="fantasy-player-card__top">
          <span className="fantasy-player-card__position">
            {resolvedPosition}
          </span>

          {
            salePrice !== undefined && (
              <span
                className="fantasy-player-card__price"
                style={{
                  color: "#111827"
                }}
              >
                Won ${salePrice}
              </span>
            )
          }
        </div>

        <div
          className="fantasy-player-card__name"
          style={{
            color: "#111827"
          }}
        >
          {name}
        </div>


        {
  (
    nflTeam !== undefined ||
    byeWeek !== undefined ||
    auctionValue !== undefined ||
    rank !== undefined
  ) && (
    <div
      className="fantasy-player-card__details"
      style={{
        color: "#64748b",
        display: "flex",
        alignItems: "center",
        gap: "18px",
        flexWrap: "wrap",
        marginTop: compact
          ? "6px"
          : "10px",
        fontWeight: 600
      }}
    >
      {
        nflTeam !== undefined && (
          <span>
            {nflTeam}
          </span>
        )
      }

      {
        (
          nflTeam !== undefined &&
          (
            byeWeek !== undefined ||
            auctionValue !== undefined ||
            rank !== undefined
          )
        ) && (
          <span>•</span>
        )
      }

      {
        byeWeek !== undefined && (
          <span>
            Bye {byeWeek}
          </span>
        )
      }

      {
        (
          byeWeek !== undefined &&
          (
            auctionValue !== undefined ||
            rank !== undefined
          )
        ) && (
          <span>•</span>
        )
      }

      {
        auctionValue !== undefined && (
          <span>
            AAV: ${auctionValue}
          </span>
        )
      }

      {
        (
          auctionValue !== undefined &&
          rank !== undefined
        ) && (
          <span>•</span>
        )
      }

      {
        rank !== undefined && (
          <span>
            Rank #{rank}
          </span>
        )
      }
    </div>
  )
}
      </div>
    </article>
  );
}