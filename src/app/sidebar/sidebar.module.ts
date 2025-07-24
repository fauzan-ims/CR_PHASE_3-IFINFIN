import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DALService } from '../../DALservice.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '../../auth-interceptor';
import { AuthGuard } from '../../auth.guard';
import { SpinnerModule } from '../spinner-ui/spinner/spinner.module';
import { Ng4LoadingSpinnerModule } from 'ng4-loading-spinner';

@NgModule({
    imports: [
        RouterModule,
        CommonModule,
        HttpClientModule,
        Ng4LoadingSpinnerModule.forRoot(),
        SpinnerModule,
        NgbModule],
    declarations: [
        SidebarComponent
    ],
    exports: [
        SidebarComponent
    ],
    providers: [
        DALService
    ]
})

export class SidebarModule { }
