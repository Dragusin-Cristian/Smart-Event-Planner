import { useState } from "react";
import Link from "next/link";
import classes from "./ProfileEvent.module.css"

const ProfileEvent = ({ title, date, time, id, handleDelete, L10n, language, location }) => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className={`Card ${classes.CardEvent}`}>
      <div className="CardContent">
        <h2 className={classes.CardTitle}>{title}</h2>
        <p className={classes.dataP}>{L10n[language].date_word}: {date} </p>
        <p className={classes.dataP}>{L10n[language].time_word}: {time}</p>
        <p className={classes.dataP}>{L10n[language].location_word}: {location}</p>
        {!isLoading ?
          <>
            <button className={classes.deleteEventBtn} onClick={() => handleDelete(id, setIsLoading, setError)}>{L10n[language].delete_event}</button>
            <Link href={`/${id}/edit-event?language=${language}`}><button>{L10n[language].edit_event}</button></Link>
          </>
          : <p>{L10n[language].loading}...</p>
        }
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};

export default ProfileEvent;