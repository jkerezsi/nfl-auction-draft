import {
  getPositionClass,
  getPositionLabel
} from "../utils/playerPosition";


interface PlayerCardProps {
  name: string;
  position: string;
  nflTeam?: string;
  rank?: number;
  price?: number;
  compact?: boolean;
  result?: "won" | "lost";
}


export default function PlayerCard({
  name,
  position,
  nflTeam,
  rank,
  price,
  compact = false,
  result
}: PlayerCardProps) {
  const resolvedPosition =
    position || "UNKNOWN";


  const positionClass =
    getPositionClass(
      resolvedPosition
    );


  const positionLabel =
    getPositionLabel(
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
            {positionLabel}
          </span>

          {
            price !== undefined && (
              <span
                className="fantasy-player-card__price"
                style={{
                  color: "#111827"
                }}
              >
                ${price}
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
            rank !== undefined
          ) && (
            <div
              className="fantasy-player-card__details"
              style={{
                color: "#64748b"
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