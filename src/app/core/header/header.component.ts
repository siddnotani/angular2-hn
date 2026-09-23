import { Component, ChangeDetectionStrategy } from '@angular/core';

import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class HeaderComponent {
  settings: Settings;

  constructor(private _settingsService: SettingsService) {
    this.settings = this._settingsService.settings;
  }

  toggleSettings() {
    this._settingsService.toggleSettings();
  }

  scrollTop() {
    window.scrollTo(0, 0);
  }
}
