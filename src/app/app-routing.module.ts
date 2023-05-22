import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'doddle', pathMatch: 'full' },
  {
    path: 'doddle',
    loadChildren: () =>
      import('./modules/doddle/doddle.module').then((m) => m.DoddleModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {})],
  exports: [RouterModule],
})
export class AppRoutingModule {}
