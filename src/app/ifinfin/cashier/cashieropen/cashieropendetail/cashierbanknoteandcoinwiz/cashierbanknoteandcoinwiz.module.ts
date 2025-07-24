import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { DALService } from '../../../../../../DALservice.service';
import { SpinnerModule } from '../../../../../spinner-ui/spinner/spinner.module';
import { CashierBankandCoinWiz } from './cashierbanknoteandcoinwiz.routing';
import { CashierbanknoteandcoinlistComponent } from './cashierbanknoteandcoinlist/cashierbanknoteandcoinlist.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(CashierBankandCoinWiz),
        FormsModule,
        HttpClientModule,
        NgbModule,
        DataTablesModule,
        SpinnerModule
    ],
    declarations: [
        CashierbanknoteandcoinlistComponent
    ],
    providers: [
        DALService
    ]
})

export class CashierBankandCoinWizModule { }
