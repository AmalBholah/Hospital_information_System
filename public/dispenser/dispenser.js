app.controller('dispensermaincontroller', function($scope,$ionicActionSheet,$ionicModal,$ionicLoading, $timeout, $state,$ionicPopup,smarthealth) {

//Initialisation buffers
$scope.addeditems = [];
$scope.dbquantitybuffer=[];
$scope.peripheralsbuffer = [];
$scope.mainmenu = {};
$scope.mainpopup = {};

//Buffer
var SELLING_PRICE;
var MARKUP;
var TIMESTAMP;

//Buffer to store stkitemsid
$scope.stkitems = [];

var SEPARATOR = "     ";
var YES = "YES";
var NO = "NO";

//RETRIEVE FIREBASE PUSHED ID
var FIREBASE_PUSHED_ID;

//SELECTOR DEFINITION FOR DROP-DOWN MENUS
var TRANSFER_FROM = "";

//SELECTOR FOR MANUAL/BARCODE SEARCH
var SELECTOR_SEARCH="";
var MANUAL_SEARCH="MANUAL_SEARCH";
var BARCODE_SEARCH = "BARCODE_SEARCH";

var COUNTER = 0;
var alertPopup_scan;
var STOCKPERSONID="STOCKPERSONID";
var ITEMID = "ITEMID";

//By default all scans direct to ITEMS
var SCAN_MODE = ITEMID;

//Current stored item barcode
var TEMP_BARCODE_ITEM="NO BARCODE";

//Autoincrement item count
var BARCODE_COUNTER = 0;

//Retrieved stock count from firebase
var DB_COUNTER_VAL = 0;

//Buffer for calculation results
var new_package_count;
var new_detail_count;
var cost_of_details;

//LOGIC FOR SUBMITMODE
var SUBMIT_MODE = "submitmode";
var ENTER_ITEM = "enteritem";
var EDIT_ITEM = "edititem";
var SEARCH_ITEM = "searchitem";
var INLINE_EDIT = "inlineedit";
var firebase_url = "https://medisave-a4903.firebaseio.com/";

$scope.selectedfrom = function(x){
//console.log("SELECTED FROM"+$scope.mainmenu.selectFROM);
TRANSFER_FROM = $scope.mainmenu.selectFROM.replace(/\s/g, "") ;
smarthealth.set_transferfrom(TRANSFER_FROM);
}
/**
 * Store listed stockitems
 * Auto filter out repetitions
 * 
 */
$scope.storestkitem = function(dbquantity,dbdetails,itemid){
var ADD_OPERATOR = false;
for(var i = 0; i < $scope.stkitems.length;i++){
if($scope.stkitems[i].STOCKID===itemid){
ADD_OPERATOR = true;
return;
}
}
if(!ADD_OPERATOR){$scope.stkitems.push({
  STOCKID:itemid,
  STOCKAMOUNT:dbquantity,
  STOCKDETAILS:dbdetails
});
}
console.log($scope.stkitems);
}//END $scope.storestkitem

/**
 * Returns stkitem count PACKAGE
 * Takes itemid as input parameter
 */
$scope.getstkitemcount_package = function(itemid){
var retval;
for(var i = 0; i < $scope.stkitems.length;i++){
if($scope.stkitems[i].STOCKID===itemid){
retval = $scope.stkitems[i].STOCKAMOUNT;
}
}
return retval;
}//END $scope.getstkitemcount_package()

/**
 * Returns stkitem count DETAIL
 * Takes itemid as input parameter
 */
$scope.getstkitemcount_detail = function(itemid){
var retval;
for(var i = 0; i < $scope.stkitems.length;i++){
if($scope.stkitems[i].STOCKID===itemid){
retval = $scope.stkitems[i].STOCKDETAILS;
}
}
return retval;
}//END $scope.getstkitemcount_detail()

/**
 * Update stkitem count
 * Takes newpackage,newdetail as parameter
 * Takes itemid for direct matching
 */

$scope.updatestkitem = function(newpackage,newdetail,itemid){

for(var i = 0; i < $scope.stkitems.length;i++){
if($scope.stkitems[i].STOCKID===itemid){
$scope.stkitems[i].STOCKAMOUNT = newpackage;
$scope.stkitems[i].STOCKDETAILS = newdetail;
}
}

}//END $scope.updatestkitem()

$scope.model = {
        barcode: 'none',
    };

$scope.$on('$ionicView.enter',function(){
//Date parameter initialisation and autofills the date text to today
    var date = new Date();
    $scope.mainmenu.dateofissue = date.yyyymmdd();
$scope.mainmenu.balance = 0;
if(smarthealth.getPatientName()!=null){document.getElementById('mainmenu.patientid').innerHTML = smarthealth.getPatientName();}
$scope.peripheralsbuffer = [];
$scope.addeditems = [];
var firebase_url = "https://medisave-a4903.firebaseio.com/tblperipherals";
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
  $scope.peripheralsbuffer.push(data.facility);
  $ionicLoading.hide();
}else{
  $ionicLoading.hide();
} 

});//END LOOPING

firebase_reference.on("value", function(snapshot){$ionicLoading.hide();});

$scope.peripherals = $scope.peripheralsbuffer;

/**
 * Reload data if present in smarthealth.get_object()
 */
if(smarthealth.get_object()!=null){
$scope.addeditems = [];
$scope.addeditems = smarthealth.get_buffer();
$scope.dbquantitybuffer.push({servercounter:smarthealth.get_object().quantity});
$scope.mainmenu.supplier = smarthealth.get_object().supplier;
$scope.mainmenu.itemname = smarthealth.get_object().itemname;
$scope.mainmenu.sellingprice = smarthealth.get_object().sellingprice;
$scope.mainmenu.batchno = smarthealth.get_object().batchno;
$scope.mainmenu.expdate=smarthealth.get_object().expdateday+'-'+smarthealth.get_object().expdatemonth+'-'+smarthealth.get_object().expdateyear;
$scope.mainmenu.barcodevalue = smarthealth.get_object().barcodeval;
$scope.mainmenu.itemsleft = smarthealth.get_object().quantity;
$scope.mainmenu.contentdetails = smarthealth.get_object().fixedcontentdetails;
$scope.mainmenu.itemcounter = "1";
BARCODE_COUNTER = 1;
FIREBASE_PUSHED_ID=smarthealth.get_object().uniqueid;
//console.log('VIEWLOADED',$scope.addeditems);
TEMP_BARCODE_ITEM =$scope.mainmenu.barcodevalue;
$scope.storestkitem(smarthealth.get_object().quantity,smarthealth.get_object().contentdetails,FIREBASE_PUSHED_ID);

}


$scope.$apply();
});

