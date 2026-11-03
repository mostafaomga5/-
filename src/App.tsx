import React, { useEffect, useLayoutEffect, useRef } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useSearchParams,
  useNavigate,
  useLocation,
  useNavigationType,
} from 'react-router-dom';
import { PlasticoProvider } from './context/PlasticoContext';
import { PublicLayout } from './layouts/PublicLayout';
import { AppLayout } from './layouts/AppLayout';
import { PublicHomepage } from './pages/PublicHomepage';
import {
  AboutPage,
  HowItWorksPage,
  ContactPage,
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  OnboardingRolePage,
  OnboardingSetupPage,
} from './pages/PublicInfoPages';
import { AppDashboard } from './pages/AppDashboard';
import { SuppliersDirectoryPage } from './pages/SuppliersDirectoryPage';
import {
  ManufacturingHubPage,
  ManufacturingRequestsListPage,
  NewManufacturingRequestPage,
  ManufacturingRequestDetailPage,
  FactoryProvidersPage,
  FactoryProviderDetailPage,
  AvailableMachinesPage,
  MoldsServicePage,
  MyManufacturingRequestsPage,
  MyFactoryOffersPage,
} from './pages/ManufacturingPages';
import {
  FaultsListPage,
  FaultDetailPage,
  JobsListPage,
  JobDetailPage,
} from './pages/FaultsAndJobsPages';
import {
  MarketListPage,
  MarketDetailPage,
  ExpoListPage,
  ExpoDetailPage,
  NewsListPage,
  NewsDetailPage,
  VisualSearchPage,
  TrainingPage,
} from './pages/MarketExpoNewsPages';
import {
  ProfilePage,
  ProfileEditPage,
  NotificationsPage,
  SettingsPage,
  MessagesPage,
  SavedItemsPage,
} from './pages/ProfileNotificationsSettingsPages';
import {
  CompanyDirectoryPage,
  FactoryDetailProfilePage,
  SupplierDetailProfilePage,
  JobApplicationsPage,
  CourseDetailPage,
  SearchResultsPage,
  HelpSupportPage,
  AdminDashboardPage,
} from './pages/ExtendedPlatformPages';
import { PublicUserProfilePage } from './pages/PublicUserProfilePage';
import {
  MaterialsIntelligencePage,
  IndustrialExpertsPage,
  PlasticoAiPage,
} from './pages/MaterialsAndExpertsPages';
import { MandatoryAuthGate } from './components/SplashAndVisitorGate';
import { usePlastico } from './context/PlasticoContext';

const scrollPositionsByKey = new Map<string, number>();

if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

function forceScrollToPosition(y: number) {
  if (typeof window === 'undefined') return;
  window.scrollTo({
    top: y,
    left: 0,
    behavior: 'instant' as ScrollBehavior,
  });
  document.documentElement.scrollTop = y;
  document.body.scrollTop = y;
}

const ScrollRestorationManager: React.FC = () => {
  const location = useLocation();
  const navType = useNavigationType();
  const prevRouteRef = useRef<string | null>(null);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    const routeKey = location.key || `${location.pathname}${location.search}`;
    const handleScroll = () => {
      scrollPositionsByKey.set(
        routeKey,
        window.scrollY || document.documentElement.scrollTop || 0
      );
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.key, location.pathname, location.search]);

  useLayoutEffect(() => {
    const currentRoute = `${location.pathname}${location.search}`;
    const isInitialLoad = prevRouteRef.current === null;
    const routeChanged = prevRouteRef.current !== currentRoute;
    prevRouteRef.current = currentRoute;

    if (isInitialLoad) {
      forceScrollToPosition(0);
      return;
    }

    if (navType === 'POP' && routeChanged) {
      const routeKey = location.key || currentRoute;
      const savedY = scrollPositionsByKey.get(routeKey) ?? 0;
      forceScrollToPosition(savedY);
      return;
    }

    if (routeChanged) {
      forceScrollToPosition(0);
    }
  }, [location.pathname, location.search, location.key, navType]);

  return null;
};

const AutostartHandler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { enterVisitorMode } = usePlastico();

  useEffect(() => {
    if (searchParams.get('autostart') === '1') {
      enterVisitorMode();
      navigate('/app/home', { replace: true });
    }
  }, [searchParams, navigate, enterVisitorMode]);

  return <>{children}</>;
};

