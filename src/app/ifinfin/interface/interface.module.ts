import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '../../../auth-interceptor';
import { AuthGuard } from '../../../auth.guard';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { Interface } from './interface.routing';
import { DALService } from '../../../DALservice.service';
import { SpinnerModule } from '../../spinner-ui/spinner/spinner.module';

import { PaymentRequestuploadComponent } from './paymentrequest/paymentrequestupload/paymentrequestupload.component';
import { ReceivedRequestuploadComponent } from './receivedrequest/receivedrequestupload/receivedrequestupload.component';
import { CashierReceivedRequestuploadComponent } from './cashierreceivedrequest/cashierreceivedrequestupload/cashierreceivedrequestupload.component';
import { JournaltransactionlistComponent } from './journaltransaction/journaltransactionlist/journaltransactionlist.component';
import { JournaltransactiondetailComponent } from './journaltransaction/journaltransactiondetail/journaltransactiondetail.component';
import { AngularMyDatePickerModule } from 'angular-mydatepicker';
import { CashierReceivedRequestlistComponent } from './cashierreceivedrequest/cashierreceivedrequestlist/cashierreceivedrequestlist.component';
import { CashierreceivedrequestdetailComponent } from './cashierreceivedrequest/cashierreceivedrequestdetail/cashierreceivedrequestdetail.component';
import { PaymentRequestlistComponent } from './paymentrequest/paymentrequestlist/paymentrequestlist.component';
import { ReceivedRequestlistComponent } from './receivedrequest/receivedrequestlist/receivedrequestlist.component';
import { PaymentrequestdetailComponent } from './paymentrequest/paymentrequestdetail/paymentrequestdetail.component';
import { ReceivedrequestdetailComponent } from './receivedrequest/receivedrequestdetail/receivedrequestdetail.component';
import { AgreementlistComponent } from './agreement/agreementist/agreementlist.component';
import { AgreementdetailComponent } from './agreement/agreementdetail/agreementdetail.component';
import { AgreementupdatelistComponent } from './agreementupdate/agreementupdatelist/agreementupdatelist.component';
import { AgreementupdatedetailComponent } from './agreementupdate/agreementupdatedetail/agreementupdatedetail.component';
import { ObligationlistComponent } from './obligation/obligationlist/obligationlist.component';
import { ObligationdetailComponent } from './obligation/obligationdetail/obligationdetail.component';
import { AmortizationlistComponent } from './amortization/amortizationlist/amortizationlist.component';
import { AmortizationdetailComponent } from './amortization/amortizationdetail/amortizationdetail.component';
import { FundinusedlistComponent } from './fundinused/fundinusedlist/fundinusedlist.component';
import { FundinuseddetailComponent } from './fundinused/fundinuseddetail/fundinuseddetail.component';
import { ApThirdPartylistComponent } from './apthirdparty/apthirdpartylist/apthirdpartylist.component';
import { ApthirdpartydetailComponent } from './apthirdparty/apthirdpartydetail/apthirdpartydetail.component';
import { AgreementretentionhistorylistComponent } from './agreementretentionhistory/agreementretentionhistorylist/agreementretentionhistorylist.component';
import { AccounttransferrequestlistComponent } from './accounttransferrequest/accounttransferrequestlist/accounttransferrequestlist.component';
import { AccounttransferrequestdetailComponent } from './accounttransferrequest/accounttransferrequestdetail/accounttransferrequestdetail.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(Interface),
        FormsModule,
        HttpClientModule,
        NgbModule,
        DataTablesModule,
        SpinnerModule,
        AngularMyDatePickerModule
    ],
    declarations: [
        PaymentRequestlistComponent,
        PaymentrequestdetailComponent,
        PaymentRequestuploadComponent,
        ReceivedRequestlistComponent,
        ReceivedrequestdetailComponent,
        ReceivedRequestuploadComponent,
        CashierReceivedRequestlistComponent,
        CashierreceivedrequestdetailComponent,
        CashierReceivedRequestuploadComponent,
        JournaltransactionlistComponent,
        JournaltransactiondetailComponent,
        AgreementlistComponent,
        AgreementdetailComponent,
        AgreementupdatelistComponent,
        AgreementupdatedetailComponent,
        ObligationlistComponent,
        ObligationdetailComponent,
        AmortizationlistComponent,
        AmortizationdetailComponent,
        FundinusedlistComponent,
        FundinuseddetailComponent,
        ApThirdPartylistComponent,
        ApthirdpartydetailComponent,
        AccounttransferrequestlistComponent,
        AgreementretentionhistorylistComponent,
        AccounttransferrequestdetailComponent
        
    ],
    providers: [
        DALService,
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true } // back to login if 401
        , AuthGuard // penjagaan apabila dari login langsung masuk ke dashboard atau ke halaman lain
    ]
})

export class SettingModule { }
