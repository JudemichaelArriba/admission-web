import { Routes } from '@angular/router';
import { PublicLayout } from './layout/public-layout/public-layout';
import { LandingPage } from './pages/landing-page/landing-page';
import { RegisterPage } from './pages/register-page/register-page';
import { LoginPage } from './pages/login-page/login-page';
import { authGuard } from './guards/auth-guard/auth-guard';
import { ApplicantDashboardComponent } from './pages/applicants/applicants-dashbaord/applicants-dashbaord';
import { StatusTableComponent } from './components/applicant/status-table/status-table';
import { ExamSchedTable } from './components/applicant/exam-sched-table/exam-sched-table';
import { DocumentsTableComponent } from './components/applicant/documents-table/documents-table';
import { ApplicantProfileComponent } from './components/applicant/applicant-profile/applicant-profile';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard/admin-dashboard';
import { ApplicantApplicationsPage } from './pages/admin/applicant-applications-page/applicant-applications-page';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout';
import { ExamSchedulerPage } from './pages/admin/exam-scheduler-page/exam-scheduler-page';
import { ExamEvaluationPage } from './pages/admin/exam-evaluation-page/exam-evaluation-page';

export const routes: Routes = [
    { path: 'login', component: LoginPage },
    { path: 'register', component: RegisterPage },
    {
        path: '',
        component: PublicLayout,
        children: [
            { path: '', component: LandingPage },
        ],



    },


    {
        path: 'admin',
        component: AdminLayoutComponent,
        canActivate: [authGuard],
        data: { roles: ['admin'] },
        children: [
            {
                path: 'dashboard',
                component: AdminDashboardComponent,
                children: [
                    { path: '', redirectTo: 'registry', pathMatch: 'full' },
                    { path: 'registry', component: ApplicantApplicationsPage },
                    { path: 'exam-scheduler', component: ExamSchedulerPage },
                    { path: 'exam-evaluation', component: ExamEvaluationPage },

                ]
            }
        ]
    },

    {
        path: 'applicant',
        canActivate: [authGuard],
        data: { roles: ['applicant'] },
        children: [
            {
                path: 'dashboard',
                component: ApplicantDashboardComponent,
                children: [
                    { path: '', redirectTo: 'status', pathMatch: 'full' },
                    { path: 'status', component: StatusTableComponent },
                    { path: 'schedule', component: ExamSchedTable },
                    { path: 'documents', component: DocumentsTableComponent },
                    { path: 'profile', component: ApplicantProfileComponent },
                ]
            }
        ]
    },






];
