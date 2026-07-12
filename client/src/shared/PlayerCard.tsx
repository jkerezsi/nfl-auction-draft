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
  const positionClass =
    getPositionClass(
      position
    );

  const positionLabel =
    getPositionLabel(
      position
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
      className={
        classNames
      }
    >
      <div className="fantasy-player-card__accent" />

      <div className="fantasy-player-card__content">
        <div className="fantasy-player-card__top">
          <span className="fantasy-player-card__position">
            {positionLabel}
          </span>

          {
            price !== undefined && (
              <span className="fantasy-player-card__price">
                ${price}
              </span>
            )
          }
        </div>

        <div className="fantasy-player-card__name">
          {name}
        </div>

        {
          (
            nflTeam !== undefined ||
            rank !== undefined
          ) && (
            <div className="fantasy-player-card__details">
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