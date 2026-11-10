import { Component, Input } from '@angular/core';
@Component({ standalone: true, selector: 'app-badge', template: `<span class="badge" [class]="'badge b-' + texto">{{ texto }}</span>` })
export class BadgeComponent { @Input() texto = ''; }
