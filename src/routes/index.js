import { createBrowserRouter } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import ProtectedRoute from "../routes/ProtectedRoute";
import MainLaout from "../components/layout/MainLayout";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import EventDashboard from "../pages/EventDashboard";
import VenueManagement from "../pages/VenueManagement";
import EquipmentManagement from "../pages/EquipmentManagement";
import BookingsReport from "../pages/BookingsReport";
import VenueRequests from "../pages/VenueRequests";
import PerformanceMetrics from "../pages/PerformanceMetrics";
import ChangePassword from "../pages/ChangePassword";
import FinancialReport from "../pages/FinancialReport";
import OrganizersPage from "../pages/OrganizersPage";
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
        element: <VenueManagement />
      },
    ],
  },
  {
    path: "/venue_request",
    element: <ProtectedRoute element={<MainLaout />} />,
    children: [
      {
        index: true,
        element: <VenueRequests />
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
  {
    path: "/bookings",
    element: <ProtectedRoute element={<MainLaout />} />,
    children: [
      {
        index: true,
        element: <BookingsReport />,
      },
    ],
  },
  {
    path: "/equipments",
    element: <ProtectedRoute element={<MainLaout />} />,
    children: [
      {
        index: true,
        element: <EquipmentManagement />,
      },
    ],
  },
  {
    path: "/metrics",
    element: <ProtectedRoute element={<MainLaout />} />,
    children: [
      {
        index: true,
        element: <PerformanceMetrics />,
      },
    ],
  },
  {
    path: "/settings",
    element: <ProtectedRoute element={<MainLaout />} />,
    children: [
      {
        index: true,
        element: <ChangePassword />,
      },
    ], 
  },
  {
    path: "/report",
    element: <ProtectedRoute element={<MainLaout />} />,
    children: [
      {
        index: true,
        element: <FinancialReport />,
      },
    ], 
  },
  {
    path: "/organizers",
    element: <ProtectedRoute element={<MainLaout />} />,
    children: [
      {
        index: true,
        element: <OrganizersPage />
      },
    ], 
  }
]);
