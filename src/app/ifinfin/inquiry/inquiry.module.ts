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
import { Inquiry } from './inquiry.routing';
import { BankmutationlistComponent } from './bankmutation/bankmutationlist/bankmutationlist.component';
import { BankmutationdetailComponent } from './bankmutation/bankmutationdetail/bankmutationdetail.component';
import { AngularMyDatePickerModule } from 'angular-mydatepicker';
import { TaxhistorylistComponent } from './taxhistory/taxhistorylist/taxhistorylist.component';
import { TaxhistorydetailComponent } from './taxhistory/taxhistorydetail/taxhistorydetail.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(Inquiry),
        FormsModule,
        HttpClientModule,
        NgbModule,
        DataTablesModule,
        SpinnerModule,
        AngularMyDatePickerModule
    ],
    declarations: [
        BankmutationlistComponent,
        BankmutationdetailComponent,
        TaxhistorylistComponent,
        TaxhistorydetailComponent
    ],
    providers: [
        DALService,
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true } // back to login if 401
        , AuthGuard // penjagaan apabila dari login langsung masuk ke dashboard atau ke halaman lain
    ]
})

export class SettingModule { }
