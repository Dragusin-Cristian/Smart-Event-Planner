import { useRef } from 'react';
import classes from "./AuthForm.module.css";

const ChangePasswordForm = ({ language, L10n, handlePasswordChange }) => {
  const oldPassRef = useRef();
  const newPassRef = useRef();

  const submitHandler = (e) => {
    e.preventDefault();

    const oldPass = oldPassRef.current.value;
    const newPass = newPassRef.current.value;

    handlePasswordChange(oldPass, newPass);
  }

  return (
      <div className={classes.formContainer}>
        <form className={classes.form} onSubmit={submitHandler}>
          <div className="labelInputContainer">
            <label htmlFor="oldPass">{L10n[language].Current_password}:</label>
            <input name="oldPass" type="password" required ref={oldPassRef} />
          </div>
          <div className="labelInputContainer">
            <label htmlFor="newPass">{L10n[language].New_password}:</label>
            <input name="newPass" type="password" required ref={newPassRef} />
          </div>
          <button className={classes.authBtn}>{L10n[language].Change_Password}</button>
        </form>
      </div>
  );
};

export default ChangePasswordForm;