import { RedirectCommand, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { AuthGuard } from './core/auth/auth.guard';
import { AdminComponent } from './pages/admin/admin.component';
import { RoleGuard } from './core/auth/role.guard';
import { GuestComponent } from './pages/guest/guest.component';
import { LeaderTableComponent } from './pages/leader-table/leader-table.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { 
        path: 'home', 
        component: HomeComponent, 
        canActivate: [AuthGuard] 
    },
    {
        path: 'admin', 
        component: AdminComponent, 
        canActivate: [AuthGuard, RoleGuard], 
        data: { role: 'admin' },
    },
    {
        path: 'guest', 
        component: GuestComponent, 
    },
    {
        path: 'leader_table',
        component: LeaderTableComponent,
    },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
];
