import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { CashierTransactionInvoiceWizRoutes } from './cashiertransactioninvoicewiz.routing';
import { DALService } from '../../../../../../DALservice.service';
import { CashiertransactioninvoicelistComponent } from './cashiertransactioninvoicelist/cashiertransactioninvoicelist.component';
import { SpinnerModule } from '../../../../../spinner-ui/spinner/spinner.module';


@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(CashierTransactionInvoiceWizRoutes),
        FormsModule,
        HttpClientModule,
        NgbModule,
        DataTablesModule,
        SpinnerModule,
    ],
    declarations: [
        CashiertransactioninvoicelistComponent
    ]
    ,
    providers: [
        DALService
    ]
})

export class CashierTransactionInvoiceWizModule { }
