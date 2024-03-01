import { AfterContentChecked, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
    private formBuider: FormBuilder
  ) {}

  ngOnInit(): void {
    this.setCurrentAction();
    this.buildCategoryForm();
    this.loadCategory();
  }

  ngAfterContentChecked(): void {
    this.setPageTitle();
  }

  // Private Methods
  private setCurrentAction() {
    if (this.actRoute.snapshot.url[0].path == 'new') {
      this.currentAction = 'new';
    } else {
      this.currentAction = 'edit';
    }
  }

  private buildCategoryForm() {
    this.categoryForm = this.formBuider.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(2)]],
      descriptin: [''],
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
}
