import { NgModule, ErrorHandler } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { DALService } from '../../../DALservice.service';
import { Report } from './controlpanel.routing';
import { AuthInterceptor } from '../../../auth-interceptor';
import { AuthGuard } from '../../../auth.guard';
import { SpinnerModule } from '../../spinner-ui/spinner/spinner.module';
import { AngularMyDatePickerModule } from 'angular-mydatepicker';
import { BackuplistComponent } from './backup/backuplist/backuplist.component';
import { LockinglistComponent } from './locking/lockinglist/lockinglist.component';
import { EodlistComponent } from './eod/eodlist/eodlist.component';
import { AuditlistComponent } from './audit/auditlist/auditlist.component';
import { ItparamlistComponent } from './itparam/itparamlist/itparamlist.component';
import { MasterjoblistComponent } from './masterjob/masterjoblist/masterjoblist.component';
import { MasterjobdetailComponent } from './masterjob/masterjobdetail/masterjobdetail.component';
import { MonitoringlistComponent } from './monitoring/monitoringlist/monitoringlist.component';
import { ReportLogComponent } from './sysreportlog/reportlog/reportlog.component';
import { SystodolistComponent } from './systodo/systodolist/systodolist.component';
import { SystododetailComponent } from './systodo/systododetail/systododetail.component';
import { SystodoemployeelistComponent } from './systodoemployee/systodoemployeelist/systodoemployeelist.component';
import { SystodoemployeedetailComponent } from './systodoemployee/systodoemployeedetail/systodoemployeedetail.component';
import { MasterfaqdetailComponent } from './masterfaq/masterfaqdetail/masterfaqdetail.component';
import { MasterfaqlistComponent } from './masterfaq/masterfaqlist/masterfaqlist.component';
import { GlobalParamlistComponent } from './globalparam/globalparamlist/globalparamlist.component';
import { GlobalParamdetailComponent } from './globalparam/globalparamdetail/globalparamdetail.component';
import { LockingdetailComponent } from './locking/lockingdetail/lockingdetail.component';
import { SysErrorLoglistComponent } from './syserrorlog/syserrorloglist/syserrorloglist.component';

// import { ReportLogComponent } from './sysreportlog/reportlog/reportlog.component';

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
        BackuplistComponent,
        LockinglistComponent,
        LockingdetailComponent,
        EodlistComponent,
        AuditlistComponent,
        ItparamlistComponent,
        MasterjoblistComponent,
        MasterjobdetailComponent,
        MonitoringlistComponent,
        ReportLogComponent,
        SystodolistComponent,
        SystododetailComponent,
        SystodoemployeelistComponent,
        SystodoemployeedetailComponent,
        MasterfaqlistComponent,
        MasterfaqdetailComponent,
        MasterjoblistComponent,
        MasterjobdetailComponent,
        GlobalParamlistComponent,
        GlobalParamdetailComponent,
        SysErrorLoglistComponent,
       
    ],
    providers: [
        DALService,
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true } // back to login if 401
        , AuthGuard // penjagaan apabila dari login langsung masuk ke dashboard atau ke halaman lain
    ]
})

export class SettingModule { }
