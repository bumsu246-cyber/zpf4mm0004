sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("ncode.zpf4mm0004.controller.View1", {
        onInit() {
        },
        onSearchStock: function () {

            let oTableStock = this.byId("stockTable");
            let oBinding = oTableStock.getBinding("items");

            // 자재번호 검색
            let oInputMatnr = this.byId("inpMatnr");
            let InputMatnr = oInputMatnr.getValue();
            

            let aFilter = [];

            if (InputMatnr) {
                aFilter.push(new Filter("Matnr", FilterOperator.EQ, InputMatnr));
            }

        

            oBinding.filter(aFilter);

        }
    });
});