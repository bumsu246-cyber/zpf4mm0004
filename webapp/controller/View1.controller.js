sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], (Controller, JSONModel, Filter, FilterOperator) => {
    "use strict";

    return Controller.extend("ncode.zpf4mm0004.controller.View1", {
        onInit() {
            this.getView().setModel(new JSONModel({
                selectedWerks: "1000",
                selectedLgort: "",
                plants: [
                    { key: "1000", text: "1000" },
                    { key: "2000", text: "2000" },
                    { key: "3000", text: "3000" },
                    { key: "4000", text: "4000" }
                ],
                storageLocations: []
            }), "search");
        },

        onToWerksChange: function (oEvent) {
            let sWerks = oEvent.getSource().getSelectedKey();
            let oSearchModel = this.getView().getModel("search");

            if (sWerks === "4000") {
                oSearchModel.setProperty("/storageLocations", [
                    { key: "4100", text: "4100 - 매장(광진구)" },
                    { key: "4200", text: "4200 - 매장(용산구)" },
                    { key: "4300", text: "4300 - 매장(마포구)" },
                    { key: "4400", text: "4400 - 매장(부산광역시)" }
                ]);
                oSearchModel.setProperty("/selectedLgort", "4100");
            } else {
                oSearchModel.setProperty("/storageLocations", []);
                oSearchModel.setProperty("/selectedLgort", "");
            }
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

            let sWerks = this.byId("selToWerks").getSelectedKey();
            let sLgort = this.byId("selToLgort").getSelectedKey();

            if (sWerks) {
                aFilter.push(new Filter("Werks", FilterOperator.EQ, sWerks));
            }

            if (sLgort) {
                aFilter.push(new Filter("Lgort", FilterOperator.EQ, sLgort));
            }

        

            oBinding.filter(aFilter);

        }
    });
});
