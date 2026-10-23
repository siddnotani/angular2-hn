import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { getUser } from '../../api/hackernews';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import { Loader } from '../../components/Loader/Loader';
import type { User } from '../../models/user';
import styles from './UserProfile.module.scss';

export function UserProfile() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setUser(null);
    setError('');
    setLoading(true);

    getUser(id, controller.signal)
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        if (controller.signal.aborted) {
          return;
        }
        setError(`Could not load user ${id}.`);
        setLoading(false);
      });

    return () => controller.abort();
  }, [id]);

  const goBack = () => navigate(-1);

  if (loading && !error) {
    return <Loader />;
  }

  if (error || !user) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className={styles.profile}>
      <div className={`${styles.mobile} ${styles.itemHeader}`}>
        <p className={styles.titleBlock}>
          <span className={styles.backButton} onClick={goBack} role="button" aria-label="Go back"></span>
          Profile: {user.id}
        </p>
      </div>
      <div className={styles.mainDetails}>
        <span className={styles.name}>{user.id}</span>
        <span className={styles.right}>{user.karma} ★</span>
        <p className={styles.age}>Created {user.created}</p>
      </div>
      {user.about && (
        <div className={styles.otherDetails}>
          <p dangerouslySetInnerHTML={{ __html: user.about }}></p>
        </div>
      )}
    </div>
  );
}
