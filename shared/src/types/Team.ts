export interface Team {
  id: number;
  token: string;
  name: string;
  budget: number;
  logo: string | null;
  connected: boolean;
}