import { Routes } from '@angular/router';
import { HomeComponent } from '../../src/pages/home/home.component';
import { DashboardComponent } from '../pages/dashboard/dashboard.component';
import { ExploreComponent } from '../../src/pages/explore/explore.component';
import { LoginComponent } from '../../src/pages/login/login.component';
import { SignupComponent } from '../pages/sign-up/sign-up.component';
import { AuthGuard } from '../services/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'explore', component: ExploreComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent }, // nuova rotta per la registrazione
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard], // proteggi solo questa rotta
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }, // redirect a home per rotte non trovate
];
