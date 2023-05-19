import { useRef, useState } from 'react';
import classes from "./AuthForm.module.css";

const AuthForm = ({ handleAuth, language, L10n }) => {
  const emailRef = useRef();
  const passRef = useRef();
  const usernameRef = useRef();
  const confirmPassRef = useRef();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState(null);

  const submitHandler = (e) => {
    e.preventDefault();
    const email = emailRef.current.value;
    const pass = passRef.current.value;
    const confirmPass = confirmPassRef.current?.value;
    const username = usernameRef.current?.value;
    if (!isLogin && (pass !== confirmPass)) {
      setError(L10n[language].passwords_do_not_match_text);
    } else {
      handleAuth(email, pass, isLogin, username);
    }
  }

  const changeFromHandler = (e) => {
    e.preventDefault();
    setIsLogin(oldState => !oldState);
  }

  const buttonText = isLogin ? L10n[language].login : L10n[language].signup;
  const changeFormText = isLogin ? L10n[language].no_account_text : L10n[language].already_registered_text;

  return (
    <div className={classes.formContainer}>
      <form className={classes.form} onSubmit={submitHandler}>
        {!isLogin &&
          <div className="labelInputContainer">
            <label htmlFor="username">{L10n[language].username}:</label>
            <input name="username" type="text" required ref={usernameRef} />
          </div>}
        <div className="labelInputContainer">
          <label htmlFor="email">{L10n[language].email_word}:</label>
          <input name="email" type="email" required ref={emailRef} />
        </div>
        <div className="labelInputContainer">
          <label htmlFor="pass">{L10n[language].password_word}:</label>
          <input name="pass" type="password" required ref={passRef} />
        </div>
        {!isLogin &&
          <div className="labelInputContainer">
            <label htmlFor="confirm_pass">{L10n[language].confirm_password}:</label>
            <input name="confirm_pass" type="password" required ref={confirmPassRef} />
          </div>}
        <button className={classes.authBtn}>{buttonText}</button>
      </form>
      <p className={classes.ErrorP}>{error}</p>
      <a className={classes.ChangeFormTypeA} onClick={changeFromHandler}>{changeFormText}</a>
    </div>
  );
};

export default AuthForm;