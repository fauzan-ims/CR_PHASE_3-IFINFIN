import { Routes } from '@angular/router';
import { ReceiptrequestlistComponent } from './receiptrequest/receiptrequestlist/receiptrequestlist.component';
import { PvmanuallistComponent } from './pvmanual/pvmanuallist/pvmanuallist.component';
import { PvmanualdetailComponent } from './pvmanual/pvmanualdetail/pvmanualdetail.component';
// tslint:disable-next-line:max-line-length
import { PvmanualdetaildetailComponent } from './pvmanual/pvmanualdetail/pvmanualdetaildetail/pvmanualdetaildetail/pvmanualdetaildetail.component';
import { ReceiptconfirmlistComponent } from './receiptconfirm/receiptconfirmlist/receiptconfirmlist.component';
import { ReceiptconfirmdetailComponent } from './receiptconfirm/receiptconfirmdetail/receiptconfirmdetail.component';
// tslint:disable-next-line:max-line-length
import { ReceiptconfirmdetaildetailComponent } from './receiptconfirm/receiptconfirmdetail/receiptconfirmdetaildetail/receiptconfirmdetaildetail/receiptconfirmdetaildetail.component';
import { PaymentrequestlistComponent } from './paymentrequest/paymentrequestlist/paymentrequestlist.component';
import { PaymentconfirmlistComponent } from './paymentconfirm/paymentconfirmlist/paymentconfirmlist.component';
import { PaymentconfirmdetailComponent } from './paymentconfirm/paymentconfirmdetail/paymentconfirmdetail.component';
// tslint:disable-next-line:max-line-length
import { PaymentconfirmdetaildetailComponent } from './paymentconfirm/paymentconfirmdetail/paymentconfirmdetaildetail/paymentconfirmdetaildetail/paymentconfirmdetaildetail.component';
import { RvmanuallistComponent } from './rvmanual/rvmanuallist/rvmanuallist.component';
import { RvmanualdetailComponent } from './rvmanual/rvmanualdetail/rvmanualdetail.component';
// tslint:disable-next-line:max-line-length
import { RvmanualdetaildetailComponent } from './rvmanual/rvmanualdetail/rvmanualdetaildetail/rvmanualdetaildetail/rvmanualdetaildetail.component';
import { AuthGuard } from '../../../auth.guard';

export const PvorRvRequest: Routes = [{
    path: '',
    children: [
        {
            path: 'subreceiptrequestlist',
            component: ReceiptrequestlistComponent,
            canActivate: [AuthGuard],
        },
        {
            path: 'subpvmanuallist',
            component: PvmanuallistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'pvmanualdetail', /*add*/
                    component: PvmanualdetailComponent
                },
                {
                    path: 'pvmanualdetail/:id', /*update*/
                    component: PvmanualdetailComponent
                },
                {
                    path: 'pvmanualdetaildetail/:id', /*add*/
                    component: PvmanualdetaildetailComponent
                },
                {
                    path: 'pvmanualdetaildetail/:id/:id2', /*update*/
                    component: PvmanualdetaildetailComponent
                },
            ]
        },

        {
            path: 'subrvmanuallist',
            component: RvmanuallistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'rvmanualdetail', /*add*/
                    component: RvmanualdetailComponent
                },
                {
                    path: 'rvmanualdetail/:id', /*update*/
                    component: RvmanualdetailComponent
                },
                {
                    path: 'rvmanualdetaildetail/:id', /*add*/
                    component: RvmanualdetaildetailComponent
                },
                {
                    path: 'rvmanualdetaildetail/:id/:id2', /*update*/
                    component: RvmanualdetaildetailComponent
                },
            ]
        },

        {
            path: 'subreceiptconfirmlist',
            component: ReceiptconfirmlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'receiptconfirmdetail', /*add*/
                    component: ReceiptconfirmdetailComponent
                },
                {
                    path: 'receiptconfirmdetail/:id', /*update*/
                    component: ReceiptconfirmdetailComponent
                },
                {
                    path: 'receiptconfirmdetaildetail/:id', /*update*/
                    component: ReceiptconfirmdetaildetailComponent
                },
                {
                    path: 'receiptconfirmdetaildetail/:id/:id2', /*update*/
                    component: ReceiptconfirmdetaildetailComponent
                },
            ]
        },

        {
            path: 'subpaymentrequestlist',
            component: PaymentrequestlistComponent,
            canActivate: [AuthGuard],
        },
        {
            path: 'subpaymentconfirmlist',
            component: PaymentconfirmlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'paymentconfirmdetail/:id', /*update*/
                    component: PaymentconfirmdetailComponent
                },
                {
                    path: 'paymentconfirmdetaildetaildetail/:id/:id2', /*update*/
                    component: PaymentconfirmdetaildetailComponent
                },
            ]
        },

    ]

}];
