import { Component } from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'footer-cmp',
    templateUrl: 'footer.component.html'
})

export class FooterComponent {
    test: Date = new Date();

    //#region Branch Lookup
    btnLookupSysBranch() {
        // $('#datatableLookupSysBranch').DataTable().clear().destroy();
        // $('#datatableLookupSysBranch').DataTable({
        //     'pagingType': 'first_last_numbers',
        //     'pageLength': 5,
        //     'processing': true,
        //     'serverSide': true,
        //     responsive: true,
        //     lengthChange: false, // hide lengthmenu
        //     searching: true, // jika ingin hilangin search box nya maka false
        //     ajax: (dtParameters: any, callback) => {
        //         // param tambahan untuk getrows dynamic
        //         dtParameters.paramTamp = [];
        //         dtParameters.paramTamp.push({
        //             'default': ''
        //         });
        //         // end param tambahan untuk getrows dynamic
        //         this.dalservice.GetrowsSys(dtParameters, this.APIControllerSysBranch, this.APIRouteForLookup).subscribe(resp => {
        //             const parse = JSON.parse(resp);
        //             this.lookupbranch = parse.data;
        //             if (parse.data != null) {
        //                 this.lookupbranch.numberIndex = dtParameters.start;
        //             }

        //             callback({
        //                 draw: parse.draw,
        //                 recordsTotal: parse.recordsTotal,
        //                 recordsFiltered: parse.recordsFiltered,
        //                 data: []
        //             });
        //         }, err => console.log('There was an error while retrieving Data(API) !!!' + err));
        //     },
        //     columnDefs: [{ orderable: false, width: '5%', targets: [0, 1, 4] }], // for disabled coloumn
        //     language: {
        //         search: '_INPUT_',
        //         searchPlaceholder: 'Search records',
        //         infoEmpty: '<p style="color:red;" > No Data Available !</p> '
        //     },
        //     searchDelay: 800 // pake ini supaya gak bug search
        // });
    }

    // btnSelectRowBranch(branch_code: String, branch_name: String) {
    //     // this.model.branch_code = branch_code;
    //     // this.model.branch_name = branch_name;
    //     // this.model.employee_code = '';
    //     // this.model.employee_name = '';
    //     $('#lookupModalSysBranch').modal('hide');
    // }
    //#endregion lookup branch

}
