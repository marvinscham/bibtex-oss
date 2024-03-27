import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { ApiService } from '../api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let apiServiceMock: any;
  let snackBarMock: any;

  beforeEach(async () => {
    // Mock ApiService and MatSnackBar
    snackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);
    apiServiceMock = jasmine.createSpyObj('ApiService', [
      'tidyBibtex',
      'getBibTexByUrl',
      'getBibTexByIsbn',
      'getBibTexByDoi',
      'getBibTexByArxiv',
    ]);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, NoopAnimationsModule, HomeComponent],
      providers: [
        { provide: ApiService, useValue: apiServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    window.plausible = window.plausible || (() => {});
    spyOn(window, 'plausible');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle ISBN input correctly', () => {
    const response = { body: 'mockResponse' };
    apiServiceMock.getBibTexByIsbn.and.returnValue(of(response));

    component.loadBibtexFromIsbn('someIsbn');
    expect(apiServiceMock.getBibTexByIsbn).toHaveBeenCalledWith('someIsbn');
  });

  it('should call notify with "Copied to clipboard!" on successful copy', async () => {
    spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());
    spyOn(component, 'notify');

    await component.copyTextToClipboard('Test text');
    expect(component.notify).toHaveBeenCalledWith('Copied to clipboard!');
  });

  it('should call notify with "Couldn\'t copy to clipboard." on failure', async () => {
    const error = new Error('Mocked error');
    spyOn(navigator.clipboard, 'writeText').and.returnValue(
      Promise.reject(error)
    );
    spyOn(component, 'notify').and.callThrough();
    spyOn(console, 'error').and.callThrough();

    await component
      .copyTextToClipboard('Test text')
      .then(() => {
        expect(component.notify).toHaveBeenCalledWith(
          "Couldn't copy to clipboard."
        );
        expect(console.error).toHaveBeenCalledWith(
          'Could not copy text: ',
          error
        );
      })
      .catch((e) => {
        console.error('Test failed with error:', e);
      });
  });

  it('should notify to enter something if bibtex is empty', () => {
    spyOn(component, 'notify');
    component.tidyOutput('');
    expect(component.notify).toHaveBeenCalledWith(
      'Enter something first!',
      'ok'
    );
  });

  it('should update output on successful tidyBibtex', fakeAsync(() => {
    const mockResponse = { body: 'tidied bibtex' };
    apiServiceMock.tidyBibtex.and.returnValue(of(mockResponse));

    component.tidyOutput('some bibtex');
    tick();

    expect(component.output).toEqual('tidied bibtex');
  }));

  it('should notify and log error on failed tidyBibtex', fakeAsync(() => {
    const mockError = new Error('Failed to tidy');
    apiServiceMock.tidyBibtex.and.returnValue(throwError(() => mockError));
    spyOn(component, 'notify');
    spyOn(console, 'error');

    component.tidyOutput('some bibtex');
    tick();

    expect(component.notify).toHaveBeenCalledWith(
      "Couldn't tidy your BibTeX.",
      'Ok :('
    );
    expect(console.error).toHaveBeenCalledWith(
      'Request failed with error:',
      mockError
    );
  }));

  it('should notify to enter something if URI is empty', () => {
    spyOn(component, 'notify');
    component.loadBibtexFromUrl('');
    expect(component.notify).toHaveBeenCalledWith(
      'Enter something first!',
      'ok'
    );
  });

  it('should update output on successful getBibTexByUrl', fakeAsync(() => {
    const mockResponse = { body: 'BibTex from URL' };
    apiServiceMock.getBibTexByUrl.and.returnValue(of(mockResponse));

    component.loadBibtexFromUrl('http://valid-url.com');
    tick();

    expect(component.output).toEqual('BibTex from URL');
  }));

  it('should notify and log error on failed getBibTexByUrl', fakeAsync(() => {
    const mockError = new Error('Error fetching BibTex');
    apiServiceMock.getBibTexByUrl.and.returnValue(throwError(() => mockError));
    spyOn(component, 'notify');
    spyOn(console, 'error');

    component.loadBibtexFromUrl('http://invalid-url.com');
    tick();

    expect(component.notify).toHaveBeenCalledWith(
      'Failed to collect data from URL, sorry!',
      'Ok :('
    );
    expect(console.error).toHaveBeenCalledWith(
      'Request failed with error:',
      mockError
    );
    expect(component.output).toEqual('');
  }));

  it('should notify to enter something if ISBN is empty', () => {
    spyOn(component, 'notify');
    component.loadBibtexFromIsbn('');
    expect(component.notify).toHaveBeenCalledWith(
      'Enter something first!',
      'ok'
    );
  });

  it('should update output on successful getBibTexByIsbn', fakeAsync(() => {
    const mockResponse = { body: 'BibTex from ISBN' };
    apiServiceMock.getBibTexByIsbn.and.returnValue(of(mockResponse));

    component.loadBibtexFromIsbn('1234567890');
    tick();

    expect(component.output).toEqual('BibTex from ISBN');
  }));

  it('should notify and log error on failed getBibTexByIsbn', fakeAsync(() => {
    const mockError = new Error('Error fetching BibTex');
    apiServiceMock.getBibTexByIsbn.and.returnValue(throwError(() => mockError));
    spyOn(component, 'notify');
    spyOn(console, 'error');

    component.loadBibtexFromIsbn('1Z34567890');
    tick();

    expect(component.notify).toHaveBeenCalledWith(
      'Failed to collect data from ISBN, sorry!',
      'Ok :('
    );
    expect(console.error).toHaveBeenCalledWith(
      'Request failed with error:',
      mockError
    );
    expect(component.output).toEqual('');
  }));

  it('should notify to enter something if arXiv is empty', () => {
    spyOn(component, 'notify');
    component.loadBibtexFromArxiv('');
    expect(component.notify).toHaveBeenCalledWith(
      'Enter something first!',
      'ok'
    );
  });

  it('should update output on successful getBibTexByArxiv', fakeAsync(() => {
    const mockResponse = { body: 'BibTex from arXiv' };
    apiServiceMock.getBibTexByArxiv.and.returnValue(of(mockResponse));

    component.loadBibtexFromArxiv('1234.5678');
    tick();

    expect(component.output).toEqual('BibTex from arXiv');
  }));

  it('should update output on successful getBibTexByArxiv with identifier marker', fakeAsync(() => {
    const mockResponse = { body: 'BibTex from arXiv' };
    apiServiceMock.getBibTexByArxiv.and.returnValue(of(mockResponse));

    component.loadBibtexFromArxiv('arxiv:1234.5678');
    tick();

    expect(component.output).toEqual('BibTex from arXiv');
  }));

  it('should notify and log error on failed getBibTexByArxiv', fakeAsync(() => {
    const mockError = new Error('Error fetching BibTex');
    apiServiceMock.getBibTexByArxiv.and.returnValue(
      throwError(() => mockError)
    );
    spyOn(component, 'notify');
    spyOn(console, 'error');

    component.loadBibtexFromArxiv('ööö');
    tick();

    expect(component.notify).toHaveBeenCalledWith(
      'Failed to collect data from arXiv, sorry!',
      'Ok :('
    );
    expect(console.error).toHaveBeenCalledWith(
      'Request failed with error:',
      mockError
    );
    expect(component.output).toEqual('');
  }));

  it('should notify to enter something if DOI is empty', () => {
    spyOn(component, 'notify');
    component.loadBibtexFromDoi('');
    expect(component.notify).toHaveBeenCalledWith(
      'Enter something first!',
      'ok'
    );
  });

  it('should update output on successful getBibTexByDoi', fakeAsync(() => {
    const mockResponse = { body: 'BibTex from DOI' };
    apiServiceMock.getBibTexByDoi.and.returnValue(of(mockResponse));

    component.loadBibtexFromDoi('10.1234');
    tick();

    expect(component.output).toEqual('BibTex from DOI');
  }));

  it('should notify and log error on failed getBibTexByDoi', fakeAsync(() => {
    const mockError = new Error('Error fetching BibTex');
    apiServiceMock.getBibTexByDoi.and.returnValue(throwError(() => mockError));
    spyOn(component, 'notify');
    spyOn(console, 'error');

    component.loadBibtexFromDoi('09.1234');
    tick();

    expect(component.notify).toHaveBeenCalledWith(
      'Failed to collect data from DOI, sorry!',
      'Ok :('
    );
    expect(console.error).toHaveBeenCalledWith(
      'Request failed with error:',
      mockError
    );
    expect(component.output).toEqual('');
  }));

  it('should detect DOI and set loading message for auto type', () => {
    spyOn(component, 'loadBibtexFromDoi');
    component.handleInput('auto', 'https://doi.org/testdoi');
    component.handleInput('auto', 'https://dx.doi.org/testdoi');
    component.handleInput('auto', 'doi.org/testdoi');
    component.handleInput('auto', 'dx.doi.org/testdoi');
    component.handleInput('auto', '10.13456/14562');
    expect(component.loadBibtexFromDoi).toHaveBeenCalledTimes(5);
    expect(component.output).toEqual('Loading...');
  });

  it('should detect ISBN and set loading message for auto type', () => {
    spyOn(component, 'loadBibtexFromIsbn');
    component.handleInput('auto', '9781234567890');
    component.handleInput('auto', '1234567890');
    component.handleInput('auto', '123456789X');
    expect(component.loadBibtexFromIsbn).toHaveBeenCalledTimes(3);
    expect(component.output).toEqual('Loading...');
  });

  it('should detect arXiv and set loading message for auto type', () => {
    spyOn(component, 'loadBibtexFromArxiv');
    component.handleInput('auto', 'arxiv:1234.5678');
    component.handleInput('auto', 'arXiv:1234.5678');
    component.handleInput('auto', 'ARXIV:1234.5678');
    expect(component.loadBibtexFromArxiv).toHaveBeenCalledTimes(3);
    expect(component.output).toEqual('Loading...');
  });

  it('should detect URL and set loading message for auto type', () => {
    spyOn(component, 'loadBibtexFromUrl');
    component.handleInput('auto', 'https://example.com');
    component.handleInput('auto', 'http://example.com');
    expect(component.loadBibtexFromUrl).toHaveBeenCalledTimes(2);
    expect(component.output).toEqual('Loading...');
  });

  it('should default to DOI for unrecognized auto type', () => {
    spyOn(component, 'loadBibtexFromDoi');
    component.handleInput('auto', 'unrecognized input');
    expect(component.loadBibtexFromDoi).toHaveBeenCalled();
    expect(component.output).toEqual('Loading...');
  });

  it('should correctly recognize different ISBNs', () => {
    expect(component.isIsbn('1234567890')).toBeTruthy();
    expect(component.isIsbn('123456789X')).toBeTruthy();
    expect(component.isIsbn('9781234567890')).toBeTruthy();
    expect(component.isIsbn('1231234567890')).toBeFalsy();
    expect(component.isIsbn('1X31234567890')).toBeFalsy();
    expect(component.isIsbn('1X34567890')).toBeFalsy();
  });
});
