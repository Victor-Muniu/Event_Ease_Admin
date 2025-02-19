import { createBrowserRouter } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import ProtectedRoute from "../routes/ProtectedRoute";
import MainLaout from "../components/layout/MainLayout";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import EventGroundsManagement from "../pages/EventGroundsManagement";
import NotificationCenter from "../pages/NotificationCentre";
import EventDashboard from "../pages/EventDashboard";
export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Login />,
      },
    ],
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute element={<MainLaout />} />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
    ],
  },
  {
    path: "/event_ground",
    element: <ProtectedRoute element={<MainLaout />} />,
    children: [
      {
        index: true,
        element: <EventGroundsManagement />,
      },
    ],
  },
  {
    path: "/event_request",
    element: <ProtectedRoute element={<MainLaout />} />,
    children: [
      {
        index: true,
        element: <NotificationCenter />,
      },
    ],
  },
  {
    path: "/events",
    element: <ProtectedRoute element={<MainLaout />} />,
    children: [
      {
        index: true,
        element: <EventDashboard />,
      },
    ],
  },
]);
