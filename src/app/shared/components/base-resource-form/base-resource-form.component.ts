import {
    AfterContentChecked,
    Directive,
    Injector,
    OnInit,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { switchMap } from 'rxjs';
import { BaseResourceModel } from '../../models/base-resource-model';
import { BaseResourceService } from '../../services/base-resource.service';

@Directive()
export abstract class BaseResourceFormComponent<T extends BaseResourceModel>
  implements OnInit, AfterContentChecked
{
  currentAction!: string;
  resourceForm!: FormGroup;
  pageTitle!: string;
  submittingForm: boolean = false;
  serverErrorMessages!: string[];

  protected actRoute: ActivatedRoute;
  protected router: Router;
  protected formBuider: FormBuilder;
  private toastr!: ToastrService;

  constructor(
    protected injector: Injector,
    public resource: T,
    protected resourceService: BaseResourceService<T>,
    protected jsonDataToResourceFn: (jsonData: any) => T
  ) {
    this.actRoute = this.injector.get(ActivatedRoute);
    this.router = this.injector.get(Router);
    this.formBuider = this.injector.get(FormBuilder);
  }

  ngOnInit(): void {
    this.setCurrentAction();
    this.buildResourceForm();
    this.loadResource();
  }

  ngAfterContentChecked(): void {
    this.setPageTitle();
  }

  submitForm() {
    this.submittingForm = true;

    if (this.currentAction == 'new') {
      this.createResource();
    } else {
      this.updateResource();
    }
  }

  // Private Methods
  protected setCurrentAction() {
    if (this.actRoute.snapshot.url[0].path == 'new') {
      this.currentAction = 'new';
    } else {
      this.currentAction = 'edit';
    }
  }

  protected loadResource() {
    if (this.currentAction == 'edit') {
      this.actRoute.paramMap
        .pipe(
          switchMap((params) =>
            this.resourceService.getById(+params.get('id')!)
          ) // O operador de verificação nula (!) para garantir que id não seja null antes de usá-lo.
        )
        .subscribe({
          next: (resource) => {
            this.resource = resource;
            this.resourceForm.patchValue(resource); // binds loaded resource data to ResourceForm
          },
          error: (error) => {
            alert('Ocorreu um erro no servidor, tente mais tarde!');
          },
        });
    }
  }

  protected setPageTitle() {
    if (this.currentAction == 'new') {
      this.pageTitle = this.creationPageTitle();
    } else {
      this.pageTitle = this.editionPageTitle();
    }
  }

  protected creationPageTitle(): string {
    return 'Novo';
  }

  protected editionPageTitle(): string {
    return 'Edição';
  }

  protected createResource() {
    const resource: T = this.jsonDataToResourceFn(this.resourceForm.value);

    this.resourceService.create(resource).subscribe({
      next: (resource) => {
        this.actionForSuccess(resource);
      },
      error: (error) => {
        this.actionForError(error);
      },
    });
  }

  protected updateResource() {
    const resource: T = this.jsonDataToResourceFn(this.resourceForm.value);

    this.resourceService.update(resource).subscribe({
      next: (resource) => {
        this.actionForSuccess(resource);
      },
      error: (error) => {
        this.actionForError(error);
      },
    });
  }

  protected actionForSuccess(resource: T) {
    this.toastr.success('Solicitação processada com sucesso!');

    const baseComponentPath: string =
      this.actRoute.snapshot.parent?.url[0].path ?? '';
    // redirect/reload component page
    this.router
      .navigateByUrl(baseComponentPath, { skipLocationChange: true })
      .then(() =>
        this.router.navigate([baseComponentPath, resource.id, 'edit'])
      );
  }

  protected actionForError(error: any) {
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

  protected abstract buildResourceForm(): void;
}
