import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { CashierTransactionAllocationWizRoutes } from './cashiertransactionallocationwiz.routing';
import { DALService } from '../../../../../../DALservice.service';
import { CashiertransactionallocationlistComponent } from './cashiertrasactionallocationlist/cashiertrasactionallocationlist.component';
import { SpinnerModule } from '../../../../../spinner-ui/spinner/spinner.module';


@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(CashierTransactionAllocationWizRoutes),
        FormsModule,
        HttpClientModule,
        NgbModule,
        DataTablesModule,
        SpinnerModule,
    ],
    declarations: [
        CashiertransactionallocationlistComponent
    ]
    ,
    providers: [
        DALService
    ]
})

export class CashierTransactionAllocationWizModule { }
