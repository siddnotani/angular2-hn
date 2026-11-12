import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useUser } from '../../api/queries';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import { Loader } from '../../components/Loader/Loader';
import type { User as UserModel } from '../../models/user';
import { sanitizeHtml } from '../../utils/sanitizeHtml';
import './User.ng.scss';

// Port of UserComponent; reused across :id changes like ItemDetails.
export default function User() {
  const params = useParams();
  const userID = params.id!;
  const { data, isError } = useUser(userID);
  const navigate = useNavigate();

  const [user, setUser] = useState<UserModel>();
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (data) {
      setUser(data);
    }
  }, [data]);

  useEffect(() => {
    if (isError) {
      setErrorMessage('Could not load user ' + userID + '.');
    }
  }, [isError, userID]);

  return (
    <app-user ngHost="user">
      {!user && !errorMessage && <Loader />}
      {!user && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

      {user && (
        <div className="profile">
          <div className="mobile item-header">
            <p className="title-block">
              <span className="back-button" onClick={() => navigate(-1)}></span>{` Profile: ${user.id} `}
            </p>
          </div>
          <div className="main-details">
            <span className="name">{user.id}</span>
            <span className="right">{`${user.karma} ★`}</span>
            <p className="age">{`Created ${user.created}`}</p>
          </div>
          {user.about && (
            <div className="other-details">
              <p dangerouslySetInnerHTML={sanitizeHtml(user.about)}></p>
            </div>
          )}
        </div>
      )}
    </app-user>
  );
}
