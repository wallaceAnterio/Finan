import { Component, OnInit } from '@angular/core';
import { Entry } from '../shared/entry.model';
import { EntryService } from '../shared/entry.service';

@Component({
  selector: 'app-entry-list',
  templateUrl: './entry-list.component.html',
  styleUrl: './entry-list.component.scss',
})
export class EntryListComponent implements OnInit {
  entries: Entry[] = [];

  onDelete = false;

  constructor(private entryService: EntryService) {}

  ngOnInit(): void {
    this.listingEntries();
  }

  listingEntries() {
    this.entryService.getAll().subscribe({
      next: (entries) => {
        this.entries = entries.sort((a, b) => b.id! - a.id!);
      },
      error: (error) => console.log(error),
    });
  }

  deleteEntry(entry: Entry) {
    const mustDelete = confirm('Deseja Reamlente deletar este item?');
    if (mustDelete) {
      this.entryService
        .delete(entry)
        .subscribe(
          () =>
            (this.entries = this.entries.filter((element) => element != entry))
        );
    }
  }
  confirmar() {
    console.log('confirmou');
  }
  cancelar() {
    console.log('cancelou');
  }
}
