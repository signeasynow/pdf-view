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
import { useClerk } from '@clerk/clerk-react';

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

export const SettingsModal = ({ onClose }) => {

  const {details: user } = useContext(UserContext);

  const { t } = useTranslation();

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

  const { signOut } = useClerk();

  const onLogout = async () => {
    const { error } = signOut();
    if (error) {
      alert(t("Something went wrong"));
      return;
    }
  }
  
  const { locale, onChangeLocale } = useContext(LocaleContext);

  const onChooseLocale = (e) => {
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
          <option value="ar">العربية</option>
          <option value="id">Bahasa Indonesia</option>
          <option value="ms">Bahasa Melayu</option>
          <option value="de">Deutsch</option>
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="ko">한국어</option>
          <option value="lt">Lietuvių</option>
          <option value="it">Italiano</option>
          <option value="ru">Русский</option>
          <option value="hi">हिंदी</option>
          <option value="pt">Português</option>
          <option value="zh_CN">中文</option>
        </select>
      </div>
    </div>
  )
}

export default SettingsModal;
