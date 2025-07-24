import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';

import { SpinnerModule } from '../spinner-ui/spinner/spinner.module';
import { DALService } from '../../DALservice.service';
import { UnauthorizedRoutes } from './unauthorized.routing';
import { UnauthorizedComponent } from './unauthorized.component';


@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(UnauthorizedRoutes),
        FormsModule,
        HttpClientModule,
        NgbModule,
        DataTablesModule,
        SpinnerModule
    ],
    declarations: [
        UnauthorizedComponent
        // IframelayoutComponent
    ],
    providers: [
        // DALService
        // EventEmitterService,
        // { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true } // back to login if 401
        // , AuthGuard // penjagaan apabila dari login langsung masuk ke dashboard atau ke halaman lain
    ]
})

export class UnauthorizedModule { }
