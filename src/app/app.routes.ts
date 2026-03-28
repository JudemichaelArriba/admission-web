import { Routes } from '@angular/router';
import { PublicLayout } from './layout/public-layout/public-layout';
import { LandingPage } from './pages/landing-page/landing-page';



export const routes: Routes = [
    {
        path: '',
        component: PublicLayout,
        children: [
            { path: '', component: LandingPage },
        ],



    },];
