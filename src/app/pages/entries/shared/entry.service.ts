import { Injectable, Injector } from '@angular/core';

import { Observable, mergeMap } from 'rxjs';
import { BaseResourceService } from '../../../shared/services/base-resource.service';
import { CategoryService } from '../../categories/shared/category.service';
import { Entry } from './entry.model';

@Injectable({
  providedIn: 'root',
})
export class EntryService extends BaseResourceService<Entry> {
  constructor(
    protected override injector: Injector,
    private categoryService: CategoryService
  ) {
    super('api/entries', injector);
  }

  override create(entry: Entry): Observable<Entry> {
    return this.categoryService.getById(entry.categoryId!).pipe(
      mergeMap((category) => {
        entry.category = category;
        return super.create(entry);
      })
    );
  }

  override update(entry: Entry): Observable<Entry> {
    const url = `${this.apiPath}/${entry.id}`;

    return this.categoryService.getById(entry.categoryId!).pipe(
      mergeMap((category) => {
        entry.category = category;
        return super.update(entry);
      })
    );
  }

  protected jsonDataToEntries(jsonData: any[]): Entry[] {
    const entries: Entry[] = [];

    jsonData.forEach((element) => {
      const entry = Object.assign(new Entry(), element);
      entries.push(entry);
    });
    return entries;
  }

  protected jsonDataToEntry(jsonData: any): Entry {
    return Object.assign(new Entry(), jsonData);
  }
}
