import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/forumThread.css';
import ThreadHeader from '../components/forumThread/ThreadHeader.jsx';
import SortBar from '../components/forumThread/SortBar.jsx';
import Post from '../components/forumThread/Post.jsx';
import Pagination from '../components/forumThread/Pagination.jsx';
import ReplyBox from '../components/forumThread/ReplyBox.jsx';
import ThreadParticipants from '../components/forumThread/ThreadParticipants.jsx';
import SponsorSidebar from '../components/forumThread/SponsorSidebar.jsx';
import RelatedThreads from '../components/forumThread/RelatedThreads.jsx';
import WikiLinks from '../components/forumThread/WikiLinks.jsx';
import ThreadTools from '../components/forumThread/ThreadTools.jsx';
import {
  THREAD_HEADER,
  SORT_SECTION,
  POSTS,
  PAGINATION,
  REPLY_BOX,
  THREAD_PARTICIPANTS,
  SPONSOR_SIDEBAR,
  RELATED_THREADS,
  WIKI_LINKS,
  THREAD_TOOLS,
} from '../data/forumThreadData.js';

export default function ForumThread() {
  const [scrollToReply, setScrollToReply] = useState(false);

  return (
    <>
      <div className="breadcrumb-bar">
        <Link to="/forums">Forums</Link>
        <span className="bc-sep">›</span>
        <span>{THREAD_HEADER.title}</span>
      </div>
      <div className="page-wrap">
        <div>
          <ThreadHeader data={THREAD_HEADER} onReply={() => setScrollToReply(true)} />
          <SortBar data={SORT_SECTION} />

          <div className="posts">
            {POSTS.map((post) => (
              <Post key={post.id} post={post} />
            ))}
          </div>

          <Pagination data={PAGINATION} />

          <ReplyBox data={REPLY_BOX} />
        </div>

        <aside className="sidebar">
          <ThreadParticipants
            participants={THREAD_PARTICIPANTS}
            moreCount={22}
          />
          <SponsorSidebar data={SPONSOR_SIDEBAR} />
          <RelatedThreads threads={RELATED_THREADS} />
          <WikiLinks links={WIKI_LINKS} />
          <ThreadTools tools={THREAD_TOOLS} />
        </aside>
      </div>
    </>
  );
}
