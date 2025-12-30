import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { SuperchampComponent } from './pages/superchamp/superchamp.component';
import { EventsComponent } from './pages/events/events.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { NewHotComponent } from './pages/new-hot/new-hot.component';
import { AuthGuard } from './auth.guard.spec';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { TermsndcondComponent } from './pages/termsndcond/termsndcond.component';
import { ContactUsComponent } from './pages/contact-us/contact-us.component';
import { LoginGuard } from './Login-guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent , canActivate: [LoginGuard]   },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'app',
    component: LayoutComponent,
    // canActivate: [AuthGuard],
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'superchamp', component: SuperchampComponent },
      { path: 'event', component: EventsComponent },
      { path: 'newhot', component: NewHotComponent },
      { path: 'home', redirectTo: 'superchamp', pathMatch: 'full' },
      { path: 'profile', component: ProfileComponent },
      { path: 'termsndcond', component: TermsndcondComponent },
      { path: 'contact-us', component: ContactUsComponent },
    ]
  },

  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