/**
 * Done button has been clicked in mainpopup
 */
$scope.submititem = function(input){
var index = 0;
for(var i = 0; i < $scope.addeditems.length;i++){
if(input.itemname===$scope.addeditems[i].itemname&&input.itemcost===$scope.addeditems[i].itemcost){
if (index > -1){$scope.addeditems.splice(index, 1);}
}
}
$scope.addeditems.push({
barcodeval:$scope.mainpopup.barcodeval,
batchno:smarthealth.get_mainpopupbuffer().batchno,
contentdetails:$scope.mainmenu.contentdetails,
sellingprice:input.sellingprice,
supplier:smarthealth.get_mainpopupbuffer().supplier,
itemname:$scope.mainpopup.itemname,
itemcost:$scope.mainpopup.itemcost,
expdate:$scope.mainpopup.expdate,
quantity:$scope.mainpopup.quantity,
markup:MARKUP,
sellingprice:SELLING_PRICE,
timestamp:TIMESTAMP,
uniqueid:smarthealth.get_mainpopupbuffer().uniqueid,
operator:smarthealth.get_mainpopupbuffer().operator});
$scope.doSumTotal();
$scope.closePopup();
console.log('SUBMITITEM',$scope.addeditems);
}

/**
 * Processes stocks return on emitIndex_delete()
 */
$scope.process_stockreturns = function(input){

var toreturn_package_count = 0;
var toreturn_detail_count = 0;

var package_count = Number(input.package);//8
var detail_count = Number(input.detail);//3
var package_contents_detail = Number(input.contentdetails);//20


if(input.operator==YES){
//Work with details

toreturn_detail_count = Number(input.quantity);//37

//Convert current package+details into details only
//(8*20)+3 = 163
var details_only = (package_count*package_contents_detail)+detail_count;
//Recover original count using details only (163+37 = 200)
var original_details_total = toreturn_detail_count+details_only;
//Convert details only to package+details
var DECIMAL_FACTOR = Number(original_details_total)/Number(package_contents_detail);
var ROUNDED_FIGURE = Math.floor(DECIMAL_FACTOR);
var DECIMAL_REMAINDER = DECIMAL_FACTOR-ROUNDED_FIGURE;
var DETAILS_ = Math.round(DECIMAL_REMAINDER * package_contents_detail);
var PACKAGE_ = Math.ceil(DECIMAL_FACTOR);

if(Number(DETAILS_)==0){DETAILS_=package_contents_detail;}

console.log("RECOVERED PACKAGE: "+PACKAGE_);
console.log("RECOVERED DETAILS: "+DETAILS_);

$scope.updatestkitem(PACKAGE_,DETAILS_,input.uniqueid);
}

if(input.operator===NO){
//Work with package
var RECOVERED_PACKAGE = $scope.getstkitemcount_package(input.uniqueid);
var RECOVERED_DETAILS = $scope.getstkitemcount_detail(input.uniqueid)
var out = (Number(RECOVERED_PACKAGE)+Number(input.quantity)).toString();
console.log("RECOVERED PACKAGE: "+out);
console.log("RECOVERED DETAILS: "+RECOVERED_DETAILS);
}

}//END process_stockreturns()

/**
 * Do the maths to dispense
 */
