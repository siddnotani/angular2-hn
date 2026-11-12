import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useFeed } from '../../api/queries';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import { Item } from '../../components/Item/Item';
import { Loader } from '../../components/Loader/Loader';
import type { Feed as FeedName } from '../../models/feedType';
import type { Story } from '../../models/story';
import './Feed.ng.scss';

// Port of FeedComponent. Mount with `key={feedType}`: Angular reused the component across page
// changes of one feed (the old list stays up until the next page arrives, with no loader) and
// created a new one per feed. A failed load only shows the error if no page has loaded yet.
// `start` is set through the ref so that, like `start="{{ listStart }}"`, NaN is still written.
export function Feed({ feedType }: { feedType: FeedName }) {
  const params = useParams();
  const pageNum = params.page ? +params.page : 1;
  const { data, isError } = useFeed(feedType, pageNum);

  const [items, setItems] = useState<Story[]>();
  const [listStart, setListStart] = useState<number>();
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (data) {
      setItems(data);
      setListStart((pageNum - 1) * 30 + 1);
      window.scrollTo(0, 0);
    }
  }, [data, pageNum]);

  useEffect(() => {
    if (isError) {
      setErrorMessage('Could not load ' + feedType + ' stories.');
    }
  }, [isError, feedType]);

  return (
    <div className="main-content">
      {!items && !errorMessage && <Loader />}
      {!items && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

      {items && (
        <div>
          {feedType === 'jobs' && (
            <p className="job-header">
              {' '}These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC startup
              through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.{' '}
            </p>
          )}
          <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} ref={ol => ol?.setAttribute('start', String(listStart))}>
            {items.map(item => (
              <li key={item.id} className="post">
                <div className="item-block">
                  <Item item={item} />
                </div>
              </li>
            ))}
          </ol>
          <div className="nav">
            {listStart !== 1 && (
              <Link to={`/${feedType}/${pageNum - 1}`} className="prev">
                {' '}‹ Prev{' '}
              </Link>
            )}
            {items.length === 30 && (
              <Link to={`/${feedType}/${pageNum + 1}`} className="more">
                {' '}More ›{' '}
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
