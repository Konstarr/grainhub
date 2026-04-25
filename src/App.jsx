import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import RequireAuth from './components/auth/RequireAuth.jsx';
import RequireStaff from './components/auth/RequireStaff.jsx';
import Layout from './components/layout/Layout.jsx';
import Home from './pages/Home.jsx';
import Forums from './pages/Forums.jsx';
import ForumCategory from './pages/ForumCategory.jsx';
import ForumThread from './pages/ForumThread.jsx';
import NewThread from './pages/NewThread.jsx';
import Jobs from './pages/Jobs.jsx';
import JobDetail from './pages/JobDetail.jsx';
import Wiki from './pages/Wiki.jsx';
import WikiArticle from './pages/WikiArticle.jsx';
import News from './pages/News.jsx';
import NewsArticle from './pages/NewsArticle.jsx';
import Marketplace from './pages/Marketplace.jsx';
import Listing from './pages/Listing.jsx';
import Suppliers from './pages/Suppliers.jsx';
import SupplierProfile from './pages/SupplierProfile.jsx';
import Signup from './pages/Signup.jsx';
import Login from './pages/Login.jsx';
import Sponsor from './pages/Sponsor.jsx';
import Communities from './pages/Communities.jsx';
import CommunityNew from './pages/CommunityNew.jsx';
import CommunityHome from './pages/CommunityHome.jsx';
import AuthCallback from './pages/AuthCallback.jsx';
import AccountSubscription from './pages/AccountSubscription.jsx';
import Events from './pages/Events.jsx';
import EventDetail from './pages/EventDetail.jsx';
import Profile from './pages/Profile.jsx';
import Messages from './pages/Messages.jsx';
import MessageThread from './pages/MessageThread.jsx';
// Admin pages — lazy-loaded so the TipTap editor (~210KB) and the
// other admin-only widgets stay out of the main bundle for the 99% of
// visitors who never see the admin panel.
const AdminNews             = lazy(() => import('./pages/admin/AdminNews.jsx'));
const AdminNewsEdit         = lazy(() => import('./pages/admin/AdminNewsEdit.jsx'));
const AdminNewsReports      = lazy(() => import('./pages/admin/AdminNewsReports.jsx'));
const AdminOwnerDashboard   = lazy(() => import('./pages/admin/AdminOwnerDashboard.jsx'));
const AdminEvents           = lazy(() => import('./pages/admin/AdminEvents.jsx'));
const AdminEventsEdit       = lazy(() => import('./pages/admin/AdminEventsEdit.jsx'));
const AdminJobs             = lazy(() => import('./pages/admin/AdminJobs.jsx'));
const AdminJobsEdit         = lazy(() => import('./pages/admin/AdminJobsEdit.jsx'));
const AdminUsers            = lazy(() => import('./pages/admin/AdminUsers.jsx'));
const AdminUserEdit         = lazy(() => import('./pages/admin/AdminUserEdit.jsx'));
const AdminSponsors         = lazy(() => import('./pages/admin/AdminSponsors.jsx'));
const AdminConnections      = lazy(() => import('./pages/admin/AdminConnections.jsx'));
const AdminForums           = lazy(() => import('./pages/admin/AdminForums.jsx'));
const AdminForumThreads     = lazy(() => import('./pages/admin/AdminForumThreads.jsx'));
const AdminForumReports     = lazy(() => import('./pages/admin/AdminForumReports.jsx'));
const AdminForumWords       = lazy(() => import('./pages/admin/AdminForumWords.jsx'));
const AdminForumLog         = lazy(() => import('./pages/admin/AdminForumLog.jsx'));
const AdminForumReputation  = lazy(() => import('./pages/admin/AdminForumReputation.jsx'));

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
    Loading admin…
  </div>
);

