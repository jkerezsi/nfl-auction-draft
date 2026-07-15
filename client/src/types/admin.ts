import type {
  Team
} from "./team";

import type {
  TeamRoster
} from "./roster";


export interface AdminTeam {
  team: Team;
  roster: TeamRoster;
}