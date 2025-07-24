import { Component, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/filter';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { Location, LocationStrategy, PathLocationStrategy, PopStateEvent, PlatformLocation } from '@angular/common';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import PerfectScrollbar from 'perfect-scrollbar';
import { Subject, Observable } from 'rxjs';
import { BaseService } from '../../../base.service';
import { BaseComponent } from '../../../base.component';
import swal from 'sweetalert2';

@Component({
    selector: 'app-layout',
    templateUrl: './admin-layout.component.html'
})

export class AdminLayoutComponent extends BaseComponent implements OnInit {
    private _router: Subscription;

    protected userActivity;
    protected interval;
    protected tokenInterval;
    protected timecount: any = 0;
    protected tokencount: any = 0;
    protected userInactive: Subject<any> = new Subject();
    protected startTime: any;
    public currentTime: any;

    // tslint:disable-next-line:member-ordering
    protected idleTime = this.AllModUrl("idleTime") * 1;

    // url: string;
    url: string;
    location: Location;
    private lastPoppedUrl: string;
    private yScrollStack: number[] = [];
    @ViewChild('sidebar') sidebar;
    @ViewChild(NavbarComponent) navbar: NavbarComponent;
    constructor(private router: Router, location: Location) {
        super();

        this.userInactive.subscribe(() => { // 1
            let th = this;
            th.startTime = (new Date()).getTime();
            this.interval = setInterval(function () { // 2
                th.currentTime = (new Date()).getTime(); // 3 
                if ((th.currentTime - th.startTime) / 1000 > th.idleTime * 60) {
                    sessionStorage.clear(); // hapus semua sessionStorage
                    parent.location.href = th.mainMenuPath;
                    clearInterval(this.interval); // 4
                }
            }, 5000)
        });
        this.location = location;
    }

    setTimeout() {
        this.userActivity = setTimeout(() => this.userInactive.next(undefined), 100);
    }

    @HostListener('window:mousemove') refreshUserState() {
        clearTimeout(this.userActivity);
        clearInterval(this.interval);
        this.timecount = 0;
        this.setTimeout();
    }

    @HostListener('window:keyup') refreshUserStates() {
        clearTimeout(this.userActivity);
        clearInterval(this.interval);
        this.timecount = 0;
        this.setTimeout();
    }

    @HostListener('window:click') refreshUserStatess() {
        clearTimeout(this.userActivity);
        clearInterval(this.interval);
        this.timecount = 0;
        this.setTimeout();
    }

    ngOnInit() {
        const elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
        const elemSidebar = <HTMLElement>document.querySelector('.sidebar .sidebar-wrapper');
        this.location.subscribe((ev: PopStateEvent) => {
            this.lastPoppedUrl = ev.url;
        });
        this.router.events.subscribe((event: any) => {
            if (event instanceof NavigationStart) {
                if (event.url !== this.lastPoppedUrl) {
                    this.yScrollStack.push(window.scrollY);
                }
            } else if (event instanceof NavigationEnd) {
                if (event.url === this.lastPoppedUrl) {
                    this.lastPoppedUrl = undefined;
                    window.scrollTo(0, this.yScrollStack.pop());
                } else {
                    window.scrollTo(0, 0);
                }
            }
        });
        this._router = this.router.events.filter(event => event instanceof NavigationEnd).subscribe((event: NavigationEnd) => {
            const domElementWiz = document.querySelectorAll('.wizard-container');

            const forWizard = event.url.split('/')[5]; //hideMainPanelWiz
            if (forWizard == undefined) {
                elemMainPanel.scrollTop = 0;
            }
            else {
                if (domElementWiz.length === 0) {
                    elemMainPanel.scrollTop = 0;
                }
            }
        });
        const html = document.getElementsByTagName('html')[0];
        if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
            let ps = new PerfectScrollbar(elemMainPanel);
            ps = new PerfectScrollbar(elemSidebar);
            html.classList.add('perfect-scrollbar-on');
        } else {
            html.classList.add('perfect-scrollbar-off');
        }
        this._router = this.router.events.filter(event => event instanceof NavigationEnd).subscribe((event: NavigationEnd) => {
            this.navbar.sidebarClose();
        });
    }
    public isMap() {
        if (this.location.prepareExternalUrl(this.location.path()) === '/maps/fullscreen') {
            return true;
        } else {
            return false;
        }
    }
    isMac(): boolean {
        let bool = false;
        if (navigator.platform.toUpperCase().indexOf('MAC') >= 0 || navigator.platform.toUpperCase().indexOf('IPAD') >= 0) {
            bool = true;
        }
        return bool;
    }
}