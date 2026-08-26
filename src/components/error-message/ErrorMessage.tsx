import './ErrorMessage.scss';

export default function ErrorMessage({ message }: { message: string }) {
    return (
        <div className="error-section">
            <div className="skull">
                <div className="head"><div className="crack"></div></div>
                <div className="mouth"><div className="teeth"></div></div>
            </div>
            <p className="strong">{message}</p>
            <p>If you are offline viewing, you'll need to visit this page with a network connection first before it can work offline.</p>
        </div>
    );
}
