import { Routes } from '@angular/router';
import { AuthGuard } from '../../auth.guard';

import { DashboardComponent } from './dashboard.component';

export const DashboardRoutes: Routes = [{

  path: '',
  children: [{
    path: 'dashboard',
    canActivate: [AuthGuard],
    component: DashboardComponent
  }]
}];
