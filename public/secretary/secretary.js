app.controller('secretaryactivepatientscontroller', function($scope,$ionicActionSheet,$ionicModal,$ionicLoading, $timeout, $state,$ionicPopup,smarthealth) {

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

firebase_reference.on("value", function(snapshot){$ionicLoading.hide();});
});//END $ionicView.enter

/**
 * An item has been selected from the activepatients list
 */
$scope.showDetails = function(item_clicked){
smarthealth.set_object(item_clicked);
$state.go('secretarypatientbill');
}

})//END secretaryactivepatientscontroller


.controller('secretarypatientbillcontroller', function($scope,$ionicActionSheet,$ionicModal,$ionicLoading, $timeout, $state,$ionicPopup,smarthealth) {

$scope.mainpopup = {};
var BANKACCOUNT;
var DOCTORACCOUNT;
var TDS_TO_APPLY = 0;
var DISCOUNT_VALUE = 0;
var DISCOUNT_KEY = "none";

//Buffer to store doctor accounts
$scope.doctorsaccounts_buffer = [];


/**
 * Retrives doctor accounts
 */
$scope.get_doctor_accounts= function(ACCKEY){
  var firebase_url = "https://medisave-a4903.firebaseio.com/tblaccountentries"
  var firebase_reference = new Firebase(firebase_url);
  firebase_reference = firebase_reference.child(smarthealth.get_doctoraccount());
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
  }else{

    if(snapshot.key()===ACCKEY){
      data.accountkey = ACCKEY;
      console.log('DOCTOR ACCOUNT ',data);
       UIkit.notification("Doctor Account retrieved", {pos: 'top-right'});
       $scope.doctorsaccounts_buffer.push(data);
       DOCTORACCOUNT = data;
       $ionicLoading.hide();
    }

    }


    });
    firebase_reference.on("value", function(snapshot){$ionicLoading.hide();});

}//END get_doctor_accounts()


//Popup initialisation
$scope.deduction = {};
$ionicModal.fromTemplateUrl('secretary/charges.html', {
id : '100',
scope: $scope
}).then(function(modal) {
$scope.modal = modal;
});

// Triggered in the popup modal to close it
$scope.closePopupX = function() {
$scope.modal.hide();
};

// Open the popup modal
$scope.showPopupX = function() {
$scope.modal.show();
};
//END Popup initialisation

//Popup initialisation

$ionicModal.fromTemplateUrl('secretary/chargeslocked.html', {
id : '200',
scope: $scope
}).then(function(modal) {
$scope.modal2 = modal;
});

// Triggered in the popup modal to close it
$scope.closePopupLOCKED = function() {
$scope.modal2.hide();
};

// Open the popup modal
$scope.showPopupLOCKED = function() {
$scope.modal2.show();
};
//END Popup initialisation


/**
 * Date parameters
 */
var SELECTED_YEAR = $scope.mainpopup.year;
var SELECTED_MONTH = $scope.mainpopup.month;
var SELECTED_DAY = $scope.mainpopup.day;

/**
 * Any date change triggers this event
 */
$scope.datechanged = function(){
var build_date = new Date();
var MONTHS =  $scope.mainpopup.month;

      if(MONTHS=="JANUARY"){MONTHS = '0';}
      if(MONTHS=="FEBRUARY"){MONTHS = '1';}
      if(MONTHS=="MARCH"){MONTHS = '2';}
      if(MONTHS=="APRIL"){MONTHS = '3';}
      if(MONTHS=="MAY"){MONTHS = '4';}
      if(MONTHS=="JUNE"){MONTHS = '5';}
      if(MONTHS=="JULY"){MONTHS = '6';}
      if(MONTHS=="AUGUST"){MONTHS = '7';}
      if(MONTHS=="SEPTEMBER"){MONTHS = '8';}
      if(MONTHS=="OCTOBER"){MONTHS = '9';}
      if(MONTHS=="NOVEMBER"){MONTHS = '10';}
      if(MONTHS=="DECEMBER"){MONTHS = '11';}


build_date.setFullYear($scope.mainpopup.year);
build_date.setMonth(MONTHS);
build_date.setDate($scope.mainpopup.day);
$scope.mainpopup.dateconsumed = build_date.toString();
console.log('REBUILT DATE',build_date);
};
//END datechanged()

