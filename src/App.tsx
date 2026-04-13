import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Layouts
import PublicLayout from "@/layouts/PublicLayout";
import DashboardLayout from "@/layouts/DashboardLayout";

// Public pages
import HomePage from "@/pages/public/HomePage";
import AboutPage from "@/pages/public/AboutPage";
import AdmissionsPage from "@/pages/public/AdmissionsPage";
import ProgrammesPage from "@/pages/public/ProgrammesPage";
import StaffPage from "@/pages/public/StaffPage";
import GalleryPage from "@/pages/public/GalleryPage";
import NewsPage from "@/pages/public/NewsPage";
import EventsPage from "@/pages/public/EventsPage";
import ContactPage from "@/pages/public/ContactPage";
import FAQPage from "@/pages/public/FAQPage";

// Auth
import LoginPage from "@/pages/LoginPage";

// Admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import StudentsPage from "@/pages/admin/StudentsPage";
import TeachersPage from "@/pages/admin/TeachersPage";
import AcademicsPage from "@/pages/admin/AcademicsPage";
import AttendancePage from "@/pages/admin/AttendancePage";
import ResultsPage from "@/pages/admin/ResultsPage";
import FeesPage from "@/pages/admin/FeesPage";
import AdminAdmissionsPage from "@/pages/admin/AdminAdmissionsPage";
import AnnouncementsPage from "@/pages/admin/AnnouncementsPage";
import AnalyticsPage from "@/pages/admin/AnalyticsPage";
import CMSPage from "@/pages/admin/CMSPage";
import SettingsPage from "@/pages/admin/SettingsPage";

// Portals
import ParentPortal from "@/pages/portals/ParentPortal";
import TeacherPortal from "@/pages/portals/TeacherPortal";

import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public website */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/admissions" element={<AdmissionsPage />} />
            <Route path="/programmes" element={<ProgrammesPage />} />
            <Route path="/staff" element={<StaffPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FAQPage />} />
          </Route>

          {/* Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Admin dashboard */}
          <Route element={<DashboardLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<StudentsPage />} />
            <Route path="/admin/teachers" element={<TeachersPage />} />
            <Route path="/admin/academics" element={<AcademicsPage />} />
            <Route path="/admin/attendance" element={<AttendancePage />} />
            <Route path="/admin/results" element={<ResultsPage />} />
            <Route path="/admin/fees" element={<FeesPage />} />
            <Route path="/admin/admissions" element={<AdminAdmissionsPage />} />
            <Route path="/admin/announcements" element={<AnnouncementsPage />} />
            <Route path="/admin/analytics" element={<AnalyticsPage />} />
            <Route path="/admin/cms" element={<CMSPage />} />
            <Route path="/admin/settings" element={<SettingsPage />} />
          </Route>

          {/* Portals */}
          <Route path="/parent" element={<ParentPortal />} />
          <Route path="/teacher" element={<TeacherPortal />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
