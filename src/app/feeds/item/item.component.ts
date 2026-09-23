import { Component, Input } from '@angular/core';
import { Story } from '../../shared/models/story';

import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'item',
    templateUrl: './item.component.html',
    styleUrls: ['./item.component.scss'],
    standalone: false
})
export class ItemComponent {
  @Input() item: Story;
  settings: Settings;

  constructor(private _settingsService: SettingsService) {
    this.settings = this._settingsService.settings;
  }

  get hasUrl(): boolean {
    return this.item.url.indexOf('http') === 0;
  }

}
