import { Routes } from '@angular/router';
import { InquirylistComponent } from './inquiry/inquirylist/inquirylist.component';
import { InquirydetailComponent } from './inquiry/inquirydetail/inquirydetail.component';
import { AllocationlistComponent } from './allocation/allocationlist/allocationlist.component';
import { AllocationdetailComponent } from './allocation/allocationdetail/allocationdetail.component';
import { MergerlistComponent } from './merger/mergerlist/mergerlist.component';
import { MergerdetailComponent } from './merger/mergerdetail/mergerdetail.component';
import { RevenuelistComponent } from './revenue/revenuelist/revenuelist.component';
import { RevenuedetailComponent } from './revenue/revenuedetail/revenuedetail.component';
import { ReleaselistComponent } from './release/releaselist/releaselist.component';
import { ReleasedetailComponent } from './release/releasedetail/releasedetail.component';
import { AuthGuard } from '../../../auth.guard';
import { ObjectinfoallocationdetailComponent } from './allocation/objectinfoallocation/objectinfoallocationdetail.component';
import { ObjectinforeleasedetailComponent } from './release/objectinforelease/objectinforeleasedetail.component';

export const Suspendmanagement: Routes = [{
    path: '',
    children: [
        {
            path: 'subinquirylist',
            component: InquirylistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'inquirydetail',
                    component: InquirydetailComponent
                },
                {
                    path: 'inquirydetail/:id',
                    component: InquirydetailComponent
                },
            ]
        },

        {
            path: 'suballocationlist',
            component: AllocationlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'allocationdetail',
                    component: AllocationdetailComponent
                },
                {
                    path: 'allocationdetail/:id',
                    component: AllocationdetailComponent
                },
            ]
        },

        {
            path: 'submergerlist',
            component: MergerlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'mergerdetail',
                    component: MergerdetailComponent
                },
                {
                    path: 'mergerdetail/:id',
                    component: MergerdetailComponent
                },
            ]
        },

        {
            path: 'subrevenuelist',
            component: RevenuelistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'revenuedetail',
                    component: RevenuedetailComponent
                },
                {
                    path: 'revenuedetail/:id',
                    component: RevenuedetailComponent
                },
            ]
        },

        {
            path: 'subreleaselist',
            component: ReleaselistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'releasedetail',
                    component: ReleasedetailComponent
                },
                {
                    path: 'releasedetail/:id',
                    component: ReleasedetailComponent
                },
            ]
        },
        {
            path: 'objectinfosuspendallocation/:id',
            component: ObjectinfoallocationdetailComponent,
            canActivate: [AuthGuard]
        },
        {
            path: 'objectinfosuspendrelease/:id',
            component: ObjectinforeleasedetailComponent,
            canActivate: [AuthGuard]
        },

    ]

}];
