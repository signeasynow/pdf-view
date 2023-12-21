/** @jsxImportSource @emotion/react */
import {  css } from '@emotion/react';
import { useState } from 'preact/hooks';
import { supabase } from '../../utils/supabase';
import { isValidEmail } from '../../utils/isValidEmail';

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

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
	return {data, error}
}

export const AuthModal = ({ onConfirm, onClose }) => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showVerifyEmail, setShowVerifyEmail] = useState(false);

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

  if (showVerifyEmail || true) {
    return (
      <div css={overlayStyle}>
        <div css={modalContentStyle}>
          <span css={topCloseBtnStyle} onClick={onClose}>&times;</span>
          <h1>Please verify your email and pick a subscription</h1>
          <p>Check your email and verify your email. You will be prompted to subscribe. Once complete, please log in below:</p>
          <div>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" />
          </div>
          <div>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" />
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
        <div>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" />
        </div>
        <div>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" />
        </div>
        <div>
          <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" placeholder="Confirm password" />
        </div>
        <button css={confirmBtnStyle} variant="primary" size="sm" onClick={onSubmit}
        >
            Confirm
        </button>
        <button css={closeBtnStyle} variant="secondary" size="md" onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}

export default AuthModal;
