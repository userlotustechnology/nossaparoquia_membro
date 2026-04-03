import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from '@/contexts/AuthContext';
import PublicRoute from '@/components/PublicRoute';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';

// Auth pages
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';

// Dashboard
import Dashboard from '@/pages/dashboard/Dashboard';

// Profile
import Profile from '@/pages/profile/Profile';
import Notifications from '@/pages/profile/Notifications';

// Announcements
import Announcements from '@/pages/announcements/Announcements';
import AnnouncementDetail from '@/pages/announcements/AnnouncementDetail';

// Liturgy
import LiturgyToday from '@/pages/liturgy/LiturgyToday';
import LiturgyWeek from '@/pages/liturgy/LiturgyWeek';

// Meditations
import Meditations from '@/pages/meditations/Meditations';
import MeditationDetail from '@/pages/meditations/MeditationDetail';

// Prayers
import Prayers from '@/pages/prayers/Prayers';
import PrayerDetail from '@/pages/prayers/PrayerDetail';
import Favorites from '@/pages/prayers/Favorites';
import Novenas from '@/pages/prayers/Novenas';
import NovenaDetail from '@/pages/prayers/NovenaDetail';
import MyNovenas from '@/pages/prayers/MyNovenas';

// Sacraments
import Masses from '@/pages/sacraments/Masses';
import Confessions from '@/pages/sacraments/Confessions';

// Community
import Community from '@/pages/community/Community';
import MemberProfile from '@/pages/community/MemberProfile';
import Connections from '@/pages/community/Connections';

// Pastorals
import Pastorals from '@/pages/pastorals/Pastorals';
import PastoralDetail from '@/pages/pastorals/PastoralDetail';

// Spiritual Direction
import SpiritualDirection from '@/pages/spiritual-direction/SpiritualDirection';

// Events
import Events from '@/pages/events/Events';
import EventDetail from '@/pages/events/EventDetail';
import MyRegistrations from '@/pages/events/MyRegistrations';

// Campaigns
import Campaigns from '@/pages/campaigns/Campaigns';
import CampaignDetail from '@/pages/campaigns/CampaignDetail';

// Raffles
import Raffles from '@/pages/raffles/Raffles';
import RaffleDetail from '@/pages/raffles/RaffleDetail';

// Courses
import Courses from '@/pages/courses/Courses';
import CourseDetail from '@/pages/courses/CourseDetail';
import MyEnrollments from '@/pages/courses/MyEnrollments';
import EnrollmentDetail from '@/pages/courses/EnrollmentDetail';
import Certificates from '@/pages/courses/Certificates';

// Tithes
import Tithes from '@/pages/tithes/Tithes';

// Gamification
import Gamification from '@/pages/gamification/Gamification';
import Leaderboard from '@/pages/gamification/Leaderboard';
import Prizes from '@/pages/gamification/Prizes';
import PointsHistory from '@/pages/gamification/PointsHistory';

// Messages
import Messages from '@/pages/messages/Messages';
import Conversation from '@/pages/messages/Conversation';

// Documents
import DocumentRequest from '@/pages/documents/DocumentRequest';
import MyDocumentRequests from '@/pages/documents/MyDocumentRequests';

// Roster
import MyRoster from '@/pages/roster/MyRoster';

// Catechism
import CatechismEnrollments from '@/pages/catechism/CatechismEnrollments';

// Videos
import Videos from '@/pages/videos/Videos';
import PlaylistDetail from '@/pages/videos/PlaylistDetail';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function App() {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Register />} />
              <Route path="/esqueci-senha" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/perfil" element={<Profile />} />
                <Route path="/notificacoes" element={<Notifications />} />

                {/* Announcements */}
                <Route path="/avisos" element={<Announcements />} />
                <Route path="/avisos/:id" element={<AnnouncementDetail />} />

                {/* Liturgy */}
                <Route path="/liturgia" element={<LiturgyToday />} />
                <Route path="/liturgia/semana" element={<LiturgyWeek />} />

                {/* Meditations */}
                <Route path="/meditacoes" element={<Meditations />} />
                <Route path="/meditacoes/:id" element={<MeditationDetail />} />

                {/* Prayers */}
                <Route path="/oracoes" element={<Prayers />} />
                <Route path="/oracoes/favoritas" element={<Favorites />} />
                <Route path="/oracoes/:id" element={<PrayerDetail />} />

                {/* Novenas */}
                <Route path="/novenas" element={<Novenas />} />
                <Route path="/novenas/:id" element={<NovenaDetail />} />
                <Route path="/minhas-novenas" element={<MyNovenas />} />

                {/* Sacraments */}
                <Route path="/missas" element={<Masses />} />
                <Route path="/confissoes" element={<Confessions />} />

                {/* Community */}
                <Route path="/comunidade" element={<Community />} />
                <Route path="/comunidade/:id" element={<MemberProfile />} />
                <Route path="/conexoes" element={<Connections />} />

                {/* Pastorals */}
                <Route path="/pastorais" element={<Pastorals />} />
                <Route path="/pastorais/:id" element={<PastoralDetail />} />

                {/* Spiritual Direction */}
                <Route path="/direcao-espiritual" element={<SpiritualDirection />} />

                {/* Events */}
                <Route path="/eventos" element={<Events />} />
                <Route path="/eventos/:id" element={<EventDetail />} />
                <Route path="/minhas-inscricoes" element={<MyRegistrations />} />

                {/* Campaigns */}
                <Route path="/campanhas" element={<Campaigns />} />
                <Route path="/campanhas/:id" element={<CampaignDetail />} />

                {/* Raffles */}
                <Route path="/sorteios" element={<Raffles />} />
                <Route path="/sorteios/:id" element={<RaffleDetail />} />

                {/* Courses */}
                <Route path="/cursos" element={<Courses />} />
                <Route path="/cursos/:slug" element={<CourseDetail />} />
                <Route path="/meus-cursos" element={<MyEnrollments />} />
                <Route path="/meus-cursos/:id" element={<EnrollmentDetail />} />
                <Route path="/certificados" element={<Certificates />} />

                {/* Tithes */}
                <Route path="/dizimos" element={<Tithes />} />

                {/* Gamification */}
                <Route path="/gamificacao" element={<Gamification />} />
                <Route path="/gamificacao/ranking" element={<Leaderboard />} />
                <Route path="/gamificacao/premios" element={<Prizes />} />
                <Route path="/gamificacao/historico" element={<PointsHistory />} />

                {/* Messages */}
                <Route path="/mensagens" element={<Messages />} />
                <Route path="/mensagens/:id" element={<Conversation />} />

                {/* Documents */}
                <Route path="/documentos" element={<DocumentRequest />} />
                <Route path="/meus-documentos" element={<MyDocumentRequests />} />

                {/* Roster */}
                <Route path="/escalas" element={<MyRoster />} />

                {/* Catechism */}
                <Route path="/catequese" element={<CatechismEnrollments />} />

                {/* Videos */}
                <Route path="/videos" element={<Videos />} />
                <Route path="/videos/:id" element={<PlaylistDetail />} />
              </Route>
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Analytics />
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}
