import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import '../styles/jobs.css';
import JobsPageHeader from '../components/jobs/JobsPageHeader.jsx';
import JobsSearchHero from '../components/jobs/JobsSearchHero.jsx';
import RoleBar from '../components/jobs/RoleBar.jsx';
import FilterSidebar from '../components/jobs/FilterSidebar.jsx';
import JobsListing from '../components/jobs/JobsListing.jsx';
import JobsSidebar from '../components/jobs/JobsSidebar.jsx';
import { JOBS_PAGE_HEADER, ROLE_PILLS, FILTER_OPTIONS, JOBS_TOOLBAR_DATA, POST_JOB_CTA, TALENT_CTA } from '../data/jobsData.js';
import { useSupabaseList } from '../hooks/useSupabaseList.js';
import { mapJobRow } from '../lib/mappers.js';

/**
 * Empty filter state — every checkbox off, every text field empty.
 * FilterSidebar reads the array of "active" strings per section and
 * toggles items in / out.
 */
const EMPTY_FILTERS = {
  jobType:          [],   // e.g. ['Full-time', 'Part-time']
  workLocation:     [],   // e.g. ['On-site', 'Remote']
  experienceLevel:  [],
  shopSpecialty:    [],
  region:           [],
  postedWithin:     [],
  minSalary:        '',
  maxSalary:        '',
};

/**
 * Map a UI "Posted within" label to a cutoff timestamp. Anything older
 * than the cutoff gets filtered out.
 */
function postedWithinCutoff(label) {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  switch (label) {
    case 'Last 24 hours': return now - 1 * day;
    case 'Last 7 days':   return now - 7 * day;
    case 'Last 30 days':  return now - 30 * day;
    case 'Any time':      return 0;
    default:              return 0;
  }
}

/** Cast $95K / $95,000 / 95 → 95000; handles hourly by returning bare number. */
function parseSalaryInput(v) {
  if (!v) return null;
  const clean = String(v).replace(/[^\d.]/g, '');
  if (!clean) return null;
  const n = Number(clean);
  if (!isFinite(n)) return null;
  // If the user typed "50" assume 50k for annual ranges
  return n < 1000 ? n * 1000 : n;
}

/**
 * Return the single experience bucket a row belongs to, using a priority
 * order so a "Senior Lead Foreman" job gets counted once (as Lead) rather
 * than both in Senior and in Lead. Priority: Lead > Senior > Entry > Mid.
 */
function experienceBucket(r) {
  const hay = ((r.title || '') + ' ' + (r.description || '')).toLowerCase();
  // Lead / Supervisor — check first; most specific
  if (/\b(lead|supervisor|foreman|manager|director|principal|head of)\b/.test(hay)) {
    return 'Lead / Supervisor';
  }
  // Senior
  if (/\b(senior|sr\.?|master|10\+\s*yrs?|8\+\s*yrs?|5\+\s*yrs?|journeyman)\b/.test(hay)) {
    return 'Senior (5+ yrs)';
  }
  // Entry
  if (/\b(entry|apprentice|junior|jr\.?|assistant|trainee|no experience)\b/.test(hay)) {
    return 'Entry level (0–2 yrs)';
  }
  // Default bucket for anything else that doesn't scream entry/senior/lead
  return 'Mid level (2–5 yrs)';
}

/**
 * Predicate builders — mirror the filter logic below so we can compute
 * counts per option by counting rows each one would match against the
 * unfiltered dataset.
 *
 * Invariant: for any section where the UI presents mutually-exclusive
 * options (Employment type, Work location, Experience level, Region),
 * each job contributes +1 to exactly one bucket's count, so the sum of
 * the counts in that section equals the total number of listings.
 */
const MATCHERS = {
  jobType: (opt) => (r) => {
    const et = (r.employment_type || '').toLowerCase();
    // "Temporary / Seasonal" collapses to an "other" bucket if no matching et
    if (opt === 'Temporary / Seasonal') return /temp|season/i.test(et);
    return et === opt.toLowerCase();
  },
  workLocation: (opt) => (r) => {
    const isRemote = !!r.is_remote || /remote/i.test(r.location || '');
    const isHybrid = !!r.is_hybrid || /hybrid/i.test(r.location || '');
    if (opt === 'Remote')  return isRemote;
    if (opt === 'Hybrid')  return !isRemote && isHybrid;
    if (opt === 'On-site') return !isRemote && !isHybrid;
    return false;
  },
  experienceLevel: (opt) => (r) => experienceBucket(r) === opt,
  shopSpecialty: (opt) => (r) => {
    const hay = ((r.title || '') + ' ' + (r.description || '')).toLowerCase();
    return hay.includes(opt.toLowerCase());
  },
  region: (opt) => (r) => {
    const hay = (r.location || '').toLowerCase();
    const token = opt.toLowerCase().replace(/\s*us$/, '').trim();
    return token && hay.includes(token);
  },
  postedWithin: (opt) => (r) => {
    if (opt === 'Any time' || !opt) return true;
    if (!r.posted_at) return false;
    const cutoff = postedWithinCutoff(opt);
    if (!cutoff) return true;
    return new Date(r.posted_at).getTime() >= cutoff;
  },
};

