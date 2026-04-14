import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAvisComponent } from './edit-avis.component';

describe('EditAvisComponent', () => {
  let component: EditAvisComponent;
  let fixture: ComponentFixture<EditAvisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditAvisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditAvisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
