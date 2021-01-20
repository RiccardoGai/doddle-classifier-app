import {
  CUSTOM_ELEMENTS_SCHEMA,
  ModuleWithProviders,
  NgModule,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

const SHARED_MODULES = [CommonModule, ReactiveFormsModule, FormsModule];
const SHARED_COMPONENTS = [];
const SHARED_DIRECTIVES = [];
const SHARED_PIPES = [];

@NgModule({
  imports: [...SHARED_MODULES],
  exports: [
    ...SHARED_MODULES,
    ...SHARED_COMPONENTS,
    ...SHARED_DIRECTIVES,
    ...SHARED_PIPES,
  ],
  providers: [DatePipe],
  declarations: [...SHARED_COMPONENTS, ...SHARED_DIRECTIVES, ...SHARED_PIPES],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: [],
    };
  }
}
