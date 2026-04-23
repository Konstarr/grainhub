import '../styles/signup.css';
import SignupForm from '../components/signup/SignupForm.jsx';
import SignupLeftPanel from '../components/signup/SignupLeftPanel.jsx';

export default function Signup() {
  return (
    <div className="signup-page-wrapper">
      <div className="signup-page-body">
        <SignupLeftPanel />
        <SignupForm />
      </div>
    </div>
  );
}
