import { Routes } from '@angular/router';
import { CashiertransactionallocationlistComponent } from './cashiertrasactionallocationlist/cashiertrasactionallocationlist.component';

export const CashierTransactionAllocationWizRoutes: Routes = [{
    path: '',
    children: [
        {
            path: 'cashiertransactionallocationlist/:id',
            component: CashiertransactionallocationlistComponent
        }
    ]
}];
