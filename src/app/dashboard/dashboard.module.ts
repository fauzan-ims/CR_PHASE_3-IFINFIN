import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AgmCoreModule
} from '@agm/core';
import { DashboardComponent } from './dashboard.component';

import { DashboardRoutes } from './dashboard.routing';
import { DALService } from '../../DALservice.service';
import { AuthGuard } from '../../auth.guard';
import { AuthInterceptor } from '../../auth-interceptor';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';

@NgModule({
  // imports: [
  //   CommonModule,
  //   RouterModule.forChild(DashboardRoutes),
  //   FormsModule,
  //   AgmCoreModule.forRoot({
  //     apiKey: 'YOUR_GOOGLE_MAPS_API_KEY'
  //   })
  // ],

  imports: [
    CommonModule,
    RouterModule.forChild(DashboardRoutes),
    FormsModule,
    HttpClientModule,
    NgbModule,
    DataTablesModule,
],

  declarations: [DashboardComponent],

  providers: [
    DALService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true } // back to login if 401
    , AuthGuard // penjagaan apabila dari login langsung masuk ke dashboard atau ke halaman lain
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class DashboardModule { }
