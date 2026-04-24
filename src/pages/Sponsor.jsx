import '../styles/sponsor.css';
import SponsorHero from '../components/sponsor/SponsorHero.jsx';
import SponsorEligibilityBanner from '../components/sponsor/SponsorEligibilityBanner.jsx';
import SponsorCurrentSponsors from '../components/sponsor/SponsorCurrentSponsors.jsx';
import SponsorAudience from '../components/sponsor/SponsorAudience.jsx';
import SponsorPackages from '../components/sponsor/SponsorPackages.jsx';
import SponsorAlaCarte from '../components/sponsor/SponsorAlaCarte.jsx';
import SponsorPlacements from '../components/sponsor/SponsorPlacements.jsx';
import SponsorTestimonials from '../components/sponsor/SponsorTestimonials.jsx';
import SponsorContact from '../components/sponsor/SponsorContact.jsx';

export default function Sponsor() {
  return (
    <>
      <SponsorHero />
      <SponsorEligibilityBanner />
      <SponsorCurrentSponsors />
      <SponsorAudience />
      <SponsorPackages />
      <SponsorAlaCarte />
      <SponsorPlacements />
      <SponsorTestimonials />
      <SponsorContact />
    </>
  );
}
