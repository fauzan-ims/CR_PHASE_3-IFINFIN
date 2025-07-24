import { Routes } from '@angular/router';

import { UnauthorizedComponent } from './unauthorized.component';

export const UnauthorizedRoutes: Routes = [{

    path: '',
    children: [ {
      path: 'unauthorized',
      component: UnauthorizedComponent
  }]
}];