$scope.dispensedetails = function(){

  $scope.data = {};

  // An elaborate, custom popup
  var myPopup = $ionicPopup.show({
    template: '<input type="number" ng-model="data.content">',
    title: 'Dispense contents of a package',
    subTitle: 'Type the amount to be dispensed',
    scope: $scope,
    buttons: [
      { text: 'Cancel' },
      {
        text: '<b>Okay</b>',
        type: 'button-positive',
        onTap: function(e) {
          if (!$scope.data.content) {
            //don't allow the user to close unless he enters wifi password
            e.preventDefault();
          } else {

var input = $scope.data.content;

//Requested detail contents
var INPUT = Number(input);

//Package count
//var package_count = Number($scope.mainmenu.itemsleft);
var package_count = Number($scope.getstkitemcount_package(FIREBASE_PUSHED_ID));

//Item count inside package_count
//var items_in_package = Number($scope.mainmenu.contentdetails);
var items_in_package = Number($scope.getstkitemcount_detail(FIREBASE_PUSHED_ID));

console.log("package_count "+package_count);
console.log("items_in_package"+items_in_package);

if(items_in_package==0){
  package_count = package_count;
  items_in_package = $scope.mainmenu.contentdetails;
}

//Price per package
var price_per_package = Number($scope.mainmenu.sellingprice);

var DECIMAL_FACTOR = Number(INPUT)/Number(items_in_package);
var ROUNDED_FIGURE = Math.floor(DECIMAL_FACTOR);
var DECIMAL_REMAINDER = DECIMAL_FACTOR-ROUNDED_FIGURE;
var true_remainder = Math.round(DECIMAL_REMAINDER * items_in_package);
var DEDUCT_REMAINDER;

//Package Factor Correction Stage
if(DECIMAL_REMAINDER==0){DEDUCT_REMAINDER = 0;}else{DEDUCT_REMAINDER = items_in_package-true_remainder;}

var DEDUCT_PACKAGE = package_count-Math.ceil(DECIMAL_FACTOR);

var cost_per_detailitem = price_per_package/Number($scope.mainmenu.contentdetails);
var cost_for_required_items = Math.round(cost_per_detailitem*INPUT * 100) / 100;

//Assign variables
new_package_count = DEDUCT_PACKAGE;
new_detail_count = DEDUCT_REMAINDER;
cost_of_details = cost_for_required_items;

$scope.updatestkitem(new_package_count,new_detail_count,FIREBASE_PUSHED_ID);
/**
 * No need to add dataset to every $scope.addeditems
 * Add only here and retrieve if operator:YES
 */
$scope.addeditems.push({itemname:$scope.mainmenu.itemname,
sellingprice:cost_per_detailitem,
markup:smarthealth.get_object().markup,
timestamp:smarthealth.get_object().timestamp,
itemcost:smarthealth.get_object().itemcost,
expdate:$scope.mainmenu.expdate,
barcodeval:TEMP_BARCODE_ITEM,
quantity:input,
uniqueid:FIREBASE_PUSHED_ID,
contentdetails:$scope.mainmenu.contentdetails,
operator:YES,package:new_package_count,
detail:new_detail_count,
batchno:$scope.mainmenu.batchno,
cost:cost_per_detailitem,
requestamount:input,
supplier:$scope.mainmenu.supplier});
console.log('DISPENSEDETAILS',$scope.addeditems);
$scope.doSumTotal();     
   }
        }
      }
    ]
  });

}//END dispensedetails()

$scope.disableinputitems = function(){
  document.getElementById('mainmenu.itemname').disabled = true;
  document.getElementById('mainmenu.itemcost').disabled = true;
  document.getElementById('mainmenu.expdate').disabled = true;
  document.getElementById('mainmenu.barcodevalue').disabled = true;
  document.getElementById('mainmenu.itemcounter').disabled = true;
  document.getElementById('mainmenu.contentdetails').disabled = true;
          
}
    
    $scope.barcodeScanned = function(barcode) {        
        console.log('callback received barcode: ' + barcode); 
        
        if(SCAN_MODE === ITEMID){
          //First item scan -- store barcodevalue into memory
          if(BARCODE_COUNTER==0){TEMP_BARCODE_ITEM = barcode;}
          BARCODE_COUNTER++;
          $scope.mainmenu.barcodevalue = barcode;
        

          if(BARCODE_COUNTER>=1&&(TEMP_BARCODE_ITEM===barcode)){
            //Barcodes are matching carry forwards with incrementation

            console.log('Barcodes are matching carry forwards with incrementation');
          }

          //Mismatch -- autodump
          else if((BARCODE_COUNTER => 1) && (TEMP_BARCODE_ITEM!=barcode)){
            $scope.addeditems.push({itemname:$scope.mainmenu.itemname,sellingprice:$scope.mainmenu.sellingprice,expdate:$scope.mainmenu.expdate,barcodeval:TEMP_BARCODE_ITEM,quantity:BARCODE_COUNTER-1,uniqueid:FIREBASE_PUSHED_ID,contentdetails:$scope.mainmenu.contentdetails,operator:NO,supplier:$scope.mainmenu.supplier});
            //$scope.dbquantitybuffer.push({servercounter:DB_COUNTER_VAL});
            $scope.doSumTotal();
          console.log('Mismatch -- autodump');
          /**
           * RESET ALL PARAMETERS
           */
            BARCODE_COUNTER = 1;
            TEMP_BARCODE_ITEM = barcode;
            $scope.mainmenu.itemcounter = BARCODE_COUNTER;
            $scope.mainmenu.itemname="";
            $scope.mainmenu.sellingprice="";
            $scope.mainmenu.expdate="";
            $scope.mainmenu.batchno="";
            $scope.mainmenu.quantity="";
            $scope.mainmenu.itemsleft="";
            $scope.mainmenu.contentdetails="";

            //Search database for item and repopulate
            $scope.render_backend_search(barcode);
          }

          $scope.mainmenu.itemcounter = BARCODE_COUNTER;
        }               

        //Keep SCAN_MODE in this order to avoid double calls to functions     
        if(SCAN_MODE === STOCKPERSONID){
            smarthealth.get_useraccess(barcode).then(function(responsevalue){
                document.getElementById('mainmenu.identifystockpersondispenser').innerHTML = responsevalue;
            });
          //Shift back to ITEMID mode
          BARCODE_COUNTER=0;
          SCAN_MODE = ITEMID;
        }  

        //Search for an item in firebase
        if(SCAN_MODE === SEARCH_ITEM){
          alertPopup_scan.close();
          
if($scope.mainmenu.selectFROM!=null){
$scope.render_backend_search(barcode);
}
else{

 UIkit.notification('Please select facility from dropdown', {pos: 'top-right'});

}
          
        }//END SEARCH_ITEM
       
    }; 

