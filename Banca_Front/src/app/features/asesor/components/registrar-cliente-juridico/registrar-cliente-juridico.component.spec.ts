import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrarClienteJuridicoComponent } from './registrar-cliente-juridico.component';

describe('RegistrarCliente', () => {
  let component: RegistrarClienteJuridicoComponent;
  let fixture: ComponentFixture<RegistrarClienteJuridicoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarClienteJuridicoComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(RegistrarClienteJuridicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
