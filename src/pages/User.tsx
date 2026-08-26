import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchUser } from '../api/hnApi';
import ErrorMessage from '../components/error-message/ErrorMessage';
import Loader from '../components/loader/Loader';
import type { User as UserType } from '../types/user';
import './User.scss';

export default function User() {
    const { id } = useParams();
    const userID = id ?? '';
    const navigate = useNavigate();
    const [user, setUser] = useState<UserType | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const loadUser = useCallback(() => fetchUser(userID), [userID]);
    useEffect(() => {
        let cancelled = false;
        setUser(null); setErrorMessage('');
        loadUser().then((result) => { if (!cancelled) setUser(result); })
            .catch(() => { if (!cancelled) setErrorMessage(`Could not load user ${userID}.`); });
        return () => { cancelled = true; };
    }, [loadUser, userID]);
    return <>
        {!user && !errorMessage && <Loader />}
        {!user && errorMessage !== '' && <ErrorMessage message={errorMessage} />}
        {user && <div className="profile">
            <div className="mobile item-header"><p className="title-block">
                <span className="back-button" onClick={() => navigate(-1)}></span>Profile: {user.id}
            </p></div>
            <div className="main-details"><span className="name">{user.id}</span><span className="right">{user.karma} ★</span>
                <p className="age">Created {user.created}</p></div>
            {user.about && <div className="other-details"><p dangerouslySetInnerHTML={{ __html: user.about }}></p></div>}
        </div>}
    </>;
}
