import { Routes } from '@angular/router';
import { ReportlistComponent } from './reports/reportlist/reportlist.component';
import { ReportUnknownMonitoring } from './reports/reportunknownmonitoring/reportunknownmonitoring.component';
import { ReportBankBook } from './reports/reportbankbook/reportbankbook.component';
import { ReportFinanceTransaction } from './reports/reportfinancetransaction/reportfinancetransaction.component';
import { ReportApPaymentRequest } from './reports/reportappaymentrequest/reportappaymentrequest.component';
import { ReportAutoDebet } from './reports/reportautodebet/reportautodebet.component';
import { ReportPendingDisbursement } from './reports/reportpendingdisbursement/reportpendingdisbursement.component';
import { ReportAdvanceAllocation } from './reports/reportadvanceallocation/reportadvanceallocation.component';
import { AuthGuard } from '../../../auth.guard';
import { ReportsettinglistComponent } from './reportsettinglist/reportsetttinglist.component';

export const Report: Routes = [{
    path: '',
    children: [

        {
            path: 'subreportmanagementlist',
            component: ReportlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'reportunknownmonitoring/:id/:page',
                    component: ReportUnknownMonitoring
                },
                {
                    path: 'reportbankbook/:id/:page',
                    component: ReportBankBook
                },
                {
                    path: 'reportfinancetransaction/:id/:page',
                    component: ReportFinanceTransaction
                },  
                {
                    path: 'reportappaymentrequest/:id/:page',
                    component: ReportApPaymentRequest
                },   
                {
                    path: 'reportautodebet/:id/:page',
                    component: ReportAutoDebet
                }, 
                {
                    path: 'reportpendingdisbursement/:id/:page',
                    component: ReportPendingDisbursement
                },  
                {
                    path: 'reportadvanceallocation/:id/:page',
                    component: ReportAdvanceAllocation
                },

            ]
        },

        {
            path: 'subreportoperationallist',
            component: ReportlistComponent,
            canActivate: [AuthGuard],
            children: [ 
                {
                    path: 'reportunknownmonitoring/:id/:page',
                    component: ReportUnknownMonitoring
                },
                {
                    path: 'reportbankbook/:id/:page',
                    component: ReportBankBook
                },
                {
                    path: 'reportfinancetransaction/:id/:page',
                    component: ReportFinanceTransaction
                },  
                {
                    path: 'reportappaymentrequest/:id/:page',
                    component: ReportApPaymentRequest
                },   
                {
                    path: 'reportautodebet/:id/:page',
                    component: ReportAutoDebet
                }, 
                {
                    path: 'reportpendingdisbursement/:id/:page',
                    component: ReportPendingDisbursement
                },  
                {
                    path: 'reportadvanceallocation/:id/:page',
                    component: ReportAdvanceAllocation
                },     
            ]
        },
        {
            path: 'subreportsetting',
            component: ReportsettinglistComponent,
            canActivate: [AuthGuard]
        }
    ]

}];
