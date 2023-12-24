/** @jsxImportSource @emotion/react */
import {  css } from '@emotion/react';
import { useEffect, useState } from 'preact/hooks';
import { supabase } from '../../utils/supabase';
import { isValidEmail } from '../../utils/isValidEmail';
import { TextLink } from '../../components/TextLink';
import { TextInput } from '../TextInput';
import { useUserData } from '../../hooks/useUserData';
import { useTranslation } from 'react-i18next';

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

  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showVerifyEmail, setShowVerifyEmail] = useState(false);

  const [shouldShowLogin, setShouldShowLogin] = useState(showLogin);

  const { hasValidSubscription } = useUserData();

  useEffect(() => {
    if (hasValidSubscription) {
      onClose();
    }
  }, [hasValidSubscription]);

  const onSubmit = () => {
    if (!email) {
      return alert(t("email-required"));
    }
    if (!isValidEmail(email)) {
      return alert(t("email-invalid"));
    }
    if (!password) {
      return alert(t("password-required"));
    }
    if (password.length < 6) {
      return alert(t("password-6-min"));
    }
    if (!confirmPassword) {
      return alert(t("password-confirmation-required"));
    }
    if (password !== confirmPassword) {
      return alert(t("passwords-dont-match"));
    }
    const { data, error } = signInWithEmail({
      email,
      password
    })
    if (error) {
      return alert(`${t("Something went wrong")}. ${JSON.stringify(error)}`)
    }
    setShowVerifyEmail(true);
  }

  const onSubmitLogin = () => {
    if (!email) {
      return alert(t("email-required"));
    }
    if (!password) {
      return alert(t("password-required"));
    }
    const { data, error } = logInWithEmail({
      email,
      password
    })
    if (error) {
      return alert(`${t("Something went wrong")}. ${JSON.stringify(error)}`)
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
          <h1>{t("Log in")}</h1>
          <div>
            <TextInput style={{marginBottom: 8}} value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder={t("Email")} />
          </div>
          <div>
            <TextInput style={{marginBottom: 16}} value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder={t("Password")} />
          </div>
          <button css={confirmBtnStyle} variant="primary" size="sm" onClick={onSubmitLogin}
          >
              {t("Confirm")}
          </button>
          <button css={closeBtnStyle} variant="secondary" size="md" onClick={onClose}>{t("Cancel")}</button>
          <hr />
          {t("dont-have-account")}&nbsp;<TextLink onClick={onRequestSignUp}>{t("Create account")}</TextLink>
        </div>
      </div>
    )
  }

  if (showVerifyEmail) {
    return (
      <div css={overlayStyle}>
        <div css={modalContentStyle}>
          <span css={topCloseBtnStyle} onClick={onClose}>&times;</span>
          <h1>{t("email-verification-subscription")}</h1>
          <p>{t("please-check-email")}</p>
          <div>
            <TextInput style={{marginBottom: 8}} value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder={t("Email")} />
          </div>
          <div>
            <TextInput style={{marginBottom: 16}} value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder={t("Password")} />
          </div>
          <button css={confirmBtnStyle} variant="primary" size="sm" onClick={onSubmitLogin}
          >
              {t("Confirm")}
          </button>
          <button css={closeBtnStyle} variant="secondary" size="md" onClick={onClose}>{t("Cancel")}</button>
        </div>
      </div>
    )
  }

  return (
    <div css={overlayStyle}>
      <div css={modalContentStyle}>
        <span css={topCloseBtnStyle} onClick={onClose}>&times;</span>
        <h1>{t("Create account")}</h1>
        {!!message && (
          <div style={{color: "grey", marginBottom: 20}}>{message}</div>
        )}

        <div>
          <TextInput style={{marginBottom: 8}} value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder={t("Email")} />
        </div>
        <div>
          <TextInput style={{marginBottom: 8}} value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder={t("Password")} />
        </div>
        <div>
          <TextInput style={{marginBottom: 16}} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" placeholder={t("Confirm password")} />
        </div>
        <button css={confirmBtnStyle} variant="primary" size="sm" onClick={onSubmit}
        >
          {t("Confirm")}
        </button>
        <button css={closeBtnStyle} variant="secondary" size="md" onClick={onClose}>{t("Cancel")}</button>
        <hr />
        {t("have-an-account")}&nbsp;<TextLink onClick={onRequestLogin}>{t("Log in")}</TextLink>
      </div>
    </div>
  )
}

export default AuthModal;
