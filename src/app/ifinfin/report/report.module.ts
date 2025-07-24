import { NgModule, ErrorHandler } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { DALService } from '../../../DALservice.service';
import { Report } from './report.routing';
import { AuthInterceptor } from '../../../auth-interceptor';
import { AuthGuard } from '../../../auth.guard';
import { SpinnerModule } from '../../spinner-ui/spinner/spinner.module';
import { ReportlistComponent } from './reports/reportlist/reportlist.component';
import { ReportUnknownMonitoring } from './reports/reportunknownmonitoring/reportunknownmonitoring.component';
import { ReportBankBook } from './reports/reportbankbook/reportbankbook.component';
import { ReportFinanceTransaction } from './reports/reportfinancetransaction/reportfinancetransaction.component';
import { ReportApPaymentRequest } from './reports/reportappaymentrequest/reportappaymentrequest.component';
import { ReportAutoDebet } from './reports/reportautodebet/reportautodebet.component';
import { ReportPendingDisbursement } from './reports/reportpendingdisbursement/reportpendingdisbursement.component';
import { ReportAdvanceAllocation } from './reports/reportadvanceallocation/reportadvanceallocation.component';
import { AngularMyDatePickerModule } from 'angular-mydatepicker';
import { ReportsettinglistComponent } from './reportsettinglist/reportsetttinglist.component';


@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(Report),
        FormsModule,
        HttpClientModule,
        NgbModule,
        DataTablesModule,
        SpinnerModule,
        AngularMyDatePickerModule
    ],
    declarations: [
        ReportlistComponent,
        ReportUnknownMonitoring,
        ReportBankBook,
        ReportFinanceTransaction,
        ReportApPaymentRequest,
        ReportAutoDebet,
        ReportPendingDisbursement,
        ReportAdvanceAllocation,
        ReportsettinglistComponent
    ],
    providers: [
        DALService,
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true } // back to login if 401
        , AuthGuard // penjagaan apabila dari login langsung masuk ke dashboard atau ke halaman lain
    ]
})

export class SettingModule { }
