sap.ui.define([
    'cgi/hr/so/controller/BaseController',
    'sap/ui/model/json/JSONModel',
    'sap/m/MessageToast',
    'sap/m/MessageBox',
    'sap/ui/core/Fragment',
    'sap/m/DisplayListItem'
], function(Controller,JSONModel,MessageToast,MessageBox,Fragment,DisplayListItem) {
    'use strict';
    return Controller.extend("cgi.hr.so.controller.Add",{
        onInit: function()
        {
            var  oJsonModel = new JSONModel();
            oJsonModel.setData({
                "prodData":{
                    "PRODUCT_ID" : "",
                    "TYPE_CODE" : "PR",
                    "CATEGORY" : "Notebooks",
                    "NAME" : "",
                    "SUPPLIER_ID" : "0100000051",
                    "SUPPLIER_NAME" : "TECUM",
                    "DESCRIPTION" : "",
                    "PRICE" : "0.00",
                    "CURRENCY_CODE" : "EUR",
                    "DIM_UNIT" : "CM",
                    "TAX_TARIF_CODE" : "1"
                  }
            });
            this.getView().setModel(oJsonModel,"prodModel");
            this.oLocalModel = oJsonModel;
            this.setMode("create");
       },
       onClear:function(){
        this.oLocalModel.setData({
            "prodData":{
                "PRODUCT_ID" : "",
                "TYPE_CODE" : "PR",
                "CATEGORY" : "Notebooks",
                "NAME" : "",
                "SUPPLIER_ID" : "0100000051",
                "SUPPLIER_NAME" : "TECUM",
                "DESCRIPTION" : "",
                "PRICE" : "0.00",
                "CURRENCY_CODE" : "EUR",
                "DIM_UNIT" : "CM",
                "TAX_TARIF_CODE" : "1"
              }
        });
        
       },
       prodId:"",
       mode:"create",
       setMode:function(sMode){
            this.mode = sMode;
            if(this.mode == "create")
            {
              this.getView().byId("prodId").setEnabled(true);
              this.getView().byId("savebtn").setText("Save");
              this.getView().byId("delbtn").setEnabled(false);            
            }
            else{
              this.getView().byId("prodId").setEnabled(false);
              this.getView().byId("savebtn").setText("Update");
              this.getView().byId("delbtn").setEnabled(true);
              this.getView().byId("idName").focus();      
            }
       },
       onLoadSingle:function(oEvent){
            this.prodId = oEvent.getSource().getValue();
            this.prodId = this.prodId.toUpperCase();
            oEvent.getSource().setValue(this.prodId);
            var oDataModel = this.getView().getModel();
            var that = this;
            oDataModel.read("/ProductSet('"+ this.prodId +"')",{
                success:function(data,oResponse){
                    MessageToast.show("Record retrieved successfully");
                    that.oLocalModel.setProperty("/prodData",data);
                    that.setMode("update");
                },
                error:function(){
                    MessageToast.show("Problem in retrieving record");
                    that.setMode("create");  
                }
            })
       },
       onConfirm:function(oEvent){
            var selItem = oEvent.getParameter("selectedItem");
            var sData = selItem.getValue();
            this.oLocalModel.setProperty("/prodData/SUPPLIER_ID",sData);
            this.oLocalModel.setProperty("/prodData/SUPPLIER_NAME",selItem.getLabel());
        },
       oValueHelp:null,
       onF4Supplier:function(){
            if(!this.oValueHelp){
                var that = this;      
                Fragment.load({
                    fragmentName: "cgi.hr.so.fragments.popup",
                    id: "idf4supplier",
                    type :"XML",
                    controller: this
                }).then(function(oFragment){
                   that.oValueHelp = oFragment;
                   that.oValueHelp.setTitle("F4 help");
                   that.getView().addDependent(that.oValueHelp);
                   that.oValueHelp.bindAggregation("items",{
                    path :'/SupplierSet' ,
                    template : new DisplayListItem({
                        label : '{COMPANY_NAME}',
                        value : '{BP_ID}'
                    })
                   });
                   that.oValueHelp.open();
                });
            }
            else
            {
                this.oValueHelp.open();
            }
       },
       onSave:function(){
        var payLoad = this.oLocalModel.getProperty("/prodData");
        if(!payLoad.PRODUCT_ID || !payLoad.NAME)
        {
            MessageBox.show("Please enter valid name and product id"); 
            return;
        }
        var oDataModel = this.getView().getModel();
        if(this.mode == "create"){
        oDataModel.create("/ProductSet", payLoad, {
            success:function(){
                MessageBox.show("Record saved to database");
            },
            error:function(oError){
                var errorMessage = JSON.parse(oError.responseText).error.innererror.errordetails[0].message;
                MessageBox.show(errorMessage + "Save has been rejected");    
            }
        })
        }
       else{
        oDataModel.update("/ProductSet('"+ this.prodId +"')", payLoad, {
            success:function(){
                MessageToast.show("Record updated successfully");
            },
            error:function(oError){
                var errorMessage = JSON.parse(oError.responseText).error.innererror.errordetails[0].message;
                MessageBox.error("Details of the error is" +  errorMessage);
            }
        })
       } 
    },
    onLoadExpensive: function(){
        var oDataModel = this.getView().getModel();
        var that = this;
        oDataModel.callFunction("/GetMoseExpensiveProduct",
        {
            urlParameters:{
                "i_category":this.getView().byId("category").getSelectedKey()
            },
            success:function(data,oResponse){
                that.oLocalModel.setProperty("/prodData",data);
                that.prodId = data.PRODUCT_ID;
                that.setMode("update");
                    
            }
        })

    },
    onDelete:function(){
        var oDataModel = this.getView().getModel();
        var that = this;
        oDataModel.remove("/ProductSet('"+ this.prodId +"')",{
            success:function(){
                MessageToast.show("Message deleted successfully");
                that.onClear();
            },
            error:function(){
                var errorMessage = JSON.parse(oError.responseText).error.innererror.errordetails[0].message;
                MessageBox.error("oops! save has been rejected Error: " + errorMessage );                   
            }
        })
    }


    });
    
});