var populateSelectBox = function (selectbox, dataArray) {
    dataArray.forEach(function (data) {
        //selectbox.append("<option>" + data + "</option>");
        selectbox.append("<option value=" + data + ">"+data+"</option>");
    });
};

$scope.years_count = function(startYear) {
            var currentYear = new Date().getFullYear(), years = [];
            startYear = startYear || 1980;

            while ( startYear <= currentYear) {
                    years.push(startYear++);
            }

            return years;
    }

var ITEM;

$scope.remove_doctordependencies = function(){

var CCARD;

if(BANKACCOUNT==null){CCARD = 1;}else{CCARD = Number(BANKACCOUNT.ccard)/100;}

var MRA = Number(MRA_VALUE_DOCTORS);
var GLCODE;
var TDS_APPLIED;
var AMOUNT_PAID;
var DOCTORACCOUNT_KEY;
var ORIGINAL_VALUE;

console.log("Running remove_doctordependencies()");
console.log("CCARD IS ",CCARD);
console.log("MRA is ",MRA);
console.log("KEY is ",CURRENT_DB_ID);

var data;
var DATA_SET;

 var firebase_url = "https://medisave-a4903.firebaseio.com/tblchanges";
 var firebase_reference = new Firebase(firebase_url);
firebase_reference.on("child_added", function(snapshot, prevChildKey) {
data = snapshot.val();
if(data!=null){
//remove match with DBKEY
if(data.currentdbid===CURRENT_DB_ID){
DATA_SET = data;
/*
var firebase_url = "https://medisave-a4903.firebaseio.com/tblaccountentries";
var firebase_referenceentries = new Firebase(firebase_url);
firebase_referenceentries.child(data.postentrylist).remove();
console.log('Removed ENTRYLIST from tblaccountentries');
firebase_referenceentries.child(data.glkey).remove();
console.log('Removed GLKEY from tblaccountentries');

var firebase_urltblmraaccounts = "https://medisave-a4903.firebaseio.com/tblmraaccounts";
var firebase_referencetblmraaccounts = new Firebase(firebase_urltblmraaccounts);
firebase_referencetblmraaccounts.child(data.postmra).remove();
console.log('Removed TDS from tblmraaccounts');

var current_date = new Date();

firebase_referenceentries.child(smarthealth.get_doctoraccount()).child(data.doctorkey).set({
  date:current_date.toUTCString(),
  category:data.category,
  glname:data.glname,
  glcode:data.glcode,
  itemdescription:data.itemdescription,
  totalamount:data.originaltotal,
  amountpaid:data.originalamountpaid,
  amountdue:data.originaldue,
  month:current_date.getMonth(),
  year:current_date.getFullYear(),
  status:'OPEN'
});
console.log('Doctor account reset()');*/

}

}
else{$ionicLoading.hide();}
});

firebase_reference.on("value", function(snapshot){
var data = DATA_SET;
    var firebase_url = "https://medisave-a4903.firebaseio.com/tblaccountentries";
    var firebase_referenceentries = new Firebase(firebase_url);
    firebase_referenceentries.child(data.postentrylist).remove();
    console.log('Removed ENTRYLIST from tblaccountentries');
    firebase_referenceentries.child(data.glkey).remove();
    console.log('Removed GLKEY from tblaccountentries');

    var firebase_urltblmraaccounts = "https://medisave-a4903.firebaseio.com/tblmraaccounts";
    var firebase_referencetblmraaccounts = new Firebase(firebase_urltblmraaccounts);
    firebase_referencetblmraaccounts.child(data.postmra).remove();
    console.log('Removed TDS from tblmraaccounts');

    var current_date = new Date();

    firebase_referenceentries.child(smarthealth.get_doctoraccount()).child(data.doctorkey).set({
        date:current_date.toUTCString(),
        category:data.category,
        glname:data.glname,
        glcode:data.glcode,
        itemdescription:data.itemdescription,
        totalamount:data.originaltotal,
        amountpaid:data.originalamountpaid,
        amountdue:data.originaldue,
        month:current_date.getMonth(),
        year:current_date.getFullYear(),
        status:'OPEN'
    });
    console.log('Doctor account reset()');
});

   /* $timeout(function() {
    $ionicLoading.hide();

    },3000);*/

};//END remove_doctordependencies()

