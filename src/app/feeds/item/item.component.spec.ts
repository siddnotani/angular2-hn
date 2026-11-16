import { ItemComponent } from './item.component';
import { Story } from '../../shared/models/story';

describe('ItemComponent', () => {
  let savedIds: Set<number>;
  let component: ItemComponent;

  beforeEach(() => {
    savedIds = new Set();
    const savedPostsService: any = {
      isSaved: (id: number) => savedIds.has(id),
      toggle: (s: Story) => savedIds.has(s.id) ? savedIds.delete(s.id) : savedIds.add(s.id)
    };
    component = new ItemComponent({ settings: {} } as any, savedPostsService);
    component.item = { id: 7, url: 'https://example.com' } as Story;
  });

  it('reports whether the item is saved', () => {
    expect(component.isSaved).toBe(false);
    savedIds.add(7);
    expect(component.isSaved).toBe(true);
  });

  it('toggles the saved state of its item', () => {
    component.toggleSaved();
    expect(component.isSaved).toBe(true);
    component.toggleSaved();
    expect(component.isSaved).toBe(false);
  });
});
