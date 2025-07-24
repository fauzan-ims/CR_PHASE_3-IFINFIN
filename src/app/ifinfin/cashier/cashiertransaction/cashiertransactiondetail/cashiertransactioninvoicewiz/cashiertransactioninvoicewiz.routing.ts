import { Routes } from '@angular/router';
import { CashiertransactioninvoicelistComponent } from './cashiertransactioninvoicelist/cashiertransactioninvoicelist.component';

export const CashierTransactionInvoiceWizRoutes: Routes = [{
    path: '',
    children: [
        {
            path: 'cashiertransactioninvoicelist/:id',
            component: CashiertransactioninvoicelistComponent
        }
    ]
}];
