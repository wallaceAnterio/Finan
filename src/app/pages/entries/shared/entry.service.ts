import { Injectable, Injector } from '@angular/core';

import { Observable, catchError, mergeMap } from 'rxjs';
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
    super('api/entries', injector, Entry.fromJson);
  }

  override create(entry: Entry): Observable<Entry> {
    return this.setCategoryAndSendToServer(entry, super.create);
  }

  override update(entry: Entry): Observable<Entry> {
    return this.setCategoryAndSendToServer(entry, super.update);
  }

  private setCategoryAndSendToServer(entry: Entry, sendFn: any) {
    return this.categoryService.getById(entry.categoryId!).pipe(
      mergeMap((category) => {
        entry.category = category;
        return sendFn(entry);
      }),
      catchError(this.handleError)
    );
  }
}