/**
 * Get patient from list of active patients only
 * 
 */
$scope.getpatientid = function(){
  $state.go('dispenseractivepatients');
}

/**
 * Enter a stock item
 */
$scope.enterstockitem = function(){
SUBMIT_MODE = ENTER_ITEM;
$scope.showPopup();
$scope.mainmenu.itemname=$scope.mainpopup.itemname;
$scope.mainmenu.sellingprice=$scope.mainpopup.itemcost;
$scope.mainmenu.expdate=$scope.mainpopup.expdate;
$scope.mainmenu.barcodevalue=$scope.mainpopup.barcodeval;
$scope.mainmenu.itemcounter=$scope.mainpopup.quantity;
$scope.mainmenu.contentdetails=$scope.mainpopup.contentdetails;
}


//Identify stock person
$scope.identifystockpersondispenser = function(){
SCAN_MODE = STOCKPERSONID;
document.getElementById('mainmenu.identifystockpersondispenser').innerHTML = "Please scan your ID";
}

//Popup initialisation
  $ionicModal.fromTemplateUrl('dispenser/dispensermainpopup.html', {
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
  console.log(input);
SUBMIT_MODE = EDIT_ITEM;
smarthealth.set_mainpopupbuffer(input);
//Pre-load items into popup
$scope.mainpopup.itemname=input.itemname;
$scope.mainpopup.itemcost=input.sellingprice;
$scope.mainpopup.expdate=input.expdate;
$scope.mainpopup.barcodeval=input.barcodeval;
$scope.mainpopup.quantity=input.quantity;
$scope.mainpopup.contentdetails=input.contentdetails;
SELLING_PRICE = input.sellingprice;
MARKUP = input.markup;
TIMESTAMP = input.timestamp;
$scope.showPopup();
};

/**
 * NULL filter function
 */
$scope.NullFilter = function(input) {
var out = "";
if(input==null){out = "";}else{out = input;}
return out;
};

/**
 * Manual Search stock item
 */

$scope.data = {};

$scope.manualsearch = function(){
    SELECTOR_SEARCH = MANUAL_SEARCH;
    if($scope.mainmenu.selectFROM!=null){

      if(document.getElementById('mainmenu.patientid').innerHTML=="Select patient"){
          UIkit.notification('Please select a patient', {pos: 'top-right'});
      }else{
          SELECTOR_SEARCH = MANUAL_SEARCH;
          smarthealth.set_buffer($scope.addeditems);
          $state.go('dispensersearchstock');
      }


}
else{
UIkit.notification('Select facility from dropdown', {pos: 'top-right'});
}
  
}

/**
 *Edit listed mainmenu item details 
 */

$scope.editstockitem = function(){
$scope.showPopup();
$scope.mainpopup.itemname=$scope.mainmenu.itemname;
$scope.mainpopup.itemcost=$scope.mainmenu.sellingprice;
$scope.mainpopup.expdate=$scope.mainmenu.expdate;
$scope.mainpopup.barcodeval=$scope.mainmenu.barcodevalue;
$scope.mainpopup.quantity=$scope.mainmenu.itemcounter;
$scope.mainpopup.contentdetails=$scope.mainmenu.contentdetails;
}

/**
 * Watch amount paid field
 * Autocalcuate balance due
 */
$scope.$watch('mainmenu.amountpaid', function(newVal, oldVal){
 $scope.doSumTotal();
 var TOTAL = Number($scope.mainmenu.sumtotal);
 var PAID = Number(newVal);
 //Set balance
 $scope.mainmenu.balance = SEPARATOR + (PAID-TOTAL);
})


/**
 * Search firebase database for given barcode
 * Inject results into mainmenu template
 */

$scope.searchstockitem = function(){

    if($scope.mainmenu.selectFROM!=null){

        if(document.getElementById('mainmenu.patientid').innerHTML=="Select patient"){
            UIkit.notification('Please select a patient', {pos: 'top-right'});
        }else{
            SCAN_MODE = SEARCH_ITEM;
            SELECTOR_SEARCH = BARCODE_SEARCH;

            if($scope.mainmenu.selectFROM!=null){
                alertPopup_scan = $ionicPopup.alert({
                    title: 'Medisave Pharmacist Dashboard',
                    template: 'Scan the item using your barcode scanner'
                });
            }
        }


    }
    else{
        UIkit.notification('Select facility from dropdown', {pos: 'top-right'});
    }

}//END searchstockitem

$scope.render_backend_search = function(SEARCH_QUERY){
console.log('render_backend_search');
var firebase_url = "https://medisave-a4903.firebaseio.com/";
var firebase_reference = new Firebase(firebase_url);
  $scope.loading = $ionicLoading.show({
    content: '<i class="icon ion-loading-c"></i>',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 50,
    showDelay: 0
  });
firebase_reference.child(smarthealth.get_transferfrom()).on("child_added", function(snapshot, prevChildKey) {
var data = snapshot.val();  

if(data==null){
$ionicLoading.hide();

    UIkit.notification('No match found', {pos: 'top-right'});
}else{
$ionicLoading.hide();

if(SEARCH_QUERY === data.barcodeval){

//STORE DB PARAMETERS
smarthealth.set_object(data);

/**
 * Logic
 */
//$scope.addeditems = [];
$scope.dbquantitybuffer.push({servercounter:smarthealth.get_object().quantity});
$scope.mainmenu.supplier = smarthealth.get_object().supplier;
$scope.mainmenu.itemname = smarthealth.get_object().itemname;
$scope.mainmenu.sellingprice = smarthealth.get_object().sellingprice;
$scope.mainmenu.batchno = smarthealth.get_object().batchno;
    $scope.mainmenu.expdate=smarthealth.get_object().expdateday+'-'+smarthealth.get_object().expdatemonth+'-'+smarthealth.get_object().expdateyear;
$scope.mainmenu.barcodevalue = smarthealth.get_object().barcodeval;
$scope.mainmenu.itemsleft = smarthealth.get_object().quantity;
$scope.mainmenu.contentdetails = smarthealth.get_object().fixedcontentdetails;
FIREBASE_PUSHED_ID=smarthealth.get_object().uniqueid;
console.log('FIREBASE_PUSHED_ID '+FIREBASE_PUSHED_ID);
$scope.mainmenu.itemcounter = "1";
BARCODE_COUNTER = 1;
TEMP_BARCODE_ITEM =$scope.mainmenu.barcodevalue;
$scope.storestkitem(smarthealth.get_object().quantity,smarthealth.get_object().contentdetails,FIREBASE_PUSHED_ID);
/**
 * END Logic
 */

}

}
});
    $timeout(function() {
    $ionicLoading.hide();
   
    }, 3000);
SCAN_MODE = ITEMID;
}

//User decides to dispense entire package
$scope.dispensepackage = function(){

  // An elaborate, custom popup
  var myPopup = $ionicPopup.show({
    template: '<input type="number" ng-model="data.content">',
    title: 'Dispense packages',
    subTitle: 'Type the amount of boxes/packages to be dispensed',
    scope: $scope,
    buttons: [
      { text: 'Cancel' },
      {
        text: '<b>Okay</b>',
        type: 'button-positive',
        onTap: function(e) {
          if (!$scope.data.content) {
            //don't allow the user to close unless he enters wifi password
            e.preventDefault();
          } else {

var input = $scope.data.content;

//Requested detail contents
var INPUT = Number(input)*Number($scope.mainmenu.contentdetails);

//Package count
var package_count = Number($scope.getstkitemcount_package(FIREBASE_PUSHED_ID));

//Item count inside package_count
var items_in_package = Number($scope.getstkitemcount_detail(FIREBASE_PUSHED_ID));

console.log("package_count "+package_count);
console.log("items_in_package"+items_in_package);

  //Price per package
var price_per_package = Number($scope.mainmenu.sellingprice);
var cost_per_detailitem = price_per_package/items_in_package;
var cost_for_required_items = Math.round(cost_per_detailitem*INPUT * 100) / 100;


  //Assign variables
new_package_count = package_count - Number(input);
new_detail_count = items_in_package;
cost_of_details = price_per_package*Number(input);

$scope.updatestkitem(new_package_count,new_detail_count,FIREBASE_PUSHED_ID);

$scope.addeditems.push({
supplier:smarthealth.get_object().supplier,
itemname:$scope.mainmenu.itemname,
itemcost:smarthealth.get_object().itemcost,
batchno:smarthealth.get_object().batchno,
timestamp:smarthealth.get_object().timestamp,
sellingprice:smarthealth.get_object().sellingprice,
markup:smarthealth.get_object().markup,
expdate:$scope.mainmenu.expdate,
barcodeval:$scope.mainmenu.barcodevalue,
quantity:input,
uniqueid:FIREBASE_PUSHED_ID,
contentdetails:$scope.mainmenu.contentdetails,
operator:NO});
console.log('DISPENSE PACKAGE',$scope.addeditems);
$scope.doSumTotal();
          }
        }
      }
    ]
  });



}

//Delete has been clicked
$scope.emitIndex_delete=function(input){
console.log(input);
var index = 0;
for(var i = 0; i < $scope.addeditems.length;i++){
if(input.itemcost===$scope.addeditems[i].itemcost&&input.itemcost===$scope.addeditems[i].itemcost){
  index = i;

  var confirmPopup = $ionicPopup.confirm({
     title: 'Delete this item?',
     template: input.itemname
   });

   confirmPopup.then(function(res) {
     if(res) {

       /**
        * Before deleting return dispensed items back to counters
        */

      $scope.process_stockreturns(input);


       if (index > -1){$scope.addeditems.splice(index, 1);}
       if (index > -1){$scope.dbquantitybuffer.splice(index, 1);}
     } else {
       
     }
   });

}
}
};//END delete item

//Add item has been clicked
$scope.additem = function(){
$scope.doSumTotal();
$scope.showPopup();
};


//Adds up items in list
$scope.doSumTotal = function(){
COUNTER = 0;
for(var i = 0; i < $scope.addeditems.length;i++){

var QUANTITY = Number($scope.addeditems[i].quantity);
var ITEM_COST = Number($scope.addeditems[i].sellingprice);
var ITEM_TOTAL_PRICE = (QUANTITY*ITEM_COST);
//ADD ITEM_TOTAL_PRICE TO COUNTER
COUNTER = COUNTER + ITEM_TOTAL_PRICE;
}
$scope.mainmenu.sumtotal = Math.round((SEPARATOR+COUNTER) * 100) / 100; 
};
//ENDS doSumTotal()

/**
 * Execute Dispensing
 */
$scope.execute_dispensing = function(){
//Get firebase instance
var firebase_url = "https://medisave-a4903.firebaseio.com/";
var firebase_reference = new Firebase(firebase_url);

  //Loop through buffer items
  for(var i = 0 ; i < $scope.addeditems.length ; i++){
    
    var ITEM_UNIQUE_ID =$scope.addeditems[i].uniqueid;

var current_package_count = Number($scope.getstkitemcount_package(ITEM_UNIQUE_ID));
var current_detail_count = Number($scope.getstkitemcount_detail(ITEM_UNIQUE_ID));

var COST = 0;

$scope.buff = $scope.addeditems[i].expdate.split('-');

if($scope.addeditems[i].operator===YES){
COST = Number($scope.NullFilter($scope.addeditems[i].itemcost))*Number($scope.NullFilter($scope.addeditems[i].contentdetails));}
else{COST = Number($scope.NullFilter($scope.addeditems[i].itemcost));}

firebase_reference.child(smarthealth.get_transferfrom())
  .child(ITEM_UNIQUE_ID).set({
"itemname":$scope.NullFilter($scope.addeditems[i].itemname),
"itemcost":COST,
"expdateday":$scope.buff[0],
"expdatemonth":$scope.buff[1],
"expdateyear":$scope.buff[2],
"batchno":$scope.NullFilter($scope.addeditems[i].batchno),
"barcodeval":$scope.NullFilter($scope.addeditems[i].barcodeval),
"contentdetails":current_detail_count,
"quantity":current_package_count,
"fixedcontentdetails":$scope.NullFilter($scope.addeditems[i].contentdetails),
"sellingprice":($scope.addeditems[i].sellingprice),
"markup":$scope.NullFilter($scope.addeditems[i].markup),
"supplier":$scope.NullFilter($scope.addeditems[i].supplier),
"staffid":document.getElementById('mainmenu.identifystockpersondispenser').innerHTML,
"uniqueid":ITEM_UNIQUE_ID,
"timestamp":$scope.NullFilter($scope.addeditems[i].timestamp)
});

}//END LOOP $scope.addeditems

//Bill patient active id
var firebase_url = "https://medisave-a4903.firebaseio.com/tblitemsconsumed";

var firebase_reference = new Firebase(firebase_url);
var date = new Date();
for(var i = 0; i < $scope.addeditems.length;i++){

var ITEM_UNIQUE_ID =$scope.addeditems[i].uniqueid;
var obj = firebase_reference.push();
var itemdetail = $scope.addeditems[i];

if($scope.addeditems[i].operator===NO){
obj.set({
  staffid:document.getElementById('mainmenu.identifystockpersondispenser').innerHTML,
  activepatientid:smarthealth.get_uniqueid(),
  batchno:$scope.NullFilter($scope.addeditems[i].batchno),
  itemconsumed: $scope.NullFilter($scope.addeditems[i].itemname),
  sellingprice:($scope.addeditems[i].sellingprice),
  markup:$scope.NullFilter($scope.addeditems[i].markup),
  itemcost:$scope.NullFilter($scope.addeditems[i].itemcost),
  quantity:$scope.NullFilter($scope.addeditems[i].quantity),
  packagecontents:$scope.NullFilter($scope.addeditems[i].contentdetails),
  itemcategory:"DRUG/DISPOSABLE",
  dateofuse: date.toUTCString(),
  patientname: smarthealth.getPatientName(),
  patientgender: smarthealth.getPatientGender(),
  facility:smarthealth.get_transferfrom(),
  packagetype:"PACKAGE",
  itemid:$scope.NullFilter($scope.addeditems[i].uniqueid),
  expdateday:$scope.buff[0],
  expdatemonth:$scope.buff[1],
  expdateyear:$scope.buff[2],
  timestamp:smarthealth.get_currentutc()
});
}
if($scope.addeditems[i].operator===YES){
obj.set({
  staffid:document.getElementById('mainmenu.identifystockpersondispenser').innerHTML,
  activepatientid:smarthealth.get_uniqueid(),
  itemconsumed: $scope.NullFilter($scope.addeditems[i].itemname),
  sellingprice:($scope.addeditems[i].sellingprice),
  markup:$scope.NullFilter($scope.addeditems[i].markup),
  itemcost:$scope.NullFilter($scope.addeditems[i].cost),
  itemcategory:"DRUG/DISPOSABLE",
  dateofuse: date.toUTCString(),
  packagecontents:$scope.NullFilter($scope.addeditems[i].contentdetails),
  quantity:$scope.NullFilter($scope.addeditems[i].quantity),
  patientname: smarthealth.getPatientName(),
  patientgender: smarthealth.getPatientGender(),
  facility:smarthealth.get_transferfrom(),
  packagetype:"DETAIL",
  itemid:$scope.NullFilter($scope.addeditems[i].uniqueid),
  expdateday:$scope.buff[0],
  expdatemonth:$scope.buff[1],
  expdateyear:$scope.buff[2],
  timestamp:smarthealth.get_currentutc()
});
}
}

//INFORM THAT VALIDATION HAS BEEN SUCCESSFUL 

UIkit.notification('Transaction successful', {pos: 'top-right'});
    $scope.mainmenu = {};
    $scope.addeditems=[];
};//END execute_dispensing()

/**
 * Validation submitted
 * Consider printing maybe
 */
$scope.submitvalidation = function(){

if(document.getElementById('mainmenu.identifystockpersondispenser').innerHTML=="Click here to identify yourself"||document.getElementById('mainmenu.identifystockpersondispenser').innerHTML == "Please scan your ID")
{
UIkit.notification('Please scan your ID', {pos: 'top-right'});
}

else{

if(TRANSFER_FROM==null)
{

UIkit.notification('Please fill in form properly', {pos: 'top-right'});

}

else{

  /**
   * Verify that none of the items cause a below zero stocks dispensing
   * @A user should not be able to dispense more than what is in stock
   */

var ERR = false;
//Loop through buffer items
  for(var i = 0 ; i < $scope.addeditems.length ; i++){
    
    var ITEM_UNIQUE_ID =$scope.addeditems[i].uniqueid;

var current_package_count = Number($scope.getstkitemcount_package(ITEM_UNIQUE_ID));
var current_detail_count = Number($scope.getstkitemcount_detail(ITEM_UNIQUE_ID));
console.log('current_package_count',current_package_count);
if(current_package_count<0){
  UIkit.notification('Quantity scanned exceeds items in stock', {pos: 'top-right'});
  ERR=true;
}

}

if(!ERR){
  if(smarthealth.getPatientName()==null||smarthealth.getPatientName()==""||smarthealth.getPatientGender()==null||smarthealth.getPatientGender()==""){
  UIkit.notification('Select a patient first', {pos: 'top-right'});
  }else{$scope.execute_dispensing();}

}


}//END ELSE STATEMENT

}//END STAFF ID VERIFICATION                                     
}

/**
 * Review past transactions
 * Returns stockitems to database and removes its costs
 * from patient bill
 * 
 * @Make sure patient is selected in mainmenu
 * @Make sure Staff ID is validated
 */

$scope.reviewtransactions = function(){
  if(document.getElementById('mainmenu.patientid').innerHTML==='Select patient'){

UIkit.notification('Please select a patient first', {pos: 'top-right'});

  }else{
    //Patient has been selected
    //smarthealth.get_uniqueid() will store patient id
    $state.go('dispenserconsumeditems')
  }

}//end $scope.reviewtransactions()

})//END dispensermaincontroller

