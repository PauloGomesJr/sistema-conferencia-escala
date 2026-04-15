import { TestBed } from '@angular/core/testing';

import { CalculoHoras } from './calculo-horas';

describe('CalculoHoras', () => {
  let service: CalculoHoras;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalculoHoras);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
