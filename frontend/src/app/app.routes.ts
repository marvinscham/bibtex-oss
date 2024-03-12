import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { NgModule } from '@angular/core';
import { HomeComponent } from './home/home.component';
import { StatsComponent } from './stats/stats.component';
import { TermsComponent } from './terms/terms.component';
import { TidyComponent } from './tidy/tidy.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'stats', component: StatsComponent },
  { path: 'terms', component: TermsComponent },
  { path: 'tidy', component: TidyComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
