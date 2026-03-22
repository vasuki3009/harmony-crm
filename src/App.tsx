import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import CRMLayout from "./components/CRMLayout";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import LeadsPage from "./pages/LeadsPage";
import TasksPage from "./pages/TasksPage";
import EmployeesPage from "./pages/EmployeesPage";
import DepartmentsPage from "./pages/DepartmentsPage";
import GoalsPage from "./pages/GoalsPage";
import AttendancePage from "./pages/AttendancePage";
import AnalyticsPage from "./pages/AnalyticsPage";
import CalendarPage from "./pages/CalendarPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><CRMLayout><Dashboard /></CRMLayout></ProtectedRoute>} />
      <Route path="/leads" element={<ProtectedRoute><CRMLayout><LeadsPage /></CRMLayout></ProtectedRoute>} />
      <Route path="/tasks" element={<ProtectedRoute><CRMLayout><TasksPage /></CRMLayout></ProtectedRoute>} />
      <Route path="/employees" element={<ProtectedRoute><CRMLayout><EmployeesPage /></CRMLayout></ProtectedRoute>} />
      <Route path="/departments" element={<ProtectedRoute><CRMLayout><DepartmentsPage /></CRMLayout></ProtectedRoute>} />
      <Route path="/goals" element={<ProtectedRoute><CRMLayout><GoalsPage /></CRMLayout></ProtectedRoute>} />
      <Route path="/attendance" element={<ProtectedRoute><CRMLayout><AttendancePage /></CRMLayout></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><CRMLayout><AnalyticsPage /></CRMLayout></ProtectedRoute>} />
      <Route path="/calendar" element={<ProtectedRoute><CRMLayout><CalendarPage /></CRMLayout></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
