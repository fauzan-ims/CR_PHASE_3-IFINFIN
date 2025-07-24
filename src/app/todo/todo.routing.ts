import { Routes } from '@angular/router';
import { AuthGuard } from '../../auth.guard';
import { TodoComponent } from './todo.component';

export const Todo: Routes = [{

    path: '',
    children: [{
        path: 'todo',
        component: TodoComponent,
        canActivate: [AuthGuard]
    }]
}];

