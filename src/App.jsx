import { Routes, Route } from 'react-router-dom';
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
import Pricing from './pages/Pricing.jsx';
import Events from './pages/Events.jsx';
import EventDetail from './pages/EventDetail.jsx';
import Profile from './pages/Profile.jsx';
import Messages from './pages/Messages.jsx';
import MessageThread from './pages/MessageThread.jsx';
import AdminNews from './pages/admin/AdminNews.jsx';
import AdminNewsEdit from './pages/admin/AdminNewsEdit.jsx';
import AdminNewsReports from './pages/admin/AdminNewsReports.jsx';
import AdminEvents from './pages/admin/AdminEvents.jsx';
import AdminEventsEdit from './pages/admin/AdminEventsEdit.jsx';
import AdminJobs from './pages/admin/AdminJobs.jsx';
import AdminJobsEdit from './pages/admin/AdminJobsEdit.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminUserEdit from './pages/admin/AdminUserEdit.jsx';
import AdminSponsors from './pages/admin/AdminSponsors.jsx';
import AdminConnections from './pages/admin/AdminConnections.jsx';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/admin" element={<RequireStaff level="admin"><AdminNews /></RequireStaff>} />
        <Route path="/admin/news" element={<RequireStaff level="admin"><AdminNews /></RequireStaff>} />
        <Route path="/admin/news/reports" element={<RequireStaff level="admin"><AdminNewsReports /></RequireStaff>} />
        <Route path="/admin/news/:id" element={<RequireStaff level="admin"><AdminNewsEdit /></RequireStaff>} />
        <Route path="/admin/events" element={<RequireStaff level="admin"><AdminEvents /></RequireStaff>} />
        <Route path="/admin/events/:id" element={<RequireStaff level="admin"><AdminEventsEdit /></RequireStaff>} />
        <Route path="/admin/jobs" element={<RequireStaff level="mod"><AdminJobs /></RequireStaff>} />
        <Route path="/admin/jobs/:id" element={<RequireStaff level="mod"><AdminJobsEdit /></RequireStaff>} />
        <Route path="/admin/users" element={<RequireStaff level="admin"><AdminUsers /></RequireStaff>} />
        <Route path="/admin/users/:id" element={<RequireStaff level="admin"><AdminUserEdit /></RequireStaff>} />
        <Route path="/admin/sponsors" element={<RequireStaff level="admin"><AdminSponsors /></RequireStaff>} />
        <Route path="/admin/connections" element={<RequireStaff level="admin"><AdminConnections /></RequireStaff>} />

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
          <Route path="/sponsor" element={<Sponsor />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/signup" element={<Signup />} />
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