/**
 * Re-shape FILTER_OPTIONS with counts computed from the current rows.
 * Options with zero matches get filtered out — the user shouldn't see
 * a choice that does nothing.
 */
function filterOptionsWithCounts(rows, catalog) {
  const recount = (section) =>
    (catalog[section] || []).map((opt) => {
      const match = MATCHERS[section](opt.label);
      const count = (rows || []).filter(match).length;
      return { ...opt, count };
    }).filter((opt) => opt.count > 0);

  return {
    jobType:         recount('jobType'),
    workLocation:    recount('workLocation'),
    experienceLevel: recount('experienceLevel'),
    shopSpecialty:   recount('shopSpecialty'),
    region:          recount('region'),
    postedWithin:    recount('postedWithin'),
  };
}

/** Role pills — count jobs whose title contains any tokens from the pill label. */
function rolePillsWithCounts(rows, pills) {
  const total = (rows || []).length;
  return pills.map((pill) => {
    if (pill.label === 'All Roles') return { ...pill, count: total, isActive: false };
    const tokens = pill.label.toLowerCase().split(/\s*\/\s*|\s+/).filter(Boolean);
    const count = (rows || []).filter((r) => {
      const t = (r.title || '').toLowerCase();
      return tokens.some((w) => t.includes(w));
    }).length;
    return { ...pill, count, isActive: false };
  }).filter((p) => p.label === 'All Roles' || p.count > 0);
}

