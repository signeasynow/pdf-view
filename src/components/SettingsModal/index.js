/** @jsxImportSource @emotion/react */
import {  css } from '@emotion/react';
import { useContext, useEffect, useState } from 'preact/hooks';
import { supabase } from '../../utils/supabase';
import { isValidEmail } from '../../utils/isValidEmail';
import { UserContext } from '../../Contexts/UserContext';
import { useModal } from '../../Contexts/ModalProvider';
import { Button } from '../Button';

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

export const SettingsModal = ({ onClose }) => {

  const {details: user } = useContext(UserContext);

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

  const hasAccount = () => {
    return user?.result?.email;
  }

  const { showAuthModal } = useModal();

  const onLogin = () => {
    showAuthModal(true);
    onClose();
  }

  const onCreateAccount = () => {
    showAuthModal(false);
    onClose();
  }

  const onLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert(dictionary["Something went wrong"]);
      return;
    }
  }

  return (
    <div css={overlayStyle}>
      <div css={modalContentStyle}>
        <span css={topCloseBtnStyle} onClick={onClose}>&times;</span>
        <h1>Account</h1>
        {
          hasAccount() && (
            <div>
              <div style={{fontSize: 16, marginBottom: 20 }}>{user?.result?.email}</div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: "center"}}>
                <Button variant='secondary' onClick={onLogout}>
                  Log out
                </Button>
                <Button variant='primary' onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </div>
          )
        }
        {
          !hasAccount() && (
            <div style={{display: 'flex', alignItems: "center", justifyContent: "space-between"}}>
              <Button onClick={onCreateAccount}>Create account</Button>
              <Button style={{width: 132}} onClick={onLogin}>Sign in</Button>
            </div>
          )
        }
        {
          !hasAccount() && (
            <>
              <hr />
              <Button variant='primary' onClick={onClose}>
                Cancel
              </Button>
            </>
          )
        }
      </div>
    </div>
  )
}

export default SettingsModal;
