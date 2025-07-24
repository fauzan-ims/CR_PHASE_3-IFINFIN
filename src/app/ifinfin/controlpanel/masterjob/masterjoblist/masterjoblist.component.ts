import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';
import { DatePipe } from '@angular/common';
import { Location } from '@angular/common';

@Component({
    moduleId: module.id,
    selector: 'app-root',
    templateUrl: './masterjoblist.component.html'
})
export class MasterjoblistComponent extends BaseComponent implements OnInit {

    // get param from url
    param = this.getRouteparam.snapshot.paramMap.get('id');

    // variable
    public listjobtasklist: any = [];
    public isReadOnly: Boolean = false;
    public tampType: String;
    public tampActive: String;
    //controller
    private APIController: String = 'SysJobTasklist';
    private APIRouteForGetRows: String = 'GetRowsMasterJob';
    private RoleAccessCode = 'R00022980000001A';

    // form 2 way binding
    model: any = {};

    // ini buat datatables
    @ViewChild(DataTableDirective)
    dtElement: DataTableDirective;
    dtOptions: DataTables.Settings = {};
    spRolename: String;

    constructor(private dalservice: DALService,
        public getRouteparam: ActivatedRoute,
        public route: Router,
        private _location: Location,
        private _elementRef: ElementRef
    ) { super(); }

    ngOnInit() {
        this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
        this.compoSide(this._location, this._elementRef, this.route);
        this.loadData();
        this.tampType = 'ALL'
        this.tampActive = '1'
    }

    //#region ddl PageType
    PageType(event: any) {
        this.tampType = event.target.value;
        $('#datatableMasterJobList').DataTable().ajax.reload();
    }
    //#endregion ddl PageType


    //#region ddl PageActive
    PageActive(event: any) {
        this.tampActive = event.target.value;
        $('#datatableMasterJobList').DataTable().ajax.reload();
    }
    //#endregion ddl PageActive

    //#region load all data
    loadData() {
        this.dtOptions = {
            pagingType: 'full_numbers',
            responsive: true,
            serverSide: true,
            processing: true,
            paging: true,
            'lengthMenu': [
                [10, 25, 50, 100],
                [10, 25, 50, 100]
            ],
            ajax: (dtParameters: any, callback) => {
                // param tambahan untuk getrows dynamic
                dtParameters.paramTamp = [];
                dtParameters.paramTamp.push({
                    'p_type': this.tampType,
                    'p_is_active': this.tampActive,
                })
                // end param tambahan untuk getrows dynamic
                this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRows).subscribe(resp => {
                    const parse = JSON.parse(resp)
                    this.listjobtasklist = parse.data;
                    if (parse.data != null) {
                        this.listjobtasklist.numberIndex = dtParameters.start;
                    }

                    callback({
                        draw: parse.draw,
                        recordsTotal: parse.recordsTotal,
                        recordsFiltered: parse.recordsFiltered,
                        data: []
                    });
                }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
            },
            columnDefs: [{ orderable: false, searchable: false, width: '5%', targets: [0, 1, 7] }], // for disabled coloumn
            language: {
                search: '_INPUT_',
                searchPlaceholder: 'Search records',
                infoEmpty: '<p style="color:red;" > No Data Available !</p> '
            },
            searchDelay: 800 // pake ini supaya gak bug search
        }

    }
    //#endregion load all data

    //#region button add
    btnAdd() {
        this.route.navigate(['/controlpanel/subjobtasklist/masterjobdetail']);
    }
    //#endregion button add

    //#region button edit
    btnEdit(codeEdit: string) {
        this.route.navigate(['/controlpanel/subjobtasklist/masterjobdetail', codeEdit]);
    }
    //#endregion button edit

}