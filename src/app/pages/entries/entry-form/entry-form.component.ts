import { AfterContentChecked, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { switchMap } from 'rxjs';
import { Entry } from '../shared/entry.model';
import { EntryService } from '../shared/entry.service';

@Component({
  selector: 'app-entry-form',
  templateUrl: './entry-form.component.html',
  styleUrl: './entry-form.component.scss',
})
export class EntryFormComponent implements OnInit, AfterContentChecked {
  currentAction!: string;
  entryForm!: FormGroup;
  pageTitle!: string;
  serverErrorMessages!: string[];
  submittingForm: boolean = false;

  entry: Entry = new Entry();

  constructor(
    private entryService: EntryService,
    private actRoute: ActivatedRoute,
    private router: Router,
    private formBuider: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.setCurrentAction();
    this.buildEntryForm();
    this.loadEntry();
  }

  ngAfterContentChecked(): void {
    this.setPageTitle();
  }

  submitForm() {
    this.submittingForm = true;

    if (this.currentAction == 'new') {
      this.createEntry();
    } else {
      this.updateEntry();
    }
  }

  // Private Methods
  private setCurrentAction() {
    if (this.actRoute.snapshot.url[0].path == 'new') {
      this.currentAction = 'new';
    } else {
      this.currentAction = 'edit';
    }
  }

  buildEntryForm() {
    this.entryForm = this.formBuider.group({
      id: [null],
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      type: ['', [Validators.required]],
      amount: ['', [Validators.required]],
      date: ['', [Validators.required]],
      paid: ['', [Validators.required]],
      caegoriId: ['', [Validators.required]],
    });
  }

  private loadEntry() {
    if (this.currentAction == 'edit') {
      this.actRoute.paramMap
        .pipe(
          switchMap((params) => this.entryService.getById(+params.get('id')!)) // O operador de verificação nula (!) para garantir que id não seja null antes de usá-lo.
        )
        .subscribe({
          next: (entry) => {
            this.entry = entry;
            this.entryForm.patchValue(entry); // binds loaded entry data to EntryForm
          },
          error: (error) => {
            alert('Ocorreu um erro no servidor, tente mais tarde!');
          },
        });
    }
  }

  private setPageTitle() {
    if (this.currentAction == 'new') {
      this.pageTitle = 'Cadastro de Nova Categoria';
    } else {
      const entryName = this.entry.name || '';
      this.pageTitle = 'Editando Categoria: ' + entryName;
    }
  }

  createEntry() {
    const entry: Entry = Object.assign(new Entry(), this.entryForm.value);

    this.entryService.create(entry).subscribe({
      next: (entry) => {
        this.actionForSuccess(entry);
      },
      error: (error) => {
        this.actionForError(error);
      },
    });
  }

  updateEntry() {
    const entry: Entry = Object.assign(new Entry(), this.entryForm.value);

    this.entryService.update(entry).subscribe({
      next: (entry) => {
        this.actionForSuccess(entry);
      },
      error: (error) => {
        this.actionForError(error);
      },
    });
  }

  private actionForSuccess(entry: Entry) {
    this.toastr.success('Solicitação processada com sucesso!');

    // redirect/reload component page
    this.router
      .navigateByUrl('categories', { skipLocationChange: true })
      .then(() => this.router.navigate(['categories', entry.id, 'edit']));
  }

  private actionForError(error: any) {
    this.toastr.error('Ocorreu um erro ao processar a sua solicitação!');

    this.submittingForm = false;

    if (error.status === 422) {
      this.serverErrorMessages = JSON.parse(error._body).console.errors;
    } else {
      this.serverErrorMessages = [
        'Falha na comunicação com o servidor. Por favor tente mais tarde',
      ];
    }
  }
}
