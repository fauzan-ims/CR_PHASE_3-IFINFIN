import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PagesRoutes } from './pages.routing';

import { RegisterComponent } from './register/register.component';
import { LockComponent } from './lock/lock.component';
import { LoginComponent } from './login/login.component';
import { SpinnerModule } from '../spinner-ui/spinner/spinner.module';
import { LoginService } from './login/login.service';
import { DALService } from '../../DALservice.service';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(PagesRoutes),
        FormsModule,
        FormsModule,
        SpinnerModule
    ],
    declarations: [
        LoginComponent,
        RegisterComponent,
        LockComponent
    ],
    providers: [
        LoginService,
        DALService
    ]
})

export class PagesModule {}
