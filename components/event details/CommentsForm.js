import { useRef } from "react";
import classes from "./Comment.module.css"

const CommentsForm = ({ L10n, language, addComment, isLoadingComment, errorComment }) => {
  const commentRef = useRef();

  const submitHandler = (e) => {
    e.preventDefault();
    const comment = commentRef.current.value;
    addComment(comment);
    commentRef.current.value = "";
  }
  return (
    <div>
      <form className={classes.commentsForm} onSubmit={submitHandler}>
        <textarea type="text" required ref={commentRef} />
        {!isLoadingComment
          ?
          <button>
            {L10n[language].add_comment}
          </button>
          :
          <p>{L10n[language].loading}...</p>
        }
        {errorComment && <p className="error">{errorComment}</p>}
      </form>
    </div>
  );
};

export default CommentsForm;