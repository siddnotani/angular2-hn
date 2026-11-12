import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderApp } from '../../test/renderApp';

async function openSettings(path = '/news/1') {
  const view = renderApp(path);
  await waitFor(() => expect(view.container.querySelector('ol')).not.toBeNull());
  await userEvent.click(screen.getByAltText('Settings'));
  return view;
}

const theme = () => document.querySelector('.wrapper')!.parentElement!.className;
const radio = (label: string) => screen.getByRole('radio', { name: label });
const fontInput = () => screen.getByRole('spinbutton', { name: 'Font size:' }) as HTMLInputElement;
const spacingInput = () => screen.getByRole('spinbutton', { name: 'List spacing:' }) as HTMLInputElement;

describe('Settings panel', () => {
  it('renders the Angular structure and labels', async () => {
    const { container } = await openSettings();
    const popup = container.querySelector('#popup1.overlay > .popup')!;
    expect(popup.querySelector('h1')!.textContent).toBe('Settings');
    expect([...popup.querySelectorAll('h2')].map(h => h.textContent)).toEqual(['Links', 'Select a theme', 'Change Font']);
    expect(popup.querySelector('.control-section')!.textContent).toBe('Links Open links in a new tab ');
    expect([...popup.querySelectorAll('label')].map(l => l.textContent)).toEqual([
      ' Default ',
      ' Night ',
      ' Black (AMOLED) ',
      ' Font size: ',
      ' List spacing: ',
    ]);
    expect(fontInput()).toHaveAttribute('min', '1');
    expect(spacingInput()).toHaveAttribute('min', '0');
    expect(popup).toHaveAttribute('data-c-settings');
  });

  it('reflects the current settings', async () => {
    localStorage.setItem('theme', 'night');
    localStorage.setItem('openLinkInNewTab', 'true');
    localStorage.setItem('titleFontSize', '20');
    localStorage.setItem('listSpacing', '5');
    await openSettings();
    expect(radio('Night')).toBeChecked();
    expect(radio('Default')).not.toBeChecked();
    expect(screen.getByRole('checkbox')).toBeChecked();
    expect(fontInput().value).toBe('20');
    expect(spacingInput().value).toBe('5');
  });

  it.each([
    ['Night', 'night'],
    ['Black (AMOLED)', 'amoledblack'],
    ['Default', 'default'],
  ])('selecting %s applies and saves the theme', async (label, value) => {
    localStorage.setItem('theme', value === 'default' ? 'night' : 'default');
    await openSettings();
    await userEvent.click(radio(label));
    expect(theme()).toBe(value);
    expect(localStorage.getItem('theme')).toBe(value);
    expect(radio(label)).toBeChecked();
  });

  it('toggles open-in-new-tab, saves it and applies it to story links', async () => {
    const { container } = await openSettings();
    const external = () => container.querySelector('li.post a.title[href^="http"]')!;
    expect(external()).not.toHaveAttribute('target');
    await userEvent.click(screen.getByRole('checkbox'));
    expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    expect(external()).toHaveAttribute('target', '_blank');
    await userEvent.click(screen.getByRole('checkbox'));
    expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
    expect(external()).not.toHaveAttribute('target');
  });

  it('saves font size and list spacing on keyup and applies them to the list', async () => {
    const { container } = await openSettings();
    await userEvent.clear(fontInput());
    await userEvent.type(fontInput(), '22');
    await userEvent.clear(spacingInput());
    await userEvent.type(spacingInput(), '8');
    expect(localStorage.getItem('titleFontSize')).toBe('22');
    expect(localStorage.getItem('listSpacing')).toBe('8');
    expect((container.querySelector('li.post a.title') as HTMLElement).style.fontSize).toBe('22px');
    expect((container.querySelector('li.post .item-block > div') as HTMLElement).style.marginBottom).toBe('8px');
  });

  it('does not save a value changed without a keyup (e.g. the spinner arrows)', async () => {
    await openSettings();
    fireEvent.change(fontInput(), { target: { value: '30' } });
    expect(localStorage.getItem('titleFontSize')).toBeNull();
  });

  it('keeps settings after closing and reopening the panel', async () => {
    await openSettings();
    await userEvent.click(radio('Night'));
    await userEvent.click(screen.getByText('×'));
    await userEvent.click(screen.getByAltText('Settings'));
    expect(radio('Night')).toBeChecked();
  });
});
