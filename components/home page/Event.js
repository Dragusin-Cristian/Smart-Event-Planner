import { useContext } from "react";
import Link from "next/link";
import classes from "./Event.module.css";
import { LanguageContext } from "../../context/language-context";

const Event = ({ id, title, startDate, startTime, location, description, L10n }) => {
  const { language } = useContext(LanguageContext);

  const descrStr = description.length > 270 ? description.slice(0, 270) + "..." : description;
  return (
    <div className="Card CardEvent">
      <div className="CardContent">
        <h2 className="EventCardTitle">{title}</h2>
        <marquee>{startDate} - {startTime} - {location.toUpperCase()} - {L10n[language].See_you_there}!</marquee>
        <p className={classes.DescrPara}>{descrStr}</p>
        <Link href={`/${id}?language=${language}`}>
          <button>{L10n[language].event_details_button}</button>
        </Link>
      </div>
    </div>
  );
};

export default Event;