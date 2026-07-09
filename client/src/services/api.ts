const API_URL =
  "http://localhost:3000/api";


export async function apiGet<T>(
  endpoint: string
): Promise<T> {


  const response =
    await fetch(
      `${API_URL}${endpoint}`
    );


  if (!response.ok) {

    throw new Error(
      "API request failed"
    );

  }


  return response.json();

}