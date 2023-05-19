import Link from "next/link";
import classes from "./ProfileEvent.module.css"

const ProfileEvent = ({ title, date, time, id, handleDelete, L10n, language, location }) => {

  return (
    <div className={`Card ${classes.CardEvent}`}>
      <div className="CardContent">
        <h2 className={classes.CardTitle}>{title}</h2>
      <p className={classes.dataP}>{L10n[language].date_word}: {date} </p>
      <p className={classes.dataP}>{L10n[language].time_word}: {time}</p>
      <p className={classes.dataP}>{L10n[language].location_word}: {location}</p>
      <button className={classes.deleteEventBtn} onClick={() => handleDelete(id)}>{L10n[language].delete_event}</button>
      <Link href={`/${id}/edit-event?language=${language}`}><button>{L10n[language].edit_event}</button></Link>
    </div>
    </div>
  );
};

export default ProfileEvent;