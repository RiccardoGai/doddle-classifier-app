import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DoddleComponent } from './doddle/doddle.component';

const routes: Routes = [{ path: '', component: DoddleComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DoddleRoutingModule {}
