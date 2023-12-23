/** @jsxImportSource @emotion/react */
import {  css } from '@emotion/react';
import { useContext, useState } from 'preact/hooks';
import { supabase } from '../../utils/supabase';
import { isValidEmail } from '../../utils/isValidEmail';
import { UserContext } from '../../Contexts/UserContext';
import { TextLink } from '../../components/TextLink';
import { TextInput } from '../TextInput';

const overlayStyle = css`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.4); /* Dull background */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* Ensure it's on top */
`;

const modalContentStyle = css`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  text-align: center;
`;

const topCloseBtnStyle = css`
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
`;

const confirmBtnStyle = css`
  background: #3183c8;
  color: white;
  border: 1px solid transparent;
  font-size: 16px;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
`;

const closeBtnStyle = css`
  border: 1px solid lightgrey;
  font-size: 16px;
  padding: 8px 16px;
  border-radius: 4px;
  margin-left: 8px;
  cursor: pointer;
`;

async function signInWithEmail({email, password}) {

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })
	return {data, error}
}

async function logInWithEmail({email, password}) {

  return await supabase.auth.signInWithPassword({
    email,
    password
  })
}

export const AuthModal = ({ message, onClose, showLogin }) => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showVerifyEmail, setShowVerifyEmail] = useState(false);

  const [shouldShowLogin, setShouldShowLogin] = useState(showLogin);

  const onSubmit = () => {
    if (!email) {
      return alert("Email is required");
    }
    if (!isValidEmail(email)) {
      return alert("Email is invalid");
    }
    if (!password) {
      return alert("Password is required");
    }
    if (password.length < 6) {
      return alert("Password must be at least 6 characters long");
    }
    if (!confirmPassword) {
      return alert("Password confirmation is required");
    }
    if (password !== confirmPassword) {
      return alert("Passwords don't match");
    }
    const { data, error } = signInWithEmail({
      email,
      password
    })
    if (error) {
      return alert(`Something went wrong. ${JSON.stringify(error)}`)
    }
    setShowVerifyEmail(true);
  }

  const onSubmitLogin = () => {
    if (!email) {
      return alert("Email is required");
    }
    if (!password) {
      return alert("Password is required");
    }
    const { data, error } = logInWithEmail({
      email,
      password
    })
    if (error) {
      return alert(`Something went wrong. ${JSON.stringify(error)}`)
    }
    onClose();
  }

  const onRequestLogin = () => {
    setShouldShowLogin(true);
  }

  const onRequestSignUp = () => {
    setShouldShowLogin(false);
  }

  if (shouldShowLogin) {
    return (
      <div css={overlayStyle}>
        <div css={modalContentStyle}>
          <span css={topCloseBtnStyle} onClick={onClose}>&times;</span>
          <h1>Log in</h1>
          <div>
            <TextInput style={{marginBottom: 8}} value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" />
          </div>
          <div>
            <TextInput style={{marginBottom: 16}} value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" />
          </div>
          <button css={confirmBtnStyle} variant="primary" size="sm" onClick={onSubmitLogin}
          >
              Confirm
          </button>
          <button css={closeBtnStyle} variant="secondary" size="md" onClick={onClose}>Cancel</button>
          <hr />
          Don't have an account?&nbsp;<TextLink onClick={onRequestSignUp}>Create account</TextLink>
        </div>
      </div>
    )
  }

  if (showVerifyEmail) {
    return (
      <div css={overlayStyle}>
        <div css={modalContentStyle}>
          <span css={topCloseBtnStyle} onClick={onClose}>&times;</span>
          <h1>Email Verification and Subscription Selection</h1>
          <p>Please check your email to verify your address and choose a subscription plan. After completing these steps, you can log in using the form below:</p>
          <div>
            <TextInput style={{marginBottom: 8}} value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" />
          </div>
          <div>
            <TextInput style={{marginBottom: 16}} value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" />
          </div>
          <button css={confirmBtnStyle} variant="primary" size="sm" onClick={onSubmitLogin}
          >
              Confirm
          </button>
          <button css={closeBtnStyle} variant="secondary" size="md" onClick={onClose}>Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <div css={overlayStyle}>
      <div css={modalContentStyle}>
        <span css={topCloseBtnStyle} onClick={onClose}>&times;</span>
        <h1>Create account</h1>
        {!!message && (
          <div style={{color: "grey", marginBottom: 20}}>{message}</div>
        )}

        <div>
          <TextInput style={{marginBottom: 8}} value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" />
        </div>
        <div>
          <TextInput style={{marginBottom: 8}} value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" />
        </div>
        <div>
          <TextInput style={{marginBottom: 16}} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" placeholder="Confirm password" />
        </div>
        <button css={confirmBtnStyle} variant="primary" size="sm" onClick={onSubmit}
        >
          Confirm
        </button>
        <button css={closeBtnStyle} variant="secondary" size="md" onClick={onClose}>Cancel</button>
        <hr />
        Have an account?&nbsp;<TextLink onClick={onRequestLogin}>Log in</TextLink>
      </div>
    </div>
  )
}

export default AuthModal;
