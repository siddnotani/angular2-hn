import { Component, type ReactNode } from 'react';

interface Props {
  resetKey: string;
  children: ReactNode;
}

interface State {
  resetKey: string;
  failed: boolean;
}

// An exception in an Angular template only broke that component; in React it would unmount
// the whole app. This renders nothing in place of the failed subtree until `resetKey` changes.
export class RenderErrorBoundary extends Component<Props, State> {
  state: State = { resetKey: this.props.resetKey, failed: false };

  static getDerivedStateFromError(): Partial<State> {
    return { failed: true };
  }

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    return props.resetKey !== state.resetKey ? { resetKey: props.resetKey, failed: false } : null;
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
