app.controller('inventorymaincontroller', function($scope,$ionicActionSheet,$ionicModal,$ionicLoading, $timeout, $state,$ionicPopup,smarthealth) {

$scope.years_count = function(startYear) {
            var currentYear = new Date().getFullYear(), years = [];
            startYear = startYear || 1980;

            while ( startYear <= currentYear+5) {
                    years.push(startYear++);
            }

            return years;
    }


//Initialisation buffers
$scope.addeditems = [];
$scope.supplierdata = [];
$scope.mainmenu = {};
$scope.mainpopup = {};
var SEPARATOR = "     ";
var COUNTER = 0;
var alertPopup_scan;
var STOCKPERSONID="STOCKPERSONID";
var ITEMID = "ITEMID";

var TOTAL_COSTING = 0;

//By default all scans direct to ITEMS
var SCAN_MODE = ITEMID;
var SUPPLIER_ACCOUNT;
//Current stored item barcode
var TEMP_BARCODE_ITEM="TEMPITEM";

//Autoincrement item count
var BARCODE_COUNTER = 0;

//LOGIC FOR SUBMITMODE
var SUBMIT_MODE = "submitmode";
var ENTER_ITEM = "enteritem";
var EDIT_ITEM = "edititem";
var SEARCH_ITEM = "searchitem";
var INLINE_EDIT = "inlineedit";

var SUPPLIER_GLCODE = "NONE";
var SUPPLIER_KEY;
var SUPPLIER_BRN ;
var SUPPLIER_NAME;
var SUPPLIER_OBJECT;

  $scope.model = {
        barcode: 'none',
    };

$scope.supplierchange = function(){
  if($scope.supplierdata != null){
   var selected_supplier = $scope.mainmenu.supplier;

   for(var i = 0; i < $scope.supplierdata.length ; i++){
      if($scope.supplierdata[i].suppliername===selected_supplier){
        SUPPLIER_GLCODE = $scope.supplierdata[i].supplierglaccount;
        SUPPLIER_BRN = $scope.supplierdata[i].supplierbrn;
        SUPPLIER_NAME = $scope.supplierdata[i].suppliername;
        SUPPLIER_ACCOUNT = $scope.supplierdata[i].accountkey;
        /*console.log('SUPPLIER GL CODE: ',SUPPLIER_GLCODE);
        console.log('SUPPLIER ACCOUNT KEY: ',SUPPLIER_ACCOUNT);
        console.log('SUPPLIER NAME: ',SUPPLIER_NAME);
        console.log('SUPPLIER BRN: ',SUPPLIER_BRN);*/

      }
   }

//Get the account of the supplier
var firebase_url = "https://medisave-a4903.firebaseio.com/tblaccountentries";
var firebase_reference = new Firebase(firebase_url);
firebase_reference = firebase_reference.child(smarthealth.get_supplieraccount());
$scope.loading = $ionicLoading.show({
    content: '<i class="icon ion-loading-c"></i>',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 50,
    showDelay: 0
  });
firebase_reference.on('child_added', function(snapshot, prevChildKey) {
if(snapshot.val()!=null){
$ionicLoading.hide();
var data = snapshot.val();

if(data.glcode===SUPPLIER_GLCODE){
  SUPPLIER_OBJECT = data;
  //console.log('SUPPLIER_OBJECT',SUPPLIER_OBJECT);
}


}


});

firebase_reference.on('value', function(snapshot){$ionicLoading.hide();});

}
}

/*
*Updates supplier account
*/
$scope.update_supplieraccount = function(amount_to_add){
  var current_date = new Date();
  /*console.log('SUPPLIER GL CODE: ',SUPPLIER_GLCODE);
  console.log('SUPPLIER ACCOUNT KEY: ',SUPPLIER_ACCOUNT);
  console.log('SUPPLIER NAME: ',SUPPLIER_NAME);
  console.log('SUPPLIER_OBJECT.accountbalance: ',SUPPLIER_OBJECT.accountbalance);*/
  var firebase_url_ = "https://medisave-a4903.firebaseio.com/tblaccountentries";
  var firebase_reference_ = new Firebase(firebase_url_);
  firebase_reference_ = firebase_reference_.child(smarthealth.get_supplieraccount());
  firebase_reference_.child(SUPPLIER_ACCOUNT).set({
date:current_date.toUTCString(),
category:'SUPPLIER',
glname:SUPPLIER_NAME,
glcode:SUPPLIER_GLCODE,
itemdescription:SUPPLIER_NAME,
totalamount:Number(SUPPLIER_OBJECT.amountdue)+Number(amount_to_add),
amountpaid:SUPPLIER_OBJECT.amountpaid,
amountdue:Number(SUPPLIER_OBJECT.amountdue)+Number(amount_to_add),
month:current_date.getMonth(),
year:current_date.getFullYear(),
status:'OPEN'
});


}//END update_supplieraccount()

$scope.buyingchanged = function(){
var nx = (((Number($scope.mainpopup.markup)+100)/100)*Number($scope.mainpopup.itemcost));
$scope.mainpopup.sellingprice = Math.round(nx * 100) / 100;
}

$scope.markupchanged = function(){
var nx = (((Number($scope.mainpopup.markup)+100)/100)*Number($scope.mainpopup.itemcost));
$scope.mainpopup.sellingprice = Math.round(nx * 100) / 100;
}

$scope.$on("$ionicView.enter",function(){

$scope.suppliers = [];
var firebase_url = "https://medisave-a4903.firebaseio.com/tblsupplier";
var firebase_reference = new Firebase(firebase_url);
  $scope.loading = $ionicLoading.show({
    content: '<i class="icon ion-loading-c"></i>',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 50,
    showDelay: 0
  });
firebase_reference.on("child_added", function(snapshot, prevChildKey) {
var data = snapshot.val();
if(data!=null){
$ionicLoading.hide();
$scope.suppliers.push(data.suppliername);
data.key = snapshot.key();
$scope.supplierdata.push(data);
$scope.$apply();}
else{$ionicLoading.hide();}
});

firebase_reference.on('value', function(snapshot){
    $scope.mainmenu.supplier = $scope.suppliers[0];
    $ionicLoading.hide();
    //Reload default supplier credentials
    $scope.supplierchange();
});

$scope.addeditems=[];

//Dynamically populate years
$scope.yearbuffer = [];
var current_date = new Date();
$scope.buff=[];
$scope.mainpopup.day = "01";
$scope.mainpopup.month = "JANUARY";
$scope.buff=($scope.years_count(current_date.getFullYear()));
$scope.years = $scope.buff;

//Preconfigure dropdowns
$scope.mainpopup.day = "01";
$scope.mainpopup.month = "JANUARY";
$scope.mainpopup.year =  $scope.buff[0];

//Date parameter initialisation and autofills the date text to today
var date = new Date();
$scope.mainmenu.dateofissue = date.yyyymmdd();
//Default item category
$scope.mainmenu.category = "DRUGS";

if(smarthealth.get_object()!=null){
$scope.clear_fields();
//Date parameter initialisation and autofills the date text to today
var date = new Date();
$scope.mainmenu.dateofissue = date.yyyymmdd();
$scope.mainmenu.sellingprice = smarthealth.get_object().sellingprice;
$scope.mainmenu.markup = smarthealth.get_object().markup;
$scope.mainmenu.category = smarthealth.get_object().category;
$scope.mainmenu.batchno=smarthealth.get_object().batchno;
$scope.mainmenu.itemname=smarthealth.get_object().itemname;
$scope.mainmenu.itemcost=smarthealth.get_object().itemcost;
$scope.mainmenu.expdate=smarthealth.get_object().expdateday+'-'+smarthealth.get_object().expdatemonth+'-'+smarthealth.get_object().expdateyear;
$scope.mainmenu.barcodevalue=smarthealth.get_object().barcodeval;
$scope.mainmenu.itemcounter="1";
BARCODE_COUNTER = 1;
$scope.mainmenu.contentdetails=smarthealth.get_object().fixedcontentdetails;
$scope.mainmenu.supplier=smarthealth.get_object().supplier;
console.log($scope.mainmenu.supplier);
TEMP_BARCODE_ITEM = $scope.mainmenu.barcodevalue;
//Set stkitems
$scope.mainmenu.stkitems = smarthealth.get_object().quantity;
$scope.addeditems.push({sellingprice:$scope.mainmenu.sellingprice,markup:$scope.mainmenu.markup,category:$scope.mainmenu.category,itemname:$scope.mainmenu.itemname,itemcost:$scope.mainmenu.itemcost,expdate:$scope.mainmenu.expdate,barcodeval:smarthealth.get_object().barcodeval,quantity:"1",batchno:$scope.mainmenu.batchno,fixedcontentdetails:smarthealth.get_object().fixedcontentdetails,contentdetails:$scope.mainmenu.contentdetails,supplier:$scope.mainmenu.supplier});
$scope.doSumTotal();
$scope.$apply();
}
});

$scope.disableinputitems = function(){
  document.getElementById('mainmenu.itemname').disabled = true;
  document.getElementById('mainmenu.itemcost').disabled = true;
  document.getElementById('mainmenu.expdate').disabled = true;
  document.getElementById('mainmenu.barcodevalue').disabled = true;
  document.getElementById('mainmenu.itemcounter').disabled = true;
  document.getElementById('mainmenu.batchno').disabled = true;
  document.getElementById('mainmenu.contentdetails').disabled = true;
  document.getElementById('mainmenu.batchno').disabled = true;
  document.getElementById('mainmenu.supplier').disabled = true;
}

    $scope.barcodeScanned = function(barcode) {
        //console.log('callback received barcode: ' + barcode);

        if(SCAN_MODE === ITEMID){
          console.log("TEMP_BARCODE_ITEM "+TEMP_BARCODE_ITEM);
          console.log("CURRENT BARCODE "+barcode);

          //First item scan -- store barcodevalue into memory
          if(BARCODE_COUNTER==0){TEMP_BARCODE_ITEM = barcode;}
          BARCODE_COUNTER++;
          $scope.mainmenu.barcodevalue = barcode;

          if(BARCODE_COUNTER>=1&&(TEMP_BARCODE_ITEM===barcode)){
            //Barcodes are matching carry forwards with incrementation

            $scope.mainmenu.barcodevalue = barcode;

           // }//END NULL CHECK FOR FIELDS

          }

          //Mismatch -- autodump
          else if(BARCODE_COUNTER=>1&&(TEMP_BARCODE_ITEM!=barcode)){
            UIkit.notification('New item scanned', {pos: 'top-right'});
            $scope.addeditems.push({sellingprice:$scope.mainmenu.sellingprice,markup:$scope.mainmenu.markup,category:$scope.mainmenu.category,itemname:$scope.mainmenu.itemname,itemcost:$scope.mainmenu.itemcost,expdate:$scope.mainmenu.expdate,barcodeval:TEMP_BARCODE_ITEM,quantity:$scope.mainmenu.itemcounter,batchno:$scope.mainmenu.batchno,contentdetails:$scope.mainmenu.contentdetails,fixedcontentdetails:$scope.mainmenu.fixedcontentdetails,supplier:$scope.mainmenu.supplier});
            $scope.doSumTotal();
          /**
           * RESET ALL PARAMETERS
           */
          $scope.clear_fields();
          $scope.render_backend_search(barcode);
            BARCODE_COUNTER = 1;
            TEMP_BARCODE_ITEM = barcode;
          }

          $scope.mainmenu.itemcounter = BARCODE_COUNTER;
        }

        //Keep SCAN_MODE in this order to avoid double calls to functions
        if(SCAN_MODE === STOCKPERSONID){

            smarthealth.get_useraccess(barcode).then(function(responsevalue){
                document.getElementById('mainmenu.identifystockperson').innerHTML = responsevalue;
            });

          //Shift back to ITEMID mode
          BARCODE_COUNTER=0;
          SCAN_MODE = ITEMID;
          document.getElementById('mainmenu.itemname').disabled = false;
          document.getElementById('mainmenu.itemcost').disabled = false;
          document.getElementById('mainmenu.expdate').disabled = false;
          document.getElementById('mainmenu.barcodevalue').disabled = false;
          document.getElementById('mainmenu.itemcounter').disabled = false;
          document.getElementById('mainmenu.batchno').disabled = false;
          document.getElementById('mainmenu.contentdetails').disabled = false;
          document.getElementById('mainmenu.batchno').disabled = false;
          document.getElementById('mainmenu.supplier').disabled = true;
    }

        //Search for an item in firebase
        if(SCAN_MODE === SEARCH_ITEM){
          alertPopup_scan.close();
          $scope.render_backend_search(barcode);
          BARCODE_COUNTER=1;
        }//END SEARCH_ITEM

    };

/**
 * Enter a stock item
 */
$scope.enterstockitem = function(){
SUBMIT_MODE = ENTER_ITEM;
$scope.mainpopup.category = "DRUGS";
$scope.showPopup();

$scope.mainpopup.supplier = $scope.mainmenu.supplier;

$scope.mainmenu.sellingprice = $scope.mainpopup.sellingprice;
$scope.mainmenu.markup=$scope.mainpopup.markup;
$scope.mainmenu.category = $scope.mainpopup.category;
//$scope.mainmenu.supplier=$scope.mainpopup.supplier;
$scope.mainmenu.batchno=$scope.mainpopup.batchno;
$scope.mainmenu.itemname=$scope.mainpopup.itemname;
$scope.mainmenu.itemcost=$scope.mainpopup.itemcost;
//$scope.mainmenu.expdate=$scope.mainpopup.expdate;
$scope.mainmenu.barcodevalue=$scope.mainpopup.barcodeval;
$scope.mainmenu.itemcounter=$scope.mainpopup.quantity;
$scope.mainmenu.contentdetails=$scope.mainpopup.contentdetails;
$scope.mainmenu.expdate=$scope.mainpopup.day+'-'+$scope.mainpopup.month+'-'+$scope.mainpopup.year;



TEMP_BARCODE_ITEM = $scope.mainmenu.barcodevalue;
}


//Identify stock person
$scope.identifystockperson = function(){
SCAN_MODE = STOCKPERSONID;
document.getElementById('mainmenu.identifystockperson').innerHTML = "Please scan your ID";
}

//Popup initialisation
  $ionicModal.fromTemplateUrl('inventory/inventorymainpopup.html', {
  id : '1',
  scope: $scope
  }).then(function(modal) {
  $scope.oModal1 = modal;
  });

  // Triggered in the popup modal to close it
  $scope.closePopup = function() {
    $scope.oModal1.hide();
  };

  // Open the popup modal
  $scope.showPopup = function() {
    $scope.oModal1.show();
  };
//END Popup initialisation

//Popup LOCKED modal initialisation
  $ionicModal.fromTemplateUrl('inventory/inventorymainpopuplocked.html', {
  id : '2',
  scope: $scope
  }).then(function(modal) {
  $scope.oModal2 = modal;
  });

  // Triggered in the popup modal to close it
  $scope.closePopupLOCKED = function() {
    $scope.oModal2.hide();
  };

  // Open the popup modal
  $scope.showPopupLOCKED = function() {
    $scope.oModal2.show();
  };
//END Popup LOCKED



/**
 * Method to return current date in human-readable format
 */
Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth();
  var dd = this.getDate();
  var month;

  if(mm == 0){month="January";}
  if(mm == 1){month="February";}
  if(mm == 2){month="March";}
  if(mm == 3){month="April";}
  if(mm == 4){month="May";}
  if(mm == 5){month="June";}
  if(mm == 6){month="July";}
  if(mm == 7){month="August";}
  if(mm == 8){month="September";}
  if(mm == 9){month="October";}
  if(mm == 10){month="November";}
  if(mm == 11){month="December";}


  var output = this.getDate()+" "+month+" "+this.getFullYear();
  return output;
};
/**
 * END Method to return current date in human-readable format
 */



$scope.feeds = [];

//Push to table
for(var i = 0; i < $scope.feeds.length ; i++){
$scope.addeditems.push($scope.feeds[i]);
$scope.doSumTotal();
}

//Edit has been clicked
$scope.emitIndex_edit=function(input){
SUBMIT_MODE = EDIT_ITEM;
$scope.date = input.expdate.split("-");
$scope.showPopupLOCKED();

$scope.mainpopup.day = $scope.date[0];
$scope.mainpopup.month = $scope.date[1];
//$scope.mainpopup.year = $scope.date[2];

//Dynamically populate years
$scope.yearbuffer = [];
var current_date = new Date();
$scope.buff=[];
$scope.buff=($scope.years_count(current_date.getFullYear()));
$scope.years = $scope.buff;

for(var i = 0; i < $scope.buff.length;i++){
  if($scope.date[2]==$scope.buff[i]){
  $scope.mainpopup.year = $scope.buff[i];
  }
}

$scope.mainpopup.sellingprice = input.sellingprice;
$scope.mainpopup.markup = input.markup;
$scope.mainpopup.category=input.category;
$scope.mainpopup.supplier=input.supplier;
$scope.mainpopup.batchno=input.batchno;
$scope.mainpopup.itemname=input.itemname;
$scope.mainpopup.itemcost=input.itemcost;
$scope.mainpopup.barcodeval=input.barcodeval;
$scope.mainpopup.quantity=input.quantity;
$scope.mainpopup.contentdetails=input.contentdetails;

TEMP_BARCODE_ITEM = $scope.mainmenu.barcodevalue;

//}

};

/**
 * NULL filter function
 */
$scope.NullFilter = function(input) {
var out = "";
if(input==null){out = "";}else{out = input;}
return out;
};

//Push data to server
$scope.push_to_server = function(){
if($scope.run_verification()){

var firebase_url = "https://medisave-a4903.firebaseio.com/medisavepharmacy";
var firebase_reference = new Firebase(firebase_url);

var firebase_urlaudit = "https://medisave-a4903.firebaseio.com/tblstkaudit";
var firebase_referenceaudit = new Firebase(firebase_urlaudit);

var firebase_supplierglaccount = "https://medisave-a4903.firebaseio.com/tblaccountentries";
var firebase_referencesupplierglaccount = new Firebase(firebase_supplierglaccount);

var currentdate = new Date();

for(var i = 0 ; i <$scope.addeditems.length;i++){
$scope.item = $scope.addeditems[i].expdate.split('-');
 var PUSH_ = firebase_reference.push();
 var UNIQUEID = PUSH_.name();
  PUSH_.set({
"sellingprice":$scope.NullFilter($scope.addeditems[i].sellingprice),
"markup":$scope.NullFilter($scope.addeditems[i].markup),
"itemname":$scope.NullFilter($scope.addeditems[i].itemname),
"itemcost":$scope.NullFilter($scope.addeditems[i].itemcost),
"expdateday":$scope.item[0],
"expdatemonth":$scope.item[1],
"expdateyear":$scope.item[2],
"barcodeval":$scope.NullFilter($scope.addeditems[i].barcodeval),
"quantity":$scope.NullFilter($scope.addeditems[i].quantity),
"supplier":$scope.NullFilter($scope.addeditems[i].supplier),
"staffid":document.getElementById('mainmenu.identifystockperson').innerHTML,
"batchno":$scope.NullFilter($scope.addeditems[i].batchno),
"contentdetails":$scope.NullFilter($scope.addeditems[i].contentdetails),
"uniqueid":UNIQUEID,
"fixedcontentdetails":$scope.NullFilter($scope.addeditems[i].contentdetails),
"category":$scope.NullFilter($scope.addeditems[i].category),
"timestamp":currentdate.toUTCString()
});

/**
 * For AUDIT purposes keep a record of all stkitems inventory
 * @tblstkaudit
 */

var AUDIT = firebase_referenceaudit.push();
var audituniqueid = AUDIT.name();
AUDIT.set({
"sellingprice":$scope.NullFilter($scope.addeditems[i].sellingprice),
"markup":$scope.NullFilter($scope.addeditems[i].markup),
"itemname":$scope.NullFilter($scope.addeditems[i].itemname),
"itemcost":$scope.NullFilter($scope.addeditems[i].itemcost),
"expdateday":$scope.item[0],
"expdatemonth":$scope.item[1],
"expdateyear":$scope.item[2],
"barcodeval":$scope.NullFilter($scope.addeditems[i].barcodeval),
"quantity":$scope.NullFilter($scope.addeditems[i].quantity),
"supplier":$scope.NullFilter($scope.addeditems[i].supplier),
"staffid":document.getElementById('mainmenu.identifystockperson').innerHTML,
"batchno":$scope.NullFilter($scope.addeditems[i].batchno),
"contentdetails":$scope.NullFilter($scope.addeditems[i].contentdetails),
"uniqueid":audituniqueid,
"fixedcontentdetails":$scope.NullFilter($scope.addeditems[i].contentdetails),
"category":$scope.NullFilter($scope.addeditems[i].category),
"timestamp":currentdate.toUTCString()
});

//Calculate each item total costing
var amt = Number($scope.NullFilter($scope.addeditems[i].itemcost))*Number($scope.NullFilter($scope.addeditems[i].quantity));
TOTAL_COSTING = TOTAL_COSTING + amt;
}//END LOOPING

$scope.update_supplieraccount(TOTAL_COSTING);

$scope.clear_fields();

 UIkit.notification('Items saved successfully', {pos: 'top-right'});

 $scope.mainmenu.identifystockperson = "Click here to identify yourself";
 $scope.mainmenu.sellingprice="";
 $scope.mainmenu.markup="";
 $scope.mainmenu.supplier = "";
 $scope.mainmenu.batchno = "";
 $scope.mainmenu.itemname = "";
 $scope.mainmenu.itemcost = "";
 $scope.mainmenu.contentdetails = "";
 $scope.mainmenu.expdate = "";
 $scope.mainmenu.barcodevalue = "";
 $scope.mainmenu.itemcounter = "";
 $scope.mainmenu.stkitems = "";
 $scope.mainmenu.category = "";
}
};//END Push data to server



/**
 * Verify if data is valid before creating or updating backend
 */
$scope.run_verification = function(){
var status = true;

if($scope.mainmenu.supplier==null||$scope.mainmenu.supplier==""
||$scope.mainmenu.dateofissue==null||$scope.mainmenu.dateofissue==""
||$scope.mainmenu.batchno==null||$scope.mainmenu.batchno==""
||$scope.mainmenu.itemname==null||$scope.mainmenu.itemname==""
||$scope.mainmenu.itemcost==null||$scope.mainmenu.itemcost==""
||$scope.mainmenu.contentdetails==null||$scope.mainmenu.contentdetails==""
||$scope.mainmenu.expdate==null||$scope.mainmenu.expdate==""
){
  status = false;
  UIkit.notification('Fill in all fields', {pos: 'top-right'});
}

return status;

};//END run_verification()

//Remove commas
    $scope.remove_commas = function(input){

        var INPUT = input.toString();

        $scope.x = INPUT.split(',');
        return parseInt($scope.x[0]+$scope.x[1]);
    }

/**
 * Clear all fields in view
 */
$scope.clear_fields = function(){
$scope.mainmenu.sellingprice="";
$scope.mainmenu.markup="";
$scope.mainmenu.supplier = "";
$scope.mainmenu.dateofissue = "";
$scope.mainmenu.batchno = "";
$scope.mainmenu.itemname = "";
$scope.mainmenu.itemcost = "";
$scope.mainmenu.contentdetails = "";
$scope.mainmenu.expdate = "";
$scope.mainmenu.barcodevalue = "";
$scope.mainmenu.itemcounter = "";
$scope.mainmenu.stkitems = "";
$scope.mainmenu.category = "DRUGS";
$scope.addeditems = [];
//Date parameter initialisation and autofills the date text to today
var date = new Date();
$scope.mainmenu.dateofissue = date.yyyymmdd();
};//END clear_fields()

/**
 * Save button has been pressed
 * Transfer data to firebase backend
 */
$scope.savestockitem = function(){
var firebase_url = "https://medisave-a4903.firebaseio.com/medisavepharmacy";
var firebase_reference = new Firebase(firebase_url);

var firebase_urlaudit = "https://medisave-a4903.firebaseio.com/tblstkaudit";
var firebase_referenceaudit = new Firebase(firebase_urlaudit);

var firebase_supplierglaccount = "https://medisave-a4903.firebaseio.com/tblaccountentries";
var firebase_referencesupplierglaccount = new Firebase(firebase_supplierglaccount);

if(document.getElementById('mainmenu.identifystockperson').innerHTML === "Please scan your ID"||document.getElementById('mainmenu.identifystockperson').innerHTML === "Click here to identify yourself"){

UIkit.notification('Please scan your ID before proceeding', {pos: 'top-right'});

}else
{

if(smarthealth.get_object()!=null){
if($scope.mainmenu.supplier===smarthealth.get_object().supplier&&
$scope.mainmenu.batchno===smarthealth.get_object().batchno&&
$scope.mainmenu.barcodevalue===smarthealth.get_object().barcodeval&&
$scope.mainmenu.expdate===(smarthealth.get_object().expdateday+'-'+smarthealth.get_object().expdatemonth+'-'+smarthealth.get_object().expdateyear) &&
$scope.run_verification()
){
//Same item credentials -- update inventory count
console.log('Same item credentials -- update inventory count');

for(var i = 0 ; i <$scope.addeditems.length;i++){
var new_stock_count = Number($scope.NullFilter($scope.addeditems[i].quantity))+Number(smarthealth.get_object().quantity);
var currentdate = new Date();
$scope.item = $scope.addeditems[i].expdate.split('-');

firebase_reference.child(smarthealth.get_object().uniqueid).set({
"sellingprice":$scope.NullFilter($scope.addeditems[i].sellingprice),
"markup":$scope.NullFilter($scope.addeditems[i].markup),
"itemname":$scope.NullFilter($scope.addeditems[i].itemname),
"itemcost":$scope.NullFilter($scope.addeditems[i].itemcost),
"expdateday":$scope.item[0],
"expdatemonth":$scope.item[1],
"expdateyear":$scope.item[2],
"barcodeval":$scope.NullFilter($scope.addeditems[i].barcodeval),
"quantity":new_stock_count,
"supplier":$scope.NullFilter($scope.addeditems[i].supplier),
"staffid":document.getElementById('mainmenu.identifystockperson').innerHTML,
"batchno":$scope.NullFilter($scope.addeditems[i].batchno),
"contentdetails":$scope.NullFilter($scope.addeditems[i].contentdetails),
"uniqueid":smarthealth.get_object().uniqueid,
"fixedcontentdetails":$scope.NullFilter($scope.addeditems[i].contentdetails),
"category":$scope.NullFilter($scope.addeditems[i].category),
"timestamp":currentdate.toUTCString()
});

/**
 * For AUDIT purposes keep a record of all stkitems inventory
 * @tblstkaudit
 */

var AUDIT = firebase_referenceaudit.push();
var audituniqueid = AUDIT.name();
AUDIT.set({
"sellingprice":$scope.NullFilter($scope.addeditems[i].sellingprice),
"markup":$scope.NullFilter($scope.addeditems[i].markup),
"itemname":$scope.NullFilter($scope.addeditems[i].itemname),
"itemcost":$scope.NullFilter($scope.addeditems[i].itemcost),
"expdateday":$scope.item[0],
"expdatemonth":$scope.item[1],
"expdateyear":$scope.item[2],
"barcodeval":$scope.NullFilter($scope.addeditems[i].barcodeval),
"quantity":$scope.NullFilter($scope.addeditems[i].quantity),
"supplier":$scope.NullFilter($scope.addeditems[i].supplier),
"staffid":document.getElementById('mainmenu.identifystockperson').innerHTML,
"batchno":$scope.NullFilter($scope.addeditems[i].batchno),
"contentdetails":$scope.NullFilter($scope.addeditems[i].contentdetails),
"uniqueid":audituniqueid,
"fixedcontentdetails":$scope.NullFilter($scope.addeditems[i].contentdetails),
"category":$scope.NullFilter($scope.addeditems[i].category),
"timestamp":currentdate.toUTCString()
});

/*
* Make a GL Account entry for the given supplier into main supplier Account
*@tblsupplierglaccounts
*/
firebase_referencesupplierglaccount = firebase_referencesupplierglaccount.child(smarthealth.get_supplieraccount());
var SUPPLIER = firebase_referencesupplierglaccount.push();
var suppliergluniqueid = SUPPLIER.name();
var amt = Number($scope.NullFilter($scope.addeditems[i].itemcost))*Number($scope.NullFilter($scope.addeditems[i].quantity));
SUPPLIER.set({
  "date":currentdate.toUTCString(),
  "category":"SUPPLIER",
  "glname":$scope.NullFilter($scope.addeditems[i].supplier),
  "glcode":SUPPLIER_GLCODE,
  "itemdescription":$scope.NullFilter($scope.addeditems[i].itemname),
  "totalamount":amt,
  "amountpaid":0,
  "amountdue":amt,
  "month":currentdate.getMonth(),
  "year":currentdate.getFullYear(),
  "status":"OPEN"
});


//Calculate each item total costing
var amt = Number($scope.NullFilter($scope.addeditems[i].itemcost))*Number($scope.NullFilter($scope.addeditems[i].quantity));
TOTAL_COSTING = Number($scope.remove_commas(TOTAL_COSTING)) + amt;
}//END LOOPIN

$scope.update_supplieraccount(TOTAL_COSTING);

UIkit.notification('Stock count updated', {pos: 'top-right'});
$scope.clear_fields();

}

else {
//Not the same item -- treat as new stock entry
$scope.push_to_server();
}
}else $scope.push_to_server();

}//END STAFF ID VERIFICATION

}//END savestockitem()


/**
 *Edit listed mainmenu item details
 */

$scope.editstockitem = function(){
SUBMIT_MODE = INLINE_EDIT;
$scope.showPopupLOCKED();
$scope.mainpopup.sellingprice=$scope.mainmenu.sellingprice;
$scope.mainpopup.markup=$scope.mainmenu.markup;
$scope.mainpopup.category=$scope.mainmenu.category;
$scope.mainpopup.supplier=$scope.mainmenu.supplier;
$scope.mainpopup.batchno=$scope.mainmenu.batchno;
$scope.mainpopup.itemname=$scope.mainmenu.itemname;
$scope.mainpopup.itemcost=$scope.mainmenu.itemcost;
$scope.mainpopup.expdate=$scope.mainmenu.expdate;
$scope.mainpopup.barcodeval=$scope.mainmenu.barcodevalue;
$scope.mainpopup.quantity=$scope.mainmenu.itemcounter;
$scope.mainpopup.contentdetails=$scope.mainmenu.contentdetails;
TEMP_BARCODE_ITEM = $scope.mainmenu.barcodevalue;
}

/**
 * Search firebase database for given barcode
 * Inject results into mainmenu template
 */

$scope.searchstockitem = function(){
SCAN_MODE = SEARCH_ITEM;
   alertPopup_scan = $ionicPopup.alert({
     title: 'Medisave Pharmacist Dashboard',
     template: 'Scan the item using your barcode scanner'
   });
}

$scope.render_backend_search = function(SEARCH_QUERY){
  console.log('render_backend_search');
var firebase_url = "https://medisave-a4903.firebaseio.com/medisavepharmacy";
var firebase_reference = new Firebase(firebase_url);
  $scope.loading = $ionicLoading.show({
    content: '<i class="icon ion-loading-c"></i>',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 50,
    showDelay: 0
  });
firebase_reference.on("child_added", function(snapshot, prevChildKey) {
var data = snapshot.val();

if(data==null){
$ionicLoading.hide();
   var alertPopup = $ionicPopup.alert({
     title: 'Medisave Pharmacist Dashboard',
     template: 'No Match found'
   });
}else{
$ionicLoading.hide();

if(SEARCH_QUERY === data.barcodeval){
smarthealth.set_object(data);
console.log(data);
if(smarthealth.get_object()!=null){
$scope.mainmenu.sellingprice=smarthealth.get_object().sellingprice;
$scope.mainmenu.markup=smarthealth.get_object().markup;
$scope.mainmenu.category=smarthealth.get_object().category;
$scope.mainmenu.batchno=smarthealth.get_object().batchno;
$scope.mainmenu.itemname=smarthealth.get_object().itemname;
$scope.mainmenu.itemcost=smarthealth.get_object().itemcost;
$scope.mainmenu.expdate=smarthealth.get_object().expdateday+'-'+smarthealth.get_object().expdatemonth+'-'+smarthealth.get_object().expdateyear;
$scope.mainmenu.barcodevalue=SEARCH_QUERY;
$scope.mainmenu.stkitems=smarthealth.get_object().quantity;
$scope.mainmenu.contentdetails=smarthealth.get_object().fixedcontentdetails;
$scope.mainmenu.supplier=smarthealth.get_object().supplier;
TEMP_BARCODE_ITEM = $scope.mainmenu.barcodevalue;
//Assign itemcounter to 1 default
$scope.mainmenu.itemcounter = "1";
$scope.$apply();
}
SCAN_MODE = ITEMID;
SUBMIT_MODE = ENTER_ITEM;
}

}
});
    $timeout(function() {
    $ionicLoading.hide();

    }, 3000);
}

//Delete has been clicked
$scope.emitIndex_delete=function(input){
$scope.doSumTotal();
var index = 0;
var to_delete = false;
for(var i = 0; i < $scope.addeditems.length;i++){
if(input.itemcost===$scope.addeditems[i].itemcost&&input.itemcost===$scope.addeditems[i].itemcost){
  index = i;
  to_delete = true;
}
}//END LOOP $scope.addeditems[]

if(to_delete){
  var confirmPopup = $ionicPopup.confirm({
     title: 'Delete this item?',
     template: input.itemname
   });

   confirmPopup.then(function(res) {
     if(res) {
       if (index > -1){$scope.addeditems.splice(index, 1);}
     } else {

     }
   });
}
};//END delete item

//Add item has been clicked
$scope.additem = function(){
$scope.doSumTotal();
$scope.showPopup();
};



//Done button has been clicked on popup
$scope.submititem = function(input){

if(input.sellingprice==null||input.sellingprice==""||
input.markup==null||input.markup==""||
input.category==null||input.category==""||
input.supplier==null||input.supplier==""||
input.batchno==null||input.batchno==""||
input.itemname==null||input.itemname==""||
input.itemcost==null||input.itemcost==""||
input.barcodeval==null||input.barcodeval==""||
input.quantity==null||input.quantity==""||
input.contentdetails==null||input.contentdetails==""){
  UIkit.notification('Fill in all fields', {pos: 'top-right'});
}
else{

if(SUBMIT_MODE===ENTER_ITEM){
$scope.mainmenu.sellingprice = input.sellingprice;
$scope.mainmenu.markup = input.markup;
$scope.mainmenu.category = input.category;
$scope.mainmenu.supplier = input.supplier;
$scope.mainmenu.batchno = input.batchno;
$scope.mainmenu.itemname = input.itemname;
$scope.mainmenu.itemcost = input.itemcost;
$scope.mainmenu.barcodevalue = input.barcodeval;
$scope.mainmenu.expdate = input.day+'-'+input.month+'-'+input.year;
TEMP_BARCODE_ITEM = $scope.mainmenu.barcodevalue;
$scope.mainmenu.itemcounter = input.quantity;
$scope.mainmenu.contentdetails = input.contentdetails;
$scope.addeditems.push({sellingprice:$scope.mainmenu.sellingprice,markup:$scope.mainmenu.markup,category:$scope.mainmenu.category,itemname:$scope.mainmenu.itemname,itemcost:$scope.mainmenu.itemcost,expdate:$scope.mainmenu.expdate,barcodeval:input.barcodeval,quantity:input.quantity,batchno:input.batchno,contentdetails:input.contentdetails,fixedcontentdetails:input.contentdetails, supplier:$scope.mainmenu.supplier});
$scope.closePopup();
$scope.doSumTotal();
}

if(SUBMIT_MODE===EDIT_ITEM){

var index = 0;
if(input.itemname===$scope.addeditems[i].itemname&&input.itemcost===$scope.addeditems[i].itemcost){
if (index > -1){$scope.addeditems.splice(index, 1);}}
$scope.mainpopup.expdate = $scope.mainpopup.day+'-'+$scope.mainpopup.month+'-'+$scope.mainpopup.year;
$scope.addeditems.push({sellingprice:$scope.mainpopup.sellingprice,markup:$scope.mainpopup.markup,category:$scope.mainpopup.category,itemname:$scope.mainpopup.itemname,itemcost:$scope.mainpopup.itemcost,expdate:$scope.mainpopup.expdate,barcodeval:$scope.mainpopup.barcodeval,quantity:$scope.mainpopup.quantity,batchno:input.batchno,contentdetails:input.contentdetails,fixedcontentdetails:input.contentdetails, supplier:$scope.mainpopup.supplier});
TEMP_BARCODE_ITEM = $scope.mainpopup.barcodevalue;
$scope.doSumTotal();
$scope.closePopupLOCKED();
}

if(SUBMIT_MODE===INLINE_EDIT){
$scope.mainmenu.sellingprice = input.sellingprice;
$scope.mainmenu.markup = input.markup;
$scope.mainmenu.category = input.category;
$scope.mainmenu.supplier = input.supplier;
$scope.mainmenu.batchno=$scope.mainpopup.batchno;
$scope.mainmenu.itemname=$scope.mainpopup.itemname;
$scope.mainmenu.itemcost=$scope.mainpopup.itemcost;
$scope.mainmenu.expdate = input.day+'-'+input.month+'-'+input.year;
$scope.mainmenu.barcodevalue=$scope.mainpopup.barcodeval;
$scope.mainmenu.itemcounter=$scope.mainpopup.quantity;
$scope.mainmenu.contentdetails=$scope.mainpopup.contentdetails;
TEMP_BARCODE_ITEM = $scope.mainmenu.barcodevalue;
$scope.closePopupLOCKED();
}

}//END ELSE

//Dynamically populate years
$scope.yearbuffer = [];
var current_date = new Date();
$scope.buff=[];
$scope.mainpopup.day = "01";
$scope.mainpopup.month = "JANUARY";
$scope.buff=($scope.years_count(current_date.getFullYear()));
$scope.years = $scope.buff;
$scope.mainpopup.year =  $scope.buff[0];
};

//Manual Search triggered
$scope.manualsearch = function(){
$state.go('inventorysearchstock');
}

//Adds up items in list
$scope.doSumTotal = function(){
COUNTER = 0;
for(var i = 0; i < $scope.addeditems.length;i++){
COUNTER = COUNTER+(Number($scope.addeditems[i].itemcost)*Number($scope.addeditems[i].quantity));
$scope.mainmenu.sumtotal = SEPARATOR+COUNTER;
}
};
//ENDS doSumTotal()

$scope.submitclaim = function(){
  /*
     var alertPopup = $ionicPopup.alert({
     title: 'Medisave Pharmacist Dashboard',
     template: 'Congratulations! Items saved successfully'
   });*/
    UIkit.notification('Items saved successfully', {pos: 'top-right'});

   alertPopup.then(function(res) {
   });
};

})//END inventorymaincontroller

.controller('inventorysearchstockcontroller', function($scope,$ionicActionSheet,$ionicModal,$ionicLoading, $timeout, $state,$ionicPopup,smarthealth) {

$scope.stockitems = [];

$scope.backtomenu = function(){
  $state.go('app.inventorymain');
}

$scope.$on("$ionicView.enter",function(){

$scope.stockitems = [];
var firebase_url = "https://medisave-a4903.firebaseio.com/medisavepharmacy";
var firebase_reference = new Firebase(firebase_url);
  $scope.loading = $ionicLoading.show({
    content: '<i class="icon ion-loading-c"></i>',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 50,
    showDelay: 0
  });
firebase_reference.on("child_added", function(snapshot, prevChildKey) {
var data = snapshot.val();

if(data!=null){
  data.expdate = data.expdateday+' '+data.expdatemonth+' '+data.expdateyear;
  $scope.stockitems.push(data);
  $ionicLoading.hide();
}else{
  $ionicLoading.hide();
}

});//END LOOPING
    $timeout(function() {
    $ionicLoading.hide();

    }, 3000);
});

$scope.showDetails = function(input){
  smarthealth.set_object(input);
  $state.go('app.inventorymain');
}

})//END searchstockcontroller

;//END controllers.js
