import styles from './Loader.module.scss';

export function Loader() {
  return (
    <div className={styles.loadingSection} data-testid="loader">
      <div className={styles.loader}>Loading...</div>
    </div>
  );
}
