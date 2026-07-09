import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import AdminPage from "./pages/AdminPage";
import PlayerPage from "./pages/PlayerPage";


function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/admin"
          element={<AdminPage />}
        />

        <Route
          path="/"
          element={<PlayerPage />}
        />

      </Routes>

    </BrowserRouter>

  );

}


export default App;