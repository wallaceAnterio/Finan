import { Component, OnInit } from '@angular/core';
import { Category } from '../shared/category.model';
import { CategoryService } from '../shared/category.service';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss',
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];

  onDelete = false;

  constructor(private categoriService: CategoryService) {}

  ngOnInit(): void {
    this.categoriService.getAll().subscribe({
      next: (categories) => {
        this.categories = categories;
        console.log(categories);
      },
      error: (error) => console.log(error),
    });
  }

  deleteCategory(category: Category) {
    const mustDelete = confirm('Deseja Reamlente deletar este item?');
    if (mustDelete) {
      this.categoriService
        .delete(category)
        .subscribe(
          () =>
            (this.categories = this.categories.filter(
              (element) => element != category
            ))
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
