import { OnInit, ViewChild, Component, ElementRef } from '@angular/core';
import 'rxjs/add/operator/map'
import { Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../base.component';
import { DALService } from '../../../../DALservice.service';
import swal from 'sweetalert2';
import { Location } from '@angular/common';

@Component({
    moduleId: module.id,
    selector: 'app-root',
    templateUrl: './reportsettinglist.component.html'
})

export class ReportsettinglistComponent extends BaseComponent implements OnInit {
    // variable
    public lookupmenu: any = [];
    public tampStatus: String;
    private APIController: String = 'Report';
    private APIRouteForGetRows: String = 'GetRows';
    private APIRouteForPrint: String = 'PrintFile';
    private RoleAccessCode = 'R00019800000010A';

    // spinner
    showSpinner: Boolean = false;
    // end

    // form 2 way binding
    model: any = {};

    // ini buat datatables
    @ViewChild(DataTableDirective)
    dtElement: DataTableDirective;
    dtOptions: DataTables.Settings = {};

    constructor(private dalservice: DALService,
        private _location: Location,
        public route: Router,
        private _elementRef: ElementRef) { super(); }

    ngOnInit() {
        this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);
        this.model.table_name = '-';
    }

    //#region menu lookup
    btnLookupMenu() {
        $('#datatableLookupMenu').DataTable().clear().destroy();
        $('#datatableLookupMenu').DataTable({
            'pagingType': 'first_last_numbers',
            'pageLength': 5,
            'processing': true,
            'serverSide': true,
            responsive: true,
            lengthChange: false, // hide lengthmenu
            searching: true, // jika ingin hilangin search box nya maka false
            ajax: (dtParameters: any, callback) => {
                // param tambahan untuk getrows dynamic
                dtParameters.paramTamp = [];
                dtParameters.paramTamp.push({
                    'default': ''
                });
                // end param tambahan untuk getrows dynamic 
                this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForGetRows).subscribe(resp => {
                    const parse = JSON.parse(resp);
                    this.lookupmenu = parse.data;

                    if (parse.data != null) {
                        this.lookupmenu.numberIndex = dtParameters.start;
                    }

                    callback({
                        draw: parse.draw,
                        recordsTotal: parse.recordsTotal,
                        recordsFiltered: parse.recordsFiltered,
                        data: []
                    });
                }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
            },
            columnDefs: [{ orderable: false, width: '5%', targets: [1, 3] }], // for disabled coloumn
            language: {
                search: '_INPUT_',
                searchPlaceholder: 'Search records',
                infoEmpty: '<p style="color:red;" > No Data Available !</p> '
            },
            searchDelay: 800 // pake ini supaya gak bug search
        });
    }
    btnSelectRowMenu(name: String) {
        this.model.table_name = name;
        $('#lookupModalMenu').modal('hide');
    }
    //#endregion menu lookup

    //#region btnDownload
    btnPrint() {
        if (this.model.table_name === '-') {
            swal({
                allowOutsideClick: false,
                title: 'Warning',
                text: 'Please Fill a Mandatory Field OR Format Is Invalid',
                buttonsStyling: false,
                confirmButtonClass: 'btn btn-danger',
                type: 'warning'
            }).catch(swal.noop)
            return;
        } else {
            this.showSpinner = true;

            const dataParam = [
                {
                    'p_table_name': this.model.table_name
                }
            ];
            // param tambahan untuk button Reject dynamic

            this.showSpinner = true;

            this.dalservice.DownloadFileWithData(dataParam, this.APIController, this.APIRouteForPrint).subscribe(res => {

                this.showSpinner = false;
                var contentDisposition = res.headers.get('content-disposition');
                var filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();

                const blob = new Blob([res.body], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const url = window.URL.createObjectURL(blob);
                var link = document.createElement('a');
                link.href = url;
                link.download = filename;
                link.click();
                // window.open(url);

            }, err => {
                this.showSpinner = false;
                const parse = JSON.parse(err);
                this.swalPopUpMsg(parse.data);
            });
        }

    }
    // #endregion btnDownload

}


