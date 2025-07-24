import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { BaseComponent } from './base.component';

@Injectable()
export class AuthGuard extends BaseComponent implements CanActivate {
  constructor(private router: Router) {
    super();
  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    if (this.AllModUrl('keytoken') != '') {
      return true;
    }
    window.location.href = this.mainMenuPath;
    return false;
  }
}
