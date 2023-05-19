import { useRef } from "react";
import classes from "./Comment.module.css"

const CommentsForm = ({ L10n, language, addComment }) => {
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
        <button >{L10n[language].add_comment}</button>
      </form>
    </div>
  );
};

export default CommentsForm;