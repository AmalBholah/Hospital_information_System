app.controller('laboratorymaincontroller', function($scope,$ionicActionSheet,$ionicModal,$ionicLoading, $timeout, $state,$ionicPopup,smarthealth) {

//Initialisation buffers
$scope.addeditems = [];
$scope.blobitems = [];
$scope.mainmenu = {};
$scope.mainpopup = {};
var SEPARATOR = "     ";
var COUNTER = 0;
var alertPopup_scan;
var STOCKPERSONID="STOCKPERSONID";
var ITEMID = "ITEMID";

//By default all scans direct to ITEMS
var SCAN_MODE = ITEMID;

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

//STORE ACTIVE PATIENT ID
var ACTIVE_PATIENT_ID = "ACTIVE_PATIENT_ID";
var PATIENTNAME;
var PATIENTGENDER;

  $scope.model = {
        barcode: 'none',
    };

//View has loaded
$scope.$on('$ionicView.enter',function(){

$scope.addeditems = [];
$scope.blobitems = [];

UIkit.notification('Loading services list', {pos: 'top-right'});
$scope.mainmenu.patientname = smarthealth.getPatientName();
$scope.mainmenu.patientgender = smarthealth.getPatientGender();

//Do not add erroneously
if(smarthealth.get_object()!=null){
$scope.blobitems.push({servicecategory:smarthealth.get_object().servicecategory,servicecost:smarthealth.get_object().servicecost,servicetype:smarthealth.get_object().servicetype});
}

//INJECT
$scope.labtests = [];

var firebase_url = "https://medisave-a4903.firebaseio.com/tblservices";
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
if(data.servicecategory==="LABORATORY"){

/**
 * Alot of junk in tblservices clear it off
 * Populate only items with servicecategory:LABORATORY
 */
var state = false;
for(var i = 0;i<$scope.labtests.length;i++){
  var item = $scope.labtests[i];
  if(item.servicetype==data.servicetype){
    state = false;
  }else{state = true;}
}
if($scope.labtests.length < 1){$scope.labtests.push(data);}
if(state == true){$scope.labtests.push(data);}
//END cleaning junk

}
$scope.$apply();}
else{$ionicLoading.hide();}

});
//END INJECT

});//END $ionicView.enter

/**
 * User wants to view past laboratory tests
 */
$scope.viewlabtests = function(){
$state.go('viewlabtests');
};//END viewlabtests()

/**
 * User wants to view patient details
 * @Modal popup
 */
$scope.patientdetails = function(){
$scope.patient = {};
$scope.patient = smarthealth.get_patient();
console.log($scope.patient);
};//END patientdetails()

$scope.selectedlabtest = function(labtest){
smarthealth.set_object(labtest);
$scope.blobitems.push({servicecategory:smarthealth.get_object().servicecategory,servicecost:smarthealth.get_object().servicecost,servicetype:smarthealth.get_object().servicetype});
}

