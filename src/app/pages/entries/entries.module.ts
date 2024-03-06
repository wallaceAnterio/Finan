import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { IMaskModule } from 'angular-imask';
import { CalendarModule } from 'primeng/calendar';

import { EntriesRoutingModule } from './entries-routing.module';
import { EntryFormComponent } from './entry-form/entry-form.component';
import { EntryListComponent } from './entry-list/entry-list.component';

@NgModule({
  declarations: [EntryListComponent, EntryFormComponent],
  imports: [
    SharedModule,
    EntriesRoutingModule,
    CalendarModule,
    IMaskModule,
  ],
})
export class EntriesModule {}
