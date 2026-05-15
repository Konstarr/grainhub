-- ============================================================
-- seed-manufacturers.sql
--
-- Seeds ~10 real architectural millwork / cabinet shops so the
-- /suppliers page (Manufacturers column) has real names to render.
--
-- All rows are inserted with kind='manufacturer', is_verified=false,
-- is_approved=true, claimed_by=null. Admins can verify / refine
-- contact details from /admin/suppliers/<id>. Re-running this file
-- is safe — `on conflict (slug) do nothing` skips existing rows.
-- ============================================================

insert into public.suppliers
  (slug, name, kind, category, trade, logo_initials,
   description, website, address, is_verified, is_approved, badges)
values
  (
    'advanced-millwork',
    'Advanced Millwork',
    'manufacturer',
    'Architectural Millwork',
    'millwork',
    'AM',
    'Custom architectural millwork shop producing high-end commercial and hospitality casework, paneling, and casework fixtures.',
    'https://www.advancedmillwork.com',
    'Pompano Beach, FL',
    false, true,
    array['AWI Member']
  ),
  (
    'hollywood-woodwork',
    'Hollywood Woodwork',
    'manufacturer',
    'Architectural Millwork',
    'millwork',
    'HW',
    'High-end architectural woodwork manufacturer specializing in luxury hospitality, retail, and corporate interiors.',
    'https://www.hollywoodwoodwork.com',
    'Hollywood, FL',
    false, true,
    array['AWI Premium', 'QCP Certified']
  ),
  (
    'mckenzie-craft',
    'McKenzie Craft',
    'manufacturer',
    'Custom Millwork',
    'millwork',
    'MC',
    'Custom millwork and cabinetry shop serving residential and light-commercial projects.',
    null,
    null,
    false, true,
    array['Family-owned']
  ),
  (
    'adams-group',
    'Adams Group',
    'manufacturer',
    'Architectural Millwork',
    'millwork',
    'AG',
    'Architectural millwork and casework manufacturer for commercial, hospitality, and institutional projects.',
    'https://www.adamsgroupinc.com',
    'Charlotte, NC',
    false, true,
    array['AWI Member']
  ),
  (
    'woodchuck-industries',
    'Woodchuck Industries',
    'manufacturer',
    'Custom Millwork',
    'millwork',
    'WI',
    'Custom millwork shop producing built-ins, store fixtures, and bespoke casework.',
    null,
    null,
    false, true,
    array[]::text[]
  ),
  (
    'imperial-woodworking',
    'Imperial Woodworking Company',
    'manufacturer',
    'Architectural Millwork',
    'millwork',
    'IW',
    'Architectural woodwork manufacturer producing premium custom millwork, paneling, and casework for commercial interiors.',
    'https://www.imperialwoodworking.com',
    'Palatine, IL',
    false, true,
    array['AWI Premium']
  ),
  (
    'heitink-architectural-millwork',
    'Heitink Architectural Millwork',
    'manufacturer',
    'Architectural Millwork',
    'millwork',
    'HA',
    'Full-service architectural millwork manufacturer specializing in corporate, hospitality, healthcare, and education projects.',
    'https://www.heitink.com',
    'Indianapolis, IN',
    false, true,
    array['AWI Member']
  ),
  (
    'parenti-raffaelli',
    'Parenti & Raffaelli',
    'manufacturer',
    'Architectural Millwork',
    'millwork',
    'PR',
    'High-end architectural woodwork firm crafting custom millwork, paneling, and bespoke furniture for luxury residential and commercial projects.',
    'https://www.parenti-raffaelli.com',
    'Mount Prospect, IL',
    false, true,
    array['AWI Premium', 'Family-owned']
  ),
  (
    'bernhard-woodwork',
    'Bernhard Woodwork',
    'manufacturer',
    'Architectural Millwork',
    'millwork',
    'BW',
    'Architectural woodwork manufacturer serving the Chicago area with custom millwork, casework, and paneling for commercial and high-end residential clients.',
    'https://www.bernhardwoodwork.com',
    'Northbrook, IL',
    false, true,
    array['AWI Member']
  ),
  (
    'bauerschmidt-sons',
    'Bauerschmidt & Sons',
    'manufacturer',
    'Architectural Millwork',
    'millwork',
    'BS',
    'Long-standing architectural millwork shop producing custom casework, paneling, and store fixtures for commercial interiors.',
    'https://www.bauerschmidtandsons.com',
    'Mount Vernon, NY',
    false, true,
    array['AWI Member']
  )
on conflict (slug) do nothing;
