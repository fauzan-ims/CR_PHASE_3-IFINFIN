import { Routes } from '@angular/router';

import { MainFrameComponent } from './mainframe.component';

export const MainFrameRoutes: Routes = [{
    path: '',
    children: [ {
      path: '',
      component: MainFrameComponent      
  }]
}];
