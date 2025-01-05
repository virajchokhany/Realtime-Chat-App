import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupBlockerComponent } from './popup-blocker.component';

describe('PopupBlockerComponent', () => {
  let component: PopupBlockerComponent;
  let fixture: ComponentFixture<PopupBlockerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupBlockerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupBlockerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
