import ProfileEvent from './ProfileEvent';

const ProfileEventsList = ({ events, handleDelete, L10n, language }) => {

  return (
    <div>
      {events?.map((e, i) => {
        return (
          <ProfileEvent
            key={i}
            title={e.title}
            date={e.date}
            time={e.time}
            id={e.id}
            handleDelete={handleDelete}
            L10n={L10n}
            language={language}
            location={e.location}
          />)
      })}
    </div>
  );
};

export default ProfileEventsList;