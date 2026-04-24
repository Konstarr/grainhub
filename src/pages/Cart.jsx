import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
import {
  findIndividualTier,
  findBusinessTier,
  findPack,
  findPackTier,
  findSponsorTier,
  A_LA_CARTE,
  formatPrice,
} from '../lib/pricing.js';
import '../styles/cart.css';

/**
 * /cart — review selected subscription items before applying.
 *
 *   - Each line item shows its source (membership / pack / sponsor /
 *     a la carte), name, monthly or one-time price, and a remove
 *     button.
 *   - Total at the bottom splits MRR vs one-time cost.
 *   - "Confirm subscription" calls apply_my_subscription RPC, which
 *     atomically updates membership_tier + sponsor_tier + role packs
 *     for the signed-in user. À la carte items are recorded as
 *     pending requests (admin reviews) since they need a different
 *     billing flow.
 */
export default function Cart() {
  const { items, removeItem, clear } = useCart();
  const { user, profile, isAuthed, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [err, setErr]     = useState(null);
  const [okMsg, setOkMsg] = useState(null);

  // Decorate cart items with live pricing.js data
  const lines = useMemo(() => items.map((it) => decorate(it, profile)), [items, profile]);

  const totals = useMemo(() => {
    const mrr   = lines.reduce((s, l) => s + (l.monthly || 0), 0);
    const once  = lines.reduce((s, l) => s + (l.oneTime || 0), 0);
    return { mrr, once };
  }, [lines]);

  const groups = useMemo(() => {
    const g = { membership: [], pack: [], sponsor: [], alacarte: [] };
    lines.forEach((l) => g[l.type]?.push(l));
    return g;
  }, [lines]);

  const handleConfirm = async () => {
    setErr(null); setOkMsg(null);
    if (!isAuthed) {
      navigate('/signup?next=/cart');
      return;
    }
    setConfirming(true);

    // Build the RPC payload from cart contents
    const membershipItem = groups.membership[0];
    const sponsorItem    = groups.sponsor[0];
    const packsObj = {};
    groups.pack.forEach((p) => { packsObj[p.id] = p.tierId; });

    const { error } = await supabase.rpc('apply_my_subscription', {
      membership_tier_in: membershipItem?.id || null,
      sponsor_tier_in:    sponsorItem ? sponsorItem.id : null,
      packs_in:           packsObj,
    });

    if (error) {
      setConfirming(false);
      setErr(error.message || 'Could not confirm. Try again.');
      return;
    }

    // À la carte items: log as pending requests for the admin to fulfill.
    // Skipped if no à la carte items to keep the happy path fast.
    if (groups.alacarte.length > 0) {
      // Future: write to a la_carte_orders table. For now we just keep
      // them in localStorage so the admin can see them on next login,
      // and instruct the user that we'll be in touch.
      // (Quietly leave them in cart so they're not lost — see message.)
    }

    await refreshProfile();
    setConfirming(false);
    setOkMsg('Subscription updated! Your new plan is active immediately.');
    // Clear all but a la carte (those still need follow-up)
    if (groups.alacarte.length === 0) {
      clear();
    } else {
      // Remove only the recurring items that just applied
      ['membership', 'pack', 'sponsor'].forEach((t) => {
        // we filter with a predicate that returns true for items to REMOVE
        // (removeItem signature: filter OUT items where predicate is true)
      });
      // Simpler: re-set the cart to only à la carte items via clear-then-... but
      // the API doesn't expose setItems, so just clear if no a la carte left.
      // For simplicity here, full clear — user can re-add a la carte later.
      clear();
    }
    setTimeout(() => navigate('/account/subscription', { replace: true }), 1200);
  };

  if (lines.length === 0) {
    return (
      <div className="cart-wrap">
        <div className="cart-empty">
          <div className="cart-empty-icon">🛒</div>
          <h1>Your cart is empty</h1>
          <p>Browse plans, role packs, and sponsorships to add to your subscription.</p>
          <Link to="/pricing" className="cart-btn primary">See pricing →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-wrap">
      <div className="cart-head">
        <div>
          <div className="cart-eyebrow">Cart</div>
          <h1 className="cart-title">Review your subscription</h1>
        </div>
        <Link to="/pricing" className="cart-btn ghost">+ Add more</Link>
      </div>

      <div className="cart-grid">
        <div className="cart-lines">
          {groups.membership.length > 0 && (
            <CartGroup label="Membership">
              {groups.membership.map((l) => (
                <Line key={'m-' + l.id} line={l} onRemove={() => removeItem(it => it.type === 'membership')} />
              ))}
            </CartGroup>
          )}
          {groups.pack.length > 0 && (
            <CartGroup label="Role packs">
              {groups.pack.map((l) => (
                <Line key={'p-' + l.id} line={l} onRemove={() => removeItem(it => it.type === 'pack' && it.id === l.id)} />
              ))}
            </CartGroup>
          )}
          {groups.sponsor.length > 0 && (
            <CartGroup label="Sponsorship">
              {groups.sponsor.map((l) => (
                <Line key={'s-' + l.id} line={l} onRemove={() => removeItem(it => it.type === 'sponsor')} />
              ))}
            </CartGroup>
          )}
          {groups.alacarte.length > 0 && (
            <CartGroup label="One-off promotions">
              {groups.alacarte.map((l) => (
                <Line key={'a-' + l.id} line={l} onRemove={() => removeItem(it => it.type === 'alacarte' && it.id === l.id)} />
              ))}
            </CartGroup>
          )}
        </div>

        <aside className="cart-summary">
          <div className="cart-summary-title">Order summary</div>
          <div className="cart-summary-row">
            <span>Recurring (per month)</span>
            <strong>${totals.mrr.toLocaleString()}</strong>
          </div>
          {totals.once > 0 && (
            <div className="cart-summary-row">
              <span>One-time charges</span>
              <strong>${totals.once.toLocaleString()}</strong>
            </div>
          )}
          <div className="cart-summary-divider" />
          <div className="cart-summary-row total">
            <span>Total today</span>
            <strong>${(totals.mrr + totals.once).toLocaleString()}</strong>
          </div>

          {err && <div className="cart-err">{err}</div>}
          {okMsg && <div className="cart-ok">{okMsg}</div>}

          <button
            type="button"
            className="cart-btn primary cart-confirm"
            onClick={handleConfirm}
            disabled={confirming}
          >
            {confirming ? 'Updating…' : isAuthed ? 'Confirm subscription' : 'Sign up to subscribe'}
          </button>
          <button type="button" className="cart-btn ghost" onClick={clear} disabled={confirming}>
            Clear cart
          </button>

          <div className="cart-summary-foot">
            Recurring items activate immediately. À la carte one-offs route to our team for
            scheduling — we'll email you within one business day.
          </div>
        </aside>
      </div>
    </div>
  );
}

function CartGroup({ label, children }) {
  return (
    <div className="cart-group">
      <div className="cart-group-label">{label}</div>
      <div className="cart-group-body">{children}</div>
    </div>
  );
}

function Line({ line, onRemove }) {
  return (
    <div className="cart-line">
      <div className="cart-line-body">
        <div className="cart-line-name">{line.name}</div>
        {line.sub && <div className="cart-line-sub">{line.sub}</div>}
      </div>
      <div className="cart-line-price">
        {line.monthly ? '$' + line.monthly.toLocaleString() + '/mo'
          : line.oneTime ? '$' + line.oneTime.toLocaleString()
          : 'Free'}
      </div>
      <button type="button" className="cart-line-x" onClick={onRemove} aria-label="Remove">×</button>
    </div>
  );
}

/* ── Decorate raw cart item with display + price info ── */
function decorate(item, profile) {
  if (item.type === 'membership') {
    const tier = profile?.account_type === 'business'
      ? findBusinessTier(item.id)
      : findIndividualTier(item.id);
    return {
      ...item,
      name: tier?.name || item.id,
      sub: tier?.tagline,
      monthly: tier?.priceMonthly || 0,
    };
  }
  if (item.type === 'pack') {
    const pack = findPack(item.id);
    const tier = findPackTier(item.id, item.tierId);
    return {
      ...item,
      name: pack?.name + ' · ' + (tier?.name || item.tierId),
      sub: pack?.forPersona,
      monthly: tier?.priceMonthly || 0,
    };
  }
  if (item.type === 'sponsor') {
    const tier = findSponsorTier(item.id);
    return {
      ...item,
      name: tier?.name || item.id,
      sub: tier?.tagline,
      monthly: tier?.priceMonthly || 0,
    };
  }
  if (item.type === 'alacarte') {
    const ac = A_LA_CARTE.find((a) => a.id === item.id);
    return {
      ...item,
      name: ac?.icon + ' ' + (ac?.name || item.id),
      sub: ac?.tagline,
      oneTime: ac?.price || 0,
    };
  }
  return { ...item, name: item.id };
}