$scope.rundeductions = function(deduction){
  if(POPUP_MODE==EDIT){
    var firebase_url = "https://medisave-a4903.firebaseio.com/tblitemsconsumed"
    var firebase_reference = new Firebase(firebase_url);
    firebase_reference.child(CURRENT_DB_ID).remove();
    $scope.refresh_contents();
  }

var AMOUNT_TO_PAY = 0;

if(deduction.doctoramount==null||deduction.doctoramount==""){
 UIkit.notification("Please fill in all fields", {pos: 'top-right'});
}
else{
    var CCARD;

    //NOT CREDIT CARD
    if(BANKACCOUNT==null){CCARD = 1;}else{CCARD = Number(BANKACCOUNT.ccard)/100;}

  var MRA = Number(MRA_VALUE_DOCTORS);
  var METHOD_EMPLOYED = "ERROR";

if(deduction.ccard=="YES" && deduction.tds=="YES"){
AMOUNT_TO_PAY = deduction.doctoramount - (deduction.doctoramount*CCARD);
// - (deduction.doctoramount*MRA);
TDS_TO_APPLY = (deduction.doctoramount*MRA);
METHOD_EMPLOYED = "Applied TDS and CREDIT CARD CHARGES";
}

if(deduction.ccard=="YES" && deduction.tds=="NO"){
AMOUNT_TO_PAY = deduction.doctoramount - (deduction.doctoramount*CCARD);
METHOD_EMPLOYED = "Applied CREDIT CARD CHARGES";
}

if(deduction.ccard=="NO" && deduction.tds=="YES"){
AMOUNT_TO_PAY = deduction.doctoramount;
// - (deduction.doctoramount*MRA);
TDS_TO_APPLY = (deduction.doctoramount*MRA);
METHOD_EMPLOYED = "Applied TDS";
}

if(deduction.ccard=="NO" && deduction.tds=="NO"){
AMOUNT_TO_PAY = deduction.doctoramount;
METHOD_EMPLOYED = "Nothing Applied";
}

//Two decimal places conversion
AMOUNT_TO_PAY = smarthealth.get_2DP(AMOUNT_TO_PAY);

}//END ELSE
console.log("AMOUNT_TO_PAY",AMOUNT_TO_PAY);
console.log('TDS_TO_APPLY',TDS_TO_APPLY);
UIkit.notification(METHOD_EMPLOYED, {pos: 'top-right'});

var currentDate = new Date();

//Post entry into list -- needs push to database + refresh contents into view
 var firebase_url = "https://medisave-a4903.firebaseio.com/tblitemsconsumed";
  var firebase_reference = new Firebase(firebase_url);
  var pushed_firebase_reference = firebase_reference.push();
  var MASTER_KEY = pushed_firebase_reference.key();

  var POST_ENTRY_LIST = MASTER_KEY;

  pushed_firebase_reference.set({
  staffid:"SECRETARY DESK",
  activepatientid:smarthealth.get_object().uniqueid,
  itemconsumed: DOCTORACCOUNT.glname,
  itemcost:AMOUNT_TO_PAY,
  itemcategory:"DOCTOR",
  dateofuse: currentDate.toUTCString(),
  patientname: smarthealth.get_object().firstname + " "+smarthealth.get_object().lastname,
  patientgender: smarthealth.get_object().gender

});
$scope.refresh_contents();

//Post Doctor Details + TDS + currentDate to @tblmraaccounts
var firebase_urltblmraaccounts = "https://medisave-a4903.firebaseio.com/tblmraaccounts";
var firebase_referencetblmraaccounts = new Firebase(firebase_urltblmraaccounts);
var OBJ = firebase_referencetblmraaccounts.push();
var POST_MRA = OBJ.key();

OBJ.set({
  activepatientid:smarthealth.get_object().uniqueid,
  itemconsumed: DOCTORACCOUNT.glname,
  glcode:DOCTORACCOUNT.glcode,
  itemcost:TDS_TO_APPLY,
  itemcategory:"DOCTOR",
  doctoraccountkey:DOCTORACCOUNT.accountkey,
  dateofuse: currentDate.toUTCString(),
  patientname: smarthealth.get_object().firstname + " "+smarthealth.get_object().lastname,
  patientgender: smarthealth.get_object().gender,
  masterkey:MASTER_KEY,
  itemkey:OBJ.key()

});

//Post AMOUNT_TO_PAY to concerned Doctor's GL Account
var firebase_urltblgl = "https://medisave-a4903.firebaseio.com/tblaccountentries";
var firebase_referencetblgl = new Firebase(firebase_urltblgl);
firebase_referencetblgl = firebase_referencetblgl.child(DOCTORACCOUNT.glcode);
var OBJ = firebase_referencetblgl.push();
var GL_KEY = OBJ.key();
OBJ.set({
  activepatientid:smarthealth.get_object().uniqueid,
  itemconsumed: DOCTORACCOUNT.glname,
  glcode:DOCTORACCOUNT.glcode,
  itemcost:AMOUNT_TO_PAY,
  itemcategory:"DOCTOR",
  dateofuse: currentDate.toUTCString(),
  patientname: smarthealth.get_object().firstname + " "+smarthealth.get_object().lastname,
  patientgender: smarthealth.get_object().gender,
  masterkey:MASTER_KEY,
  itemkey:OBJ.key()

});

//Update DOCTOR ACCOUNT amountdue to new value (amountdue = amountdue + AMOUNT_TO_PAY)
var firebase_urltblgl = "https://medisave-a4903.firebaseio.com/tblaccountentries";
var firebase_referencetblgl = new Firebase(firebase_urltblgl);
firebase_referencetblgl = firebase_referencetblgl.child(smarthealth.get_doctoraccount());

var NEW_AMOUNT_DUE  = AMOUNT_TO_PAY + Number(DOCTORACCOUNT.amountdue);
var NEW_AMOUNT_TOTAL  = AMOUNT_TO_PAY + Number(DOCTORACCOUNT.totalamount);
var DOCTOR_KEY =DOCTORACCOUNT.accountkey;
var current_date = new Date();
firebase_referencetblgl.child(DOCTORACCOUNT.accountkey).set({
  date:current_date.toUTCString(),
  category:DOCTORACCOUNT.category,
  glname:DOCTORACCOUNT.glname,
  glcode:DOCTORACCOUNT.glcode,
  itemdescription:DOCTORACCOUNT.itemdescription,
  totalamount:NEW_AMOUNT_TOTAL,
  amountpaid:DOCTORACCOUNT.amountpaid,
  amountdue:NEW_AMOUNT_DUE,
  month:current_date.getMonth(),
  year:current_date.getFullYear(),
  status:'OPEN'

});

//Log database changes to tblchanges for future editing/deleting operations
var firebase_ = "https://medisave-a4903.firebaseio.com/tblchanges";
var firebase_changes = new Firebase(firebase_);

firebase_changes.push({
  postentrylist:POST_ENTRY_LIST,
  postmra:POST_MRA,
  glkey:GL_KEY,
  ccard:CCARD,
  doctorglcode:DOCTORACCOUNT.glcode,
  amounttopay:AMOUNT_TO_PAY,
  originaldue:DOCTORACCOUNT.amountdue,
  originaltotal:DOCTORACCOUNT.totalamount,
  originalamountpaid:DOCTORACCOUNT.amountpaid,
  doctorkey:DOCTOR_KEY,
  currentdbid:MASTER_KEY,
  category:DOCTORACCOUNT.category,
  glname:DOCTORACCOUNT.glname,
  glcode:DOCTORACCOUNT.glcode,
  itemdescription:DOCTORACCOUNT.itemdescription,
  doctoramount:deduction.doctoramount,
  ccard:deduction.ccard,
  tds:deduction.tds
})

$scope.closePopupX();
$scope.closePopupLOCKED();

}//END rundeductions()

