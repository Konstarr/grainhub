import { useState } from 'react';
import '../styles/jobs.css';
import JobsPageHeader from '../components/jobs/JobsPageHeader.jsx';
import JobsSearchHero from '../components/jobs/JobsSearchHero.jsx';
import RoleBar from '../components/jobs/RoleBar.jsx';
import FilterSidebar from '../components/jobs/FilterSidebar.jsx';
import JobsListing from '../components/jobs/JobsListing.jsx';
import JobsSidebar from '../components/jobs/JobsSidebar.jsx';
import { JOBS_PAGE_HEADER, ROLE_PILLS, FILTER_OPTIONS, JOBS_TOOLBAR_DATA, FEATURED_JOB, JOB_LISTINGS, PAGINATION_DATA, SALARY_GUIDE, TOP_HIRING_COMPANIES, POST_JOB_CTA, TALENT_CTA } from '../data/jobsData.js';
import { useSupabaseList } from '../hooks/useSupabaseList.js';
import { mapJobRow } from '../lib/mappers.js';

export default function Jobs() {
  const [activeRole, setActiveRole] = useState('All Roles');
  const [currentPage, setCurrentPage] = useState(1);

  // Pull approved jobs from Supabase, newest first.
  const { data: rows } = useSupabaseList('jobs', {
    filter: (q) => q.eq('is_approved', true).eq('is_filled', false),
    order: { column: 'posted_at', ascending: false },
    limit: 50,
  });

  // If DB returned rows, use them; otherwise fall back to the static sample
  // so the page still renders during local dev without env vars.
  const liveJobs = rows.length ? rows.map(mapJobRow) : JOB_LISTINGS;

  return (
    <>
      <JobsPageHeader data={JOBS_PAGE_HEADER} />
      <JobsSearchHero />
      <RoleBar pills={ROLE_PILLS} activeRole={activeRole} setActiveRole={setActiveRole} />

      <div className="jobs-wrap">
        <FilterSidebar filters={FILTER_OPTIONS} />

        <JobsListing
          toolbarData={JOBS_TOOLBAR_DATA}
          featuredJob={FEATURED_JOB}
          jobs={liveJobs}
          pagination={PAGINATION_DATA}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />

        <JobsSidebar
          salaryGuide={SALARY_GUIDE}
          topCompanies={TOP_HIRING_COMPANIES}
          postJobCta={POST_JOB_CTA}
          talentCta={TALENT_CTA}
        />
      </div>
    </>
  );
}