// Helper: every admin route shares the same Suspense boundary so the
// chunk loads once and re-uses across nav.
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
      <Routes>
        <Route path="/admin"                  element={adminRoute('admin', AdminNews)} />
        <Route path="/admin/dashboard"        element={adminRoute('owner', AdminOwnerDashboard)} />
        <Route path="/admin/news"             element={adminRoute('admin', AdminNews)} />
        <Route path="/admin/news/reports"     element={adminRoute('admin', AdminNewsReports)} />
        <Route path="/admin/news/:id"         element={adminRoute('admin', AdminNewsEdit)} />
        <Route path="/admin/events"           element={adminRoute('admin', AdminEvents)} />
        <Route path="/admin/events/:id"       element={adminRoute('admin', AdminEventsEdit)} />
        <Route path="/admin/jobs"             element={adminRoute('mod',   AdminJobs)} />
        <Route path="/admin/jobs/:id"         element={adminRoute('mod',   AdminJobsEdit)} />
        <Route path="/admin/users"            element={adminRoute('admin', AdminUsers)} />
        <Route path="/admin/users/:id"        element={adminRoute('admin', AdminUserEdit)} />
        <Route path="/admin/sponsors"         element={adminRoute('admin', AdminSponsors)} />
        <Route path="/admin/connections"      element={adminRoute('admin', AdminConnections)} />
        {/* Admin panel routes are admin/owner level only — moderators
            do their work inline on /forums/thread/:slug instead. */}
        <Route path="/admin/forums"           element={adminRoute('admin', AdminForums)} />
        <Route path="/admin/forums/threads"   element={adminRoute('admin', AdminForumThreads)} />
        <Route path="/admin/forums/reports"   element={adminRoute('admin', AdminForumReports)} />
        <Route path="/admin/forums/words"     element={adminRoute('admin', AdminForumWords)} />
        <Route path="/admin/forums/log"       element={adminRoute('admin', AdminForumLog)} />
        <Route path="/admin/forums/reputation" element={adminRoute('admin', AdminForumReputation)} />

        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/forums" element={<Forums />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<RequireAuth><JobDetail /></RequireAuth>} />
          <Route path="/wiki" element={<Wiki />} />
          <Route path="/news" element={<News />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:slug" element={<RequireAuth><EventDetail /></RequireAuth>} />
          <Route path="/communities" element={<Communities />} />
          <Route path="/communities/new" element={<RequireAuth><CommunityNew /></RequireAuth>} />
          <Route path="/c/:slug" element={<CommunityHome />} />
          <Route path="/sponsor" element={<Sponsor />} />
          {/* /pricing folded into /account/subscription. Keep as a
              redirect so old links / bookmarks / search results still
              land in the right place. */}
          <Route path="/pricing" element={<Navigate to="/account/subscription" replace />} />
          <Route path="/account/subscription" element={<AccountSubscription />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/login" element={<Login />} />

          <Route path="/forums/new" element={<RequireAuth><NewThread /></RequireAuth>} />
          <Route path="/forums/category/:id" element={<RequireAuth><ForumCategory /></RequireAuth>} />
          <Route path="/forums/thread/:slug" element={<RequireAuth><ForumThread /></RequireAuth>} />
          <Route path="/forums/thread" element={<RequireAuth><ForumThread /></RequireAuth>} />

          <Route path="/wiki/article/:slug" element={<RequireAuth><WikiArticle /></RequireAuth>} />
          <Route path="/wiki/article" element={<RequireAuth><WikiArticle /></RequireAuth>} />

          <Route path="/news/article/:slug" element={<RequireAuth><NewsArticle /></RequireAuth>} />
          <Route path="/news/article" element={<RequireAuth><NewsArticle /></RequireAuth>} />
          <Route path="/marketplace/listing/:slug" element={<RequireAuth><Listing /></RequireAuth>} />
          <Route path="/marketplace/listing" element={<RequireAuth><Listing /></RequireAuth>} />

          <Route path="/suppliers/profile" element={<RequireAuth><SupplierProfile /></RequireAuth>} />
          <Route path="/profile/:handle" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/messages" element={<RequireAuth><Messages /></RequireAuth>} />
          <Route path="/messages/:id" element={<RequireAuth><MessageThread /></RequireAuth>} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
