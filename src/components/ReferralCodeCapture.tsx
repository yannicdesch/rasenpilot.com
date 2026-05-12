import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Captures `?ref=CODE` from any URL into localStorage so that, when the visitor
 * eventually signs up, AuthContext can redeem the referral. Mounted once globally.
 */
const ReferralCodeCapture = () => {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('ref');
    if (code && /^[A-Za-z0-9]{4,16}$/.test(code)) {
      localStorage.setItem('pending_referral_code', code.toUpperCase());
    }
  }, [location.search]);

  return null;
};

export default ReferralCodeCapture;
