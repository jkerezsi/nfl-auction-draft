interface TeamCardProps {
  name: string;
  budget: number;
  playerCount?: number;
  spent?: number;
  selected?: boolean;
  onClick?: () => void;
}


export default function TeamCard({
  name,
  budget,
  playerCount,
  spent,
  selected = false,
  onClick
}: TeamCardProps) {
  return (
    <button
      type="button"
      className={
        `team-card ${
          selected
            ? "team-card--selected"
            : ""
        }`
      }
      onClick={onClick}
    >
      <div className="team-card__header">
        <h3>
          {name}
        </h3>

        <span className="team-card__budget">
          ${budget}
        </span>
      </div>

      {
        (
          playerCount !== undefined ||
          spent !== undefined
        ) && (
          <div className="team-card__stats">
            {
              playerCount !== undefined && (
                <div>
                  <span>
                    Players
                  </span>

                  <strong>
                    {playerCount}
                  </strong>
                </div>
              )
            }

            {
              spent !== undefined && (
                <div>
                  <span>
                    Spent
                  </span>

                  <strong>
                    ${spent}
                  </strong>
                </div>
              )
            }
          </div>
        )
      }
    </button>
  );
}