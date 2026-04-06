import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusTable } from './status-table';

describe('StatusTable', () => {
  let component: StatusTable;
  let fixture: ComponentFixture<StatusTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatusTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
