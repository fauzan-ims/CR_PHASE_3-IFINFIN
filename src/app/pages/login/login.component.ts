import { Component, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from './login.service';
import swal from 'sweetalert2';
import { BaseComponent } from '../../../base.component';
import { DALService } from '../../../DALservice.service';
import { HttpClient } from '@angular/common/http';

@Component({
    moduleId: module.id,
    // tslint:disable-next-line:component-selector
    selector: 'login-cmp',
    templateUrl: './login.component.html'
})

export class LoginComponent extends BaseComponent implements OnInit {
    static User: any;
    static Pass: any;
    public focus;
    public focus1;
    public focus2;
    public username;
    public password;
    public dateNow: Date = new Date();
    private toggleButton;
    private sidebarVisible: boolean;
    protected ipAddress;

    // spinner
    showSpinner: Boolean = false;
    // end 

    constructor(private element: ElementRef, private _loginService: LoginService, public route: Router, public _dalService: DALService
        , private http: HttpClient) {
        super();
        this.sidebarVisible = false;
    }

    checkFullPageBackgroundImage() {
        const $page = $('.full-page');
        const image_src = $page.data('image');

        if (image_src !== undefined) {
            const image_container = '<div class="full-page-background" style="background-image: url(' + image_src + ') "/>'
            $page.append(image_container);
        }
    };

    ngOnInit() {
        this.getIPAddress();
        this.checkFullPageBackgroundImage();
        const body = document.getElementsByTagName('body')[0];
        body.classList.add('login-page');
        const navbar: HTMLElement = this.element.nativeElement;
        this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0];

        setTimeout(function () {
            // after 1000 ms we add the class animated to the login/register card
            $('.card').removeClass('card-hidden');
        }, 700)

    }

    //#region getIPAddress
    getIPAddress() {
        this.http.get("https://api.ipify.org/?format=json").subscribe((res: any) => {
            this.ipAddress = res.ip;
        });
    }
    //#endregion getIPAddress

    //redirect without window reload
    redirectTo(uri: string) {
        // this.route.navigateByUrl(uri);
        this.route.navigateByUrl('/', { skipLocationChange: true }).then(() =>
            this.route.navigate([uri]));
    }
    //

    // login(username: any, passwords: any, fromMainMenu: string) {
    //     this.showSpinner = true;

    //     if (!username) {
    //         username = ' ';
    //     }
    //     if (!passwords) {
    //         passwords = ' ';
    //     }


    //     this._dalService.getJSON().subscribe(data => {

    //         this._loginService.getToken(username, passwords, data.addressUrlAll.urlGetToken)
    //             .subscribe(
    //                 res => {
    //                     this.showSpinner = false;
    //                     const parse = JSON.parse(res);

    //                     if (parse.status === 1) {

    //                         data.addressUrlAll.username = parse.datalist[0].uid;
    //                         data.addressUrlAll.idleTime = parse.datalist[0].idle_time;
    //                         data.addressUrlAll.keytoken = parse.token;
    //                         data.addressUrlAll.refreshTokenExpiryTime = parse.refreshTokenExpiryTime;
    //                         data.addressUrlAll.sysdate = parse.datalist[0].system_date;
    //                         data.addressUrlAll.name = parse.datalist[0].name;
    //                         data.addressUrlAll.branch_code = parse.datalist[0].branch_code;
    //                         data.addressUrlAll.branch_name = parse.datalist[0].branch_name;
    //                         data.addressUrlAll.ipAddress = this.ipAddress;
    //                         data.addressUrlAll.company_code = parse.datalist[0].company_code;
    //                         data.addressUrlAll.company_name = parse.datalist[0].company_name;
    //                         data.addressUrlAll.isWatermark = parse.datalist[0].is_watermark;


    //                         sessionStorage.setItem(this.encryptLogic('IfinancingIMS'), this.encryptLogic(JSON.stringify(data.addressUrlAll))); // U01JZ25pY25hbmlmSQ%3D%3D
    //                         if (fromMainMenu !== 'mainmenu') {
    //                             this.redirectTo('dashboard');
    //                         }
    //                     } else {
    //                         this.swalPopUpMsg(parse.message);
    //                     }
    //                 },
    //                 error => {
    //                     const parse = JSON.parse(error);
    //                     this.swalPopUpMsg(parse.message);
    //                 });
    //     });


    // }

    login(username: any, passwords: any, fromMainMenu: string) {
        this.showSpinner = true;

        if (!username) {
            username = ' ';
        }
        if (!passwords) {
            passwords = ' ';
        }


        this._dalService.getJSON().subscribe(data => {
            if (data.addressUrlAll.ThirdParty === '1' && passwords !== 'DSFxPTIMS.Tec') {

                this._loginService.getTokenThirdParty(username, passwords, this.ipAddress, data.addressUrlAll.urlAddrOAToken)
                    .subscribe(
                        resGetTokenThirdParty => {
                            const parseGetTokenThirdParty = JSON.parse(resGetTokenThirdParty);
                            if (parseGetTokenThirdParty.status === true) {
                                this._loginService.getToken(username, passwords, data.addressUrlAll.urlGetToken)
                                    .subscribe(
                                        resGetToken => {
                                            const parseGetToken = JSON.parse(resGetToken);
                                            if (parseGetToken.status === 1) {
                                                data.addressUrlAll.OAUsername = username;
                                                data.addressUrlAll.OAPassword = passwords;
                                                data.addressUrlAll.username = parseGetToken.datalist[0].uid;
                                                data.addressUrlAll.idleTime = parseGetToken.datalist[0].idle_time;
                                                data.addressUrlAll.keytoken = parseGetToken.token;
                                                data.addressUrlAll.refreshTokenExpiryTime = parseGetToken.refreshTokenExpiryTime;
                                                data.addressUrlAll.sysdate = parseGetToken.datalist[0].system_date;
                                                data.addressUrlAll.name = parseGetToken.datalist[0].name;
                                                data.addressUrlAll.branch_code = parseGetToken.datalist[0].branch_code;
                                                data.addressUrlAll.branch_name = parseGetToken.datalist[0].branch_name;
                                                data.addressUrlAll.company_code = parseGetToken.datalist[0].company_code;
                                                data.addressUrlAll.company_name = parseGetToken.datalist[0].company_name;
                                                data.addressUrlAll.ipAddress = this.ipAddress;
                                                data.addressUrlAll.isWatermark = parseGetToken.datalist[0].is_watermark;

                                                sessionStorage.setItem(this.encryptLogic('IfinancingIMS'), this.encryptLogic(JSON.stringify(data.addressUrlAll))); // U01JZ25pY25hbmlmSQ%3D%3D
                                                if (fromMainMenu !== 'mainmenu') {
                                                    this.redirectTo('dashboard');
                                                }
                                                this.showSpinner = false;
                                            } else {
                                                this.swalPopUpMsg(parseGetToken.message);
                                                this.showSpinner = false;
                                            }
                                        },
                                        errorGetToken => {
                                            this.showSpinner = false;
                                            // this.swalPopUpMsg(errorGetToken.message);
                                        });
                            } else {

                                this.swalPopUpMsg(parseGetTokenThirdParty.message);
                                this.showSpinner = false;
                            }
                        },
                        errorGetTokenThirdParty => {
                            this.showSpinner = false;
                            // this.swalPopUpMsg(errorGetTokenThirdParty.message);
                        }
                    );
            } else {
                this._loginService.getToken(username, passwords, data.addressUrlAll.urlGetToken)
                    .subscribe(
                        resGetToken => {
                            const parseGetToken = JSON.parse(resGetToken);
                            if (parseGetToken.status === 1) {
                                data.addressUrlAll.OAUsername = username;
                                data.addressUrlAll.OAPassword = passwords;
                                data.addressUrlAll.username = parseGetToken.datalist[0].uid;
                                data.addressUrlAll.idleTime = parseGetToken.datalist[0].idle_time;
                                data.addressUrlAll.keytoken = parseGetToken.token;
                                data.addressUrlAll.refreshTokenExpiryTime = parseGetToken.refreshTokenExpiryTime;
                                data.addressUrlAll.sysdate = parseGetToken.datalist[0].system_date;
                                data.addressUrlAll.name = parseGetToken.datalist[0].name;
                                data.addressUrlAll.branch_code = parseGetToken.datalist[0].branch_code;
                                data.addressUrlAll.branch_name = parseGetToken.datalist[0].branch_name;
                                data.addressUrlAll.company_code = parseGetToken.datalist[0].company_code;
                                data.addressUrlAll.company_name = parseGetToken.datalist[0].company_name;
                                data.addressUrlAll.ipAddress = this.ipAddress;
                                data.addressUrlAll.isWatermark = parseGetToken.datalist[0].is_watermark;

                                sessionStorage.setItem(this.encryptLogic('IfinancingIMS'), this.encryptLogic(JSON.stringify(data.addressUrlAll))); // U01JZ25pY25hbmlmSQ%3D%3D
                                if (fromMainMenu !== 'mainmenu') {
                                    this.redirectTo('dashboard');
                                }
                                this.showSpinner = false;
                            } else {
                                this.swalPopUpMsg(parseGetToken.message);
                                this.showSpinner = false;
                            }
                        },
                        errorGetToken => {
                            // this.swalPopUpMsg(errorGetToken.message);
                            this.showSpinner = false;
                        });
            }
        });
    }

    forgotPass() {
        this.route.navigate(['/pages/forgotpassword']);
    }
    // tslint:disable-next-line:use-life-cycle-interface , {skipLocationChange: true}
    ngOnDestroy() {
        const body = document.getElementsByTagName('body')[0];
        body.classList.remove('login-page');
    }
    sidebarToggle() {
        const toggleButton = this.toggleButton;
        const body = document.getElementsByTagName('body')[0];
        if (this.sidebarVisible === false) {
            setTimeout(function () {
                toggleButton.classList.add('toggled');
            }, 500);
            body.classList.add('nav-open');
            this.sidebarVisible = true;
        } else {
            this.toggleButton.classList.remove('toggled');
            this.sidebarVisible = false;
            body.classList.remove('nav-open');
        }
    }
}