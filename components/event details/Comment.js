import { useState } from "react";
import classes from "./Comment.module.css"

const Comment = ({ username, text, L10n, language, id, authenticated, isCommAuthor,
  deleteComment }) => {

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className={`Card ${classes.CardComment}`}>
      <div className="CardContent">
        <h3 className="CardTitle">{username}:</h3>
        <p className={classes.commContentP}>{text}</p>
        {authenticated && isCommAuthor &&
          (!isLoading ?
            <button
              className={classes.deleteCommBtn}
              onClick={() => deleteComment(id, setIsLoading, setError)}
            >
              {L10n[language].delete_word}
            </button>
            :
            <p>{L10n[language].loading}...</p>
          )
        }
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};

export default Comment;