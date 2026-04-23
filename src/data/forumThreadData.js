/**
 * Content for the Forum Thread page (/forums/thread).
 * A single discussion thread with OP, replies, and sidebar content.
 */

export const THREAD_HEADER = {
  tags: [
    { label: 'Cabinet Making', variant: 'tag-cat' },
    { label: '🔥 Hot', variant: 'tag-hot' },
    { label: '✓ Answered', variant: 'tag-solved' },
  ],
  title: 'Best approach for full-overlay frameless on an out-of-square opening? Photos inside',
  meta: [
    { icon: '👤', text: 'TomKowalski' },
    { icon: '🕐', text: 'Posted 2 hours ago' },
    { icon: '💬', text: '48 replies' },
    { icon: '👁', text: '621 views' },
    { icon: '⬆', text: '34 upvotes' },
  ],
};

export const THREAD_ACTIONS = [
  { icon: '🔔', label: 'Subscribe', class: '' },
  { icon: '🔖', label: 'Save Thread', class: '' },
  { icon: '↗', label: 'Share', class: '' },
  { icon: '⊕', label: 'Follow User', class: '' },
];

export const SORT_SECTION = {
  totalReplies: 48,
  currentPage: 1,
  totalPages: 4,
  options: [
    { label: 'Oldest first', active: true },
    { label: 'Newest first', active: false },
    { label: 'Top rated', active: false },
  ],
};

