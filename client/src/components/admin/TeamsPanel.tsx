import type {
  Team
} from "../../types/team";


interface TeamsPanelProps {
  teams: Team[];

  name: string;

  editingTeamId:
    number | null;

  editingTeamName: string;

  deletingTeamId:
    number | null;

  isSavingTeam: boolean;

  isDeletingTeam: boolean;

  isAuctionActive: boolean;

  onNameChange: (
    value: string
  ) => void;

  onAddTeam: () => void;

  onEditingTeamNameChange: (
    value: string
  ) => void;

  onBeginEditing: (
    team: Team
  ) => void;

  onCancelEditing: () => void;

  onSaveTeam: (
    teamId: number
  ) => void;

  onCancelDelete: () => void;

  onDeleteTeam: (
    teamId: number
  ) => void;
}


export default function TeamsPanel({
  teams,
  name,
  editingTeamId,
  editingTeamName,
  deletingTeamId,
  isSavingTeam,
  isDeletingTeam,
  isAuctionActive,
  onNameChange,
  onAddTeam,
  onEditingTeamNameChange,
  onBeginEditing,
  onCancelEditing,
  onSaveTeam,
  onCancelDelete,
  onDeleteTeam
}: TeamsPanelProps) {
  return (
    <section
      style={{
        padding: "20px",
        background: "#1f2937",
        borderRadius: "16px"
      }}
    >
      <h2>
        Teams
      </h2>

      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "18px"
        }}
      >
        <input
          value={
            name
          }
          onChange={
            event =>
              onNameChange(
                event.target.value
              )
          }
          onKeyDown={
            event => {
              if (
                event.key ===
                "Enter"
              ) {
                onAddTeam();
              }
            }
          }
          placeholder="Team name"
          style={{
            flex: 1,
            minWidth: 0,
            padding: "12px"
          }}
        />

        <button
          type="button"
          onClick={
            onAddTeam
          }
          style={{
            padding:
              "12px 16px"
          }}
        >
          Add
        </button>
      </div>

      {
        teams.length === 0 ? (
          <p
            style={{
              opacity: 0.7
            }}
          >
            No teams created yet.
          </p>
        ) : (
          teams.map(
            team => {
              const isEditing =
                editingTeamId ===
                  team.id;

              const isConfirmingDelete =
                deletingTeamId ===
                  team.id;


              return (
                <div
                  key={
                    team.id
                  }
                  style={{
                    padding:
                      "12px 0",
                    borderBottom:
                      "1px solid #374151"
                  }}
                >
                  {
                    isEditing ? (
                      <div
                        style={{
                          display:
                            "grid",
                          gap:
                            "10px"
                        }}
                      >
                        <input
                          value={
                            editingTeamName
                          }
                          onChange={
                            event =>
                              onEditingTeamNameChange(
                                event
                                  .target
                                  .value
                              )
                          }
                          onKeyDown={
                            event => {
                              if (
                                event.key ===
                                  "Enter"
                              ) {
                                onSaveTeam(
                                  team.id
                                );
                              }

                              if (
                                event.key ===
                                  "Escape"
                              ) {
                                onCancelEditing();
                              }
                            }
                          }
                          autoFocus
                          disabled={
                            isSavingTeam
                          }
                          style={{
                            width:
                              "100%",
                            boxSizing:
                              "border-box",
                            padding:
                              "10px"
                          }}
                        />

                        <div
                          style={{
                            display:
                              "flex",
                            gap:
                              "8px"
                          }}
                        >
                          <button
                            type="button"
                            onClick={
                              () =>
                                onSaveTeam(
                                  team.id
                                )
                            }
                            disabled={
                              isSavingTeam
                            }
                            style={{
                              flex: 1,
                              padding:
                                "9px"
                            }}
                          >
                            {
                              isSavingTeam
                                ? "Saving..."
                                : "Save"
                            }
                          </button>

                          <button
                            type="button"
                            onClick={
                              onCancelEditing
                            }
                            disabled={
                              isSavingTeam
                            }
                            style={{
                              flex: 1,
                              padding:
                                "9px"
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div
                          style={{
                            display:
                              "flex",
                            justifyContent:
                              "space-between",
                            alignItems:
                              "center",
                            gap:
                              "12px"
                          }}
                        >
                          <div
                            style={{
                              minWidth: 0
                            }}
                          >
                            <div
                              style={{
                                overflow:
                                  "hidden",
                                textOverflow:
                                  "ellipsis",
                                whiteSpace:
                                  "nowrap",
                                fontWeight:
                                  700
                              }}
                            >
                              {
                                team.name
                              }
                            </div>

                            <div
                              style={{
                                marginTop:
                                  "3px",
                                opacity:
                                  0.7
                              }}
                            >
                              Budget $
                              {
                                team.budget
                              }
                            </div>
                          </div>

                          <div
                            style={{
                              display:
                                "flex",
                              flexWrap:
                                "wrap",
                              justifyContent:
                                "flex-end",
                              gap:
                                "6px"
                            }}
                          >
                            {
                              isConfirmingDelete && (
                                <button
                                  type="button"
                                  onClick={
                                    onCancelDelete
                                  }
                                  disabled={
                                    isDeletingTeam
                                  }
                                  style={{
                                    padding:
                                      "8px 10px"
                                  }}
                                >
                                  Cancel
                                </button>
                              )
                            }

                            <button
                              type="button"
                              onClick={
                                () =>
                                  onBeginEditing(
                                    team
                                  )
                              }
                              disabled={
                                isDeletingTeam ||
                                isConfirmingDelete
                              }
                              style={{
                                padding:
                                  "8px 10px"
                              }}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={
                                () =>
                                  onDeleteTeam(
                                    team.id
                                  )
                              }
                              disabled={
                                isAuctionActive ||
                                isDeletingTeam
                              }
                              title={
                                isAuctionActive
                                  ? "Teams cannot be deleted during an active auction"
                                  : undefined
                              }
                              style={{
                                padding:
                                  "8px 10px",

                                border:
                                  isConfirmingDelete
                                    ? "1px solid #f87171"
                                    : undefined,

                                background:
                                  isConfirmingDelete
                                    ? "#b91c1c"
                                    : undefined,

                                color:
                                  isConfirmingDelete
                                    ? "white"
                                    : undefined,

                                cursor:
                                  isAuctionActive ||
                                  isDeletingTeam
                                    ? "not-allowed"
                                    : "pointer",

                                opacity:
                                  isAuctionActive
                                    ? 0.5
                                    : 1
                              }}
                            >
                              {
                                isDeletingTeam &&
                                isConfirmingDelete
                                  ? "Deleting..."
                                  : isConfirmingDelete
                                    ? "Confirm Delete"
                                    : "Delete"
                              }
                            </button>
                          </div>
                        </div>

                        {
                          isConfirmingDelete && (
                            <div
                              style={{
                                marginTop:
                                  "10px",
                                padding:
                                  "10px",
                                border:
                                  "1px solid #ef4444",
                                borderRadius:
                                  "8px",
                                background:
                                  "#7f1d1d",
                                fontSize:
                                  "14px"
                              }}
                            >
                              Delete {
                                team.name
                              }? Its bids and
                              roster entries
                              will be removed,
                              and its drafted
                              players will
                              return to the
                              pool.
                            </div>
                          )
                        }
                      </>
                    )
                  }
                </div>
              );
            }
          )
        )
      }
    </section>
  );
}
