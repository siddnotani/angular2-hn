import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchItemContent } from '../api/hnApi';
import Comment from '../components/comment/Comment';
import ErrorMessage from '../components/error-message/ErrorMessage';
import Loader from '../components/loader/Loader';
import { useSettings } from '../context/SettingsContext';
import type { Story } from '../types/story';
import { formatCommentCount } from '../utils/formatCommentCount';
import './ItemDetails.scss';

export default function ItemDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [item, setItem] = useState<Story | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const loadItem = useCallback(() => fetchItemContent(Number(id)), [id]);

    useEffect(() => {
        window.scrollTo(0, 0);
        let cancelled = false;
        setItem(null);
        setErrorMessage('');
        loadItem().then((result) => { if (!cancelled) setItem(result); })
            .catch(() => { if (!cancelled) setErrorMessage('Could not load item comments.'); });
        return () => { cancelled = true; };
    }, [loadItem]);

    const hasUrl = !!item?.url && item.url.indexOf('http') === 0;
    const externalProps = settings.openLinkInNewTab ? { target: '_blank', rel: 'noopener' } : {};
    return <div className="main-content">
        {!item && !errorMessage && <Loader />}
        {!item && errorMessage !== '' && <ErrorMessage message={errorMessage} />}
        {item && <div className="item">
            <div className="mobile item-header"><p className="title-block">
                <span className="back-button" onClick={() => navigate(-1)}></span>
                {hasUrl ? <a className="title" href={item.url} {...externalProps}>{item.title}</a> : <Link className="title" to={`/item/${item.id}`}>{item.title}</Link>}
            </p></div>
            <div className={`laptop${item.comments_count > 0 || item.type === 'job' ? ' item-header' : ''}${item.text ? ' head-margin' : ''}`}>
                {hasUrl ? <p><a className="title" href={item.url} {...externalProps}>{item.title}</a>{item.domain && <span className="domain">({item.domain})</span>}</p>
                    : <p><Link className="title" to={`/item/${item.id}`}>{item.title}</Link></p>}
                <div className="subtext">
                    {item.type !== 'job' && <span>{item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link></span>}
                    <span className={item.type !== 'job' ? 'item-details' : ''}>{item.time_ago}
                        {item.type !== 'job' && <span> | <Link to={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</Link></span>}
                    </span>
                </div>
            </div>
            {item.type === 'poll' && <div className="pollResults">
                {item.poll?.map((pollResult, index) => <div key={index} className="pollContent">
                    <div dangerouslySetInnerHTML={{ __html: pollResult.content }}></div>
                    <div className="subtext">{pollResult.points} points</div>
                    <div className="pollBar" style={{ width: `${pollResult.points / (item.poll_votes_count || 1) * 100}%` }}></div>
                </div>)}
            </div>}
            <p className="subject" dangerouslySetInnerHTML={{ __html: item.content ?? '' }}></p>
            <ul className="comment-list">{item.comments?.map((comment) => <li key={comment.id}><Comment comment={comment} /></li>)}</ul>
        </div>}
    </div>;
}
