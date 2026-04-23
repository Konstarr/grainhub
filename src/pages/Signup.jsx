import { useState } from 'react';
import '../styles/signup.css';
import SignupForm from '../components/signup/SignupForm.jsx';
import SignupLeftPanel from '../components/signup/SignupLeftPanel.jsx';

export default function Signup() {
  return (
    <div className="signup-page-wrapper">
      <nav className="signup-nav">
        <a className="logo" href="/">
          <svg viewBox="0 0 36 36" fill="none" width="32" height="32">
            <rect width="36" height="36" rx="7" fill="#A0522D" opacity="0.3" />
            <path d="M7 26 L18 9 L29 26" stroke="#D2925A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M7 26 L29 26" stroke="#D2925A" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M15 26 L15 20 L21 20 L21 26" stroke="#A0522D" strokeWidth="1.5" fill="none" />
          </svg>
          <span className="logo-text">Grain<span>Hub</span></span>
        </a>
        <div className="signup-nav-signin">
          Already a member? <a href="/signin">Sign in →</a>
        </div>
      </nav>

      <div className="signup-page-body">
        <SignupLeftPanel />
        <SignupForm />
      </div>
    </div>
  );
}
