import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentRow } from './document-row';

describe('DocumentRow', () => {
  let component: DocumentRow;
  let fixture: ComponentFixture<DocumentRow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentRow]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentRow);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