export const POSTS = [
  {
    id: 1,
    number: 1,
    type: 'op', // op | normal | best
    author: {
      initials: 'TK',
      name: 'TomKowalski',
      title: 'Custom Cabinet Maker',
      rep: '⭐ 1,842 pts',
      badges: [
        { emoji: '🏭', title: 'Verified Shop Owner' },
        { emoji: '🥇', title: 'Top Contributor' },
      ],
      postCount: '2,316 posts',
      avatarClass: 'av-a',
    },
    timestamp: 'Today at 9:14 AM',
    votes: 34,
    voted: true,
    body: `<p>Working on a kitchen remodel in a 1940s craftsman home — classic old-house problem where nothing is square. The opening I'm dealing with is out of plumb by about <strong>5/8" over 88"</strong> of height, and racked left-to-right by roughly <strong>3/8" across 126"</strong> of width. Client wants full-overlay frameless Euro boxes throughout.</p>
<p>I've done plenty of face-frame jobs where I just scribe the stiles, but frameless is a different story. I have a few questions for folks who've dealt with this:</p>
<p><strong>1.</strong> Are you scribing filler strips at the wall, shimming the box run, or both?<br>
<strong>2.</strong> Do you level and plumb every box individually or establish a run datum and shim off that?<br>
<strong>3.</strong> How are you handling door reveals when the opening itself isn't level — adjust hinges, or account for it in the layout?</p>
<p>Happy to share more dimensions. Trying to nail down my sequence of operations before I get on-site next week. Any experience with this scenario appreciated.</p>`,
    image: {
      emoji: '📐',
      title: 'Site_survey_drawings.pdf',
      desc: 'Annotated floor plan and elevation with all measurements',
      size: '2.4 MB',
      action: 'Click to download',
    },
  },
  {
    id: 2,
    number: 2,
    type: 'normal',
    author: {
      initials: 'DL',
      name: 'DianeLachapelle',
      title: 'Architectural Millwork',
      rep: '⭐ 4,210 pts',
      badges: [{ emoji: '🎖', title: 'Expert Member' }],
      postCount: '5,041 posts',
      avatarClass: 'av-b',
    },
    timestamp: 'Today at 9:31 AM',
    votes: 12,
    voted: false,
    body: `<p>5/8" over 88" is well within what I'd call normal for old craftsman construction — I've dealt with significantly worse. Here's my approach for frameless runs in non-square openings:</p>
<p>Set a <strong>laser level</strong> across the full run at install height. Shim the first box to that datum, plumb it independently, then work off it laterally for the rest of the run. Never try to follow the wall — your eye will catch a tilted door reveal long before it catches a 1/16" gap at the wall. So always sacrifice the wall gap to maintain level reveals.</p>
<p>For the reveals specifically: once boxes are in and clamped, I adjust hinge overlay rather than trying to rack the doors individually. Most clip hinges give you ±2mm side-to-side adjustment. If the reveal discrepancy is more than that, you likely have a shimming or box-plumb issue, not a hinge issue. Mill a tapered filler on the scribe side as your final step.</p>`,
  },
  {
    id: 3,
    number: 3,
    type: 'best',
    author: {
      initials: 'MB',
      name: 'MikeBrosnan',
      title: 'Shop Owner · 28 yrs',
      rep: '⭐ 9,870 pts',
      badges: [
        { emoji: '🏆' },
        { emoji: '🎖' },
      ],
      postCount: '11,204 posts',
      avatarClass: 'av-c',
    },
    timestamp: 'Today at 9:47 AM',
    votes: 29,
    voted: true,
    bestAnswer: true,
    body: `<p>Diane's advice is solid. Let me add a full sequencing framework that's worked for us on dozens of old-house jobs over the years.</p>

<p><strong>Step 1 — Survey before you build.</strong> Before you cut a single panel, go back on-site and measure the opening in at least 6 spots vertically and 4 horizontally. Map the actual wall plane on paper. You want to know the worst-case deviation, not the average.</p>

<p><strong>Step 2 — Set your reference line, not the wall.</strong> Snap a chalk line on the floor for your cabinet face plane. Everything is measured from this. If you have a soffit, drop a plumb bob from it and note any discrepancy with the floor line.</p>

<p><strong>Step 3 — Build in scribes.</strong> On frameless, I add a minimum <code>3"</code> scribe stile to all wall-side boxes. Mill these fat on purpose — you can always remove material, never add. Rip the final scribe angle on-site with a track saw after the run is plumbed and clamped.</p>

<p><strong>Step 4 — Door reveals.</strong> On a racked run, I target my door reveal at the visual midpoint of the column stack, then allow the top and bottom to deviate ±1/16". If the deviation is larger than that, you have a box plumb problem, not a hinge problem. Fix it at the box before you hang a single door.</p>

<div class="post-callout">
  <div class="callout-label">Key insight</div>
  For 5/8" out of plumb over 88" — that's less than 0.4°. You're well within Blum's hinge side-adjustment range if your boxes are properly plumbed. The risk isn't the deviation size, it's trying to correct it at the door level instead of the box level.
</div>

<p>Follow this sequence and you'll be fine. The floor plan attachment you uploaded shows a pretty typical layout for this era of construction — the wall irregularity is at the right-side return, which is exactly where your scribe allowance will earn its keep.</p>`,
  },
  {
    id: 4,
    number: 4,
    type: 'normal',
    author: {
      initials: 'SR',
      name: 'SaraRomero',
      title: 'CNC Specialist',
      rep: '⭐ 2,140 pts',
      badges: [{ emoji: '🔧' }],
      postCount: '987 posts',
      avatarClass: 'av-d',
    },
    timestamp: 'Today at 10:12 AM',
    votes: 8,
    voted: false,
    quote: {
      author: 'MikeBrosnan',
      text: '"For 5/8" over 88" — that\'s less than 0.4°. You\'re well within Blum\'s hinge side-adjustment range if your boxes are properly plumbed."',
    },
    body: `<p>Seconding all of this. One tool I'd add to the kit — if you have a <strong>digital level with a data port</strong> (Stabila 196-2, Bosch DNM 60L, similar), log every shim point as you set each box. Takes 20 extra seconds per box and gives you a complete QC record if the client ever questions alignment later. Has saved me in a few warranty conversations.</p>
<p>Also worth checking before you assume it's a wall problem: are the floor and ceiling actually parallel to each other? In craftsman homes I've found ceiling slope is often the root cause of perceived wall lean. If your ceiling drops 1/4" over 10' and you're running uppers to the ceiling, that's where your reveal issue is really coming from.</p>`,
  },
  {
    id: 5,
    number: 5,
    type: 'normal',
    author: {
      initials: 'JP',
      name: 'JakeParsons',
      title: 'Millwork Estimator',
      rep: '⭐ 980 pts',
      badges: [{ emoji: '📋' }],
      postCount: '412 posts',
      avatarClass: 'av-e',
    },
    timestamp: 'Today at 10:44 AM',
    votes: 5,
    voted: false,
    body: `<p>One practical add from the estimating side: if you're billing T&M or have an allowance for on-site fitting, document the deviation measurements in your pre-install walkthrough and attach them to the work order. I've been on jobs where the GC disputed the scribe time because "the opening looked fine." Having the laser measurement printout changes that conversation immediately.</p>
<p>Also — for the survey photo attachment, are those measurements taken at the floor or mid-height? I've seen installs go sideways because the bottom of the wall was square but bowed in the middle, which doesn't show up in floor and ceiling measurements alone.</p>`,
  },
];

