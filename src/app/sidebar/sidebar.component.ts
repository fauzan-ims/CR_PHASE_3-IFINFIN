import { Component, OnInit, AfterViewInit, AfterViewChecked, AfterContentInit, setTestabilityGetter } from '@angular/core';
import { DALService } from '../../DALservice.service';
import { BaseComponent } from '../../base.component';
import swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';

// Metadata
export interface RouteInfo {
    idModule: String;
    path: String;
    title: String;
    type: String;
    icontype: String;
    // icon: string;
    submenuitems?: SubMenuItems[]; // jaka nambah submenu items
    childrenitemsonesub?: ChildrenItemsOneSub[];
    // children?: ChildrenItems[];
}

export interface ChildrenItems {
    path: String;
    title: String;
    ab: String;
    type: String;
    // submenuitems?: SubMenuItems[];
}

// jaka tes nambah sub menu
export interface SubMenuItems {
    idSubMenu: String;
    path: String;
    title: String;
    type: String;
    icontype: String;

    children?: ChildrenItems[];
}
// end jaka nambah sub menu

export interface ChildrenItemsOneSub {
    idSubMenu: string;
    path: string;
    title: string;
    ab: string;
    // type?: string;
    // submenuitems?: SubMenuItems[];
}

// Menu Items
export const ROUTES: RouteInfo[] = null;

@Component({
    moduleId: module.id,
    selector: 'sidebar-cmp',
    templateUrl: 'sidebar.component.html',
})

export class SidebarComponent extends BaseComponent implements OnInit {
    public menuItems: any;
    public routeInfo: RouteInfo = {} as RouteInfo;
    public submenuItems: SubMenuItems = {} as SubMenuItems;
    public childrenItems: ChildrenItems = {} as ChildrenItems;
    public listModuleItems: any[];
    public listMenuItems: any[];
    public listChildItems: any[];
    private dataTampModule: any = [];
    private dataTampMenu: any = [];
    private dataTampChild: any = [];
    private APIController: String = 'SidebarMenu';
    private APIRouteSidebarForModuleGetRows: String = 'GetRowsSidebarForModule';
    private APIRouteSidebarForMenuGetRows: String = 'GetRowsSidebarForMenu';
    private APIRouteSidebarForChildGetRows: String = 'GetRowsSidebarForChild';
    private APIRouteNavbar: String = 'GetRowsNavbar';
    private moduleName: String = 'IFINFIN'

    public tamp1: any = [];
    public tamp2: any = [];

    // spinner
    showSpinnerF1: Boolean = true;
    showSpinnerF2: Boolean = true;
    // end

    public submenuitemTamp: any = [];

    constructor(private dalservice: DALService) {
        super();
    }

    isNotMobileMenu() {
        if (window.outerWidth > 991) {
            return false;
        }
        return true;
    }

    // tslint:disable-next-line:use-life-cycle-interface
    ngOnInit() {

        this.getDataSidebar();
        this.getChildMenuDataForNavbar();

    }


    getDataSidebar() {

        // param tambahan untuk getrow dynamic
        this.dataTampModule = [{
            'action': 'getResponse',
            'p_parent_module_code': this.moduleName,
            'p_user_code': this.userId
        }];
        // end param tambahan untuk getrow dynamic
        this.dalservice.ExecSpSys(this.dataTampModule, this.APIController, this.APIRouteSidebarForModuleGetRows)
            .subscribe(
                res => {

                    const parse = JSON.parse(res);
                    this.listModuleItems = parse.data;

                    // 1st loop for routeInfo
                    for (let i = 0; i < this.listModuleItems.length; i++) {

                        if (this.listModuleItems[i].type == 'link') {

                            this.tamp1.push(
                                {
                                    idModule: this.listModuleItems[i].idModule,
                                    title: this.listModuleItems[i].name,
                                    type: 'link',
                                    path: this.listModuleItems[i].url_menu,
                                    icontype: this.listModuleItems[i].icontype,
                                    submenuitems: [],
                                    childrenitemsonesub: []
                                }
                            );

                        } else {

                            this.tamp1.push(
                                {
                                    idModule: this.listModuleItems[i].idModule,
                                    title: this.listModuleItems[i].name,
                                    type: 'sub',
                                    path: this.listModuleItems[i].url_menu,
                                    icontype: this.listModuleItems[i].icontype,
                                    submenuitems: [],
                                    childrenitemsonesub: []
                                }
                            );

                        }

                    }


                    for (let k = 0; k < this.tamp1.length; k++) {
                        this.dataTampMenu = [{
                            'p_parent_menu_name': this.tamp1[k].idModule,
                            'p_module_code': this.moduleName,
                            'action': 'getResponse',
                            'p_user_code': this.userId
                        }];
                        // end param tambahan untuk getrow dynamic
                        this.dalservice.ExecSpSys(this.dataTampMenu, this.APIController, this.APIRouteSidebarForMenuGetRows)
                            .subscribe(
                                ress => {

                                    const parses = JSON.parse(ress);
                                    this.listMenuItems = parses.data;

                                    let submenuItemsData = [];

                                    let pathHead = this.tamp1[k].path;

                                    for (let k = 0; k < this.listMenuItems.length; k++) {

                                        submenuItemsData.push({
                                            idSubMenu: this.listMenuItems[k].idSubMenu,
                                            path: this.listMenuItems[k].path,
                                            title: this.listMenuItems[k].title,
                                            ab: '',
                                            pathHeader: pathHead
                                        });

                                    }

                                    this.tamp1[k].childrenitemsonesub = submenuItemsData;//this.listMenuItems;

                                });
                    }

                    this.routeInfo = this.tamp1;
                    this.menuItems = this.routeInfo;//this.routeInfo.filter(menuItem => menuItem);

                    sessionStorage.setItem('sideBarVal' + this.moduleName, this.encryptLogic(JSON.stringify(this.menuItems)));
                    this.showSpinnerF1 = false;
                },
                error => {
                    const parse = JSON.parse(error);
                    this.swalPopUpMsg(parse.message);
                });

    }

    getChildMenuDataForNavbar() {

        this.dataTampModule = [];
        let navBarChildData;

        // param tambahan untuk getrow dynamic
        this.dataTampModule = [{
            'action': 'getResponse',
            'p_module_code': this.moduleName,
            'p_user_code': this.userId
        }];
        // end param tambahan untuk getrow dynamic
        this.dalservice.ExecSpSys(this.dataTampModule, this.APIController, this.APIRouteNavbar)
            .subscribe(
                res => {

                    const parse = JSON.parse(res);
                    navBarChildData = parse.data;

                    sessionStorage.setItem('navbarHeader' + this.moduleName, this.encryptLogic(JSON.stringify(navBarChildData)));
                    this.showSpinnerF2 = false;
                },
                error => {
                    const parse = JSON.parse(error);
                    this.swalPopUpMsg(parse.message);
                });
    }

    getName() {
        let name = this.AllModUrl('name');//sessionStorage.getItem('ZW1hbg%3D%3D');
        return name; //this.decryptLogic(name).toString();

    }

    goToMainMenu() {
        const urlMainMenu = this.AllModUrl('urlMainMenu');//this.decryptLogic(sessionStorage.getItem('dW5lTWxhdHJvUGxydQ%3D%3D'));
        window.open(urlMainMenu, '_parent');
        // sessionStorage.clear();

    }

}