// Deprecated. The forums sidebar now uses <SponsorSidebar /> from
// components/sponsors/AdSlot.jsx, which pulls live rows from
// sponsor_media (and falls back to a "Become a sponsor" CTA when
// no sponsor is approved for the slot). Kept as a stub re-export
// so any stragglers don't break — remove once nothing imports it.
export { SponsorSidebar as default } from '../sponsors/AdSlot.jsx';