export const PAGINATION = {
  currentPage: 1,
  totalPages: 4,
  totalReplies: 48,
  pages: [1, 2, 3, 4],
  showNextArrow: true,
};

export const REPLY_BOX = {
  header: 'Post a Reply',
  placeholder: 'Share your experience or advice... Be specific — the best answers include measurements, product names, and step-by-step details. Use the quote button above to reference a previous post.',
  toolButtons: [
    { icon: 'B', title: 'Bold', htmlTag: 'strong' },
    { icon: 'I', title: 'Italic', htmlTag: 'em' },
    { icon: 'U', title: 'Underline', htmlTag: 'u' },
    { icon: '{ }', title: 'Inline Code', htmlTag: 'code', isSeparator: false },
    { icon: '❝', title: 'Block Quote' },
    { icon: '①', title: 'Ordered List' },
    { icon: '•', title: 'Unordered List' },
    { icon: '🖼', title: 'Insert Image', isSeparator: true },
    { icon: '📎', title: 'Attach File' },
    { icon: '🔗', title: 'Insert Link' },
    { icon: '@', title: 'Mention User' },
  ],
  footerLeft: 'Markdown supported · Max 3 attachments · 10 MB each · Reply will notify the OP',
};

export const THREAD_PARTICIPANTS = [
  {
    initials: 'TK',
    name: 'TomKowalski',
    postCount: '12 posts in thread',
    isOP: true,
    avatarClass: 'av-a',
  },
  {
    initials: 'MB',
    name: 'MikeBrosnan',
    postCount: '8 posts',
    isBestAnswer: true,
    avatarClass: 'av-c',
  },
  {
    initials: 'DL',
    name: 'DianeLachapelle',
    postCount: '5 posts in thread',
    avatarClass: 'av-b',
  },
  {
    initials: 'SR',
    name: 'SaraRomero',
    postCount: '3 posts in thread',
    avatarClass: 'av-d',
  },
  {
    initials: 'JP',
    name: 'JakeParsons',
    postCount: '2 posts in thread',
    avatarClass: 'av-e',
  },
];

export const SPONSOR_SIDEBAR = {
  label: 'Sponsored · Cabinet Making',
  title: 'Blum CLIP top BLUMOTION',
  subtitle: 'Soft-close concealed hinge with ±2mm side adjustment and 9 opening angles — engineered for frameless cabinets in imperfect installations.',
  ctaText: 'Download Spec Sheet & Catalog →',
};

export const RELATED_THREADS = [
  {
    title: 'Scribing frameless boxes to a rough stone wall — best technique?',
    meta: '62 replies · 2 days ago',
  },
  {
    title: 'Hinge side adjustment range — Blum vs Grass vs Salice comparison',
    meta: '38 replies · 1 week ago',
  },
  {
    title: 'Long frameless run installation sequence — what\'s your workflow?',
    meta: '51 replies · 2 weeks ago',
  },
  {
    title: 'Dealing with sloped floors under base cabinet runs',
    meta: '29 replies · 3 weeks ago',
  },
  {
    title: 'PUR edge banding on scribe pieces — adhesion issues?',
    meta: '17 replies · 1 month ago',
  },
];

export const WIKI_LINKS = [
  { emoji: '📐', text: 'Frameless Cabinet Construction' },
  { emoji: '🔩', text: 'European Hinge Adjustment Guide' },
  { emoji: '🪵', text: 'Scribing & Fitting Techniques' },
  { emoji: '📏', text: 'Cabinet Layout & Datum Setting' },
  { emoji: '⚙️', text: 'Edge Banding Methods' },
];

export const THREAD_TOOLS = [
  { icon: '🖨', text: 'Print Thread' },
  { icon: '📥', text: 'Export as PDF' },
  { icon: '🔗', text: 'Copy Share Link' },
  { icon: '🚩', text: 'Report Thread', isReport: true },
];
