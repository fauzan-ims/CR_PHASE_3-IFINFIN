import { Routes } from '@angular/router';
import { CashierbanknoteandcoinlistComponent } from './cashierbanknoteandcoinlist/cashierbanknoteandcoinlist.component';

export const CashierBankandCoinWiz: Routes = [{
    path: '',
    children: [
        {
            path: 'cashierbanknoteandcoinlist/:id/:status',
            component: CashierbanknoteandcoinlistComponent
        }
    ]

}];
