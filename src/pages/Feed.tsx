import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { fetchFeed } from '../api/hnApi';
import ErrorMessage from '../components/error-message/ErrorMessage';
import Item from '../components/item/Item';
import Loader from '../components/loader/Loader';
import type { Story } from '../types/story';
import './Feed.scss';

export default function Feed() {
    const { page } = useParams();
    const feedType = useLocation().pathname.split('/')[1];
    const pageNum = Number(page) || 1;
    const [items, setItems] = useState<Story[] | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [listStart, setListStart] = useState(1);
    const loadFeed = useCallback(() => fetchFeed(feedType, pageNum), [feedType, pageNum]);
    useEffect(() => {
        let cancelled = false;
        setItems(null); setErrorMessage('');
        loadFeed().then((result) => {
            if (!cancelled) { setItems(result); setListStart((pageNum - 1) * 30 + 1); window.scrollTo(0, 0); }
        }).catch(() => { if (!cancelled) setErrorMessage(`Could not load ${feedType} stories.`); });
        return () => { cancelled = true; };
    }, [loadFeed, pageNum, feedType]);
    return <div className="main-content">
        {!items && !errorMessage && <Loader />}
        {!items && errorMessage !== '' && <ErrorMessage message={errorMessage} />}
        {items && <>
            {feedType === 'jobs' && <p className="job-header">These are jobs at startups that were funded by Y Combinator.
                You can also get a job at a YC startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.</p>}
            <ol start={listStart} className={feedType !== 'jobs' ? 'list-margin' : undefined}>
                {items.map((item) => <li key={item.id} className="post"><Item className="item-block" item={item} /></li>)}
            </ol>
            <div className="nav">
                {listStart !== 1 && <Link to={`/${feedType}/${pageNum - 1}`} className="prev">‹ Prev</Link>}
                {items.length === 30 && <Link to={`/${feedType}/${pageNum + 1}`} className="more">More ›</Link>}
            </div>
        </>}
    </div>;
}
