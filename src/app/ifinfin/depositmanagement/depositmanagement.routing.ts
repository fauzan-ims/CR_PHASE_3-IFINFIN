import { Routes } from '@angular/router';
import { InquirylistComponent } from './inquiry/inquirylist/inquirylist.component';
import { InquirydetailComponent } from './inquiry/inquirydetail/inquirydetail.component';
import { AllocationlistComponent } from './allocation/allocationlist/allocationlist.component';
import { AllocationdetailComponent } from './allocation/allocationdetail/allocationdetail.component';
import { MovelistComponent } from './move/movelist/movelist.component';
import { MovedetailComponent } from './move/movedetail/movedetail.component';
import { ReleaselistComponent } from './release/releaselist/releaselist.component';
import { ReleasedetailComponent } from './release/releasedetail/releasedetail.component';
import { RevenuelistComponent } from './revenue/revenuelist/revenuelist.component';
import { RevenuedetailComponent } from './revenue/revenuedetail/revenuedetail.component';
import { AuthGuard } from '../../../auth.guard';
import { ObjectinfodepositallocationComponent } from './allocation/objectinfodepositallocation/objectinfodepositallocation.component';
import { ObjectinfodepositreleaseComponent } from './release/objectinfordepositrelease/objectinfodepositrelease.component';

export const Depositmanagement: Routes = [{
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
            path: 'submovelist',
            component: MovelistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'movedetail',
                    component: MovedetailComponent
                },
                {
                    path: 'movedetail/:id',
                    component: MovedetailComponent
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
            path: 'objectinfodepositallocation/:id',
            component: ObjectinfodepositallocationComponent,
            canActivate: [AuthGuard],
        },
        {
            path: 'objectinfodepositrelease/:id',
            component: ObjectinfodepositreleaseComponent,
            canActivate: [AuthGuard],
        },
    ]

}];
