import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import Home from './pages/Home.jsx';
import Forums from './pages/Forums.jsx';
import ForumThread from './pages/ForumThread.jsx';
import Jobs from './pages/Jobs.jsx';
import Wiki from './pages/Wiki.jsx';
import WikiArticle from './pages/WikiArticle.jsx';
import News from './pages/News.jsx';
import NewsArticle from './pages/NewsArticle.jsx';
import Marketplace from './pages/Marketplace.jsx';
import Listing from './pages/Listing.jsx';
import Suppliers from './pages/Suppliers.jsx';
import SupplierProfile from './pages/SupplierProfile.jsx';
import Signup from './pages/Signup.jsx';
import Sponsor from './pages/Sponsor.jsx';
import Events from './pages/Events.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/forums" element={<Forums />} />
        <Route path="/forums/thread" element={<ForumThread />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/wiki" element={<Wiki />} />
        <Route path="/wiki/article" element={<WikiArticle />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/article" element={<NewsArticle />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/marketplace/listing" element={<Listing />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/suppliers/profile" element={<SupplierProfile />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/sponsor" element={<Sponsor />} />
        <Route path="/events" element={<Events />} />
      </Route>
    </Routes>
  );
}
