import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, map, throwError } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';

import { CategoryService } from '../../categories/shared/category.service';
import { Entry } from './entry.model';

@Injectable({
  providedIn: 'root',
})
export class EntryService {
  private apiPath = 'api/entries';

  constructor(
    private http: HttpClient,
    private categoryService: CategoryService
  ) {}

  getAll(): Observable<Entry[]> {
    return this.http
      .get(this.apiPath)
      .pipe(catchError(this.handleError), map(this.jsonDataToEntries));
  }

  getById(id: number): Observable<Entry> {
    const url = `${this.apiPath}/${id}`;

    return this.http
      .get(url)
      .pipe(catchError(this.handleError), map(this.jsonDataToEntry));
  }

  create(entry: Entry): Observable<Entry> {
    // entry.categoryId // 1 => Morada
    // entry.category = category // null / antes da alteração estava retornando null

    // criando um relacionamento entre uma entrade de despesa/receita com a categoria.
    // criando uma relação entre, o Entry/despesa/receita a category/categoria da despesa/receita, manualmente.
    // estou fazendo essa configuração aui, porque estou utilizando o in-memory-web-api
    //  TODO! Criar esse realcionamento no backend diréto. NO (.NET)
    return this.categoryService.getById(entry.categoryId!).pipe(
      mergeMap((category) => {
        entry.category = category;

        return this.http
          .post(this.apiPath, entry)
          .pipe(catchError(this.handleError), map(this.jsonDataToEntry));
      })
    );
  }

  // segue o mesmo raciocinio que o método create
  update(entry: Entry): Observable<Entry> {
    const url = `${this.apiPath}/${entry.id}`;

    return this.categoryService.getById(entry.categoryId!).pipe(
      mergeMap((category) => {
        entry.category = category;

        return this.http.put(url, entry).pipe(
          catchError(this.handleError),
          map(() => entry)
        );
      })
    );
  }

  delete(entry: Entry): Observable<any> {
    const url = `${this.apiPath}/${entry.id}`;

    return this.http.delete(url).pipe(
      catchError(this.handleError),
      map(() => null)
    );
  }

  // Private methods
  private jsonDataToEntries(jsonData: any[]): Entry[] {
    const entries: Entry[] = [];

    jsonData.forEach((element) => {
      const entry = Object.assign(new Entry(), element);
      entries.push(entry);
    });
    return entries;
  }

  private jsonDataToEntry(jsonData: any): Entry {
    return Object.assign(new Entry(), jsonData);
  }

  private handleError(error: any): Observable<any> {
    console.log('Erro na requisição!! => ', error);
    return throwError(() => new Error(error));
  }
}