$scope.disableinputitems = function(){
  document.getElementById('mainmenu.itemname').disabled = true;
  document.getElementById('mainmenu.itemcost').disabled = true;
  document.getElementById('mainmenu.expdate').disabled = true;
  document.getElementById('mainmenu.barcodevalue').disabled = true;
  document.getElementById('mainmenu.itemcounter').disabled = true;
  document.getElementById('mainmenu.batchno').disabled = true;
}

    $scope.barcodeScanned = function(barcode) {

        if(SCAN_MODE === ITEMID){

          //First item scan -- store barcodevalue into memory
          if(BARCODE_COUNTER==0){TEMP_BARCODE_ITEM = barcode;}
          BARCODE_COUNTER++;
          $scope.mainmenu.barcodevalue = barcode;

          if(BARCODE_COUNTER>=1&&(TEMP_BARCODE_ITEM===barcode)){
            //Barcodes are matching carry forwards with incrementation

            //Verify if input fields are validated
            if($scope.mainmenu.itemname==null||$scope.mainmenu.itemcost==null||$scope.mainmenu.expdate==null){

          /*
          var alertPopup = $ionicPopup.alert({
          title: 'ERROR',
          template: 'Please fill in fields correctly before proceeding'
        });*/
         UIkit.notification('Please fill in all fields correctly', {pos: 'top-right'});

            //Adjust barcode counter amount
            BARCODE_COUNTER=1;
            $scope.mainmenu.barcodevalue = barcode;
            }//END NULL CHECK FOR FIELDS

          }

          //Mismatch -- autodump
          if(BARCODE_COUNTER>1&&(TEMP_BARCODE_ITEM!=barcode)){
            $scope.addeditems.push({itemname:$scope.mainmenu.itemname,itemcost:$scope.mainmenu.itemcost,expdate:$scope.mainmenu.expdate,barcodeval:TEMP_BARCODE_ITEM,quantity:BARCODE_COUNTER-1,batchno:$scope.mainmenu.batchno});

          /**
           * RESET ALL PARAMETERS
           */
            BARCODE_COUNTER = 0;
            TEMP_BARCODE_ITEM = barcode;
            $scope.mainmenu.itemname="";
            $scope.mainmenu.itemcost="";
            $scope.mainmenu.expdate="";
            $scope.mainmenu.batchno="";

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
        }

        //Search for an item in firebase
        if(SCAN_MODE === SEARCH_ITEM){
          alertPopup_scan.close();
          $scope.render_backend_search(barcode);
        }//END SEARCH_ITEM

    };

/**
 * Enter a stock item
 */
$scope.enterstockitem = function(){
SUBMIT_MODE = ENTER_ITEM;
$scope.showPopup();
$scope.mainmenu.batchno=$scope.mainpopup.batchno;
$scope.mainmenu.itemname=$scope.mainpopup.itemname;
$scope.mainmenu.itemcost=$scope.mainpopup.itemcost;
$scope.mainmenu.expdate=$scope.mainpopup.expdate;
$scope.mainmenu.barcodevalue=$scope.mainpopup.barcodeval;
$scope.mainmenu.itemcounter=$scope.mainpopup.quantity;
}

//Identify stock person
$scope.identifystockperson = function(){
SCAN_MODE = STOCKPERSONID;
document.getElementById('mainmenu.identifystockperson').innerHTML = "Please scan your ID";
}

//Popup initialisation
  $ionicModal.fromTemplateUrl('laboratory/laboratorymainpopup.html', {
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

//Date parameter initialisation and autofills the date text to today
var date = new Date();
$scope.mainmenu.dateofissue = date.yyyymmdd();

$scope.feeds = [];

//Push to table
for(var i = 0; i < $scope.feeds.length ; i++){
$scope.addeditems.push($scope.feeds[i]);
}

//Edit has been clicked
$scope.emitIndex_edit=function(input){
SUBMIT_MODE = EDIT_ITEM;
var index = 0;
for(var i = 0; i < $scope.addeditems.length;i++){
console.log(input);
if(input.itemname===$scope.addeditems[i].itemname&&input.itemcost===$scope.addeditems[i].itemcost){
if (index > -1){$scope.addeditems.splice(index, 1);}
$scope.showPopup();
$scope.mainpopup.batchno=input.batchno;
$scope.mainpopup.itemname=input.itemname;
$scope.mainpopup.itemcost=input.itemcost;
$scope.mainpopup.expdate=input.expdate;
$scope.mainpopup.barcodeval=input.barcodeval;
$scope.mainpopup.quantity=input.quantity;
}
}
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
 *Edit listed mainmenu item details
 */

$scope.editstockitem = function(){
$scope.showPopup();
$scope.mainpopup.batchno=$scope.mainmenu.batchno;
$scope.mainpopup.itemname=$scope.mainmenu.itemname;
$scope.mainpopup.itemcost=$scope.mainmenu.itemcost;
$scope.mainpopup.expdate=$scope.mainmenu.expdate;
$scope.mainpopup.barcodeval=$scope.mainmenu.barcodevalue;
$scope.mainpopup.quantity=$scope.mainmenu.itemcounter;
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
$scope.mainmenu.itemname=data.itemname;
$scope.mainmenu.itemcost=data.itemcost;
$scope.mainmenu.barcodevalue=data.barcodeval;
$scope.mainmenu.batchno=data.batchno;
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
for(var i = 0; i < $scope.addeditems.length;i++){
if(input.itemcost===$scope.addeditems[i].itemcost&&input.itemcost===$scope.addeditems[i].itemcost){
  index = i;

  var confirmPopup = $ionicPopup.confirm({
     title: 'Delete this item?',
     template: input.itemcost
   });

   confirmPopup.then(function(res) {
     if(res) {
       if (index > -1){$scope.addeditems.splice(index, 1);}
     } else {

     }
   });

}
}
};//END delete item

//Blob listing delete
$scope.deleteblob = function(input){
  var index = 0;
for(var i = 0; i < $scope.blobitems.length;i++){
if(input.servicecategory===$scope.blobitems[i].servicecategory&&input.servicecost===$scope.blobitems[i].servicecost){
  index = i;

  var confirmPopup = $ionicPopup.confirm({
     title: 'Delete this item?',
     template: input.servicetype
   });

   confirmPopup.then(function(res) {
     if(res) {
       if (index > -1){$scope.blobitems.splice(index, 1);}
     } else {

     }
   });

}
}
}

//Add item has been clicked
$scope.additem = function(){
$scope.doSumTotal();
$scope.showPopup();
};


/**
 * Load active patients list
 */
$scope.loadpatientprofile = function(){$state.go('laboratoryactivepatients');smarthealth.set_object(null);}

/**
 * Load laboratory investigations
 * Use tblservices as datasource with indexing:LABORATORY
 */
$scope.selectlabtest = function(){$state.go('laboratorytests');}

//Done button has been clicked on popup
$scope.submititem = function(input){

if(SUBMIT_MODE===ENTER_ITEM){
$scope.mainmenu.batchno = input.batchno;
$scope.mainmenu.itemname = input.itemname;
$scope.mainmenu.itemcost = input.itemcost;
$scope.mainmenu.expdate = input.expdate;
$scope.mainmenu.barcodevalue = input.barcodeval;
$scope.mainmenu.itemcounter = input.quantity;
$scope.addeditems.push({itemname:$scope.mainmenu.itemname,itemcost:$scope.mainmenu.itemcost,expdate:$scope.mainmenu.expdate,barcodeval:input.barcodeval,quantity:input.quantity,batchno:input.batchno});
$scope.closePopup();
}

if(SUBMIT_MODE===EDIT_ITEM){
$scope.addeditems.push({itemname:$scope.mainpopup.itemname,itemcost:$scope.mainpopup.itemcost,expdate:$scope.mainpopup.expdate,barcodeval:$scope.mainpopup.barcodeval,quantity:$scope.mainpopup.quantity,batchno:input.batchno});
$scope.closePopup();
}

if(SUBMIT_MODE===INLINE_EDIT){
$scope.mainmenu.batchno=$scope.mainpopup.batchno
$scope.mainmenu.itemname=$scope.mainpopup.itemname
$scope.mainmenu.itemcost=$scope.mainpopup.itemcost
$scope.mainmenu.expdate=$scope.mainpopup.expdate
$scope.mainmenu.barcodevalue=$scope.mainpopup.barcodeval
$scope.mainmenu.itemcounter=$scope.mainpopup.quantity
}


};

//Adds up items in list
$scope.doSumTotal = function(){
COUNTER = 0;
for(var i = 0; i < $scope.addeditems.length;i++){
COUNTER = COUNTER+Number($scope.addeditems[i].price);
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

/**
 * Submit laboratory tests to server
 * tblactivepatients as data source
 */

$scope.submitlabtests = function(){

if($scope.mainmenu.patientname===""||$scope.mainmenu.patientgender===""||$scope.blobitems.length<1){
  //Throw error

  /*
   var alertPopup = $ionicPopup.alert({
     title: 'Medisave Laboratory Services',
     template: 'Please fill in fields correctly'
   });*/
    UIkit.notification('Fill in all fields correctly', {pos: 'top-right'});
}

else{

  if(document.getElementById('mainmenu.identifystockperson').innerHTML=='Please scan your ID'||
  document.getElementById('mainmenu.identifystockperson').innerHTML=='Click here to identify yourself'){
    UIkit.notification('Please Identify yourself', {pos: 'top-right'});
  }

else{
var firebase_url = "https://medisave-a4903.firebaseio.com/tblitemsconsumed";
var firebase_reference = new Firebase(firebase_url);
var date = new Date();
for(var i = 0; i < $scope.blobitems.length;i++){
var obj = firebase_reference.push();
var itemdetail = $scope.blobitems[i];
obj.set({
  staffid:document.getElementById('mainmenu.identifystockperson').innerHTML,
  activepatientid:smarthealth.get_uniqueid(),
  itemconsumed: itemdetail.servicetype,
  itemcost:itemdetail.servicecost,
  itemcategory:itemdetail.servicecategory,
  dateofuse: date.toUTCString(),
  patientname: smarthealth.getPatientName(),
  patientgender: smarthealth.getPatientGender()
});
}//END LOOP $scope.blobitems

UIkit.notification('Save successful', {pos: 'top-right'});
}

}//END ELSE

};

})//END laboratorymaincontroller

.controller('laboratoryactivepatientscontroller', function($scope,$ionicActionSheet,$ionicModal,$ionicLoading, $timeout, $state,$ionicPopup,smarthealth) {

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

firebase_reference.on("child_added", function(snapshot){$ionicLoading.hide();});
});//END $ionicView.enter

/**
 * An item has been selected from the activepatients list
 * Navigate back to mainmenu with data stored in memory
 */
$scope.showDetails = function(item_clicked){

//Save credentials
var FULL_NAME =  item_clicked.lastname +" "+item_clicked.firstname;
var GENDER = item_clicked.gender;
window.localStorage.setItem('fullname',FULL_NAME);
window.localStorage.setItem('gender',GENDER);
smarthealth.setPatientName(FULL_NAME);
smarthealth.setPatientGender(GENDER);
smarthealth.set_uniqueid(item_clicked.uniqueid);
smarthealth.set_patient(item_clicked);
$state.go('app.laboratorymain');
}

/**
 * User wants to go back to mainmenu
 * User did not make any selection from list of activepatients
 */
$scope.backtomenu = function(){
smarthealth.set_object(null);
$state.go('app.laboratorymain');};
})//END laboratoryactivepatientscontroller


app.controller('viewlabtestscontroller', function($scope,$ionicActionSheet,$ionicModal,$ionicLoading, $timeout, $state,$ionicPopup,smarthealth) {

$scope.labtests = {};
var LAB_STARTS;
var LAB_ENDS;

/**
 * Preload LABs beginning and end dates
 * @Use current_date as default for both
 *
 */
var SELECTED_YEAR = $scope.labtests.year;
var SELECTED_MONTH = $scope.labtests.month;
var SELECTED_DAY = $scope.labtests.day;
/**
 * Selector Configuration
 * Dateinput custom
 */

$scope.rebuild_month = function(i){
var obtained_month;
if(i=="JANUARY"){obtained_month=0;}
if(i=="FEBRUARY"){obtained_month=1;}
if(i=="MARCH"){obtained_month=2;}
if(i=="APRIL"){obtained_month=3;}
if(i=="MAY"){obtained_month=4;}
if(i=="JUNE"){obtained_month=5;}
if(i=="JULY"){obtained_month=6;}
if(i=="AUGUST"){obtained_month=7;}
if(i=="SEPTEMBER"){obtained_month=8;}
if(i=="OCTOBER"){obtained_month=9;}
if(i=="NOVEMBER"){obtained_month=10;}
if(i=="DECEMBER"){obtained_month=11;}
return obtained_month;
}

$scope.rebuild_dates = function(){

LAB_STARTS = new Date();
LAB_STARTS.setFullYear($scope.labtests.year);
LAB_STARTS.setMonth($scope.rebuild_month($scope.labtests.month));
LAB_STARTS.setDate($scope.labtests.day);


LAB_ENDS = new Date();
LAB_ENDS.setFullYear($scope.labtests.yeartransfer);
LAB_ENDS.setMonth($scope.rebuild_month($scope.labtests.monthtransfer));
LAB_ENDS.setDate($scope.labtests.daytransfer);

console.log('LAB_STARTS '+LAB_STARTS);
console.log('LAB_ENDS '+LAB_ENDS);
};

$scope.daychange = function(){
$scope.rebuild_dates();
}

$scope.monthchange = function(){
$scope.rebuild_dates();
}
$scope.yearchange = function(){
$scope.rebuild_dates();
}

$scope.daychangetransfer = function(){
$scope.rebuild_dates();
}

$scope.monthchangetransfer = function(){
$scope.rebuild_dates();
}
$scope.yearchangetransfer = function(){
$scope.rebuild_dates();
}

$scope.years_count = function(startYear) {
            var currentYear = new Date().getFullYear(), years = [];
            startYear = startYear || 1980;

            while ( startYear <= currentYear) {
                    years.push(startYear++);
            }

            return years;
}

$scope.returnMonth = function(i){
var obtained_month;
if(i==0){obtained_month="JANUARY";}
if(i==1){obtained_month="FEBRUARY";}
if(i==2){obtained_month="MARCH";}
if(i==3){obtained_month="APRIL";}
if(i==4){obtained_month="MAY";}
if(i==5){obtained_month="JUNE";}
if(i==6){obtained_month="JULY";}
if(i==7){obtained_month="AUGUST";}
if(i==8){obtained_month="SEPTEMBER";}
if(i==9){obtained_month="OCTOBER";}
if(i==10){obtained_month="NOVEMBER";}
if(i==11){obtained_month="DECEMBER";}
return obtained_month;
}


$scope.$on('$ionicView.enter',function(){
  //Prepare days
$scope.daybuffer=[];
for(var i = 0;i<=31;i++){
  if(i>0)
  $scope.daybuffer.push(i.toString());
}

//Prepare months
$scope.monthbuffer=[];
for(var i = 0;i<=12;i++){
if(i>0)$scope.monthbuffer.push($scope.returnMonth(i-1));
}

//Prepare hours
$scope.hourbuffer=[];
for(var i = 0;i<=23;i++){
$scope.hourbuffer.push(i.toString());
}

//Prepare minutes
$scope.minutebuffer=[];
for(var i = 0;i<=59;i++){
$scope.minutebuffer.push(i.toString());
}

//DAYS
$scope.days = $scope.daybuffer;
$scope.daytransfers = $scope.daybuffer;

//MONTHS
$scope.months = $scope.monthbuffer;
$scope.monthtransfers = $scope.monthbuffer;

//YEARS
$scope.years = $scope.years_count(1920);
$scope.yeartransfers = $scope.years_count(1920);

//Fill in data

$scope.labtests.day = $scope.daybuffer[0];
$scope.labtests.daytransfer = $scope.daybuffer[0];

$scope.labtests.month = $scope.monthbuffer[0];
$scope.labtests.monthtransfer = $scope.monthbuffer[0];

var date = new Date();

$scope.labtests.year = date.getFullYear()-1;
$scope.labtests.yeartransfer = date.getFullYear();

});//END $ionicView.enter

/**
 * Search in between given dates
 */
$scope.runsearch = function(){

$scope.addeditems = [];
console.log('runsearch');
$scope.addeditems = [];
var firebase_url = "https://medisave-a4903.firebaseio.com/tblitemsconsumed";
var firebase_reference = new Firebase(firebase_url);

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
data.uniquekey = snapshot.key();

//Check if date range is matching -- then only push to buffer
var date_db = new Date(data.dateofuse);

if(date_db>=LAB_STARTS && date_db<=LAB_ENDS){
if(data.itemcategory=="LABORATORY"){
data.dateofuse = smarthealth.get_localtime(data.dateofuse);
$scope.addeditems.push(data);
}
}

$scope.$apply();}
else{$ionicLoading.hide();}


});
    $timeout(function() {
    $ionicLoading.hide();
    }, 3000);

};//END runsearch()

/**
 * User wants to go back to mainmenu
 *
 */
$scope.backtomenu = function(){
$state.go('app.laboratorymain');
};

})//END viewlabtestscontroller()

;//END controllers.js
