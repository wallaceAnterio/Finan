import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CategoriesRoutingModule } from './categories-routing.module';
import { CategoryFormComponent } from './category-form/category-form.component';
import { CategoryListComponent } from './category-list/category-list.component';
import { ModalConfirmComponent } from './shared/modal-confirm/modal-confirm.component';


@NgModule({
  declarations: [
    CategoryListComponent,
    CategoryFormComponent,
    ModalConfirmComponent
  ],
  imports: [
    CommonModule,
    CategoriesRoutingModule,
  ]
})
export class CategoriesModule { }
