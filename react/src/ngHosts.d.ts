import type { DetailedHTMLProps, HTMLAttributes } from 'react';

type HostProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & { ngHost?: string };

// Angular component host elements, rendered as-is so the DOM matches the Angular build.
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'app-loader': HostProps;
      'app-error-message': HostProps;
      'app-comment': HostProps;
      'app-item-details': HostProps;
      'app-user': HostProps;
    }
  }
}
