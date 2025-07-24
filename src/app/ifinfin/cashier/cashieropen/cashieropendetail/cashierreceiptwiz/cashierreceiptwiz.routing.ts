import { Routes } from '@angular/router';
import { CashierreceiptlistComponent } from './cashierreceiptlist/cashierreceiptlist.component';

export const CashierReceiptWiz: Routes = [{
    path: '',
    children: [
        {
            path: 'cashierreceiptlist/:id/:status/:branch',
            component: CashierreceiptlistComponent
        }
    ]

}];
