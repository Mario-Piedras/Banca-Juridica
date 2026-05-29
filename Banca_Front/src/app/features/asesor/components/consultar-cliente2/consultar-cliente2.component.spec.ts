import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultarCliente2Component } from './consultar-cliente2.component';
describe('ConsultarCliente2Component', () => {
  let component: ConsultarCliente2Component;
  let fixture: ComponentFixture<ConsultarCliente2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultarCliente2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultarCliente2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
