import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '../../../auth-interceptor';
import { AuthGuard } from '../../../auth.guard';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { DALService } from '../../../DALservice.service';
import { SpinnerModule } from '../../spinner-ui/spinner/spinner.module';
import { Reversal } from './reversal.routing';
import { ReversalmainlistComponent } from './reversalmain/reversalmainlist/reversalmainlist.component';
import { ReversalmaindetailComponent } from './reversalmain/reversalmaindetail/reversalmaindetail.component';
import { AngularMyDatePickerModule } from 'angular-mydatepicker';
import { ObjectinforeversalmainComponent } from './reversalmain/objectinforeversalmain/objectinforeversalmain.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(Reversal),
        FormsModule,
        HttpClientModule,
        NgbModule,
        DataTablesModule,
        SpinnerModule,
        AngularMyDatePickerModule
    ],
    declarations: [
        ReversalmainlistComponent,
        ReversalmaindetailComponent,
        ObjectinforeversalmainComponent
    ],
    providers: [
        DALService,
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true } // back to login if 401
        , AuthGuard // penjagaan apabila dari login langsung masuk ke dashboard atau ke halaman lain
    ]
})

export class SettingModule { }
