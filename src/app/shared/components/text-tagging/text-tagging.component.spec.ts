import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextTaggingComponent } from './text-tagging.component';

describe('TextTaggingComponent', () => {
  let component: TextTaggingComponent;
  let fixture: ComponentFixture<TextTaggingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TextTaggingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextTaggingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
