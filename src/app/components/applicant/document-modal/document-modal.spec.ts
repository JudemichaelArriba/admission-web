import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentModal } from './document-modal';

describe('DocumentModal', () => {
  let component: DocumentModal;
  let fixture: ComponentFixture<DocumentModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
