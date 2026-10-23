import styles from './ErrorMessage.module.scss';

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className={styles.errorSection} role="alert">
      <div className={styles.skull}>
        <div className={styles.head}>
          <div className={styles.crack}></div>
        </div>
        <div className={styles.mouth}>
          <div className={styles.teeth}></div>
        </div>
      </div>
      <p className={styles.strong}>{message}</p>
      <p>
        If you are offline viewing, you'll need to visit this page with a network connection first
        before it can work offline.
      </p>
    </div>
  );
}
