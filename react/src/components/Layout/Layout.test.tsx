import { act, render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { useSettings } from '../../settings/SettingsContext';
import { SettingsProvider } from '../../settings/SettingsProvider';
import { mockColorScheme } from '../../test/matchMedia';
import { Layout } from './Layout';

let setTheme: (theme: string) => void;
function Page() {
  setTheme = useSettings().setTheme;
  return <p>page</p>;
}

function renderLayout() {
  return render(
    <SettingsProvider>
      <MemoryRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="*" element={<Page />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </SettingsProvider>,
  );
}

describe('Layout', () => {
  it('renders the AppComponent structure with the theme class on the outer element', () => {
    mockColorScheme(false);
    const { container } = renderLayout();
    const root = container.firstElementChild!;
    expect(root.className).toBe('default');
    expect(root.children[0]).toHaveClass('body-cover');
    expect(root.children[1]).toHaveClass('wrapper');
    expect(root.children[1]).toHaveTextContent('page');
  });

  it('scopes its elements like Angular emulated encapsulation', () => {
    mockColorScheme(false);
    const { container } = renderLayout();
    expect(container.querySelector('.body-cover')).toHaveAttribute('data-c-layout');
    expect(container.querySelector('.wrapper')).toHaveAttribute('data-c-layout');
  });

  it.each(['night', 'amoledblack', 'default'])('switches the root class to %s', theme => {
    mockColorScheme(false);
    const { container } = renderLayout();
    act(() => setTheme(theme));
    expect(container.firstElementChild!.className).toBe(theme);
  });

  it('starts on night for a dark system scheme', () => {
    mockColorScheme(true);
    expect(renderLayout().container.firstElementChild!.className).toBe('night');
  });
});
