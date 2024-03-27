import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { FooterComponent } from './footer/footer.component';
import { AppRoutingModule } from './app.routes';
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

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HeaderComponent,
        HomeComponent,
        FooterComponent,
        AppComponent,
        AppRoutingModule,
      ],
      providers: [{ provide: ActivatedRoute, useValue: mockActivatedRoute }],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
