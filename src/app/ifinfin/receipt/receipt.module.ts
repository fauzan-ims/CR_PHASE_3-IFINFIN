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
import { Receipt } from './receipt.routing';
import { ReceiptregisterdetailComponent } from './receiptregister/receiptregisterdetail/receiptregisterdetail.component';
import { ReceiptregisterlistComponent } from './receiptregister/receiptregisterlist/receiptregisterlist.component';
import { ReceiptlistlistComponent } from './receiptlist/receiptlistlist/receiptlistlist.component';
import { SpinnerModule } from '../../spinner-ui/spinner/spinner.module';
import { ReceiptvoidlistComponent } from './receiptvoid/receiptvoidlist/receiptvoidlist.component';
import { ReceiptvoiddetailComponent } from './receiptvoid/receiptvoiddetail/receiptvoiddetail.component';
import { AngularMyDatePickerModule } from 'angular-mydatepicker';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(Receipt),
        FormsModule,
        HttpClientModule,
        NgbModule,
        DataTablesModule,
        SpinnerModule,
        AngularMyDatePickerModule
    ],
    declarations: [
        ReceiptregisterlistComponent,
        ReceiptregisterdetailComponent,
        ReceiptlistlistComponent,
        ReceiptvoidlistComponent,
        ReceiptvoiddetailComponent,
    ],
    providers: [
        DALService,
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true } // back to login if 401
        , AuthGuard // penjagaan apabila dari login langsung masuk ke dashboard atau ke halaman lain
    ]
})

export class SettingModule { }
