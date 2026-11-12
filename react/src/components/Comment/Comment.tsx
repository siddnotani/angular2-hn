import { useState } from 'react';
import { NavLink } from 'react-router-dom';

import type { Comment as CommentModel } from '../../models/comment';
import { sanitizeHtml } from '../../utils/sanitizeHtml';
import './Comment.ng.scss';

// Port of CommentComponent. Each comment owns its collapse state (starts expanded); collapsing
// only hides the subtree with `hidden`, so child comments keep their own state when reopened.
export function Comment({ comment }: { comment: CommentModel }) {
  const [collapse, setCollapse] = useState(false);

  return (
    <app-comment ngHost="comment">
      {!comment.deleted && (
        <div>
          <div className={collapse ? 'meta meta-collapse' : 'meta'}>
            <span className="collapse" onClick={() => setCollapse(!collapse)}>
              [{collapse ? '+' : '-'}]
            </span>
            <NavLink to={`/user/${comment.user}`}>{comment.user}</NavLink>
            <span className="time">{comment.time_ago}</span>
          </div>
          <div className="comment-tree">
            <div hidden={collapse}>
              <p className="comment-text" dangerouslySetInnerHTML={sanitizeHtml(comment.content)}></p>
              <ul className="subtree">
                {comment.comments.map(subComment => (
                  <li key={subComment.id}>
                    <Comment comment={subComment} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      {comment.deleted && (
        <div>
          <div className="deleted-meta">
            <span className="collapse">[deleted]</span> | Comment Deleted{' '}
          </div>
        </div>
      )}
    </app-comment>
  );
}
