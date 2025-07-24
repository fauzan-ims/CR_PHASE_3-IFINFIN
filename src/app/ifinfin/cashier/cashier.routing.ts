import { Routes } from '@angular/router';
import { CashieropenlistComponent } from './cashieropen/cashieropenlist/cashieropenlist.component';
import { CashieropendetailComponent } from './cashieropen/cashieropendetail/cashieropendetail.component';
import { CashiertransactionlistComponent } from './cashiertransaction/cashiertransactionlist/cashiertransactionlist.component';
import { CashiertransactiondetailComponent } from './cashiertransaction/cashiertransactiondetail/cashiertransactiondetail.component';
// tslint:disable-next-line:max-line-length
import { AccounttransferrequestlistComponent } from './accounttransferrequest/accounttransferrequestlist/accounttransferrequestlist.component';
// tslint:disable-next-line:max-line-length
import { AccounttransferrequestdetailComponent } from './accounttransferrequest/accounttransferrequestdetail/accounttransferrequestdetail.component';
import { ReprintreceiptdetailComponent } from './reprintreceipt/reprintreceiptdetail/reprintreceiptdetail.component';
import { ReprintreceiptlistComponent } from './reprintreceipt/reprintreceiptlist/reprintreceiptlist.component';
import { InquirycashierlistComponent } from './inquirycashier/inquirycashierlist/inquirycashierlist.component';
import { InquirycashierdetailComponent } from './inquirycashier/inquirycashierdetail/inquirycashierdetail.component';
import { CashierreceiptlistComponent } from './cashieropen/cashieropendetail/cashierreceiptwiz/cashierreceiptlist/cashierreceiptlist.component';
import { CashierbanknoteandcoinlistComponent } from './cashieropen/cashieropendetail/cashierbanknoteandcoinwiz/cashierbanknoteandcoinlist/cashierbanknoteandcoinlist.component';
import { ReceiptrequestlistComponent } from './cashierreceiptrequest/cashierreceiptrequestlist/receiptrequestlist.component';
import { AuthGuard } from '../../../auth.guard';

//wizard
import { CashiertransactionallocationlistComponent } from './cashiertransaction/cashiertransactiondetail/cashiertransactionallocationwiz/cashiertrasactionallocationlist/cashiertrasactionallocationlist.component';
import { CashiertransactioninvoicelistComponent } from './cashiertransaction/cashiertransactiondetail/cashiertransactioninvoicewiz/cashiertransactioninvoicelist/cashiertransactioninvoicelist.component';
import { CashieruploadlistComponent } from './cashierupload/cashieruploadlist/cashieruploadlist.component';
import { CashieruploaddetailComponent } from './cashierupload/cashieruploaddetail/cashieruploaddetail.component';


export const Cashier: Routes = [{
    path: '',
    children: [
        {
            path: 'subcashieropenlist',
            component: CashieropenlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'cashieropendetail',
                    component: CashieropendetailComponent
                },
                {
                    path: 'cashieropendetail/:id',
                    component: CashieropendetailComponent,
                    children: [
                        {
                            path: 'cashierreceiptlist/:id',
                            component: CashierreceiptlistComponent
                        },
                        {
                            path: 'cashierbanknoteandcoinlist/:id',
                            component: CashierbanknoteandcoinlistComponent
                        }
                    ]
                },
            ]
        },

        {
            path: 'subcashierreceiptrequestlist',
            component: ReceiptrequestlistComponent,
            canActivate: [AuthGuard],

        },
        {
            path: 'subcashiertransactionlist',
            component: CashiertransactionlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'cashiertransactiondetail',
                    component: CashiertransactiondetailComponent
                },
                {
                    path: 'cashiertransactiondetail/:id',
                    component: CashiertransactiondetailComponent,
                    children: [
                        {
                            path: 'cashiertransactionallocationlist/:id',
                            component: CashiertransactionallocationlistComponent
                        },
                        {
                            path: 'cashiertransactioninvoicelist/:id',
                            component: CashiertransactioninvoicelistComponent
                        },
                    ]
                },
            ]
        },

        {
            path: 'subaccounttransferrequestlist',
            component: AccounttransferrequestlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'accounttransferrequestdetail',
                    component: AccounttransferrequestdetailComponent
                },
                {
                    path: 'accounttransferrequestdetail/:id',
                    component: AccounttransferrequestdetailComponent
                },
            ]
        },

        {
            path: 'subreprintreceiptlist',
            component: ReprintreceiptlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'reprintreceiptdetail',
                    component: ReprintreceiptdetailComponent
                },
                {
                    path: 'reprintreceiptdetail/:id',
                    component: ReprintreceiptdetailComponent
                },
            ]
        },

        {
            path: 'subinquirycashierlist',
            component: InquirycashierlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'inquirycashierdetail/:id',
                    component: InquirycashierdetailComponent
                },
            ]
        },

        {
            path: 'subcashieruploadlist',
            component: CashieruploadlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'cashieruploaddetail',
                    component: CashieruploaddetailComponent
                },
                {
                    path: 'cashieruploaddetail/:id',
                    component: CashieruploaddetailComponent
                },
            ]
        },

    ]

}];
