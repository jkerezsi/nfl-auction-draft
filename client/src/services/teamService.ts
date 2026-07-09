import { apiGet } from "./api";

import {
  Team
} from "../types/team";


export function getTeams() {

  return apiGet<Team[]>(
    "/team"
  );

}