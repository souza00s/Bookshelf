import { TestBed } from '@angular/core/testing';

import { SocketService } from './socket'; // Correção: importando SocketService

describe('SocketService', () => { // Correção: descrevendo SocketService
  let service: SocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SocketService); // Correção: injetando SocketService
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});