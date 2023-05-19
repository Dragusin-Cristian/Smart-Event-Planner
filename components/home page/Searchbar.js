import { useRef } from "react";
import classes from "./Searchbar.module.css";

const Searchbar = ({ onSearch, language, value, L10n }) => {
  const inputRef = useRef();

  const submitHandler = (e) => {
    e.preventDefault();
    const value = inputRef.current.value;
    onSearch(value);
  }
  return (
    <div className={classes.Container}>
      <form className={classes.form} onSubmit={submitHandler}>
        <label className={`special-big ${classes.SpecialLabel}`}>{L10n[language].Search_for_event}:</label>
        <input type='search' name='filter-events' ref={inputRef} defaultValue={value} />
        <button>{L10n[language].search_button}</button>
      </form>
    </div>
  );
};

export default Searchbar;