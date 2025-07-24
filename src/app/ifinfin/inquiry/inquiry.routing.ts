import { Routes } from '@angular/router';
import { BankmutationdetailComponent } from './bankmutation/bankmutationdetail/bankmutationdetail.component';
import { BankmutationlistComponent } from './bankmutation/bankmutationlist/bankmutationlist.component';
import { TaxhistorylistComponent } from './taxhistory/taxhistorylist/taxhistorylist.component';
import { TaxhistorydetailComponent } from './taxhistory/taxhistorydetail/taxhistorydetail.component';
import { AuthGuard } from '../../../auth.guard';

export const Inquiry: Routes = [{
    path: '',
    children: [
        {
            path: 'subbankmutationlist',
            component: BankmutationlistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'bankmutationdetail',
                    component: BankmutationdetailComponent
                },
                {
                    path: 'bankmutationdetail/:id',
                    component: BankmutationdetailComponent
                },
            ]
        },

        {
            path: 'subwithholdingtaxhistorylist',
            component: TaxhistorylistComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: 'taxhistorydetail/:id',
                    component: TaxhistorydetailComponent
                },
            ]
        },

    ]

}];
