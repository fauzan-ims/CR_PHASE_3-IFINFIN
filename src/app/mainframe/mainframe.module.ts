
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { SpinnerModule } from '../spinner-ui/spinner/spinner.module';
import { MainFrameComponent } from './mainframe.component';
import { MainFrameRoutes } from './mainframe.routing';
import { DALService } from '../../DALservice.service';
import { LoginService } from '../pages/login/login.service'

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(MainFrameRoutes),
        FormsModule,
        HttpClientModule,
        NgbModule,
        DataTablesModule,
        SpinnerModule,
    ],
    declarations: [
      MainFrameComponent
    ],
    providers: [     
      LoginService,
      DALService
    ]
})

export class MainFrameModule {}
