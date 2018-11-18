import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeableValueEditorComponent } from './tag-editor.component';

describe('TagEditorComponent', () => {
  let component: ChangeableValueEditorComponent;
  let fixture: ComponentFixture<ChangeableValueEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeableValueEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeableValueEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
