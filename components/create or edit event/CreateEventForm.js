import classes from "./CreateEventForm.module.css";

const CreateEventForm = ({ handleEvent, L10n, language, titleRef,
  startTimeRef, endTimeRef, startDateRef, endDateRef, locationRef, descriptionRef, isAdd, isLoading, error }) => {

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
        <label htmlFor="startDate">{L10n[language].start_date}:</label>
        <input className={classes.createEventInput} name="startDate" type="date" min={new Date().toISOString().split('T')[0]} required ref={startDateRef} />
      </div>
      <div className="labelInputContainer">
        <label htmlFor="startTime">{L10n[language].start_time}:</label>
        <input className={classes.createEventInput} name="startTime" type="time" required ref={startTimeRef} />
      </div>
      <div className="labelInputContainer">
        <label htmlFor="endDate">{L10n[language].end_date}:</label>
        <input className={classes.createEventInput} name="endDate" type="date" min={new Date().toISOString().split('T')[0]} required ref={endDateRef} />
      </div>
      <div className="labelInputContainer">
        <label htmlFor="endTime">{L10n[language].end_time}:</label>
        <input className={classes.createEventInput} name="endTime" type="time" required ref={endTimeRef} />
      </div>
      <div className="labelInputContainer">
        <label htmlFor="location">{L10n[language].location_word}:</label>
        <input className={classes.createEventInput} name="location" type="text" required ref={locationRef} />
      </div>
      <div>
        <label htmlFor="description">{L10n[language].description_word}:</label>
        <textarea className={classes.createEventInput} name="description" type="text" required ref={descriptionRef} />
      </div>
      {!isLoading
        ?
        <button>
          {isAdd
            ?
            L10n[language].add_event
            :
            L10n[language].edit_event
          }
        </button>
        :
        <p>{L10n[language].loading}...</p>
      }
      {!isLoading && <p className={error ? "error" : ""}>{error}</p>}
    </form>
  );
};

export default CreateEventForm;