/**
 * A service has been selected from view
 */
$scope.selectedservice = function(item){

if(item.servicecategory==='DOCTOR'){

//Verify if patient is a credit card payer
if(smarthealth.get_object().paymentmethod==="CREDIT CARD"){
var ACCOUNT_KEY = item.accountkey;
$scope.get_doctor_accounts(ACCOUNT_KEY);
$scope.deduction.tds = "YES";
$scope.deduction.ccard = "YES";
$scope.showPopupX();}


else{
//If patient is not using credit card do not allow creditcard fees to be applied
var ACCOUNT_KEY = item.accountkey;
$scope.get_doctor_accounts(ACCOUNT_KEY);
$scope.deduction.tds = "YES";
$scope.deduction.ccard = "NO";
$scope.showPopupLOCKED();

}


}//END DOCTOR CHECK
else{
POPUP_MODE = NEW;
$scope.mainpopup = {};
//Preload data into mainpopup before launching
$scope.mainpopup.itemconsumed = item.servicetype;
$scope.mainpopup.itemcost = parseInt(item.servicecost);
$scope.mainpopup.itemcategory = item.servicecategory;

  //Dynamically populate years
  $scope.yearbuffer = [];

    $scope.buff=[];
    $scope.buff=($scope.years_count(1900));
    $scope.years = $scope.buff;

//Preconfigure dropdowns
$scope.mainpopup.day = "01";
$scope.mainpopup.month = "JANUARY";
$scope.mainpopup.year =  $scope.buff[60];
ITEM = item;

$scope.showPopup();
}

};//END selectedservice()

