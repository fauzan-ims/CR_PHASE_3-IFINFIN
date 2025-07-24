import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { DALService } from '../../../DALservice.service';
import { SpinnerModule } from '../../spinner-ui/spinner/spinner.module';
import { InquirylistComponent } from './inquiry/inquirylist/inquirylist.component';
import { InquirydetailComponent } from './inquiry/inquirydetail/inquirydetail.component';
import { Suspendmanagement } from './suspendmanagement.routing';
import { AllocationlistComponent } from './allocation/allocationlist/allocationlist.component';
import { AllocationdetailComponent } from './allocation/allocationdetail/allocationdetail.component';
import { MergerlistComponent } from './merger/mergerlist/mergerlist.component';
import { MergerdetailComponent } from './merger/mergerdetail/mergerdetail.component';
import { RevenuelistComponent } from './revenue/revenuelist/revenuelist.component';
import { RevenuedetailComponent } from './revenue/revenuedetail/revenuedetail.component';
import { ReleaselistComponent } from './release/releaselist/releaselist.component';
import { ReleasedetailComponent } from './release/releasedetail/releasedetail.component';
import { AngularMyDatePickerModule } from 'angular-mydatepicker';
import { AuthGuard } from '../../../auth.guard';
import { AuthInterceptor } from '../../../auth-interceptor';
import { ObjectinfoallocationdetailComponent } from './allocation/objectinfoallocation/objectinfoallocationdetail.component';
import { ObjectinforeleasedetailComponent } from './release/objectinforelease/objectinforeleasedetail.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(Suspendmanagement),
        FormsModule,
        HttpClientModule,
        NgbModule,
        DataTablesModule,
        SpinnerModule,
        AngularMyDatePickerModule
    ],
    declarations: [
        InquirylistComponent,
        InquirydetailComponent,
        AllocationlistComponent,
        AllocationdetailComponent,
        MergerlistComponent,
        MergerdetailComponent,
        RevenuelistComponent,
        RevenuedetailComponent,
        ReleaselistComponent,
        ReleasedetailComponent,
        ObjectinfoallocationdetailComponent,
        ObjectinforeleasedetailComponent
    ], 
    providers: [
        DALService,
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true } // back to login if 401
        , AuthGuard // penjagaan apabila dari login langsung masuk ke dashboard atau ke halaman lain
    ]  
})

export class SettingModule { }
