const TEAM_KEY = "fantasy_team_id";


export function saveTeamId(
  teamId: number
) {

  localStorage.setItem(
    TEAM_KEY,
    String(teamId)
  );

}



export function getTeamId(): number | null {

  const value =
    localStorage.getItem(
      TEAM_KEY
    );


  if (!value) {

    return null;

  }


  return Number(value);

}



export function clearTeamId() {

  localStorage.removeItem(
    TEAM_KEY
  );

}