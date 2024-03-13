import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TidyComponent } from './tidy.component';

describe('TidyComponent', () => {
  let component: TidyComponent;
  let fixture: ComponentFixture<TidyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TidyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TidyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
