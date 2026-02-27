import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotaDebito } from './nota-debito';

describe('NotaDebito', () => {
  let component: NotaDebito;
  let fixture: ComponentFixture<NotaDebito>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotaDebito]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotaDebito);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
