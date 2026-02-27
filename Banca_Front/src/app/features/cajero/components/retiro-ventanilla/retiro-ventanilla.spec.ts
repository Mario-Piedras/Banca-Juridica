import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetiroVentanilla } from './retiro-ventanilla.component';

describe('RetiroVentanilla', () => {
  let component: RetiroVentanilla;
  let fixture: ComponentFixture<RetiroVentanilla>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetiroVentanilla]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RetiroVentanilla);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
