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
import { PvorRvRequest } from './pvorrvrequest.routing';
import { SpinnerModule } from '../../spinner-ui/spinner/spinner.module';
import { ReceiptrequestlistComponent } from './receiptrequest/receiptrequestlist/receiptrequestlist.component';
import { ReceiptconfirmlistComponent } from './receiptconfirm/receiptconfirmlist/receiptconfirmlist.component';
import { ReceiptconfirmdetailComponent } from './receiptconfirm/receiptconfirmdetail/receiptconfirmdetail.component';
import { PvmanuallistComponent } from './pvmanual/pvmanuallist/pvmanuallist.component';
import { PvmanualdetailComponent } from './pvmanual/pvmanualdetail/pvmanualdetail.component';
// tslint:disable-next-line:max-line-length
import { PvmanualdetaildetailComponent } from './pvmanual/pvmanualdetail/pvmanualdetaildetail/pvmanualdetaildetail/pvmanualdetaildetail.component';
// tslint:disable-next-line:max-line-length
import { ReceiptconfirmdetaildetailComponent } from './receiptconfirm/receiptconfirmdetail/receiptconfirmdetaildetail/receiptconfirmdetaildetail/receiptconfirmdetaildetail.component';
import { PaymentrequestlistComponent } from './paymentrequest/paymentrequestlist/paymentrequestlist.component';
import { PaymentconfirmlistComponent } from './paymentconfirm/paymentconfirmlist/paymentconfirmlist.component';
import { PaymentconfirmdetailComponent } from './paymentconfirm/paymentconfirmdetail/paymentconfirmdetail.component';
// tslint:disable-next-line:max-line-length
import { PaymentconfirmdetaildetailComponent } from './paymentconfirm/paymentconfirmdetail/paymentconfirmdetaildetail/paymentconfirmdetaildetail/paymentconfirmdetaildetail.component';
import { RvmanualdetailComponent } from './rvmanual/rvmanualdetail/rvmanualdetail.component';
import { RvmanuallistComponent } from './rvmanual/rvmanuallist/rvmanuallist.component';
// tslint:disable-next-line:max-line-length
import { RvmanualdetaildetailComponent } from './rvmanual/rvmanualdetail/rvmanualdetaildetail/rvmanualdetaildetail/rvmanualdetaildetail.component';
import { AngularMyDatePickerModule } from 'angular-mydatepicker';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(PvorRvRequest),
        FormsModule,
        HttpClientModule,
        NgbModule,
        DataTablesModule,
        SpinnerModule,
        AngularMyDatePickerModule
    ],
    declarations: [
        ReceiptrequestlistComponent,
        ReceiptconfirmlistComponent,
        ReceiptconfirmdetailComponent,
        PvmanuallistComponent,
        PvmanualdetailComponent,
        PvmanualdetaildetailComponent,
        ReceiptconfirmdetaildetailComponent,
        PaymentrequestlistComponent,
        PaymentconfirmlistComponent,
        PaymentconfirmdetailComponent,
        PaymentconfirmdetaildetailComponent,
        RvmanualdetailComponent,
        RvmanuallistComponent,
        RvmanualdetaildetailComponent
    ],
    providers: [
        DALService,
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true } // back to login if 401
        , AuthGuard // penjagaan apabila dari login langsung masuk ke dashboard atau ke halaman lain
    ]
})

export class SettingModule { }
