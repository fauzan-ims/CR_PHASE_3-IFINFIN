import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import 'rxjs/add/operator/map'
import { Router, ActivatedRoute } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { BaseComponent } from '../../../../../base.component';
import { DALService } from '../../../../../DALservice.service';
import swal from 'sweetalert2';

@Component({
    selector: 'app-paymentrequestupload',
    templateUrl: './paymentrequestupload.component.html'
})

export class PaymentRequestuploadComponent extends BaseComponent implements OnInit {
    // get param from url
    param = this.getRouteparam.snapshot.paramMap.get('id');

    // form 2 way binding
    model: any = {};

    // checklist
    public selectedAll: any;
    public checkedList: any = [];

    // spinner
    showSpinner: Boolean = false;
    // end

    // variable
    public listPaymentRequestUpload: any = [];
    public lookupbranch: any = [];
    public tempFile: any;
    private rolecode: any = [];
    private base64textString: string;
    private tamps = new Array();
    private dataTamp: any = [];
    private dataRoleTamp: any = [];
    private RoleAccessCode = 'R00003450000346A';

    private APIController: String = 'FinInterfacePaymentRequest';
    private APIRouteForPost: String = 'ExecSpForPost';
    private APIRouteForCancel: String = 'ExecSpForCancel';
    private APIRouteForGetRows: String = 'GetRows';
    private APIRouteForUploadGetRows: String = 'GetRowsForUpload';
    private APIRouteForGetRole: String = 'ExecSpForGetRole';
    private APIRouteForUploadDataFile: String = 'UploadDataExcel';
    private APIRouteForDownload: String = 'DownloadFile';

    public downloadData: any = [];
    public empty: any = [];

    // ini buat datatables
    @ViewChild(DataTableDirective)
    dtElement: DataTableDirective;
    dtOptions: DataTables.Settings = {};

    constructor(private dalservice: DALService,
        public getRouteparam: ActivatedRoute,
        public route: Router,
        private _elementRef: ElementRef
    ) { super(); }

