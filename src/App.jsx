import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
// Lazy-load Vercel telemetry so it never competes with the user's
// first interactions for main-thread time.
const Analytics     = lazy(() => import('@vercel/analytics/react').then((m) => ({ default: m.Analytics })));
const SpeedInsights = lazy(() => import('@vercel/speed-insights/react').then((m) => ({ default: m.SpeedInsights })));

/**
 * Map the live pathname to a stable Vercel "route" template so every
 * /jobs/<id>, /suppliers/<slug>, etc. groups under one bucket instead
 * of polluting the dashboard with one row per UUID.
 *
 * The patterns are simple — full path → template. Anything that doesn't
 * match falls through to the raw pathname so we still see the page.
 */
function templateFor(pathname) {
  if (!pathname) return '/';
  // Exact static routes first.
  const exact = new Set([
    '/', '/forums', '/news',
    '/suppliers', '/events', '/membership', '/board', '/education', '/signup', '/login',
    '/contact', '/inbox', '/messages',
    '/terms', '/privacy', '/community-rules',
  ]);
  if (exact.has(pathname)) return pathname;

  // Common dynamic patterns.
  if (pathname.startsWith('/forum/thread/'))      return '/forum/thread/:slug';
  if (pathname.startsWith('/forum/category/'))    return '/forum/category/:slug';
  if (pathname.startsWith('/forum/topic/'))       return '/forum/topic/:slug';
  if (pathname.startsWith('/profile/'))           return '/profile/:handle';
  if (pathname.startsWith('/suppliers/'))         return '/suppliers/:slug';
  if (pathname.startsWith('/news/'))              return '/news/:slug';
  if (pathname.startsWith('/events/'))            return '/events/:slug';
  if (pathname.startsWith('/messages/'))          return '/messages/:id';
  if (pathname.startsWith('/admin/'))             return '/admin/*';

  return pathname;
}

function VercelTelemetry() {
  const { pathname } = useLocation();
  const route = templateFor(pathname);
  return (
    <Suspense fallback={null}>
      <Analytics />
      <SpeedInsights route={route} />
    </Suspense>
  );
}
import RequireAuth from './components/auth/RequireAuth.jsx';
import RequireStaff from './components/auth/RequireStaff.jsx';
import Layout from './components/layout/Layout.jsx';
import Home from './pages/Home.jsx';
import Forums from './pages/Forums.jsx';
import ForumCategory from './pages/ForumCategory.jsx';
import ForumThread from './pages/ForumThread.jsx';
import NewThread from './pages/NewThread.jsx';
import ForumRules from './pages/ForumRules.jsx';
import ForumSearch from './pages/ForumSearch.jsx';
import ForumTopic from './pages/ForumTopic.jsx';
import News from './pages/News.jsx';
import NewsArticle from './pages/NewsArticle.jsx';
import Suppliers from './pages/Suppliers.jsx';
import SupplierProfile from './pages/SupplierProfile.jsx';
import Signup from './pages/Signup.jsx';
import Login from './pages/Login.jsx';
import AuthCallback from './pages/AuthCallback.jsx';
import Membership from './pages/Membership.jsx';
import Board from './pages/Board.jsx';
import Education from './pages/Education.jsx';
import Events from './pages/Events.jsx';
import EventDetail from './pages/EventDetail.jsx';
import Profile from './pages/Profile.jsx';
import Messages from './pages/Messages.jsx';
import MessageThread from './pages/MessageThread.jsx';
import Terms from './pages/Terms.jsx';
import Privacy from './pages/Privacy.jsx';
import CommunityRules from './pages/CommunityRules.jsx';

const AdminNews             = lazy(() => import('./pages/admin/AdminNews.jsx'));
const AdminNewsEdit         = lazy(() => import('./pages/admin/AdminNewsEdit.jsx'));
const AdminWiki             = lazy(() => import('./pages/admin/AdminWiki.jsx'));
const AdminWikiEdit         = lazy(() => import('./pages/admin/AdminWikiEdit.jsx'));
const AdminNewsReports      = lazy(() => import('./pages/admin/AdminNewsReports.jsx'));
const AdminOwnerDashboard   = lazy(() => import('./pages/admin/AdminOwnerDashboard.jsx'));
const AdminEvents           = lazy(() => import('./pages/admin/AdminEvents.jsx'));
const AdminEventsEdit       = lazy(() => import('./pages/admin/AdminEventsEdit.jsx'));
const AdminUsers            = lazy(() => import('./pages/admin/AdminUsers.jsx'));
const AdminUserEdit         = lazy(() => import('./pages/admin/AdminUserEdit.jsx'));
const AdminSponsors         = lazy(() => import('./pages/admin/AdminSponsors.jsx'));
const AdminSupplierClaims   = lazy(() => import('./pages/admin/AdminSupplierClaims.jsx'));
const AdminSuppliers        = lazy(() => import('./pages/admin/AdminSuppliers.jsx'));
const AdminSupplierEdit     = lazy(() => import('./pages/admin/AdminSupplierEdit.jsx'));
const AdminConnections      = lazy(() => import('./pages/admin/AdminConnections.jsx'));
const AdminForums           = lazy(() => import('./pages/admin/AdminForums.jsx'));
const AdminForumThreads     = lazy(() => import('./pages/admin/AdminForumThreads.jsx'));
const AdminForumReports     = lazy(() => import('./pages/admin/AdminForumReports.jsx'));
const AdminForumWords       = lazy(() => import('./pages/admin/AdminForumWords.jsx'));
const AdminForumLog         = lazy(() => import('./pages/admin/AdminForumLog.jsx'));
const AdminForumReputation  = lazy(() => import('./pages/admin/AdminForumReputation.jsx'));
const AdminForumBadges      = lazy(() => import('./pages/admin/AdminForumBadges.jsx'));

