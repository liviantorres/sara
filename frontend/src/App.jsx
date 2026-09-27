import { RouterProvider } from "react-router-dom";
import { appRoutes } from "./routes";
import { AuthProvider } from "./contexts/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={appRoutes} />;
    </AuthProvider>
  );
}