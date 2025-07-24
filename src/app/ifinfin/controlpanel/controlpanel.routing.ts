import { Routes } from '@angular/router';
import { BackuplistComponent } from './backup/backuplist/backuplist.component';
import { LockinglistComponent } from './locking/lockinglist/lockinglist.component';
import { EodlistComponent } from './eod/eodlist/eodlist.component';
import { AuditlistComponent } from './audit/auditlist/auditlist.component';
import { ItparamlistComponent } from './itparam/itparamlist/itparamlist.component';
import { MasterjoblistComponent } from './masterjob/masterjoblist/masterjoblist.component';
import { MasterjobdetailComponent } from './masterjob/masterjobdetail/masterjobdetail.component';
import { MonitoringlistComponent } from './monitoring/monitoringlist/monitoringlist.component';
//import { ReportLogComponent } from './sysreportlog/reportlog/reportlog.component';

import { AuthGuard } from '../../../auth.guard';
import { ReportLogComponent } from './sysreportlog/reportlog/reportlog.component';
import { SystodolistComponent } from './systodo/systodolist/systodolist.component';
import { SystododetailComponent } from './systodo/systododetail/systododetail.component';
import { SystodoemployeelistComponent } from './systodoemployee/systodoemployeelist/systodoemployeelist.component';
import { SystodoemployeedetailComponent } from './systodoemployee/systodoemployeedetail/systodoemployeedetail.component';
import { GlobalParamlistComponent } from './globalparam/globalparamlist/globalparamlist.component';
import { GlobalParamdetailComponent } from './globalparam/globalparamdetail/globalparamdetail.component';
import { MasterfaqlistComponent } from './masterfaq/masterfaqlist/masterfaqlist.component';
import { MasterfaqdetailComponent } from './masterfaq/masterfaqdetail/masterfaqdetail.component';
import { LockingdetailComponent } from './locking/lockingdetail/lockingdetail.component';
import { SysErrorLoglistComponent } from './syserrorlog/syserrorloglist/syserrorloglist.component';


export const Report: Routes = [{
    path: '',
    children: [

        {
            path: 'subbackuplist',
            component: BackuplistComponent,
            canActivate: [AuthGuard],
        },
        {
            path: 'sublockinglist',
            component: LockinglistComponent,
            canActivate: [AuthGuard],
        },
        {
            path: 'subeodlist',
            component: EodlistComponent,
            canActivate: [AuthGuard],
        },
        {
            path: 'subauditlist',
            component: AuditlistComponent,
            canActivate: [AuthGuard],
        },
        {
            path: 'subitparamlist',
            component: ItparamlistComponent,
            canActivate: [AuthGuard],
        },
        {
            path: 'subjobtasklist',
            component: MasterjoblistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'masterjobdetail', /*add*/
                    component: MasterjobdetailComponent
                },
                {
                    path: 'masterjobdetail/:id', /*update*/
                    component: MasterjobdetailComponent
                },
            ]
        },

        {
            path: 'submonitoringlist',
            component: MonitoringlistComponent,
            canActivate: [AuthGuard],
        },
        {
            path: 'subreportlog',
            component: ReportLogComponent,
            canActivate: [AuthGuard],
        },
        {
            path: 'subsystodolist',
            component: SystodolistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'systododetail', /*add*/
                    component: SystododetailComponent
                },
                {
                    path: 'systododetail/:id', /*update*/
                    component: SystododetailComponent
                },
            ]
        },
        {
            path: 'subsystodoemployeelist',
            component: SystodoemployeelistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'systodoemployeedetail', /*add*/
                    component: SystodoemployeedetailComponent
                },
                {
                    path: 'systodoemployeedetail/:id', /*update*/
                    component: SystodoemployeedetailComponent
                },
               
            ]
        },
        {
            path: 'subglobalparamlist',
            component: GlobalParamlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'globalparamdetail', /*add*/
                    component: GlobalParamdetailComponent
                },
                {
                    path: 'globalparamdetail/:id', /*update*/
                    component: GlobalParamdetailComponent
                },
            ]
        },
        {
            path: 'submasterfaqlist',
            component: MasterfaqlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'masterfaqdetail', /*add */
                    component: MasterfaqdetailComponent
                },
                {
                    path: 'masterfaqdetail/:id', /*update */
                    component: MasterfaqdetailComponent
                }, 
            ]
        },
        {
            path: 'sublockinglist',
            component: LockinglistComponent,
            canActivate: [AuthGuard],
            children : [
                {
                    path: 'lockingdetail',
                    component: LockingdetailComponent
                },
                {
                    path: 'lockingdetail/:id',
                    component: LockingdetailComponent

                }
            ]
        },
        {
            path: 'subsyserrorloglist',
            component: SysErrorLoglistComponent,
            canActivate: [AuthGuard],
        },
    ]

}];
