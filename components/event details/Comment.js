import classes from "./Comment.module.css"

const Comment = ({ username, text, L10n, language, deleteComment, id, authenticated, isCommAuthor }) => {
  return (
    <div className={`Card ${classes.CardComment}`}>
      <div className="CardContent">
        <h3 className="CardTitle">{username}:</h3>
        <p className={classes.commContentP}>{text}</p>
        {authenticated && isCommAuthor && <button className={classes.deleteCommBtn} onClick={() => deleteComment(id)}>{L10n[language].delete_word}</button>}
      </div>
    </div>
  );
};

export default Comment;