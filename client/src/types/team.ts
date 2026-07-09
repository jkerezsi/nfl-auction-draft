export interface Team {
  id: number;
  token?: string;
  name: string;
  logo?: string | null;
  budget: number;
  connected: number;
}