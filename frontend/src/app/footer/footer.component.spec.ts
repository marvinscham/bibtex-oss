import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

const mockActivatedRoute = {
  snapshot: {
    paramMap: {
      get: (name: string) => 'mockId',
    },
    queryParamMap: {
      get: (name: string) => 'mockQueryParam',
    },
  },
  paramMap: of(new Map([['id', 'mockId']])),
  queryParamMap: of(new Map([['page', '1']])),
};

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [{ provide: ActivatedRoute, useValue: mockActivatedRoute }],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should contain a toolbar', () => {
    const toolbarElement = fixture.debugElement.query(By.css('mat-toolbar'));
    expect(toolbarElement).not.toBeNull();
  });
});
