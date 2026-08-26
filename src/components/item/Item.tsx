import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import type { Story } from '../../types/story';
import { formatCommentCount } from '../../utils/formatCommentCount';
import './Item.scss';

export default function Item({ item, className }: { item: Story; className?: string }) {
    const { settings } = useSettings();
    const hasUrl = !!item.url && item.url.indexOf('http') === 0;
    const titleStyle = { fontSize: `${settings.titleFontSize}px` };
    const externalProps = settings.openLinkInNewTab ? { target: '_blank', rel: 'noopener' } : {};
    return (
        <div className={className} style={{ marginBottom: `${settings.listSpacing}px` }}>
            {hasUrl ? <p><a className="title" style={titleStyle} href={item.url} {...externalProps}>{item.title}</a>
                {item.domain && <span className="domain">({item.domain})</span>}</p>
                : <p><Link className="title" style={titleStyle} to={`/item/${item.id}`}>{item.title}</Link></p>}
            <div className="subtext-palm">
                {item.type !== 'job' && <div className="details"><span className="name"><Link to={`/user/${item.user}`}>{item.user}</Link></span><span className="right">{item.points} ★</span></div>}
                <div className="details">{item.time_ago}{item.type !== 'job' && <Link to={`/item/${item.id}`} className="comment-number"> • {formatCommentCount(item.comments_count)}</Link>}</div>
            </div>
            <div className="subtext-laptop">
                {item.type !== 'job' && <span>{item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link></span>}
                <span className={item.type !== 'job' ? 'item-details' : ''}>{item.time_ago}
                    {item.type !== 'job' && <span> | <Link to={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</Link></span>}
                </span>
            </div>
        </div>
    );
}
