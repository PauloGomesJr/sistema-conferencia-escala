import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroLista } from './registro-lista';

describe('RegistroLista', () => {
  let component: RegistroLista;
  let fixture: ComponentFixture<RegistroLista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroLista]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroLista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
