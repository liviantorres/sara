import { RouterProvider } from "react-router-dom";
import { appRoutes } from "./routes";

export default function App() {
  return <RouterProvider router={appRoutes} />;
}