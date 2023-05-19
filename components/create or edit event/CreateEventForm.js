import classes from "./CreateEventForm.module.css";

const CreateEventForm = ({ handleEvent, L10n, language, titleRef,
  timeRef, dateRef, locationRef, descriptionRef, isAdd }) => {

  const submitHandler = (e) => {
    e.preventDefault();
    handleEvent();
  }

  return (
    <form className={classes.form} onSubmit={submitHandler}>
      <div className="labelInputContainer">
        <label htmlFor="title">{L10n[language].title_word}:</label>
        <input className={classes.createEventInput} name="title" type="text" required ref={titleRef} />
      </div>
      <div className="labelInputContainer">
        <label htmlFor="date">{L10n[language].date_word}:</label>
        <input className={classes.createEventInput} name="date" type="date" required ref={dateRef} />
      </div>
      <div className="labelInputContainer">
        <label htmlFor="time">{L10n[language].time_word}:</label>
        <input className={classes.createEventInput} name="time" type="time" required ref={timeRef} />
      </div>
      <div className="labelInputContainer">
        <label htmlFor="location">{L10n[language].location_word}:</label>
        <input className={classes.createEventInput} name="location" type="text" required ref={locationRef} />
      </div>
      <div>
        <label htmlFor="description">{L10n[language].description_word}:</label>
        <textarea className={classes.createEventInput} name="description" type="text" required ref={descriptionRef} />
      </div>
      <button>{isAdd ? L10n[language].add_event : L10n[language].edit_event}</button>
    </form>
  );
};

export default CreateEventForm;