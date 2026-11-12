import { Link, useMatch, useResolvedPath, type LinkProps } from 'react-router-dom';

// `routerLink` + `routerLinkActive="active"`: adds `active` while the URL starts with the link's
// path and, unlike NavLink, renders no aria-current and no empty class attribute.
export function RouterLink({ className, to, ...props }: LinkProps & { className?: string }) {
  const active = useMatch({ path: useResolvedPath(to).pathname, end: false }) !== null;
  const classes = [className, active && 'active'].filter(Boolean).join(' ');
  return <Link {...props} to={to} className={classes || undefined} />;
}