/**
 * Refresh listing
 */
$scope.refresh_listing = function(){

var firebase_url = "https://medisave-a4903.firebaseio.com/tblservices"
var firebase_reference = new Firebase(firebase_url);
$scope.services = [];


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
}else{

var state = false;
for(var i = 0;i<$scope.services.length;i++){
  var item = $scope.services[i];
  if(item.servicetype==data.servicetype){
    state = false;
  }else{state = true;}
}
if($scope.services.length < 1){$scope.services.push(data);}
if(state == true){$scope.services.push(data);}

$ionicLoading.hide();
}


});
firebase_reference.on("value", function(snapshot){$ionicLoading.hide();});

};//END refresh_listing()

  //Popup initialisation
  $ionicModal.fromTemplateUrl('secretary/secretarymainpopup.html', {
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

  //POPUP_MODE states handling
  var POPUP_MODE="NONE";
  var EDIT = "EDIT";
  var NEW = "NEW";

  /**
   * Go back to activepatients list
   */
  $scope.backtomenu = function(){
  $scope.clear_fields();
  $state.go('app.secretaryactivepatients');
  }

  //Buffers
  $scope.patientbills = [];
  $scope.instanceid = [];

  //patientbill enumeration
  $scope.patientbill = {};

  //tblitemsconsumed instance ID
  $scope.instanceid = [];

  //Popup initialisation
  $scope.mainpopup = {};

  //MRA value for doctors
  var MRA_VALUE_DOCTORS = 0;

  $scope.$on("$ionicView.enter",function(){

   //Set discount to zero
   $scope.patientbill.discountvalue = "No discount applied";

  //Retrieve MRA percentage to deduct for doctors
  var firebase_url = "https://medisave-a4903.firebaseio.com/tblparameters"
var firebase_reference = new Firebase(firebase_url);
  firebase_reference.on("child_added", function(snapshot, prevChildKey) {
  var data = snapshot.val();
  if(data!=null){
  $ionicLoading.hide();

  //Match uniqueid before pushing to $scope.patientbills
  if(smarthealth.get_MRA_doctors()===data.identifier){
    MRA_VALUE_DOCTORS = Number(data.value)/100;
    console.log('MRA_VALUE_DOCTORS',MRA_VALUE_DOCTORS);
  }

  if(smarthealth.get_object().discountamount==null){smarthealth.get_object().discountamount="0";}

  $scope.patientbill.discountvalue = "Discount applied is (Rs) "+smarthealth.get_object().discountamount;

  $scope.$apply();}
  else{$ionicLoading.hide();}
});

      //Load patient details into current view
      $scope.patientbill.patientname = smarthealth.get_object().firstname + " " + smarthealth.get_object().lastname;
      $scope.patientbill.gender = smarthealth.get_object().gender;
      $scope.patientbill.address = smarthealth.get_object().address;
      $scope.patientbill.dateofbirth = smarthealth.get_object().dateofbirthday + " " + smarthealth.get_object().dateofbirthmonth + " " + smarthealth.get_object().dateofbirthyear;

    if(smarthealth.get_object().paymentmethod==="CREDIT CARD"){
    $scope.patientbill.paymentmethod = smarthealth.get_object().paymentmethod+" - "+smarthealth.get_object().bankaccount;


    var firebase_url = "https://medisave-a4903.firebaseio.com/tblaccountentries"
    var firebase_reference = new Firebase(firebase_url);
    $scope.objects = [];
      $scope.loading = $ionicLoading.show({
        content: '<i class="icon ion-loading-c"></i>',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 50,
        showDelay: 0
      });
    firebase_reference.child(smarthealth.get_bankaccount()).on("child_added", function(snapshot, prevChildKey) {
    var data = snapshot.val();

    if(data==null){
    $ionicLoading.hide();
    }else{

    if(data.bankname===smarthealth.get_object().bankaccount){
      BANKACCOUNT = data;
      console.log(BANKACCOUNT);
     UIkit.notification("Bank Account retrieved", {pos: 'top-right'});
    }

    }

    });

    firebase_reference.on("value", function(snapshot){$ionicLoading.hide();});


    }else{
    //Not CREDIT CARD
    $scope.patientbill.paymentmethod = smarthealth.get_object().paymentmethod;
    }

  $scope.patientbill.notes = smarthealth.get_object().notes;
  $scope.refresh_contents();
  $scope.refresh_listing();

});//END $ionicView.enter

/**
 * Loads selected patient into modalview
 */
$scope.loadpatient = function(){
  $scope.patient = {};
  $scope.patient = smarthealth.get_object();
}//END loadpatient()

$scope.refresh_contents = function(){
  //Reset buffers
  $scope.patientbills = [];
  $scope.instanceid = [];

  $scope.loading = $ionicLoading.show({
    content: '<i class="icon ion-loading-c"></i>',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 50,
    showDelay: 0
  });

var firebase_url = "https://medisave-a4903.firebaseio.com/tblitemsconsumed"
var firebase_reference = new Firebase(firebase_url);
  firebase_reference.on("child_added", function(snapshot, prevChildKey) {
  var data = snapshot.val();
  if(data!=null){
  $ionicLoading.hide();

  //Match uniqueid before pushing to $scope.patientbills
  if(smarthealth.get_object().uniqueid===data.activepatientid){
  data.utctime = data.dateofuse;
  data.dateofuse = smarthealth.get_localtime(data.dateofuse);

  $scope.patientbills.push(data);


  $scope.instanceid.push({id:snapshot.name(),obj:data});
  }

  $scope.$apply();}
  else{$ionicLoading.hide();}
});
  firebase_reference.on("value", function(snapshot){$ionicLoading.hide();});
}//END refresh_contents()

/**
 * Returns DB KEY
 */
$scope.findkey_tblitemsconsumed = function(item){
  for(var i = 0; i < $scope.instanceid.length; i++){
  if($scope.instanceid[i].obj===item){
    return $scope.instanceid[i].id;
  }
}
}

//Store current state
var CURRENT_ITEM;
var CURRENT_DB_ID;

/**
 * EDIT CLICKED
 */
$scope.edititem = function(item){
POPUP_MODE = EDIT;
console.log("edititem item",item);
console.log($scope.findkey_tblitemsconsumed(item));
CURRENT_DB_ID = $scope.findkey_tblitemsconsumed(item);
CURRENT_ITEM = item;

if(item.itemcategory=="DOCTOR"){
 var firebase_url = "https://medisave-a4903.firebaseio.com/tblchanges";
 var firebase_reference = new Firebase(firebase_url);
firebase_reference.on("child_added", function(snapshot, prevChildKey) {
var data = snapshot.val();
if(data!=null){
//remove match with DBKEY
if(data.currentdbid===CURRENT_DB_ID){
$scope.get_doctor_accounts(data.doctorkey);
//Doctor account gets loaded after this function executes
$scope.deduction.doctoramount = Number(data.doctoramount);
$scope.deduction.tds = data.tds;
$scope.deduction.ccard = data.ccard;
$scope.showPopupX();
$scope.remove_doctordependencies();
$scope.refresh_contents();
}

}
else{$ionicLoading.hide();}
});



}//END DOCTOR CHECK

else{
//Preload data into mainpopup before launching
$scope.mainpopup.itemconsumed = item.itemconsumed;
$scope.mainpopup.itemcost = parseInt(item.itemcost);
$scope.mainpopup.itemcategory = item.itemcategory;

var date = new Date(item.utctime);
$scope.mainpopup.dateconsumed = item.utctime;
//Convert to dropdown compatible format and apply
console.log('YEAR',date.getFullYear());
console.log('MONTH',date.getMonth());
console.log('DAY',date.getDate());

var set_day;
var set_month;
var set_years;

if(parseInt(date.getDate().toString())<10){
set_day = "0"+date.getDate().toString();
}else{set_day = date.getDate().toString();}

if(parseInt(date.getMonth().toString())==0){set_month="JANUARY";}
if(parseInt(date.getMonth().toString())==1){set_month="FEBRUARY";}
if(parseInt(date.getMonth().toString())==2){set_month="MARCH";}
if(parseInt(date.getMonth().toString())==3){set_month="APRIL";}
if(parseInt(date.getMonth().toString())==4){set_month="MAY";}
if(parseInt(date.getMonth().toString())==5){set_month="JUNE";}
if(parseInt(date.getMonth().toString())==6){set_month="JULY";}
if(parseInt(date.getMonth().toString())==7){set_month="AUGUST";}
if(parseInt(date.getMonth().toString())==8){set_month="SEPTEMBER";}
if(parseInt(date.getMonth().toString())==9){set_month="OCTOBER";}
if(parseInt(date.getMonth().toString())==10){set_month="NOVEMBER";}
if(parseInt(date.getMonth().toString())==11){set_month="DECEMBER";}

set_year = date.getFullYear().toString();

$scope.mainpopup.day = set_day;
$scope.mainpopup.month = set_month;

  //Dynamically populate years
  $scope.yearbuffer = [];

    $scope.buff=[];
    $scope.buff=($scope.years_count(1900));
    $scope.years = $scope.buff;

var value;
for(var i = 0; i < $scope.buff.length ; i++){
  if($scope.buff[i]==set_year){value = i;}
}

$scope.mainpopup.year = $scope.buff[value];
$scope.showPopup();
}//END ELSE



}//END edititem()

/**
 * DELETE CLICKED
 */
$scope.deleteitem = function(item){
var index = 0;

//if (index > -1){$scope.patientbills.splice(index, 1);}
CURRENT_DB_ID = $scope.findkey_tblitemsconsumed(item);

if(item.itemcategory=="DOCTOR"){
$scope.remove_doctordependencies();
var firebase_url = "https://medisave-a4903.firebaseio.com/tblitemsconsumed"
var firebase_reference = new Firebase(firebase_url);
firebase_reference.child(CURRENT_DB_ID).remove();
$scope.refresh_contents();
}else{
var firebase_url = "https://medisave-a4903.firebaseio.com/tblitemsconsumed"
var firebase_reference = new Firebase(firebase_url);
firebase_reference.child(CURRENT_DB_ID).remove();
$scope.refresh_contents();
}

}//END deleteitem()

/**
 * mainpopup form submitted
 */
$scope.submititem = function(mainpopup){
  /**
   * POPUP_MODE is in EDIT
   */

  if(POPUP_MODE===EDIT){

  var firebase_url = "https://medisave-a4903.firebaseio.com/tblitemsconsumed";
  var firebase_reference = new Firebase(firebase_url);

  //Update CURRENT_ITEM database specifics
  CURRENT_ITEM.itemconsumed = $scope.mainpopup.itemconsumed;
  CURRENT_ITEM.itemcost = $scope.mainpopup.itemcost;
  CURRENT_ITEM.itemcategory = $scope.mainpopup.itemcategory;
  CURRENT_ITEM.dateconsumed = $scope.mainpopup.dateconsumed;

  firebase_reference.child(CURRENT_DB_ID).set({
  staffid:CURRENT_ITEM.staffid,
  activepatientid:CURRENT_ITEM.activepatientid,
  itemconsumed: CURRENT_ITEM.itemconsumed,
  itemcost:CURRENT_ITEM.itemcost,
  itemcategory:CURRENT_ITEM.itemcategory,
  dateofuse: $scope.mainpopup.dateconsumed,
  patientname: CURRENT_ITEM.patientname,
  patientgender: CURRENT_ITEM.patientgender

  });

//Close the mainpopup
$scope.closePopup();

UIkit.notification('Edit successful', {pos: 'top-right'});

//Reload table contents to reflect changes made
$scope.refresh_contents();

}//END POPUP_MODE is in EDIT

/**
 * POPUP_MODE is in NEW
 */
if(POPUP_MODE===NEW){

 var firebase_url = "https://medisave-a4903.firebaseio.com/tblitemsconsumed";
  var firebase_reference = new Firebase(firebase_url);
  var pushed_firebase_reference = firebase_reference.push();
  pushed_firebase_reference.set({
  staffid:"SECRETARY DESK",
  activepatientid:smarthealth.get_object().uniqueid,
  itemconsumed: $scope.mainpopup.itemconsumed,
  itemcost:$scope.mainpopup.itemcost,
  itemcategory:$scope.mainpopup.itemcategory,
  dateofuse: $scope.mainpopup.dateconsumed,
  patientname: smarthealth.get_object().firstname + " "+smarthealth.get_object().lastname,
  patientgender: smarthealth.get_object().gender

  });
UIkit.notification('Bill added successfully', {pos: 'top-right'});

//Close the mainpopup
$scope.closePopup();

//Reload table contents to reflect changes made
$scope.refresh_contents();
}//END POPUP_MODE is NEW
}//END submititem()


/**
 * Add a service to the patient bill
 */
$scope.addservicetobill = function(){
POPUP_MODE = NEW;
$scope.mainpopup = {};
  //Dynamically populate years
  $scope.yearbuffer = [];

    $scope.buff=[];
    $scope.buff=($scope.years_count(1900));
    $scope.years = $scope.buff;

//Preconfigure dropdowns
$scope.mainpopup.day = "01";
$scope.mainpopup.month = "JANUARY";
$scope.mainpopup.year =  $scope.buff[60];
$scope.showPopup();
}//END addservicetobill()

/**
 * User wants to view patient movement book
 * Implements tblmovementbooks as datasource
 */
$scope.openmovementbook = function(){
$state.go('secretarymovementbook');
}//END openmovementbook()

  /**
   * Clear content view
   */
  $scope.clear_fields = function(){
  $scope.patientbill.patientname = "";
  $scope.patientbill.gender = "";
  $scope.patientbill.address = "";
  $scope.patientbill.dateofbirth = "";
  $scope.patientbill.paymentmethod = "";
  $scope.patientbill.notes = "";

  }//END clear_fields()


    /*
    Adds a discount to the patient bill
     */

    $scope.creatediscount = function () {



        UIkit.modal.prompt('Type discount amount (use NUMBERS only)','').then(function(value) {
        if(value==null||value==""){$scope.patientbill.discountvalue = "No discount applied"}else{



            var data = smarthealth.get_object();
            var firebase_url = "https://medisave-a4903.firebaseio.com/tblactivepatients";
            var firebase_reference = new Firebase(firebase_url);
            firebase_reference.child(data.uniqueid).set({
                address:smarthealth.NullFilter(data.address),
                bankaccount:smarthealth.NullFilter(data.bankaccount),
                calculateage:smarthealth.NullFilter(data.calculateage),
                dateofbirthday:smarthealth.NullFilter(data.dateofbirthday),
                dateofbirthmonth:smarthealth.NullFilter(data.dateofbirthmonth),
                dateofbirthyear:smarthealth.NullFilter(data.dateofbirthyear),
                datetime:smarthealth.NullFilter(data.datetime),
                email:smarthealth.NullFilter(data.email),
                facilityoccupied:smarthealth.NullFilter(data.facilityoccupied),
                firstname:smarthealth.NullFilter(data.firstname),
                gender:smarthealth.NullFilter(data.gender),
                lastname:smarthealth.NullFilter(data.lastname),
                mrn:smarthealth.NullFilter(data.mrn),
                nic:smarthealth.NullFilter(data.nic),
                notes:smarthealth.NullFilter(data.notes),
                paymentmethod:smarthealth.NullFilter(data.paymentmethod),
                phonenumber:smarthealth.NullFilter(data.phonenumber),
                referringdoctor:smarthealth.NullFilter(data.referringdoctor),
                uniqueid:smarthealth.NullFilter(data.uniqueid),
                discountamount:Number(value)

            });
            $scope.patientbill.discountvalue = "Discount applied is (Rs) "+Number(value);
            UIkit.notification('Discount applied successfully', {pos: 'top-right'});
        }//END ELSE

        $scope.$apply();

        $scope.refresh_contents();

        });
    }//END creatediscount()



})//END secretarypatientbillcontroller

.controller('secretarymovementbookcontroller', function($scope,$ionicActionSheet,$ionicModal,$ionicLoading, $timeout, $state,$ionicPopup,smarthealth) {

  $scope.facilityitems = [];

  $scope.$on("$ionicView.enter",function(){
  $scope.facilityitems = [];
  var firebase_url = "https://medisave-a4903.firebaseio.com/tblmovementbook";
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

  //Match uniqueid before pushing to $scope.facilityitems
  if(smarthealth.get_object().uniqueid===data.patientid){
  $scope.facilityitems.push(data);
  }

  $scope.$apply();}
  else{$ionicLoading.hide();}
  });
    $timeout(function() {
    $ionicLoading.hide();

    }, 3000);
});//END $ionicView.enter

$scope.backtomenu = function(){
$state.go('secretarypatientbill');
}//END backtomenu()

})//END secretarymovementbookcontroller()

;//END controllers.js