export function App() {
  return (
    <PlasticoProvider>
      <BrowserRouter>
        <ScrollRestorationManager />
        <AutostartHandler>
          <MandatoryAuthGate>
            <Routes>
              {/* Splash Screen when visiting /splash */}
              <Route path="/splash" element={<PublicHomepage />} />

              {/* Public & Authentication Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<PublicHomepage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/register" element={<RegisterPage />} />
                <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/onboarding/type" element={<OnboardingRolePage />} />
                <Route path="/onboarding/setup" element={<OnboardingSetupPage />} />
              </Route>

              {/* Convenience top-level routes redirecting into the unified app shell */}
              <Route path="/market" element={<Navigate to="/app/market" replace />} />
              <Route path="/suppliers" element={<Navigate to="/app/suppliers" replace />} />
              <Route path="/companies" element={<Navigate to="/app/companies" replace />} />
              <Route path="/factories" element={<Navigate to="/app/companies" replace />} />
              <Route path="/expo" element={<Navigate to="/app/expo" replace />} />
              <Route path="/academy" element={<Navigate to="/app/training" replace />} />
              <Route path="/community" element={<Navigate to="/app/faults" replace />} />
              <Route path="/jobs" element={<Navigate to="/app/jobs" replace />} />
              <Route path="/news" element={<Navigate to="/app/news" replace />} />
              <Route path="/materials" element={<Navigate to="/app/materials" replace />} />
              <Route path="/experts" element={<Navigate to="/app/experts" replace />} />
              <Route path="/ai" element={<Navigate to="/app/ai" replace />} />
              <Route path="/dashboard" element={<Navigate to="/app/home" replace />} />
              <Route path="/admin" element={<Navigate to="/app/admin" replace />} />

              {/* Main Application Routes */}
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<Navigate to="/app/home" replace />} />
                <Route path="home" element={<AppDashboard />} />
                <Route path="dashboard" element={<AppDashboard />} />

                {/* Companies, Factories & Suppliers Directories + Dedicated Profiles */}
                <Route path="companies" element={<CompanyDirectoryPage />} />
                <Route path="factories" element={<CompanyDirectoryPage />} />
                <Route path="factories/:id" element={<FactoryDetailProfilePage />} />
                <Route path="suppliers" element={<SuppliersDirectoryPage />} />
                <Route path="suppliers/:id" element={<SupplierDetailProfilePage />} />

                {/* Manufacturing & Contract Manufacturing (RFQ) + Industrial Services */}
                <Route path="manufacturing" element={<ManufacturingHubPage />} />
                <Route path="services" element={<ManufacturingHubPage />} />
                <Route
                  path="manufacturing/requests"
                  element={<ManufacturingRequestsListPage />}
                />
                <Route
                  path="manufacturing/requests/new"
                  element={<NewManufacturingRequestPage />}
                />
                <Route
                  path="manufacturing/requests/:id"
                  element={<ManufacturingRequestDetailPage />}
                />
                <Route path="manufacturing/providers" element={<FactoryProvidersPage />} />
                <Route
                  path="manufacturing/providers/:id"
                  element={<FactoryProviderDetailPage />}
                />
                <Route path="manufacturing/machines" element={<AvailableMachinesPage />} />
                <Route path="manufacturing/molds" element={<MoldsServicePage />} />
                <Route
                  path="manufacturing/my-requests"
                  element={<MyManufacturingRequestsPage />}
                />
                <Route path="manufacturing/my-offers" element={<MyFactoryOffersPage />} />

                {/* Ecosystem Modules & Sub-Markets */}
                <Route path="faults" element={<FaultsListPage />} />
                <Route path="faults/:id" element={<FaultDetailPage />} />
                <Route path="jobs" element={<JobsListPage />} />
                <Route path="jobs/applications" element={<JobApplicationsPage />} />
                <Route path="jobs/:id" element={<JobDetailPage />} />
                <Route path="market" element={<MarketListPage />} />
                <Route path="market/machinery" element={<MarketListPage />} />
                <Route path="market/raw-materials" element={<MarketListPage />} />
                <Route path="market/molds-spares" element={<MarketListPage />} />
                <Route path="market/:id" element={<MarketDetailPage />} />
                <Route path="expo" element={<ExpoListPage />} />
                <Route path="expo/:id" element={<ExpoDetailPage />} />
                <Route path="news" element={<NewsListPage />} />
                <Route path="news/:id" element={<NewsDetailPage />} />
                <Route path="materials" element={<MaterialsIntelligencePage />} />
                <Route path="experts" element={<IndustrialExpertsPage />} />
                <Route path="ai" element={<PlasticoAiPage />} />

                {/* Visual Search, Academy, Course Player, Unified Search, Messages, Saved */}
                <Route path="visual-search" element={<VisualSearchPage />} />
                <Route path="training" element={<TrainingPage />} />
                <Route path="training/:courseId" element={<CourseDetailPage />} />
                <Route path="academy" element={<TrainingPage />} />
                <Route path="academy/:courseId" element={<CourseDetailPage />} />
                <Route path="search" element={<SearchResultsPage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="saved" element={<SavedItemsPage />} />
                <Route path="favorites" element={<SavedItemsPage />} />

                {/* Profile, Public Member Profiles, Notifications, Settings, Help & Verification, Admin */}
                <Route path="profile" element={<ProfilePage />} />
                <Route path="profile/edit" element={<ProfileEditPage />} />
                <Route path="profile/:targetId" element={<PublicUserProfilePage />} />
                <Route path="users/:targetId" element={<PublicUserProfilePage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="help" element={<HelpSupportPage />} />
                <Route path="admin" element={<AdminDashboardPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/app/home" replace />} />
            </Routes>
          </MandatoryAuthGate>
        </AutostartHandler>
      </BrowserRouter>
    </PlasticoProvider>
  );
}

export default App;
