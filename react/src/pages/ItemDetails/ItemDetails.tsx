import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useItem } from '../../api/queries';
import { Comment } from '../../components/Comment/Comment';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import { Loader } from '../../components/Loader/Loader';
import { RouterLink } from '../../components/RouterLink/RouterLink';
import type { Story } from '../../models/story';
import { useSettings } from '../../settings/SettingsContext';
import { formatCommentCount } from '../../utils/formatCommentCount';
import { sanitizeHtml } from '../../utils/sanitizeHtml';
import './ItemDetails.ng.scss';

// Port of ItemDetailsComponent. Angular reused it when only :id changed, so the previous item
// stays up until the next one arrives, and an error only shows if nothing has loaded yet.
export default function ItemDetails() {
  const params = useParams();
  const itemID = +params.id!;
  const { data, isError } = useItem(itemID);
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [item, setItem] = useState<Story>();
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (data) {
      setItem(data);
    }
  }, [data]);

  useEffect(() => {
    if (isError) {
      setErrorMessage('Could not load item comments.');
    }
  }, [isError]);

  const goBack = () => navigate(-1);
  const target = settings.openLinkInNewTab ? '_blank' : undefined;
  const rel = settings.openLinkInNewTab ? 'noopener' : undefined;

  return (
    <app-item-details>
      <div className="main-content">
        {!item && !errorMessage && <Loader />}
        {!item && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

        {item && <ItemBody item={item} goBack={goBack} target={target} rel={rel} />}
      </div>
    </app-item-details>
  );
}

interface BodyProps {
  item: Story;
  goBack: () => void;
  target?: string;
  rel?: string;
}

function ItemBody({ item, goBack, target, rel }: BodyProps) {
  const hasUrl = item.url.indexOf('http') === 0;
  const isJob = item.type === 'job';
  const laptopClass = ['laptop'];
  if (item.comments_count > 0 || isJob) {
    laptopClass.push('item-header');
  }
  // `[class.head-margin]="item.text"`: node-hnapi has no `text` field, kept for parity.
  if ((item as Story & { text?: string }).text) {
    laptopClass.push('head-margin');
  }

  return (
    <div className="item">
      <div className="mobile item-header">
        <p className="title-block">
          <span className="back-button" onClick={goBack}></span>
          {hasUrl && (
            <a className="title" href={item.url} target={target} rel={rel}>
              {` ${item.title} `}
            </a>
          )}
          {!hasUrl && (
            <RouterLink className="title" to={`/item/${item.id}`}>
              {` ${item.title} `}
            </RouterLink>
          )}
        </p>
      </div>
      <div className={laptopClass.join(' ')}>
        {hasUrl && (
          <p>
            <a className="title" href={item.url} target={target} rel={rel}>
              {` ${item.title} `}
            </a>
            {item.domain && <span className="domain">{`(${item.domain})`}</span>}
          </p>
        )}
        {!hasUrl && (
          <p>
            <RouterLink className="title" to={`/item/${item.id}`}>
              {` ${item.title} `}
            </RouterLink>
          </p>
        )}
        <div className="subtext">
          {!isJob && (
            <span>
              {` ${item.points} points by `}<RouterLink to={`/user/${item.user}`}>{item.user}</RouterLink>
            </span>
          )}
          <span className={isJob ? undefined : 'item-details'}>
            {` ${item.time_ago} `}
            {!isJob && (
              <span>
                {' | '}
                <RouterLink to={`/item/${item.id}`}>{` ${formatCommentCount(item.comments_count)} `}</RouterLink>
              </span>
            )}
          </span>
        </div>
      </div>
      {item.type === 'poll' && (
        <div className="pollResults">
          {item.poll!.map((pollResult, i) => (
            <div key={i} className="pollContent">
              <div dangerouslySetInnerHTML={sanitizeHtml(pollResult.content)}></div>
              <div className="subtext">{`${pollResult.points} points`}</div>
              <div className="pollBar" style={{ width: (pollResult.points / item.poll_votes_count!) * 100 + '%' }}></div>
            </div>
          ))}
        </div>
      )}
      <p className="subject" dangerouslySetInnerHTML={sanitizeHtml(item.content)}></p>
      <ul className="comment-list">
        {item.comments?.map(comment => (
          <li key={comment.id}>
            <Comment comment={comment} />
          </li>
        ))}
      </ul>
    </div>
  );
}
