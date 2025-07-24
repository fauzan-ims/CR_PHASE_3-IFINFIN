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
import { SpinnerModule } from '../../spinner-ui/spinner/spinner.module';
import { Reconcile } from './reconcile.routing';
import { ReconcilelistComponent } from './reconcile/reconcilelist/reconcilelist.component';
import { ReconciledetailComponent } from './reconcile/reconciledetail/reconciledetail.component';
import { AngularMyDatePickerModule } from 'angular-mydatepicker';
import { ObjectinforeconcileComponent } from './reconcile/objectinforeconcile/objectinforeconcile.component';
// import { OutstandingWizModule } from './reconcile/reconciledetail/outstandingwiz/outstandingwiz.module';
// import { AutomatchWizModule } from './reconcile/reconciledetail/automatchwiz/automatchwiz.module';
// import { ManualmatchizModule } from './reconcile/reconciledetail/manualmatchwiz/manualmatchwiz.module';
// import { TelorancematchWizModule } from './reconcile/reconciledetail/telorancematchwiz/telorancematchwiz.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(Reconcile),
        FormsModule,
        HttpClientModule,
        NgbModule,
        DataTablesModule,
        SpinnerModule,
        AngularMyDatePickerModule,
        // OutstandingWizModule,
        // AutomatchWizModule,
        // ManualmatchizModule,
        // TelorancematchWizModule
    ],
    declarations: [
        ReconcilelistComponent,
        ReconciledetailComponent,
        ObjectinforeconcileComponent,
    ],
    providers: [
        DALService,
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true } // back to login if 401
        , AuthGuard // penjagaan apabila dari login langsung masuk ke dashboard atau ke halaman lain
    ]
})

export class SettingModule { }