    ngOnInit() {
        this.callGetRole(this.userId, this._elementRef, this.dalservice, this.RoleAccessCode, this.route);

        this.loadData();
    }

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
                    'p_status': 'UPLOAD'
                })
                // end param tambahan untuk getrows dynamic

                this.dalservice.Getrows(dtParameters, this.APIController, this.APIRouteForUploadGetRows).subscribe(resp => {
                    const parse = JSON.parse(resp)
                    this.empty = parse.data.length;
                    this.listPaymentRequestUpload = parse.data;
                    if (parse.data != null) {
                        this.listPaymentRequestUpload.numberIndex = dtParameters.start;
                    }


                    callback({
                        draw: parse.draw,
                        recordsTotal: parse.recordsTotal,
                        recordsFiltered: parse.recordsFiltered,
                        data: []
                    });
                }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
            },
            columnDefs: [{ orderable: false, width: '5%', targets: [0, 1] }], // for disabled coloumn
            language: {
                search: '_INPUT_',
                searchPlaceholder: 'Search records',
                infoEmpty: '<p style="color:red;" > No Data Available !</p> '
            },
            searchDelay: 800 // pake ini supaya gak bug search
        }

    }
    //#endregion load all data

    //#region delete all upload
    deleteAll() {
        //this.showSpinner = true;

        // param tambahan untuk getrole dynamic
        this.dataTamp = [{
            // 'default': '',
            // 'action': 'default'
        }];
        // param tambahan untuk getrole dynamic
        this.dalservice.ExecSp(this.dataTamp, this.APIController, this.APIRouteForCancel)
            .subscribe(
                res => {
                    this.showSpinner = false;
                    const parse = JSON.parse(res);
                    if (parse.result === 1) {
                        //this.showNotification('bottom', 'right', 'success');
                        //this.route.navigate(['/interface/subpaymentrequestlist']);
                    } else {
                        this.swalPopUpMsg(parse.data);
                    }
                },
                error => {
                    this.showSpinner = false;
                    const parse = JSON.parse(error);
                    this.swalPopUpMsg(parse.data);
                });
    }
    //#endregion delete all upload

    //#region btnDownload
    btnDownload() {
        this.showSpinner = true;
        this.dalservice.DownloadFile(this.APIController, this.APIRouteForDownload).subscribe(res => {

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
    // #endregion btnDownload

    //#region btnCancel
    btnCancel() {
        this.showSpinner = true;
        // param tambahan untuk getrole dynamic
        this.dataTamp = [{
            // 'default': '',
            // 'action': 'default'
        }];
        // param tambahan untuk getrole dynamic
        swal({
            allowOutsideClick: false,
            title: 'Are you sure?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonClass: 'btn btn-success',
            cancelButtonClass: 'btn btn-danger',
            confirmButtonText: this._deleteconf,
            buttonsStyling: false
        }).then((result) => {
            this.showSpinner = true;
            if (result.value) {
                this.dalservice.ExecSp(this.dataTamp, this.APIController, this.APIRouteForCancel)
                    .subscribe(
                        res => {
                            this.showSpinner = false;
                            const parse = JSON.parse(res);
                            if (parse.result === 1) {
                                this.showNotification('bottom', 'right', 'success');
                                this.route.navigate(['/interface/subpaymentrequestlist']);
                            } else {
                                this.swalPopUpMsg(parse.data);
                            }
                        },
                        error => {
                            this.showSpinner = false;
                            const parse = JSON.parse(error);
                            this.swalPopUpMsg(parse.data);
                        });

            } else {
                this.showSpinner = false;
            }
        })
    }
    //#endregion btnCancel

    //#region btnPost
    btnPost() {
        this.showSpinner = true;
        // param tambahan untuk getrole dynamic
        this.dataTamp = [{
            'default': '',
            'action': 'default'
        }];
        // param tambahan untuk getrole dynamic
        swal({
            allowOutsideClick: false,
            title: 'Are you sure?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonClass: 'btn btn-success',
            cancelButtonClass: 'btn btn-danger',
            confirmButtonText: this._deleteconf,
            buttonsStyling: false
        }).then((result) => {
            this.showSpinner = true;
            if (result.value) {
                this.dalservice.ExecSp(this.dataTamp, this.APIController, this.APIRouteForPost)
                    .subscribe(
                        res => {
                            this.showSpinner = false;
                            const parse = JSON.parse(res);
                            if (parse.result === 1) {
                                this.showNotification('bottom', 'right', 'success');
                                this.route.navigate(['/interface/subpaymentrequestlist']);
                            } else {
                                this.swalPopUpMsg(parse.data);
                            }
                        },
                        error => {
                            this.showSpinner = false;
                            const parse = JSON.parse(error);
                            this.swalPopUpMsg(parse.data);
                        });
            } else {
                this.showSpinner = false;
            }
        })
    }
    //#endregion btnPost

    //#region upload excel reader
    handleFile(event) {
        const binaryString = event.target.result;
        this.base64textString = btoa(binaryString);
        this.tamps.push({
            p_module: 'IFINFIN',
            filename: this.tempFile,
            base64: this.base64textString
        });
    }

    onUploadReader(event) {
        this.deleteAll();
        const files = event.target.files;
        const file = files[0];
        if (event.target.files && event.target.files[0]) {
            const reader = new FileReader();
            reader.readAsDataURL(event.target.files[0]); // read file as data url
            // tslint:disable-next-line:no-shadowed-variable
            reader.onload = (event) => {
                reader.onload = this.handleFile.bind(this);
                reader.readAsBinaryString(file);
            }
        }
        this.tempFile = files[0].name;
        // this.tampDocumentCode = code;
        swal({
            title: 'Are you sure?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: this._deleteconf,
            cancelButtonText: 'No',
            confirmButtonClass: 'btn btn-success',
            cancelButtonClass: 'btn btn-danger',
            buttonsStyling: false
        }).then((result) => {
            this.showSpinner = true;
            if (result.value) {
                this.dalservice.UploadFile(this.tamps, this.APIController, this.APIRouteForUploadDataFile)
                    .subscribe(
                        res => {
                            this.showSpinner = false;
                            const parse = JSON.parse(res);
                            if (parse.result === 1) {
                                $('#fileControl').val('');
                                this.tempFile = '';
                                this.showNotification('bottom', 'right', 'success');
                                window.location.reload();
                                //$('#datatablePaymentRequestUpload').DataTable().ajax.reload();

                            } else {
                                this.swalPopUpMsg(parse.data);
                                $('#fileControl').val('');
                                window.location.reload();
                                //$('#datatablePaymentRequestUpload').DataTable().ajax.reload();
                                this.tempFile = '';
                            }
                        }, error => {
                            this.showSpinner = false;
                            const parse = JSON.parse(error);
                            this.swalPopUpMsg(parse.data);
                            $('#fileControl').val('');
                            this.tempFile = '';
                        });
            } else {
                this.showSpinner = false;
                $('#fileControl').val('');
                window.location.reload();
                this.tempFile = '';
            }
        })
    }
    //#endregion button select image
}
