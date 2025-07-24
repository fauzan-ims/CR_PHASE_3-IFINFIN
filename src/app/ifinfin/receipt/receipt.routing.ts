import { Routes } from '@angular/router';
import { ReceiptregisterlistComponent } from './receiptregister/receiptregisterlist/receiptregisterlist.component';
import { ReceiptregisterdetailComponent } from './receiptregister/receiptregisterdetail/receiptregisterdetail.component';
import { ReceiptlistlistComponent } from './receiptlist/receiptlistlist/receiptlistlist.component';
import { ReceiptvoidlistComponent } from './receiptvoid/receiptvoidlist/receiptvoidlist.component';
import { ReceiptvoiddetailComponent } from './receiptvoid/receiptvoiddetail/receiptvoiddetail.component';
import { AuthGuard } from '../../../auth.guard';

export const Receipt: Routes = [{
    path: '',
    children: [
        {
            path: 'subreceiptregisterlist',
            component: ReceiptregisterlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'receiptregisterdetail', /*add*/
                    component: ReceiptregisterdetailComponent
                },
                {
                    path: 'receiptregisterdetail/:id', /*update*/
                    component: ReceiptregisterdetailComponent
                },
            ]
        },

        {
            path: 'subreceiptlistlist',
            component: ReceiptlistlistComponent,
            canActivate: [AuthGuard],
        },
        {
            path: 'subreceiptvoidlist',
            component: ReceiptvoidlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'receiptvoiddetail', /*add*/
                    component: ReceiptvoiddetailComponent
                },
                {
                    path: 'receiptvoiddetail/:id', /*update*/
                    component: ReceiptvoiddetailComponent
                },
            ]
        },

    ]

}];
