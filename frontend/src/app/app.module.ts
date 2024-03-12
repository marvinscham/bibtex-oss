import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AboutComponent } from './about/about.component';
import { AppRoutingModule } from './app.routes';
import { MatTooltipModule } from '@angular/material/tooltip';
@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    AppComponent,
    AboutComponent,
    BrowserAnimationsModule,
    MatIconModule,
    MatSnackBarModule,
    AppRoutingModule,
    MatTooltipModule,
  ],
  providers: [],
  bootstrap: [],
})
export class AppModule {}
