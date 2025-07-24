import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '../../../auth-interceptor';
import { AuthGuard } from '../../../auth.guard';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { DALService } from '../../../DALservice.service';
import { Setting } from './setting.routing';
import { SpinnerModule } from '../../spinner-ui/spinner/spinner.module';
import { CodelistComponent } from './code/codelist/codelist.component';
import { CodedetailComponent } from './code/codedetail/codedetail.component';
import { SubcodedetailComponent } from './code/codedetail/subcode/subcodedetail.component';
import { NumberlistComponent } from './number/numberlist/numberlist.component';
import { NumberdetailComponent } from './number/numberdetail/numberdetail.component';
import { CashierprioritylistComponent } from './cashierpriority/cashierprioritylist/cashierprioritylist.component';
import { CashierprioritydetailComponent } from './cashierpriority/cashierprioritydetail/cashierprioritydetail.component';
import { CashierprioritydetaildetailComponent } from './cashierpriority/cashierprioritydetail/cashierprioritydetaildetail/cashierprioritydetaildetail.component';
import { ProgressivetaxpolicylistComponent } from './progressivetaxpolicy/progressivetaxpolicylist/progressivetaxpolicylist.component';
import { ProgressivetaxpolicydetailComponent } from './progressivetaxpolicy/progressivetaxpolicydetail/progressivetaxpolicydetail.component';
import { ProgressivetaxpolicydetaildetailComponent } from './progressivetaxpolicy/progressivetaxpolicydetail/progressivetaxpolicydetaildetail/progressivetaxpolicydetaildetail/progressivetaxpolicydetaildetail.component';
import { CashiertransactionlistComponent } from './cashiertransaction/cashiertransactionlist/cashiertransactionlist.component';
import { CashiertransactiondetailComponent } from './cashiertransaction/cashiertransactiondetail/cashiertransactiondetail.component';
import { BanknoteandcoinlistComponent } from './banknoteandcoin/banknoteandcoinlist/banknoteandcoinlist.component';
import { BanknoteandcoindetailComponent } from './banknoteandcoin/banknoteandcoindetail/banknoteandcoindetail.component';
import { CashierquestionlistComponent } from './cashierquestion/cashierquestionlist/cashierquestionlist.component';
import { CashierquestiondetailComponent } from './cashierquestion/cashierquestiondetail/cashierquestiondetail.component';
import { ReferencelistComponent } from './reference/referencelist/referencelist.component';
import { ReferencedetailComponent } from './reference/referencedetail/referencedetail.component';
import { GllinklistComponent } from './gllink/gllinklist/gllinklist.component';
import { GllinkdetailComponent } from './gllink/gllinkdetail/gllinkdetail.component';
import { TransactionlistComponent } from './transaction/transactionlist/transactionlist.component';
import { TransactiondetailComponent } from './transaction/transactiondetail/transactiondetail.component';
import { AngularMyDatePickerModule } from 'angular-mydatepicker';
import { ReportlistComponent } from './sysreport/reports/reportlist/reportlist.component';
import { ReportdetailComponent } from './sysreport/reports/reportdetail/reportdetail.component';
import { AccountpayablelistComponent } from './accountpayable/accountpayablelist/accountpayablelist.component';
import { AccountpayabledetailComponent } from './accountpayable/accountpayabledetail/accountpayabledetail.component';
import { AccountpayabledetaildetailComponent } from './accountpayable/accountpayabledetail/accountpayabledetaildetail/accountpayabledetaildetail.component';
import { ReversalvalidationlistComponent } from './reversalvalidation/reversalvalidationlist/reversalvalidationlist.component';
import { ReversalvalidationdetailComponent } from './reversalvalidation/reversalvalidationdetail/reversalvalidationdetail.component';
import { MasterdashboardlistComponent } from './masterdashboard/masterdashboardlist/masterdashboardlist.component';
import { MasterdashboarddetailComponent } from './masterdashboard/masterdashboarddetail/masterdashboarddetail.component';
import { MasterdashboarduserlistComponent } from './masterdashboarduser/masterdashboarduserlist/masterdashboarduserlist.component';
import { MasterdashboarduserdetailComponent } from './masterdashboarduser/masterdashboarduserdetail/masterdashboarduserdetail.component';
import { MasterapprovallistComponent } from './masterapproval/masterapprovallist/masterapprovallist.component';
import { MasterapprovaldetailComponent } from './masterapproval/masterapprovaldetail/masterapprovaldetail.component';
import { DimensionlistComponent } from './dimension/dimensionlist/dimensionlist.component';
import { DimensiondetailComponent } from './dimension/dimensiondetail/dimensiondetail.component';
import { DimensiondetaildetailComponent } from './dimension/dimensiondetail/dimensiondetaildetail/dimensiondetaildetail.component';


@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(Setting),
        FormsModule,
        HttpClientModule,
        NgbModule,
        DataTablesModule,
        SpinnerModule,
        AngularMyDatePickerModule
    ],
    declarations: [
        CodelistComponent,
        CodedetailComponent,
        SubcodedetailComponent,
        NumberlistComponent,
        NumberdetailComponent,
        CashierprioritylistComponent,
        CashierprioritydetailComponent,
        CashierprioritydetaildetailComponent,
        ProgressivetaxpolicylistComponent,
        ProgressivetaxpolicydetailComponent,
        ProgressivetaxpolicydetaildetailComponent,
        CashiertransactionlistComponent,
        CashiertransactiondetailComponent,
        BanknoteandcoinlistComponent,
        BanknoteandcoindetailComponent,
        CashierquestionlistComponent,
        CashierquestiondetailComponent,
        ReferencelistComponent,
        ReferencedetailComponent,
        GllinklistComponent,
        GllinkdetailComponent,
        TransactionlistComponent,
        TransactiondetailComponent,
        ReportlistComponent,
        ReportdetailComponent,
        AccountpayablelistComponent,
        AccountpayabledetailComponent,
        AccountpayabledetaildetailComponent,
        ReversalvalidationlistComponent,
        ReversalvalidationdetailComponent,
        MasterdashboardlistComponent,
        MasterdashboarddetailComponent,
        MasterdashboarduserlistComponent,
        MasterdashboarduserdetailComponent,
        MasterapprovallistComponent,
        MasterapprovaldetailComponent,
        DimensionlistComponent,
        DimensiondetailComponent,
        DimensiondetaildetailComponent,
    ],
    providers: [
        DALService,
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true } // back to login if 401
        , AuthGuard // penjagaan apabila dari login langsung masuk ke dashboard atau ke halaman lain
    ]
})

export class SettingModule { }
