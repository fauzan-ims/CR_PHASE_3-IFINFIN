import { Component, OnInit, ViewChild, ElementRef, Directive } from '@angular/core';
import { ROUTES } from '../.././sidebar/sidebar.component';
import { Router, ActivatedRoute, NavigationEnd, NavigationStart } from '@angular/router';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { BaseComponent } from '../../../base.component';
import { Subscription } from 'rxjs/Subscription';
import { Title } from '@angular/platform-browser';
import 'rxjs/add/operator/mergeMap';

var misc: any = {
    navbar_menu_visible: 0,
    active_collapse: true,
    disabled_collapse_init: 0,
}

@Component({
    moduleId: module.id,
    selector: 'navbar-cmp',
    templateUrl: 'navbar.component.html'
})

export class NavbarComponent extends BaseComponent implements OnInit {
    // private listTitles: any;
    // private listChildTitles: any;
    location: Location;
    private nativeElement: Node;
    private toggleButton;
    private sidebarVisible: boolean;
    private _router: Subscription;
    private titleServiceMenu: any;
    public getTitles: any;
    private moduleName: String = 'IFINFIN';

    @ViewChild("navbar-cmp") button;

    constructor(location: Location,
        private element: ElementRef,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private titleService: Title) {
        super();
        this.location = location;
        this.nativeElement = element.nativeElement;
        this.sidebarVisible = false;
    }

    ngOnInit() {
        const navbar: HTMLElement = this.element.nativeElement;
        const body = document.getElementsByTagName('body')[0];
        this.toggleButton = navbar.getElementsByClassName('navbar-toggler')[0];
        if (body.classList.contains('sidebar-mini')) {
            misc.sidebar_mini_active = true;
        }
        this._router = this.router.events.filter(event => event instanceof NavigationEnd).subscribe((event: NavigationEnd) => {
            const $layer = document.getElementsByClassName('close-layer')[0];
            if ($layer) {
                $layer.remove();
            }
        });
    }

    minimizeSidebar() {
        const body = document.getElementsByTagName('body')[0];

        if (misc.sidebar_mini_active === true) {
            body.classList.remove('sidebar-mini');
            misc.sidebar_mini_active = false;

        } else {
            setTimeout(function () {
                body.classList.add('sidebar-mini');

                misc.sidebar_mini_active = true;
            }, 300);
        }

        // we simulate the window Resize so the charts will get updated in realtime.
        const simulateWindowResize = setInterval(function () {
            window.dispatchEvent(new Event('resize'));
        }, 180);

        // we stop the simulation of Window Resize after the animations are completed
        setTimeout(function () {
            clearInterval(simulateWindowResize);
        }, 1000);
    }

    isMobileMenu() {
        if (window.outerWidth < 991) {
            return false;
        }
        return true;
    }

    sidebarOpen() {
        var toggleButton = this.toggleButton;
        var html = document.getElementsByTagName('html')[0];
        setTimeout(function () {
            toggleButton.classList.add('toggled');
        }, 500);
        const mainPanel = <HTMLElement>document.getElementsByClassName('main-panel')[0];
        if (window.innerWidth < 991) {
            mainPanel.style.position = 'fixed';
        }
        html.classList.add('nav-open');
        this.sidebarVisible = true;
    }
    sidebarClose() {
        var html = document.getElementsByTagName('html')[0];
        this.toggleButton.classList.remove('toggled');
        this.sidebarVisible = false;
        html.classList.remove('nav-open');
        const mainPanel = <HTMLElement>document.getElementsByClassName('main-panel')[0];

        if (window.innerWidth < 991) {
            setTimeout(function () {
                mainPanel.style.position = '';
            }, 500);
        }
    }
    sidebarToggle() {
        if (this.sidebarVisible == false) {
            this.sidebarOpen();
        } else {
            this.sidebarClose();
        }
    }

    getTitle() {
        let listTitles = JSON.parse(this.decryptLogic(sessionStorage.getItem('sideBarVal' + this.moduleName)));
        let listChildTitles = JSON.parse(this.decryptLogic(sessionStorage.getItem('navbarHeader' + this.moduleName)));

        let titlee: any;

        if (this.iframePublishPath != '') {
            titlee = this.location.prepareExternalUrl(this.location.path());
            titlee = titlee.replace(this.iframePublishPath, '/');
        }
        else {
            titlee = this.location.prepareExternalUrl(this.location.path());
        }

        if (listTitles !== undefined) {

            for (let i = 0; i < listTitles.length; i++) {

                const element = listTitles[i];

                if (titlee.split("/")[1] == element.path.split("/")[1]) {


                    for (let p = 0; p < listChildTitles.length; p++) {

                        const elements = listChildTitles[p];

                        if (element.type == 'link') {

                            if (titlee == element.path) {

                                titlee = element.title;
                                return titlee;

                            }

                        }
                        else {

                            if (element.idModule == elements.parent_menu_code) {

                                if (titlee.split("/")[2] == elements.path) {

                                    titlee = elements.title;
                                    return titlee;

                                }

                            }

                        }

                    }

                }


            }
        }

    }

    getPath() {
        // console.log(this.location);
        // return this.location.prepareExternalUrl(this.location.path());
    }

    systemDate() {

        let sysdate = this.AllModUrl('sysdate');//sessionStorage.getItem('ZXRhZHN5cw%3D%3D');

        return sysdate;//this.decryptLogic(sysdate).toString();
    }

    changePass() {
        this.router.navigate(['/pages/user']);
    }

    // logout() {
    //     sessionStorage.clear(); // hapus semua localstorage
    //     localStorage.clear();
    //     // localStorage.removeItem(key);
    //     window.location.href = this.iframePublishPath + 'pages/login';
    //     // this.router.navigate(['/pages/login']);
    // }

    logout() {
        const urlMainMenu = this.AllModUrl('urlMainMenu');

        window.open(urlMainMenu, '_parent');

        sessionStorage.clear(); // hapus semua sessionStorage
    }
    getName() {
        let name =
            this.AllModUrl('name');//sessionStorage.getItem('ZW1hbg%3D%3D');
        return name; //this.decryptLogic(name).toString();
    }
}
