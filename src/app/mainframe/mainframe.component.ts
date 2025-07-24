import { Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../../base.component';
import { LoginComponent } from '../pages/login/login.component'
import { LoginService } from '../pages/login/login.service'
import { DALService } from '../../DALservice.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-mainframe',
  templateUrl: './mainframe.component.html'
})
export class MainFrameComponent extends BaseComponent implements OnInit {

  constructor(public _route: Router
    , private element: ElementRef
    , private _dalService: DALService
    , private _loginService: LoginService
    , private http: HttpClient
    , public getRouteparam: ActivatedRoute) {
    super();
  }

  ngOnInit() {
    this.getPublishPath();
  }

  getPublishPath() {
    this._dalService.getJSON().subscribe(data => {
      this.iframePublishPath = data.addressUrlAll.publishPathIFINFIN;

      const iframe = $('#mainframe');

      if (this.AllModUrl('keytoken') !== '') {

        this._route.navigate(['main']);
        setTimeout(() => {
          iframe.attr('src', (this.iframePublishPath + '/dashboard'));
        }, 500);
      }
      else {
        iframe.attr('src', (this.iframePublishPath + '/pages/login'));
      }
    });
  }

}