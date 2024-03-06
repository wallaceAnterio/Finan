import { AfterContentChecked, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { switchMap } from 'rxjs';
import { Category } from '../../categories/shared/category.model';
import { CategoryService } from '../../categories/shared/category.service';
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
  categories!: Category[];

  entry: Entry = new Entry();

  imaskConfig = {
    mask: Number,
    scale: 2,
    thousandsSeparator: '',
    padFractionalZeros: true,
    normalizeZeros: true,
    radix: ',',
  };

  ptBR = {
    firstDayOfWeek: 0,
    dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
    dayNamesMin: ['Do', 'Se', 'Te', 'Qu', 'Qu', 'Se', 'Sa'],
    monthNames: [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho',
      'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ],
    monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    today: 'Hoje',
    clear: 'Limpar'
  }

  get typeOptions(): Array<any> {
    return Object.entries(Entry.types).map(([value, text]) => {
      return {
        text: text,
        value: value,
      };
    });
  }

  constructor(
    private entryService: EntryService,
    private categoryService: CategoryService,
    private actRoute: ActivatedRoute,
    private router: Router,
    private formBuider: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.setCurrentAction();
    this.buildEntryForm();
    this.loadEntry();
    this.loadCategory();
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
      type: ['expense', [Validators.required]],
      amount: ['', [Validators.required]],
      date: ['', [Validators.required]],
      paid: [true, [Validators.required]],
      categoryId: ['', [Validators.required]],
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

  private loadCategory(){
    this.categoryService.getAll().subscribe(categories => this.categories = categories)
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
      .navigateByUrl('entries', { skipLocationChange: true })
      .then(() => this.router.navigate(['entries', entry.id, 'edit']));
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