export default function Jobs() {
  const [searchParams] = useSearchParams();
  // The site-wide SecondaryNav on /jobs uses ?role=<keyword>.
  const navRoleKeyword = searchParams.get('role') || '';

  const [activeRole, setActiveRole] = useState('All Roles');
  const [keyword, setKeyword]       = useState('');
  const [locationQ, setLocationQ]   = useState('');
  const [heroJobType, setHeroJobType] = useState('All Job Types');
  const [sort, setSort]             = useState('newest');
  const [filters, setFilters]       = useState(EMPTY_FILTERS);

  const { data: rows } = useSupabaseList('jobs', {
    filter: (q) => {
      let out = q.eq('is_approved', true).eq('is_filled', false);
      // Role keyword from the site-wide SecondaryNav (?role=cabinet%20maker
      // etc.) — loose match against title + description.
      if (navRoleKeyword) {
        const kw = navRoleKeyword.trim()
          .replace(/[%_]/g, (c) => '\\' + c)
          .replace(/[,()]/g, ' ');
        out = out.or(`title.ilike.%${kw}%,description.ilike.%${kw}%`);
      }
      return out;
    },
    order: { column: 'posted_at', ascending: false },
    limit: 200,
    deps: [navRoleKeyword],
  });

  // Live counts, re-derived whenever rows change
  const liveFilterOptions = useMemo(
    () => filterOptionsWithCounts(rows, FILTER_OPTIONS),
    [rows]
  );
  const liveRolePills = useMemo(
    () => rolePillsWithCounts(rows, ROLE_PILLS),
    [rows]
  );

  // ---------- filter ----------
  const filteredRows = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    const loc = locationQ.trim().toLowerCase();

    // Normalize hero job-type ("Full-time") → row value ("full-time")
    const heroTypeRaw = heroJobType === 'All Job Types' ? null : heroJobType.toLowerCase();

    // Combine hero job type with sidebar job-type checkboxes
    const jobTypeSet = new Set(filters.jobType.map((s) => s.toLowerCase()));
    if (heroTypeRaw) jobTypeSet.add(heroTypeRaw);

    const workLocSet = new Set(filters.workLocation.map((s) => s.toLowerCase()));
    const regionSet  = new Set(filters.region.map((s) => s.toLowerCase()));
    const specSet    = new Set(filters.shopSpecialty.map((s) => s.toLowerCase()));
    const expSet     = new Set(filters.experienceLevel.map((s) => s.toLowerCase()));

    const minSalary = parseSalaryInput(filters.minSalary);
    const maxSalary = parseSalaryInput(filters.maxSalary);

    // Posted within — pick the most restrictive selected window
    const postedCutoffs = filters.postedWithin.map(postedWithinCutoff).filter(Boolean);
    const postedCutoff  = postedCutoffs.length ? Math.max(...postedCutoffs) : 0;

    // Role pill matches against job title (heuristic but effective)
    const roleMatch = activeRole && activeRole !== 'All Roles'
      ? activeRole.toLowerCase().split(/\s*\/\s*|\s+/).filter(Boolean)
      : null;

    return (rows || []).filter((r) => {
      // keyword — title / company / description
      if (kw) {
        const hay = [r.title, r.company, r.description].filter(Boolean).join(' ').toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      // location
      if (loc) {
        const hay = [r.location, r.venue, r.city, r.state].filter(Boolean).join(' ').toLowerCase();
        if (!hay.includes(loc)) return false;
      }
      // job type
      if (jobTypeSet.size > 0) {
        const et = (r.employment_type || '').toLowerCase();
        if (!jobTypeSet.has(et)) return false;
      }
      // work location on-site / hybrid / remote
      if (workLocSet.size > 0) {
        const isRemote = !!r.is_remote || /remote/i.test(r.location || '');
        const isHybrid = !!r.is_hybrid || /hybrid/i.test(r.location || '');
        let ok = false;
        if (workLocSet.has('remote')   && isRemote) ok = true;
        if (workLocSet.has('hybrid')   && isHybrid) ok = true;
        if (workLocSet.has('on-site')  && !isRemote && !isHybrid) ok = true;
        if (!ok) return false;
      }
      // region — best-effort substring match
      if (regionSet.size > 0) {
        const hay = (r.location || '').toLowerCase();
        // region labels end with "US"/"Canada"; pick distinguishing tokens
        const regionTokens = Array.from(regionSet).map((reg) =>
          reg.replace(/\s*us$/, '').trim()
        );
        if (!regionTokens.some((t) => hay.includes(t))) return false;
      }
      // shop specialty — try a description match
      if (specSet.size > 0) {
        const hay = (r.description || '').toLowerCase() + ' ' + (r.title || '').toLowerCase();
        if (!Array.from(specSet).some((t) => hay.includes(t))) return false;
      }
      // experience — use the single canonical bucket so filter behavior
      // stays consistent with what the sidebar counts advertise
      if (expSet.size > 0) {
        const bucket = experienceBucket(r).toLowerCase();
        if (!expSet.has(bucket)) return false;
      }
      // salary
      if (minSalary != null && r.salary_max != null && r.salary_max < minSalary) return false;
      if (maxSalary != null && r.salary_min != null && r.salary_min > maxSalary) return false;
      // posted within
      if (postedCutoff && r.posted_at && new Date(r.posted_at).getTime() < postedCutoff) {
        return false;
      }
      // role pill
      if (roleMatch) {
        const hay = (r.title || '').toLowerCase();
        if (!roleMatch.some((word) => hay.includes(word))) return false;
      }
      return true;
    });
  }, [rows, keyword, locationQ, heroJobType, activeRole, filters]);

  // ---------- sort ----------
  const sortedRows = useMemo(() => {
    const arr = [...filteredRows];
    switch (sort) {
      case 'salary-high':
        arr.sort((a, b) => (b.salary_max || 0) - (a.salary_max || 0));
        break;
      case 'salary-low':
        arr.sort((a, b) => (a.salary_min || 0) - (b.salary_min || 0));
        break;
      case 'newest':
      case 'relevant':
      default:
        arr.sort((a, b) => new Date(b.posted_at || 0) - new Date(a.posted_at || 0));
    }
    return arr;
  }, [filteredRows, sort]);

  const liveJobs = sortedRows.map(mapJobRow);

  return (
    <>
      <JobsPageHeader data={JOBS_PAGE_HEADER} />

      <JobsSearchHero
        keyword={keyword}
        onKeywordChange={setKeyword}
        location={locationQ}
        onLocationChange={setLocationQ}
        jobType={heroJobType}
        onJobTypeChange={setHeroJobType}
      />

      <RoleBar pills={liveRolePills} activeRole={activeRole} setActiveRole={setActiveRole} />

      <div className="jobs-wrap">
        <FilterSidebar
          filters={liveFilterOptions}
          active={filters}
          onChange={setFilters}
          onClear={() => setFilters(EMPTY_FILTERS)}
        />
        <JobsListing
          toolbarData={JOBS_TOOLBAR_DATA}
          jobs={liveJobs}
          sort={sort}
          onSortChange={setSort}
        />
        <JobsSidebar postJobCta={POST_JOB_CTA} talentCta={TALENT_CTA} />
      </div>
    </>
  );
}
