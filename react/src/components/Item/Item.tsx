import { Link } from 'react-router-dom';

import type { Story } from '../../models/story';
import { useSettings } from '../../settings/SettingsContext';
import { formatCommentCount } from '../../utils/formatCommentCount';
import './Item.ng.scss';

// Port of the feeds ItemComponent. Text nodes keep the single leading/trailing spaces that
// Angular's whitespace collapsing leaves in the template, so inline layout matches.
export function Item({ item }: { item: Story }) {
  const { settings } = useSettings();
  const hasUrl = item.url.indexOf('http') === 0;
  const titleStyle = { fontSize: `${settings.titleFontSize}px` };
  const isJob = item.type === 'job';

  return (
    <div style={{ marginBottom: `${settings.listSpacing}px` }}>
      {hasUrl && (
        <p>
          <a
            className="title"
            style={titleStyle}
            href={item.url}
            target={settings.openLinkInNewTab ? '_blank' : undefined}
            rel={settings.openLinkInNewTab ? 'noopener' : undefined}
          >
            {' '}{item.title}{' '}
          </a>
          {item.domain && <span className="domain">({item.domain})</span>}
        </p>
      )}
      {!hasUrl && (
        <p>
          <Link className="title" style={titleStyle} to={`/item/${item.id}`}>
            {' '}{item.title}{' '}
          </Link>
        </p>
      )}
      <div className="subtext-palm">
        {!isJob && (
          <div className="details">
            <span className="name">
              <Link to={`/user/${item.user}`}>{item.user}</Link>
            </span>
            <span className="right">{item.points} ★</span>
          </div>
        )}
        <div className="details">
          {' '}{item.time_ago}{' '}
          {!isJob && (
            <Link to={`/item/${item.id}`} className="comment-number">
              {' '}• {formatCommentCount(item.comments_count)}{' '}
            </Link>
          )}
        </div>
      </div>
      <div className="subtext-laptop">
        {!isJob && (
          <span>
            {' '}{item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>
          </span>
        )}
        <span className={isJob ? undefined : 'item-details'}>
          {' '}{item.time_ago}{' '}
          {!isJob && (
            <span>
              {' '}|{' '}
              <Link to={`/item/${item.id}`}> {formatCommentCount(item.comments_count)} </Link>
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
