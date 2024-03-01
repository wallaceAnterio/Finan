import { AfterContentChecked, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { switchMap } from 'rxjs';
import { Category } from '../shared/category.model';
import { CategoryService } from '../shared/category.service';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.scss',
})
export class CategoryFormComponent implements OnInit, AfterContentChecked {
  currentAction!: string;
  categoryForm!: FormGroup;
  pageTitle!: string;
  serverErrorMessages!: string[];
  submittingForm: boolean = false;

  category: Category = new Category();

  constructor(
    private categoryService: CategoryService,
    private actRoute: ActivatedRoute,
    private router: Router,
    private formBuider: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.setCurrentAction();
    this.buildCategoryForm();
    this.loadCategory();
  }

  ngAfterContentChecked(): void {
    this.setPageTitle();
  }

  submitForm() {
    this.submittingForm = true;

    if (this.currentAction == 'new') {
      this.createCategory();
    } else {
      this.updateCategory();
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

  buildCategoryForm() {
    this.categoryForm = this.formBuider.group({
      id: [null],
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
    });
  }

  private loadCategory() {
    if (this.currentAction == 'edit') {
      this.actRoute.paramMap
        .pipe(
          switchMap((params) =>
            this.categoryService.getById(+params.get('id')!)
          ) // O operador de verificação nula (!) para garantir que id não seja null antes de usá-lo.
        )
        .subscribe({
          next: (category) => {
            this.category = category;
            this.categoryForm.patchValue(category); // binds loaded category data to CategoryForm
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
      const categoryName = this.category.name || '';
      this.pageTitle = 'Editando Categoria: ' + categoryName;
    }
  }

  createCategory() {
    const category: Category = Object.assign(
      new Category(),
      this.categoryForm.value
    );

    this.categoryService.create(category).subscribe({
      next: (category) => {
        this.actionForSuccess(category);
      },
      error: (error) => {
        this.actionForError(error);
      },
    });
  }

  updateCategory() {
    const category: Category = Object.assign(
      new Category(),
      this.categoryForm.value
    );

    this.categoryService.update(category).subscribe({
      next: (category) => {
        this.actionForSuccess(category);
      },
      error: (error) => {
        this.actionForError(error);
      },
    });
  }

  private actionForSuccess(category: Category) {
    this.toastr.success('Solicitação processada com sucesso!');

    // redirect/reload component page
    this.router
      .navigateByUrl('categories', { skipLocationChange: true })
      .then(() => this.router.navigate(['categories', category.id, 'edit']));
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