const AdminFallback = (
  <div style={{
    minHeight: '60vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
    fontFamily: 'Montserrat, sans-serif',
    fontSize: 14,
  }}>
    Loading admin...
  </div>
);

const adminRoute = (level, Component) => (
  <RequireStaff level={level}>
    <Suspense fallback={AdminFallback}>
      <Component />
    </Suspense>
  </RequireStaff>
);

export default function App() {
  return (
    <AuthProvider>
      <VercelTelemetry />
      <Routes>
        <Route path="/admin"                  element={adminRoute('admin', AdminNews)} />
        <Route path="/admin/dashboard"        element={adminRoute('owner', AdminOwnerDashboard)} />
        <Route path="/admin/news"             element={adminRoute('admin', AdminNews)} />
        <Route path="/admin/news/reports"     element={adminRoute('admin', AdminNewsReports)} />
        <Route path="/admin/news/:id"         element={adminRoute('admin', AdminNewsEdit)} />
        <Route path="/admin/wiki"             element={adminRoute('admin', AdminWiki)} />
        <Route path="/admin/wiki/:id"         element={adminRoute('admin', AdminWikiEdit)} />
        <Route path="/admin/events"           element={adminRoute('admin', AdminEvents)} />
        <Route path="/admin/events/:id"       element={adminRoute('admin', AdminEventsEdit)} />
        <Route path="/admin/users"            element={adminRoute('admin', AdminUsers)} />
        <Route path="/admin/users/:id"        element={adminRoute('admin', AdminUserEdit)} />
        <Route path="/admin/sponsors"         element={adminRoute('admin', AdminSponsors)} />
        <Route path="/admin/supplier-claims"  element={adminRoute('admin', AdminSupplierClaims)} />
        <Route path="/admin/suppliers"        element={adminRoute('admin', AdminSuppliers)} />
        <Route path="/admin/suppliers/new"    element={adminRoute('admin', AdminSupplierEdit)} />
        <Route path="/admin/suppliers/:id"    element={adminRoute('admin', AdminSupplierEdit)} />
        <Route path="/admin/connections"      element={adminRoute('admin', AdminConnections)} />
        <Route path="/admin/forums"           element={adminRoute('admin', AdminForums)} />
        <Route path="/admin/forums/threads"   element={adminRoute('admin', AdminForumThreads)} />
        <Route path="/admin/forums/reports"   element={adminRoute('admin', AdminForumReports)} />
        <Route path="/admin/forums/words"     element={adminRoute('admin', AdminForumWords)} />
        <Route path="/admin/forums/log"       element={adminRoute('admin', AdminForumLog)} />
        <Route path="/admin/forums/reputation" element={adminRoute('admin', AdminForumReputation)} />
        <Route path="/admin/forums/badges"    element={adminRoute('admin', AdminForumBadges)} />

        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/forums" element={<Forums />} />
          <Route path="/wiki/*" element={<Navigate to="/" replace />} />
          <Route path="/news" element={<News />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:slug" element={<RequireAuth><EventDetail /></RequireAuth>} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/board" element={<Board />} />
          <Route path="/education" element={<Education />} />
          <Route path="/account/subscription" element={<Navigate to="/membership" replace />} />
          <Route path="/pricing" element={<Navigate to="/membership" replace />} />
          {/* Decommissioned in the AWI Florida rebrand. Redirects keep old links working. */}
          <Route path="/jobs/*" element={<Navigate to="/forums" replace />} />
          <Route path="/marketplace/*" element={<Navigate to="/suppliers" replace />} />
          <Route path="/communities/*" element={<Navigate to="/forums" replace />} />
          <Route path="/c/:slug" element={<Navigate to="/forums" replace />} />
          <Route path="/sponsor" element={<Navigate to="/membership" replace />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/login" element={<Login />} />

          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/community-rules" element={<CommunityRules />} />
          <Route path="/rules" element={<Navigate to="/community-rules" replace />} />

          <Route path="/forums/new" element={<RequireAuth><NewThread /></RequireAuth>} />
          <Route path="/forums/rules" element={<ForumRules />} />
          <Route path="/forums/search" element={<ForumSearch />} />
          <Route path="/forums/category/:id" element={<RequireAuth><ForumCategory /></RequireAuth>} />
          <Route path="/forums/category/:categoryId/:topicSlug" element={<RequireAuth><ForumTopic /></RequireAuth>} />
          <Route path="/forums/thread/:slug" element={<RequireAuth><ForumThread /></RequireAuth>} />
          <Route path="/forums/thread" element={<RequireAuth><ForumThread /></RequireAuth>} />

          
          <Route path="/news/article/:slug" element={<RequireAuth><NewsArticle /></RequireAuth>} />
          <Route path="/news/article" element={<RequireAuth><NewsArticle /></RequireAuth>} />

          <Route path="/suppliers/profile" element={<RequireAuth><SupplierProfile /></RequireAuth>} />
          <Route path="/suppliers/:slug"   element={<RequireAuth><SupplierProfile /></RequireAuth>} />
          <Route path="/profile/:handle" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/messages" element={<RequireAuth><Messages /></RequireAuth>} />
          <Route path="/messages/:id" element={<RequireAuth><MessageThread /></RequireAuth>} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}