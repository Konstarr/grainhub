import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/forumThread.css';
import PageBack from '../components/shared/PageBack.jsx';
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
import { supabase } from '../lib/supabase.js';
import { mapThreadRow } from '../lib/mappers.js';
import { FORUM_GROUPS } from '../data/forumsData.js';
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

function findCategoryMeta(id) {
  for (const g of FORUM_GROUPS) {
    const cat = g.categories.find((c) => c.id === id);
    if (cat) return { category: cat, group: g };
  }
  return { category: null, group: null };
}

export default function ForumThread() {
  const { slug } = useParams();
  const [scrollToReply, setScrollToReply] = useState(false);
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(Boolean(slug));

  useEffect(() => {
    if (!slug) { setThread(null); setLoading(false); return; }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('forum_threads')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) setThread(null);
      else setThread(mapThreadRow(data));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [slug]);

  const { category, group } = findCategoryMeta(thread?.categoryId);
  const headerData = thread
    ? {
        ...THREAD_HEADER,
        title: thread.title,
        isPinned: thread.isPinned,
        isSolved: thread.isSolved,
        isLocked: thread.isLocked,
        viewCount: thread.viewCount,
        replyCount: thread.replyCount,
      }
    : THREAD_HEADER;

  const crumbs = [
    { label: 'Home', to: '/' },
    { label: 'Forums', to: '/forums' },
  ];
  if (category && group) {
    crumbs.push({ label: group.name });
    crumbs.push({ label: category.name, to: `/forums/category/${category.id}` });
  }
  crumbs.push({ label: thread?.title || headerData.title });

  const backTo = category ? `/forums/category/${category.id}` : '/forums';
  const backLabel = category ? `Back to ${category.name}` : 'Back to Forums';

  return (
    <>
      <PageBack
        backTo={backTo}
        backLabel={backLabel}
        crumbs={crumbs}
      />
      <div className="ft-wrap">
        <div>
          {loading && (
            <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading thread…</div>
          )}
          {!loading && slug && !thread && (
            <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>
              Thread not found.
            </div>
          )}
          {(!slug || thread) && (
            <>
              <ThreadHeader data={headerData} onReply={() => setScrollToReply(true)} />
              <SortBar data={SORT_SECTION} />

              <div className="posts">
                {POSTS.map((post) => (
                  <Post key={post.id} post={post} />
                ))}
              </div>

              <Pagination data={PAGINATION} />

              <ReplyBox data={REPLY_BOX} />
            </>
          )}
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
