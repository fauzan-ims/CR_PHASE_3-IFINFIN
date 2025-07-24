import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { DALService } from '../../../DALservice.service';
import { SpinnerModule } from '../../spinner-ui/spinner/spinner.module';
import { Cashier } from './cashier.routing';
import { AuthInterceptor } from '../../../auth-interceptor';
import { AuthGuard } from '../../../auth.guard';
import { CashieropenlistComponent } from './cashieropen/cashieropenlist/cashieropenlist.component';
import { CashieropendetailComponent } from './cashieropen/cashieropendetail/cashieropendetail.component';
import { CashiertransactionlistComponent } from './cashiertransaction/cashiertransactionlist/cashiertransactionlist.component';
import { CashiertransactiondetailComponent } from './cashiertransaction/cashiertransactiondetail/cashiertransactiondetail.component';
// tslint:disable-next-line:max-line-length
import { AccounttransferrequestlistComponent } from './accounttransferrequest/accounttransferrequestlist/accounttransferrequestlist.component';
// tslint:disable-next-line:max-line-length
import { AccounttransferrequestdetailComponent } from './accounttransferrequest/accounttransferrequestdetail/accounttransferrequestdetail.component';
import { ReprintreceiptlistComponent } from './reprintreceipt/reprintreceiptlist/reprintreceiptlist.component';
import { ReprintreceiptdetailComponent } from './reprintreceipt/reprintreceiptdetail/reprintreceiptdetail.component';
import { InquirycashierlistComponent } from './inquirycashier/inquirycashierlist/inquirycashierlist.component';
import { InquirycashierdetailComponent } from './inquirycashier/inquirycashierdetail/inquirycashierdetail.component';
import { CashierBankandCoinWizModule } from './cashieropen/cashieropendetail/cashierbanknoteandcoinwiz/cashierbanknoteandcoinwiz.module';
import { CashierReceiptWizModule } from './cashieropen/cashieropendetail/cashierreceiptwiz/cashierreceiptwiz.module';
import { AngularMyDatePickerModule } from 'angular-mydatepicker';
import { ReceiptrequestlistComponent } from './cashierreceiptrequest/cashierreceiptrequestlist/receiptrequestlist.component';

//wizard
import { CashierTransactionAllocationWizModule } from './cashiertransaction/cashiertransactiondetail/cashiertransactionallocationwiz/cashiertransactionallocationwiz.module';
import { CashierTransactionInvoiceWizModule } from './cashiertransaction/cashiertransactiondetail/cashiertransactioninvoicewiz/cashiertransactioninvoicewiz.module';
import { CashieruploadlistComponent } from './cashierupload/cashieruploadlist/cashieruploadlist.component';
import { CashieruploaddetailComponent } from './cashierupload/cashieruploaddetail/cashieruploaddetail.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(Cashier),
        FormsModule,
        HttpClientModule,
        NgbModule,
        DataTablesModule,
        SpinnerModule,
        CashierBankandCoinWizModule,
        CashierReceiptWizModule,
        AngularMyDatePickerModule,
        CashierTransactionAllocationWizModule,
        CashierTransactionInvoiceWizModule
    ],
    declarations: [
        CashieropenlistComponent,
        CashieropendetailComponent,
        ReceiptrequestlistComponent,
        CashiertransactionlistComponent,
        CashiertransactiondetailComponent,
        AccounttransferrequestlistComponent,
        AccounttransferrequestdetailComponent,
        ReprintreceiptlistComponent,
        ReprintreceiptdetailComponent,
        InquirycashierlistComponent,
        InquirycashierdetailComponent,
        CashieruploadlistComponent,
        CashieruploaddetailComponent
    ],
    providers: [
        DALService,
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true } // back to login if 401
        , AuthGuard // penjagaan apabila dari login langsung masuk ke dashboard atau ke halaman lain
    ]
})

export class SettingModule { }
