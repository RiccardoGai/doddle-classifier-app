import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoddleComponent } from './doddle.component';

describe('DoddleComponent', () => {
  let component: DoddleComponent;
  let fixture: ComponentFixture<DoddleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DoddleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DoddleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
