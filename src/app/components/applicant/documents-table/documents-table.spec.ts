import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentsTable } from './documents-table';

describe('DocumentsTable', () => {
  let component: DocumentsTable;
  let fixture: ComponentFixture<DocumentsTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentsTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentsTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
