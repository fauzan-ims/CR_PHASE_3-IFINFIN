import { Routes } from '@angular/router';
import { ReversalmainlistComponent } from './reversalmain/reversalmainlist/reversalmainlist.component';
import { ReversalmaindetailComponent } from './reversalmain/reversalmaindetail/reversalmaindetail.component';
import { AuthGuard } from '../../../auth.guard';
import { ObjectinforeversalmainComponent } from './reversalmain/objectinforeversalmain/objectinforeversalmain.component';

export const Reversal: Routes = [{
    path: '',
    children: [
        {
            path: 'subreversalmainlist',
            component: ReversalmainlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'reversalmaindetail',
                    component: ReversalmaindetailComponent
                },
                {
                    path: 'reversalmaindetail/:id',
                    component: ReversalmaindetailComponent
                },
            ]
        },
        {
            path: 'objectinforeversalmain/:id',
            component: ObjectinforeversalmainComponent,
            canActivate: [AuthGuard]
        },
    ]

}];
