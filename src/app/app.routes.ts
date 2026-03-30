import { Routes } from '@angular/router';
import { PublicLayout } from './layout/public-layout/public-layout';
import { LandingPage } from './pages/landing-page/landing-page';
import { RegisterPage } from './pages/register-page/register-page';


export const routes: Routes = [
    { path: 'register', component: RegisterPage },
    {
        path: '',
        component: PublicLayout,
        children: [
            { path: '', component: LandingPage },
        ],



    },];
