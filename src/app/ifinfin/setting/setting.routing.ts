import { Routes } from '@angular/router';
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
import { ReportlistComponent } from './sysreport/reports/reportlist/reportlist.component';
import { ReportdetailComponent } from './sysreport/reports/reportdetail/reportdetail.component';
import { AccountpayablelistComponent } from './accountpayable/accountpayablelist/accountpayablelist.component';
import { AccountpayabledetailComponent } from './accountpayable/accountpayabledetail/accountpayabledetail.component';
import { AccountpayabledetaildetailComponent } from './accountpayable/accountpayabledetail/accountpayabledetaildetail/accountpayabledetaildetail.component';
import { ReversalvalidationlistComponent } from './reversalvalidation/reversalvalidationlist/reversalvalidationlist.component';
import { ReversalvalidationdetailComponent } from './reversalvalidation/reversalvalidationdetail/reversalvalidationdetail.component';

import { AuthGuard } from '../../../auth.guard';
import { MasterdashboardlistComponent } from './masterdashboard/masterdashboardlist/masterdashboardlist.component';
import { MasterdashboarddetailComponent } from './masterdashboard/masterdashboarddetail/masterdashboarddetail.component';
import { MasterdashboarduserlistComponent } from './masterdashboarduser/masterdashboarduserlist/masterdashboarduserlist.component';
import { MasterdashboarduserdetailComponent } from './masterdashboarduser/masterdashboarduserdetail/masterdashboarduserdetail.component';
import { MasterapprovallistComponent } from './masterapproval/masterapprovallist/masterapprovallist.component';
import { MasterapprovaldetailComponent } from './masterapproval/masterapprovaldetail/masterapprovaldetail.component';
import { DimensionlistComponent } from './dimension/dimensionlist/dimensionlist.component';
import { DimensiondetailComponent } from './dimension/dimensiondetail/dimensiondetail.component';
import { DimensiondetaildetailComponent } from './dimension/dimensiondetail/dimensiondetaildetail/dimensiondetaildetail.component';

