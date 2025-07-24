import { Routes } from '@angular/router';

import { PaymentRequestuploadComponent } from './paymentrequest/paymentrequestupload/paymentrequestupload.component';
import { ReceivedRequestuploadComponent } from './receivedrequest/receivedrequestupload/receivedrequestupload.component';
import { CashierReceivedRequestuploadComponent } from './cashierreceivedrequest/cashierreceivedrequestupload/cashierreceivedrequestupload.component';
import { JournaltransactionlistComponent } from './journaltransaction/journaltransactionlist/journaltransactionlist.component';
import { JournaltransactiondetailComponent } from './journaltransaction/journaltransactiondetail/journaltransactiondetail.component';
import { CashierReceivedRequestlistComponent } from './cashierreceivedrequest/cashierreceivedrequestlist/cashierreceivedrequestlist.component';
import { CashierreceivedrequestdetailComponent } from './cashierreceivedrequest/cashierreceivedrequestdetail/cashierreceivedrequestdetail.component';
import { PaymentRequestlistComponent } from './paymentrequest/paymentrequestlist/paymentrequestlist.component';
import { ReceivedRequestlistComponent } from './receivedrequest/receivedrequestlist/receivedrequestlist.component';
import { PaymentrequestdetailComponent } from './paymentrequest/paymentrequestdetail/paymentrequestdetail.component';
import { ReceivedrequestdetailComponent } from './receivedrequest/receivedrequestdetail/receivedrequestdetail.component';
import { AuthGuard } from '../../../auth.guard';
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


export const Interface: Routes = [{
    path: '',
    children: [

        {
            path: 'subpaymentrequestlist',
            component: PaymentRequestlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'paymentrequestupload', /*add*/
                    component: PaymentRequestuploadComponent
                },
                {
                    path: 'paymentrequestupload/:id', /*update*/
                    component: PaymentRequestuploadComponent
                },
                {
                    path: 'paymentrequestdetail/:id', /*update*/
                    component: PaymentrequestdetailComponent
                },
            ]
        },

        {
            path: 'subreceivedrequestlist',
            component: ReceivedRequestlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'receivedrequestupload', /*add*/
                    component: ReceivedRequestuploadComponent
                },
                {
                    path: 'receivedrequestupload/:id', /*update*/
                    component: ReceivedRequestuploadComponent
                },
                {
                    path: 'receivedrequestdetail/:id', /*update*/
                    component: ReceivedrequestdetailComponent
                },
            ]
        },

        {
            path: 'subcashierreceivedrequestlist',
            component: CashierReceivedRequestlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'cashierreceivedrequestupload', /*add*/
                    component: CashierReceivedRequestuploadComponent
                },
                {
                    path: 'cashierreceivedrequestupload/:id', /*update*/
                    component: CashierReceivedRequestuploadComponent
                },
                {
                    path: 'cashierreceivedrequestdetail/:id', /*update*/
                    component: CashierreceivedrequestdetailComponent
                },
            ]
        },

        {
            path: 'subjournaltransactionlist',
            component: JournaltransactionlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'journaltransactiondetail/:id/:id2', /*update*/
                    component: JournaltransactiondetailComponent
                },
            ]
        },

        /* amortizationlist */
        {
            path: 'subamortizationlist',
            component: AmortizationlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'amortizationdetail/:id', /*edit*/
                    component: AmortizationdetailComponent
                },
            ]
        },

        {
            path: 'subagreementlist',
            component: AgreementlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'agreementdetail/:id',
                    component: AgreementdetailComponent
                },
            ]
        },

        {
            path: 'subobligationlist',
            component: ObligationlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'obligationdetail/:id', /*update*/
                    component: ObligationdetailComponent
                },
            ]
        },

        {
            path: 'subfundinusedlist',
            component: FundinusedlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'fundinuseddetail/:id', /*update*/
                    component: FundinuseddetailComponent
                },
            ]
        },

        {
            path: 'subagreementupdatelist',
            component: AgreementupdatelistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'agreementupdatedetail/:id',
                    component: AgreementupdatedetailComponent
                },
            ]
        },

        {
            path: 'subapthirdpartylist',
            component: ApThirdPartylistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'apthirdpartydetail/:id',
                    component: ApthirdpartydetailComponent
                },
            ]
        },
        {
            path: 'subagreementretentionhistory',
            component: AgreementretentionhistorylistComponent,
            canActivate: [AuthGuard],
        },

        {
            path: 'subaccounttransferrequestlist',
            component: AccounttransferrequestlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'accounttransferrequestdetail/:id',
                    component: AccounttransferrequestdetailComponent
                },
            ]
        },
    ]

}];
