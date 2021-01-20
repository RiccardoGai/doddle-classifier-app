import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { DoddleRoutingModule } from './doddle-routing.module';
import { DoddleComponent } from './doddle/doddle.component';

const NG_COMPONENTS = [DoddleComponent];
const NG_MODULES = [DoddleRoutingModule, SharedModule];

@NgModule({
  declarations: [...NG_COMPONENTS],
  imports: [...NG_MODULES],
})
export class DoddleModule {}