export const Setting: Routes = [{
    path: '',
    children: [
        {
            path: 'subcodelist',
            component: CodelistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'codedetail', /*add*/
                    component: CodedetailComponent
                },
                {
                    path: 'codedetail/:id', /*update*/
                    component: CodedetailComponent
                },
                {
                    path: 'subcodedetail/:id', /*add*/
                    component: SubcodedetailComponent
                },
                {
                    path: 'subcodedetail/:id/:id2', /*update*/
                    component: SubcodedetailComponent
                }
            ]
        },

        {
            path: 'subnumberlist',
            component: NumberlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'numberdetail', /*add*/
                    component: NumberdetailComponent
                },
                {
                    path: 'numberdetail/:id', /*update*/
                    component: NumberdetailComponent
                },
            ]
        },

        {
            path: 'subcashierprioritylist',
            component: CashierprioritylistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'cashierprioritydetail', /*add*/
                    component: CashierprioritydetailComponent
                },
                {
                    path: 'cashierprioritydetail/:id', /*update*/
                    component: CashierprioritydetailComponent
                },
                {
                    path: 'cashierprioritydetaildetail/:id', /*add*/
                    component: CashierprioritydetaildetailComponent
                },
                {
                    path: 'cashierprioritydetaildetail/:id/:id2', /*update*/
                    component: CashierprioritydetaildetailComponent
                },
            ]
        },

        {
            path: 'subprogressivetaxpolicylist',
            component: ProgressivetaxpolicylistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'progressivetaxpolicydetail', /*add*/
                    component: ProgressivetaxpolicydetailComponent
                },
                {
                    path: 'progressivetaxpolicydetail/:id', /*update*/
                    component: ProgressivetaxpolicydetailComponent
                },
                {
                    path: 'progressivetaxpolicydetaildetail/:id', /*add*/
                    component: ProgressivetaxpolicydetaildetailComponent
                },
                {
                    path: 'progressivetaxpolicydetaildetail/:id/:id2', /*update*/
                    component: ProgressivetaxpolicydetaildetailComponent
                },
            ]
        },

        {
            path: 'subcashiertransactionlist',
            component: CashiertransactionlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'cashiertransactiondetail', /*add*/
                    component: CashiertransactiondetailComponent
                },
                {
                    path: 'cashiertransactiondetail/:id', /*update*/
                    component: CashiertransactiondetailComponent
                },
            ]
        },

        {
            path: 'subbanknoteandcoinlist',
            component: BanknoteandcoinlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'banknoteandcoindetail', /*add*/
                    component: BanknoteandcoindetailComponent
                },
                {
                    path: 'banknoteandcoindetail/:id', /*update*/
                    component: BanknoteandcoindetailComponent
                },
            ]
        },

        {
            path: 'subcashierquestionlist',
            component: CashierquestionlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'cashierquestiondetail', /*add*/
                    component: CashierquestiondetailComponent
                },
                {
                    path: 'cashierquestiondetail/:id', /*update*/
                    component: CashierquestiondetailComponent
                },
            ]
        },

        {
            path: 'subreferencelist',
            component: ReferencelistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'referencedetail', /*add*/
                    component: ReferencedetailComponent
                },
                {
                    path: 'referencedetail/:id', /*update*/
                    component: ReferencedetailComponent
                },
            ]
        },

        {
            path: 'subgllinklist',
            component: GllinklistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'gllinkdetail', /*add*/
                    component: GllinkdetailComponent
                },
                {
                    path: 'gllinkdetail/:id', /*update*/
                    component: GllinkdetailComponent
                },
            ]
        },

        {
            path: 'subtransactionlist',
            component: TransactionlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'transactiondetail', /*add*/
                    component: TransactiondetailComponent
                },
                {
                    path: 'transactiondetail/:id', /*update*/
                    component: TransactiondetailComponent
                },
            ]
        },

        {
            path: 'subreportlist',
            component: ReportlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'reportsdetail', /*add*/
                    component: ReportdetailComponent
                },
                {
                    path: 'reportsdetail/:id', /*update*/
                    component: ReportdetailComponent
                },
            ]
        },

        //acountpayable
        {
            path: 'subaccountpayablelist',
            component: AccountpayablelistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'accountpayabledetail', /*add*/
                    component: AccountpayabledetailComponent
                },
                {
                    path: 'accountpayabledetail/:id', /*update*/
                    component: AccountpayabledetailComponent
                },
                {
                    path: 'accountpayabledetaildetail/:id', /*add*/
                    component: AccountpayabledetaildetailComponent
                },
                {
                    path: 'accountpayabledetaildetail/:id/:id2', /*update*/
                    component: AccountpayabledetaildetailComponent
                }
            ]
        },

        {
            path: 'subreversalvalidationlist',
            component: ReversalvalidationlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'reversalvalidationdetail', /*add*/
                    component: ReversalvalidationdetailComponent
                },
                {
                    path: 'reversalvalidationdetail/:id', /*update*/
                    component: ReversalvalidationdetailComponent
                },
            ]
        },

        //master dashboard
        {
            path: 'submasterdashboardlist',
            component: MasterdashboardlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'masterdashboarddetail', /*add*/
                    component: MasterdashboarddetailComponent
                },
                {
                    path: 'masterdashboarddetail/:id', /*update*/
                    component: MasterdashboarddetailComponent
                },
            ]
        },
        //master dashboard

        //master dashboard User
        {
            path: 'submasterdashboarduserlist',
            component: MasterdashboarduserlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'masterdashboarduserdetail', /*add*/
                    component: MasterdashboarduserdetailComponent
                },
                {
                    path: 'masterdashboarduserdetail/:id', /*update*/
                    component: MasterdashboarduserdetailComponent
                },
            ]
        },
        //master dashboard User

        {
            path: 'submasterapprovallist',
            component: MasterapprovallistComponent,
            children: [
                {
                    path: 'masterapprovaldetail', /*add*/
                    component: MasterapprovaldetailComponent,
                },
                {
                    path: 'masterapprovaldetail/:id', /*update*/
                    component: MasterapprovaldetailComponent,
                },
            ],
            canActivate: [AuthGuard]
        },

        {
            path: 'subdimensionlist',
            component: DimensionlistComponent,
            children: [
                {
                    path: 'dimensiondetail', /*add*/
                    component: DimensiondetailComponent
                },
                {
                    path: 'dimensiondetail/:id', /*update*/
                    component: DimensiondetailComponent
                },
                {
                    path: 'dimensiondetaildetail/:id', /*add*/
                    component: DimensiondetaildetailComponent
                },
                {
                    path: 'dimensiondetaildetail/:id/:id2', /*update*/
                    component: DimensiondetaildetailComponent
                }
            ],
            canActivate: [AuthGuard]
        },
    ]
}];