.controller('dispenseractivepatientscontroller', function($scope,$ionicActionSheet,$ionicModal,$ionicLoading, $timeout, $state,$ionicPopup,smarthealth) {

/**
 * Populate list with active patients 
 * Use tblactivepatients as datasource
 */
$scope.$on('$ionicView.enter',function(){
$scope.activepatients = [];
var firebase_url = "https://medisave-a4903.firebaseio.com/tblactivepatients";
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
data.calculateage = smarthealth.get_age(data.dateofbirthyear,data.dateofbirthmonth,data.dateofbirthday);
$scope.activepatients.push(data);
$scope.$apply();}
else{$ionicLoading.hide();}
});
    $timeout(function() {
    $ionicLoading.hide();
   
    }, 3000);
});//END $ionicView.enter

/**
 * An item has been selected from the activepatients list
 * Navigate back to mainmenu with data stored in memory
 */
$scope.showDetails = function(item_clicked){

//Save credentials
var FULL_NAME =  item_clicked.lastname +" "+item_clicked.firstname;
var GENDER = item_clicked.gender;
smarthealth.setPatientName(FULL_NAME);
smarthealth.setPatientGender(GENDER);
smarthealth.set_uniqueid(item_clicked.uniqueid);
$state.go('app.dispensermain');
}

