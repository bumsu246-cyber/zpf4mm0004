sap.ui.define([
    "sap/ui/core/UIComponent",
    "ncode/zpf4mm0004/model/models"
], (UIComponent, models) => {
    "use strict";

    return UIComponent.extend("ncode.zpf4mm0004.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // enable routing
            this.getRouter().initialize();
        }
    });
});