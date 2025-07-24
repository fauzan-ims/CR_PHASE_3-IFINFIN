import { Routes } from '@angular/router';
import { ReconcilelistComponent } from './reconcile/reconcilelist/reconcilelist.component';
import { ReconciledetailComponent } from './reconcile/reconciledetail/reconciledetail.component';
// import { OutstandingwizlistComponent } from './reconcile/reconciledetail/outstandingwiz/outstandingwizlist/outstandingwizlist.component';
// import { AutomatchwizlistComponent } from './reconcile/reconciledetail/automatchwiz/automatchwizlist/automatchwizlist.component';
// import { ManualmatchwizlistComponent } from './reconcile/reconciledetail/manualmatchwiz/manualmatchwizlist/manualmatchwizlist.component';
// import { TelorancematchwizlistComponent } from './reconcile/reconciledetail/telorancematchwiz/telorancematchwizlist/telorancematchwizlist.component';
import { AuthGuard } from '../../../auth.guard';
import { ObjectinforeconcileComponent } from './reconcile/objectinforeconcile/objectinforeconcile.component';

export const Reconcile: Routes = [{
    path: '',
    children: [
        {
            path: 'subreconcilelist',
            component: ReconcilelistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'reconciledetail',
                    component: ReconciledetailComponent
                },
                {
                    path: 'reconciledetail/:id',
                    component: ReconciledetailComponent,
                    children: [
                        // {
                        //     path: 'outstandingwizlist/:id',
                        //     component: OutstandingwizlistComponent
                        // },
                        // {
                        //     path: 'automatchwizlist/:id',
                        //     component: AutomatchwizlistComponent
                        // },
                        // {
                        //     path: 'manualmatchwizlist/:id',
                        //     component: ManualmatchwizlistComponent
                        // },
                        // {
                        //     path: 'telorancematchwizlist/:id',
                        //     component: TelorancematchwizlistComponent
                        // },
                    ]
                },
            ]
        },
        {
            path: 'objectinforeconcilemain/:id',
            component: ObjectinforeconcileComponent,
            canActivate: [AuthGuard],
        },

    ]

}];
