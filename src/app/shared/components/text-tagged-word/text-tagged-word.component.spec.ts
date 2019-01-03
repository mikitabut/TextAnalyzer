import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextTaggedWordComponent } from './text-tagged-word.component';

describe('TextTaggedWordComponent', () => {
  let component: TextTaggedWordComponent;
  let fixture: ComponentFixture<TextTaggedWordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TextTaggedWordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextTaggedWordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
