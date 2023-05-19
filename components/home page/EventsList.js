import Event from "./Event";
import classes from "./Event.module.css"

const EventsList = ({ events, L10n }) => {
  return (
    <div className={classes.CardsList}>
      {events.map((event, index) => {
        return <Event {...event} L10n={L10n} />
      })}
    </div>
  );
};

export default EventsList;