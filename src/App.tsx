import React, { useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useSearchParams,
  useNavigate,
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
  OnboardingRolePage,
  OnboardingSetupPage,
} from './pages/PublicInfoPages';
import { AppDashboard } from './pages/AppDashboard';
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

const AutostartHandler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get('autostart') === '1') {
      navigate('/app/home', { replace: true });
    }
  }, [searchParams, navigate]);

  return <>{children}</>;
};

export function App() {
  return (
    <PlasticoProvider>
      <BrowserRouter>
        <AutostartHandler>
          <Routes>
            {/* Splash Screen (Screen 01) when visiting /?welcome=1 or /splash */}
            <Route path="/splash" element={<PublicHomepage />} />

            {/* Public & Onboarding Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<PublicHomepage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/register" element={<RegisterPage />} />
              <Route path="/onboarding/type" element={<OnboardingRolePage />} />
              <Route path="/onboarding/setup" element={<OnboardingSetupPage />} />
            </Route>

            {/* Main Application Routes */}
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Navigate to="/app/home" replace />} />
              <Route path="home" element={<AppDashboard />} />

              {/* Manufacturing & Contract Manufacturing (RFQ) */}
              <Route path="manufacturing" element={<ManufacturingHubPage />} />
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

              {/* Supporting Modules */}
              <Route path="faults" element={<FaultsListPage />} />
              <Route path="faults/:id" element={<FaultDetailPage />} />
              <Route path="jobs" element={<JobsListPage />} />
              <Route path="jobs/:id" element={<JobDetailPage />} />
              <Route path="market" element={<MarketListPage />} />
              <Route path="market/:id" element={<MarketDetailPage />} />
              <Route path="expo" element={<ExpoListPage />} />
              <Route path="expo/:id" element={<ExpoDetailPage />} />
              <Route path="news" element={<NewsListPage />} />
              <Route path="news/:id" element={<NewsDetailPage />} />

              {/* Visual Search, Training, Messages, Saved Items */}
              <Route path="visual-search" element={<VisualSearchPage />} />
              <Route path="training" element={<TrainingPage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="saved" element={<SavedItemsPage />} />

              {/* Profile, Notifications, Settings */}
              <Route path="profile" element={<ProfilePage />} />
              <Route path="profile/edit" element={<ProfileEditPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/app/home" replace />} />
          </Routes>
        </AutostartHandler>
      </BrowserRouter>
    </PlasticoProvider>
  );
}

export default App;
