import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layouts/admin/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth/auth-layout.component';
import { IframelayoutComponent } from './layouts/iframe/iframe-layout.component';

export const AppRoutes: Routes = [{
    path: '',
    // redirectTo: 'dashboard',
    redirectTo: 'main',
    pathMatch: 'full',
}, {
    path: '',
    component: AdminLayoutComponent,
    children: [{
        path: '',
        loadChildren: './dashboard/dashboard.module#DashboardModule'
    },
    {
        path: '',
        loadChildren: './unauthorized/unauthorized.module#UnauthorizedModule'
    },
    {
        path: '',
        loadChildren: './todo/todo.module#TodoModule'
    },
    {
        path: 'receipt',
        loadChildren: './ifinfin/receipt/receipt.module#SettingModule'
    },
    {
        path: 'depositmanagement',
        loadChildren: './ifinfin/depositmanagement/depositmanagement.module#SettingModule'
    },
    {
        path: 'suspendmanagement',
        loadChildren: './ifinfin/suspendmanagement/suspendmanagement.module#SettingModule'
    },
    {
        path: 'reconcile',
        loadChildren: './ifinfin/reconcile/reconcile.module#SettingModule'
    },
    {
        path: 'reversal',
        loadChildren: './ifinfin/reversal/reversal.module#SettingModule'
    },
    {
        path: 'pvorrvrequest',
        loadChildren: './ifinfin/pvorrvrequest/pvorrvrequest.module#SettingModule'
    },
    {
        path: 'cashier',
        loadChildren: './ifinfin/cashier/cashier.module#SettingModule'
    },
    {
        path: 'setting',
        loadChildren: './ifinfin/setting/setting.module#SettingModule'
    },
    {
        path: 'interface',
        loadChildren: './ifinfin/interface/interface.module#SettingModule'
    },
    {
        path: 'inquiry',
        loadChildren: './ifinfin/inquiry/inquiry.module#SettingModule'
    },
    {
        path: 'report',
        loadChildren: './ifinfin/report/report.module#SettingModule'
    },
    {
        path: 'controlpanel',
        loadChildren: './ifinfin/controlpanel/controlpanel.module#SettingModule'
    }
    ]
},
{
    path: '',
    component: AuthLayoutComponent,
    children: [
        {
            path: 'main',
            loadChildren: './mainframe/mainframe.module#MainFrameModule'
        }, {
            path: 'pages',
            loadChildren: './pages/pages.module#PagesModule'
        }]
},
{
    path: '',
    component: IframelayoutComponent,
    children: [
        // {
        //     path: 'cashierreceiptwiz',
        //     loadChildren: './ifinfin/cashier/cashieropen/cashieropendetail/cashierreceiptwiz/cashierreceiptwiz.module#SettingWizModule'
        // },
        // {
        //     path: 'cashierbanknoteandcoinwiz',
        //     // tslint:disable-next-line:max-line-length
        //     loadChildren: './ifinfin/cashier/cashieropen/cashieropendetail/cashierbanknoteandcoinwiz/cashierbanknoteandcoinwiz.module#SettingWizModule'
        // }
        {
            path: 'objectinfodepositmanagement',
            loadChildren: './ifinfin/depositmanagement/depositmanagement.module#SettingModule'
        },
        {
            path: 'objectinforeversal',
            loadChildren: './ifinfin/reversal/reversal.module#SettingModule'
        },
        {
            path: 'objectinforeconcile',
            loadChildren: './ifinfin/reconcile/reconcile.module#SettingModule'
        },
        {
            path: 'objectinfosuspendmanagement',
            loadChildren: './ifinfin/suspendmanagement/suspendmanagement.module#SettingModule'
        },
    ]
}
];
