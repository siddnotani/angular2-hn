import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { SettingsService } from './shared/services/settings.service';
import { Settings } from './shared/models/settings';

declare let ga: (...args: unknown[]) => void;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})

export class AppComponent {
  settings: Settings;
  theme: string;

  constructor(
    private _settingsService: SettingsService,
    public router: Router
  ) {
    this.settings = this._settingsService.settings;
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        ga('set', 'page', event.urlAfterRedirects);
        ga('send', 'pageview');
      }
    });
  }
}