/**
 * User wants to go back to mainmenu
 * User did not make any selection from list of activepatients
 */
$scope.backtomenu = function(){
$state.go('app.dispensermain');};
})//END dispenseractivepatientscontroller

.controller('dispensersearchstockcontroller', function($scope,$ionicActionSheet,$ionicModal,$ionicLoading, $timeout, $state,$ionicPopup,smarthealth) {

$scope.stockitems = [];

$scope.backtomenu = function(){
  $state.go('app.dispensermain');
}

$scope.$on("$ionicView.enter",function(){
$scope.stockitems = [];
var firebase_url = "https://medisave-a4903.firebaseio.com/";
console.log(smarthealth.get_buffer());
var firebase_reference = new Firebase(firebase_url);
  $scope.loading = $ionicLoading.show({
    content: '<i class="icon ion-loading-c"></i>',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 50,
    showDelay: 0
  });
firebase_reference.child(smarthealth.get_transferfrom()).on("child_added", function(snapshot, prevChildKey) {
var data = snapshot.val();

if(data!=null){
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
var OPERATOR = false;
$scope.items = [];
$scope.items =smarthealth.get_buffer();
console.log($scope.items);
for(var i = 0; i < $scope.items.length;i++){
  if($scope.items[i].uniqueid===input.uniqueid){
//Match error autodump
var alertPopup = $ionicPopup.alert({
title: 'Medisave Dispenser Dashboard',
template: 'Item already dispensed'
}); 
    OPERATOR = true;
    return;
  }else{OPERATOR=false;}
}

if(OPERATOR){
var alertPopup = $ionicPopup.alert({
title: 'Medisave Dispenser Dashboard',
template: 'Item already dispensed'
}); 
}else{
smarthealth.set_object(input);
$state.go('app.dispensermain');
}

}

})//END dispensersearchstockcontroller

.controller('dispenserconsumeditemscontroller', function($scope,$ionicActionSheet,$ionicModal,$ionicLoading, $timeout, $state,$ionicPopup,smarthealth) {
var TBLCONSUMED_KEY;
$scope.itemconsumeds = [];
$scope.rangefinder = [];
$scope.stockitems = [];


$scope.refresh_list = function(){
$scope.itemconsumeds = [];
$scope.rangefinder = [];
$scope.stockitems = [];
var firebase_url = "https://medisave-a4903.firebaseio.com/tblitemsconsumed";
var OUT;
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
  if(data.activepatientid===smarthealth.get_uniqueid()){
  $scope.itemconsumeds.push(data);
  $scope.rangefinder.push({TIME:data.dateofuse,KEY:snapshot.name()})
}

  $ionicLoading.hide();
}else{
  $ionicLoading.hide();
} 

});//END LOOPING
    $timeout(function() {
    $ionicLoading.hide();
   
    }, 3000);
}


$scope.$on("$ionicView.enter",function(){
$scope.refresh_list();
});

$scope.backtomenu = function(){
    smarthealth.set_object(null);
    smarthealth.set_buffer(null);
  $state.go('app.dispensermain');
}

$scope.showDetails = function(itemconsumed){

//Find tblitemsconsumed DBKEY
for(var i = 0;i<$scope.rangefinder.length;i++){
  if($scope.rangefinder[i].TIME===itemconsumed.dateofuse){
    TBLCONSUMED_KEY = $scope.rangefinder[i].KEY;
  }
}

var AMOUNT_CONSUMED = itemconsumed.quantity;
var PACKAGETYPE = itemconsumed.packagetype;
var SNAP;
var data;
var firebase_url = "https://medisave-a4903.firebaseio.com/";
var MSG ='Items consumed: '+itemconsumed.quantity+' '+itemconsumed.packagetype+" of "+itemconsumed.itemconsumed;
smarthealth.set_temp(MSG);
var firebase_reference = new Firebase(firebase_url);
var firebase_transferred = firebase_reference.child(itemconsumed.facility).child(itemconsumed.itemid);
firebase_transferred.on("value", function(snapshot) {
  data = snapshot.val();
  SNAP = snapshot.name();

});
$timeout(function(){
$scope.stockreturns(data,PACKAGETYPE,AMOUNT_CONSUMED,SNAP,itemconsumed.facility);
 }, 1000);


}//END showDetails()

$scope.stockreturns = function(input,PACKAGETYPE,AMOUNT_CONSUMED,DBKEY,FACILITY){

var toreturn_package_count = 0;
var toreturn_detail_count = 0;

var package_count = Number(input.quantity);
var detail_count = Number(input.contentdetails);
var package_contents_detail = Number(input.fixedcontentdetails);

if(PACKAGETYPE==="DETAIL"){
//Work with details

toreturn_detail_count = Number(AMOUNT_CONSUMED);

//Convert current package+details into details only
var details_only = (package_count*package_contents_detail)+detail_count;
//Recover original count using details only 
var original_details_total = toreturn_detail_count+details_only;
//Convert details only to package+details
var DECIMAL_FACTOR = Number(original_details_total)/Number(package_contents_detail);
var ROUNDED_FIGURE = Math.floor(DECIMAL_FACTOR);
var DECIMAL_REMAINDER = DECIMAL_FACTOR-ROUNDED_FIGURE;
var DETAILS_ = Math.round(DECIMAL_REMAINDER * package_contents_detail);
var PACKAGE_ = Math.ceil(DECIMAL_FACTOR);
if(Number(DETAILS_)==0){DETAILS_=package_contents_detail;}
console.log("RECOVERED PACKAGE: "+PACKAGE_);
console.log("RECOVERED DETAILS: "+DETAILS_);
$scope.updatefacilitystock(PACKAGE_,DETAILS_,FACILITY,DBKEY,input);
}

if(PACKAGETYPE==="PACKAGE"){
//Work with package
var out = (Number(package_count)+Number(AMOUNT_CONSUMED)).toString();
console.log("RECOVERED PACKAGE: "+out);
console.log("RECOVERED DETAIL: "+detail_count);
$scope.updatefacilitystock(out,detail_count,FACILITY,DBKEY,input);
}

}//END stockreturns()

/**
 * Restore database changes
 * Remove item from patient bill
 */
$scope.updatefacilitystock = function(NEWPACKAGE,NEWDETAIL,FACILITY,DBKEY,input){
var firebase_url = "https://medisave-a4903.firebaseio.com/";

var firebase_reference = new Firebase(firebase_url);
firebase_reference_attribution = firebase_reference.child(FACILITY);

var confirmPopup = $ionicPopup.confirm({
     title: 'Medisave Dispenser Dashboard',
     template: 'Are you sure you want to cancel this billing?'+' '+smarthealth.get_temp()
   });

   confirmPopup.then(function(res) {
     if(res) {
//Update parameters in stockitem listing in facility
firebase_reference_attribution.child(DBKEY)
.set({
"itemname":input.itemname,
"itemcost":input.itemcost,
"expdateday":input.expdateday,
"expdatemonth":input.expdatemonth,
"expdateyear":input.expdateyear,
"batchno":input.batchno,
"sellingprice":input.sellingprice,
"barcodeval":input.barcodeval,
"contentdetails":NEWDETAIL,
"quantity":NEWPACKAGE,
"supplier":input.supplier,
"staffid":input.staffid,
"uniqueid":input.uniqueid,
"fixedcontentdetails":input.fixedcontentdetails
});

//Remove billing from tblitemsconsumed
var firebase_url = "https://medisave-a4903.firebaseio.com/tblitemsconsumed";
var firebase_reference = new Firebase(firebase_url);
firebase_reference.child(TBLCONSUMED_KEY).remove();
var alertPopup = $ionicPopup.alert({
title: 'Medisave Dispenser Dashboard',
template: 'Restored Package to: '+NEWPACKAGE + ' and Details to: '+NEWDETAIL
});
$scope.backtomenu();
} else {
//User cancelled operation
       
}
});

}//END updatefacilitystock()

})//END dispenserconsumeditemscontroller()

;//END controller.js
