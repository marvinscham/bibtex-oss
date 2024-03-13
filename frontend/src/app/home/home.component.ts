import { Component } from '@angular/core';
import { ApiService } from '../api.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatOption } from '@angular/material/autocomplete';
import { MatSelect } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatOption,
    MatSelect,
    FormsModule,
    MatIcon,
    MatTooltipModule,
  ],
})
export class HomeComponent {
  output = '';

  constructor(private apiService: ApiService, private snackBar: MatSnackBar) {}

  handleInput(type: string, input: string) {
    input = input.trim();

    if (type == 'auto') {
      if (this.isIsbn(input)) {
        type = 'isbn';
      } else if (
        input.startsWith('https://dx.doi.org/') ||
        input.startsWith('dx.doi.org/') ||
        input.startsWith('https://doi.org/') ||
        input.startsWith('doi.org/')
      ) {
        type = 'doi';
      } else if (input.startsWith('https://') || input.startsWith('http://')) {
        type = 'url';
      } else {
        type = 'doi';
      }
    }

    this.output = 'Loading...';
    switch (type) {
      case 'doi': {
        this.loadBibtexFromDoi(input);
        break;
      }
      case 'isbn': {
        this.loadBibtexFromIsbn(input);
        break;
      }
      case 'url': {
        this.loadBibtexFromUrl(input);
        break;
      }
    }

    plausible('Lookup', { props: { type: type } });
  }

  isIsbn(input: string): boolean {
    const sanitizedInput = input.replace(/[-\s]/g, '');

    const regexISBN10 = /^(?:\d{9}X|\d{10})$/; // ISBN-10 may end with X
    const regexISBN13 = /^(?:978|979)\d{10}$/;

    return regexISBN10.test(sanitizedInput) || regexISBN13.test(sanitizedInput);
  }

  loadBibtexFromIsbn(isbn: string) {
    isbn = isbn.replace(/[-\s]/g, '');

    if (!isbn) {
      this.notify('Enter something first!', 'ok');
    }

    this.apiService.getBibTexByIsbn(isbn).subscribe({
      next: (response: { body: string }) => {
        this.output = response.body;
      },
      error: (error: any) => {
        this.notify('Failed to collect data from ISBN, sorry!', 'Ok :(');
        console.error('Request failed with error:', error);
        this.output = '';
      },
    });
  }

  loadBibtexFromDoi(doi: string) {
    if (!doi) {
      this.notify('Enter something first!', 'ok');
    }
    doi = doi.replace('https://dx.doi.org/', '');
    doi = doi.replace('dx.doi.org/', '');
    doi = doi.replace('https://doi.org/', '');
    doi = doi.replace('doi.org/', '');

    this.apiService.getBibTexByDoi(doi).subscribe({
      next: (response: { body: string }) => {
        this.output = response.body;
      },
      error: (error: any) => {
        this.notify('Failed to collect data from DOI, sorry!', 'Ok :(');
        console.error('Request failed with error:', error);
        this.output = '';
      },
    });
  }

  loadBibtexFromUrl(uri: string) {
    if (!uri) {
      this.notify('Enter something first!', 'ok');
    }

    this.apiService.getBibTexByUrl(uri).subscribe({
      next: (response: { body: string }) => {
        this.output = response.body;
      },
      error: (error: any) => {
        this.notify('Failed to collect data from URL, sorry!', 'Ok :(');
        console.error('Request failed with error:', error);
        this.output = '';
      },
    });
  }

  tidyOutput(bibtex: string) {
    if (!bibtex) {
      this.notify('Enter something first!', 'ok');
    }

    this.apiService.tidyBibtex(bibtex).subscribe({
      next: (response: { body: string }) => {
        console.log(this.output);
        this.output = response.body;
        console.log(this.output);
      },
      error: (error: any) => {
        this.notify("Couldn't tidy your BibTeX.", 'Ok :(');
        console.error('Request failed with error:', error);
      },
    });
  }

  copyTextToClipboard(text: string) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        this.notify('Copied to clipboard!');
      })
      .catch((err) => {
        this.notify("Couldn't copy to clipboard.");
        console.error('Could not copy text: ', err);
      });
  }

  notify(message: string, buttonText: string = 'Close') {
    this.snackBar.open(message, buttonText, {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  protected readonly HTMLInputElement = HTMLInputElement;
  selectedOption = 'auto';
}
