/** @jsxImportSource @emotion/react */
import {  css } from '@emotion/react';
import { useContext, useState } from 'preact/hooks';
import { supabase } from '../../utils/supabase';
import { isValidEmail } from '../../utils/isValidEmail';
import { UserContext } from '../../Contexts/UserContext';
import { useModal } from '../../Contexts/ModalProvider';
import { Button } from '../Button';
import { useTranslation } from 'react-i18next';
import { LocaleContext } from '../../Contexts/LocaleContext';

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

  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showVerifyEmail, setShowVerifyEmail] = useState(false);

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
      alert(t("Something went wrong"));
      return;
    }
  }
  
  const { locale, onChangeLocale } = useContext(LocaleContext);

  const onChooseLocale = (e) => {
    console.log(e.target.value, 'huh2')
    onChangeLocale(e.target.value);
  }

  return (
    <div css={overlayStyle}>
      <div css={modalContentStyle}>
        <span css={topCloseBtnStyle} onClick={onClose}>&times;</span>
        {
          true && (
            <>
            <h1>{t("Account")}</h1>
              {
                hasAccount() && (
                  <div>
                    <div style={{fontSize: 16, marginBottom: 20 }}>{user?.result?.email}</div>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: "center"}}>
                      <Button variant='secondary' onClick={onLogout}>
                        {t("Log out")}
                      </Button>
                      <Button variant='primary' onClick={onClose}>
                        {t("Cancel")}
                      </Button>
                    </div>
                  </div>
                )
              }
              {
                !hasAccount() && (
                  <div style={{display: 'flex', alignItems: "center", justifyContent: "space-between"}}>
                    <Button onClick={onCreateAccount}>{t("Create account")}</Button>
                    <Button style={{width: 132}} onClick={onLogin}>{t("Log in")}</Button>
                  </div>
                )
              }
              {
                !hasAccount() && (
                  <>
                    <hr />
                    <Button variant='primary' onClick={onClose}>
                      {t("Cancel")}
                    </Button>
                  </>
                )
              }
            </>
          )
        }
        <hr />
        <select onChange={onChooseLocale} value={locale}>
          <option value="de">Deutsch</option>
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="ko">한국어</option>
          <option value="it">Italiano</option>
          <option value="ru">Русский</option>
          <option value="hi">हिंदी</option>
          <option value="pt">Português</option>
        </select>
      </div>
    </div>
  )
}

export default SettingsModal;
