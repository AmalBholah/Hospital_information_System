app.controller('wardmanagermaincontroller', function($scope,$ionicActionSheet,$ionicModal,$ionicLoading, $timeout, $state,$ionicPopup,smarthealth) {

//Buffer to store ward listings
$scope.wards = [];

$scope.$on("$ionicView.enter",function(){

$scope.percent = 0;
$scope.delimbuffer = [];
$scope.wards = [];
var firebase_url = "https://medisave-a4903.firebaseio.com/tblwardmanager"
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
}else{
$scope.wards.push(data);
$scope.delimbuffer.push(data.wardname);
smarthealth.set_delimiter($scope.delimbuffer);
$ionicLoading.hide();
}


});

firebase_reference.on("value", function(snapshot){
//Keep in values in memory for wardsconfig updates
smarthealth.set_wardmanagercontents($scope.wards);
$ionicLoading.hide();
});

});//END $ionicView.enter



/**
 * Navigate to wardsconfigcontroller
 */
$scope.configurewards = function(){$state.go('wardconfig');}

$scope.addpatient = function(ward){

//Prevent bed overflow
if(ward.occupied==ward.maxbeds){
    UIkit.notification(ward.wardname+' is full', {pos: 'top-right'});
}else{
    smarthealth.set_ward(ward);
//Add patients
    $state.go('wardactivepatients');
}



}//END addpatient

$scope.viewpatients = function(ward){
smarthealth.set_ward(ward);
//View patients
$state.go('wardviewpatients');
}//END viewpatients



})//END wardmanagermaincontroller

.controller('wardconfigcontroller', function($scope,$ionicActionSheet,$ionicModal,$ionicLoading, $timeout, $state,$ionicPopup,smarthealth) {

$scope.peripherals = [];

$scope.$on("$ionicView.enter",function(){

//Load tblperipherals
$scope.peripherals = [];
var firebase_url = "https://medisave-a4903.firebaseio.com/tblperipherals"
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

}else{

if(data.category==="WARD"){
  $scope.peripherals.push(data);
}


$ionicLoading.hide();
}
$scope.$apply;
});

firebase_reference.on("child_added", function(snapshot){$ionicLoading.hide();});

});//END $ionicView.enter

function return_occupancy(input){
    //Get ward configs
    $scope.wardconfigs = smarthealth.get_wardmanagercontents();
    for(var i = 0; i <= $scope.wardconfigs.length;i++){
        if($scope.wardconfigs[i].wardname==input.facility){
            return $scope.wardconfigs[i].occupied;
        };
    }
}

$scope.peripheralclicked = function(input){
  $scope.data = {};

  console.log(return_occupancy(input));

  // An elaborate, custom popup
  var myPopup = $ionicPopup.show({
    template: '<input type="number" ng-model="data.content">',
    title: input.facility,
    subTitle: 'Type the amount of beds to allocate',
    scope: $scope,
    buttons: [
      { text: 'Cancel' },
      {
        text: '<b>Okay</b>',
        type: 'button-positive',
        onTap: function(e) {
          if (!$scope.data.content) {
            e.preventDefault();
          } else {
            //Data obtained
            var bed_count = $scope.data.content;
            var selected_ward = input.facility;

            //By default set occupied beds to zero on listing creation
            var occupied = return_occupancy(input);

            var firebase_url = "https://medisave-a4903.firebaseio.com/tblwardmanager"
            var firebase_reference = new Firebase(firebase_url);
            var obj = firebase_reference.child(selected_ward);
            obj.set({
              occupied:occupied,
              maxbeds:bed_count,
              wardname:selected_ward
            });

        /*  var alertPopup = $ionicPopup.alert({
          title: 'Ward Manager',
          template: 'Ward listing created successfully'
        });*/
        
        UIkit.notification('Ward listing created successfully', {pos: 'top-right'});
          
        }//END else statement
        }
      }
    ]
  });

}
    
/*
 * Navigate to wardmanagercontroller
 */
$scope.backtomenu = function(){$state.go('app.wardmanagermain');}

})//END wardsconfigcontroller

.controller('wardactivepatientscontroller', function($scope,$ionicActionSheet,$ionicModal,$ionicLoading, $timeout, $state,$ionicPopup,smarthealth) {

$scope.patient = {};

$scope.showDetailsActive = function(patient){
$scope.patient = patient;
};

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

//Display patients that are not yet admitted
if(data.facilityoccupied==null||data.facilityoccupied=='NONE'){
$scope.activepatients.push(data);}

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

//set patient facilityoccupied to selected_ward
var selected_ward = smarthealth.get_ward().wardname;
var firebase_url = "https://medisave-a4903.firebaseio.com/"
var firebase_reference = new Firebase(firebase_url);
item_clicked.facilityoccupied = selected_ward;
var date = new Date();
firebase_reference.child("tblactivepatients").child(item_clicked.uniqueid).set({
address:item_clicked.address,
dateofbirthday:item_clicked.dateofbirthday,
dateofbirthmonth:item_clicked.dateofbirthmonth,
dateofbirthyear:item_clicked.dateofbirthyear,
datetime:item_clicked.datetime,
email:item_clicked.email,
facilityoccupied:selected_ward,
firstname:item_clicked.firstname,
gender:item_clicked.gender,
lastname:item_clicked.lastname,
paymentmethod:item_clicked.paymentmethod,
phonenumber:item_clicked.phonenumber,
referringdoctor:item_clicked.referringdoctor,
uniqueid:item_clicked.uniqueid,
facilityissuedate:date.toUTCString()
});

//increment facility count by 1
firebase_reference.child("tblwardmanager").child(selected_ward).set({
maxbeds:smarthealth.get_ward().maxbeds,
occupied:parseInt(smarthealth.get_ward().occupied)+1,
wardname:smarthealth.get_ward().wardname
});
UIkit.notification('Patient added to ward', {pos: 'top-right'});
$state.go('app.wardmanagermain');
}

/**
 * User wants to go back to mainmenu
 * User did not make any selection from list of activepatients
 */
$scope.backtomenu = function(){
$state.go('app.wardmanagermain');};
})//END wardactivepatientscontroller


.controller('wardviewpatientscontroller', function($scope,$ionicActionSheet,$ionicModal,$ionicLoading, $timeout, $state,$ionicPopup,smarthealth) {
$scope.mainpopup = {};
$scope.patient = {};

$scope.showDetailsWard = function(patient){
$scope.patient = patient;
};


//Buffer to store selected patient credentials
var CURRENT_PATIENT;

/**
 * Populate list with active patients 
 * Use tblactivepatients as datasource
 * Filter by smarthealth.get_ward().wardname
 */
$scope.$on('$ionicView.enter',function(){
$scope.viewpatients = [];
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

//Display patients that are in current facility
if(data.facilityoccupied==smarthealth.get_ward().wardname){
$scope.viewpatients.push(data);}

$scope.$apply();}
else{$ionicLoading.hide();}
});
    $timeout(function() {
    $ionicLoading.hide();
   
    }, 3000);
});//END $ionicView.enter

/*
 * Navigate to wardviewpatientscontroller
 */
$scope.backtomenu = function(){$state.go('app.wardmanagermain');}

//Transfer request emitted
/**
 * Date parameters
 */
var SELECTED_YEAR = $scope.mainpopup.year;
var SELECTED_MONTH = $scope.mainpopup.month;
var SELECTED_DAY = $scope.mainpopup.day;
/**
 * Selector Configuration
 * Dateinput custom
 */

$scope.daychange = function(){SELECTED_DAY = $scope.mainpopup.day;}
$scope.monthchange = function(){SELECTED_MONTH = $scope.mainpopup.month;}
$scope.yearchange = function(){SELECTED_YEAR = $scope.mainpopup.year;}

$scope.years_count = function(startYear) {
            var currentYear = new Date().getFullYear(), years = [];
            startYear = startYear || 1980;

            while ( startYear <= currentYear) {
                    years.push(startYear++);
            } 

            return years;
    }

//Popup initialisation
  $ionicModal.fromTemplateUrl('wardmanager/wardmanagermainpopup.html', {
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

$scope.transferpatient = function(patient){

//Transfer a patient
$scope.mainpopup.wardname = smarthealth.get_ward().wardname;
//Dynamically populate years
$scope.yearbuffer = [];
$scope.wardlist = [];
$scope.wardlist = smarthealth.get_delimiter();
$scope.showPopup();

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
$scope.years = $scope.years_count(1850);
$scope.yeartransfers = $scope.years_count(1850);

//HOURS
$scope.hours = $scope.hourbuffer;
$scope.hourtransfers = $scope.hourbuffer;

//MINUTES
$scope.minutes = $scope.minutebuffer;
$scope.minutetransfers = $scope.minutebuffer;

//WARD LISTING
$scope.wardlists = $scope.wardlist;

$scope.mainpopup.transferward = smarthealth.get_ward().wardname;

//Facility issue date
var date = new Date(patient.facilityissuedate);

//SET FACILITY DATETIME
$scope.mainpopup.hour = date.getHours().toString();
$scope.mainpopup.minute = date.getMinutes().toString();
$scope.mainpopup.day = date.getDay().toString();
$scope.mainpopup.month = $scope.returnMonth(parseInt(date.getMonth().toString()));
$scope.mainpopup.year = date.getFullYear();

var current_date =  new Date();

//SET CURRENT DATETIME
$scope.mainpopup.hourtransfer= current_date.getHours().toString();
$scope.mainpopup.minutetransfer = current_date.getMinutes().toString();
$scope.mainpopup.daytransfer= current_date.getDay().toString();
$scope.mainpopup.monthtransfer = $scope.returnMonth(parseInt(current_date.getMonth().toString()));
$scope.mainpopup.yeartransfer = current_date.getFullYear();

//Set CURRENT_PATIENT
CURRENT_PATIENT = patient;

}//END transferpatient

$scope.submititem = function(item){
$scope.closePopup();

if(CURRENT_PATIENT.facilityoccupied===$scope.mainpopup.transferward){
/*     
var alertPopup = $ionicPopup.alert({
title: 'Ward Manager',
template: 'Cannot transfer to same ward'
});*/
    UIkit.notification('Cannot transfer to same ward', {pos: 'top-right'});
}else{
$scope.performtransfer(item);
}


}//END submititem

/**
 * Perform transfer to selected ward
 */
$scope.performtransfer = function(item){
var current_date =  new Date();

//Update current patient facilityoccupied parameter
var previously_occupied_ward = CURRENT_PATIENT.facilityoccupied;
var selected_ward_to_transfer = $scope.mainpopup.transferward;
CURRENT_PATIENT.facilityoccupied = selected_ward_to_transfer;


var item_clicked  = CURRENT_PATIENT;
var firebase_url = "https://medisave-a4903.firebaseio.com/tblactivepatients"
var firebase_reference = new Firebase(firebase_url);
firebase_reference.child(CURRENT_PATIENT.uniqueid).set({
address:item_clicked.address,
dateofbirthday:item_clicked.dateofbirthday,
dateofbirthmonth:item_clicked.dateofbirthmonth,
dateofbirthyear:item_clicked.dateofbirthyear,
datetime:item_clicked.datetime,
email:item_clicked.email,
facilityoccupied:selected_ward_to_transfer,
firstname:item_clicked.firstname,
gender:item_clicked.gender,
lastname:item_clicked.lastname,
paymentmethod:item_clicked.paymentmethod,
phonenumber:item_clicked.phonenumber,
referringdoctor:item_clicked.referringdoctor,
uniqueid:item_clicked.uniqueid,
facilityissuedate:current_date.toUTCString()
});

//Record event in tblmovementbook
var firebase_url = "https://medisave-a4903.firebaseio.com/tblmovementbook"
var firebase_reference = new Firebase(firebase_url);
var pushed_firebase_reference = firebase_reference.push();
pushed_firebase_reference.set({
patientid:CURRENT_PATIENT.uniqueid,
facilityoccupied:CURRENT_PATIENT.facilityoccupied,
facilitystarted:CURRENT_PATIENT.facilityissuedate,
facilityended:current_date.toUTCString(),
firstname:CURRENT_PATIENT.firstname,
gender:CURRENT_PATIENT.gender,
lastname:CURRENT_PATIENT.lastname,
address:CURRENT_PATIENT.address
});


//Update bed occupancy in source ward and destination ward
var firebase_url = "https://medisave-a4903.firebaseio.com/tblwardmanager"
var firebase_reference = new Firebase(firebase_url);

  $scope.loading = $ionicLoading.show({
    content: '<i class="icon ion-loading-c"></i>',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 50,
    showDelay: 0
  });

$scope.wardmanagerdata = [];
  
firebase_reference.on("child_added", function(snapshot, prevChildKey) {
var data = snapshot.val();  
if(data!=null){
$ionicLoading.hide();
$scope.wardmanagerdata.push(data);
}
else{$ionicLoading.hide();}
});
    $timeout(function() {
    $ionicLoading.hide();
   
    }, 3000);
  
var PREVIOUS_MAXBEDS = "";
var PREVIOUS_OCCUPIED = "";
var PREVIOUS_WARDNAME = "";

var NEXT_MAXBEDS = "";
var NEXT_OCCUPIED = "";
var NEXT_WARDNAME =" ";

console.log($scope.wardmanagerdata);

//Loop through $scope.wardmanagerdata
for(var i = 0; i < $scope.wardmanagerdata.length;i++){
  if($scope.wardmanagerdata[i].wardname===previously_occupied_ward){
     PREVIOUS_MAXBEDS =  $scope.wardmanagerdata[i].maxbeds;
     PREVIOUS_OCCUPIED = $scope.wardmanagerdata[i].occupied;
     PREVIOUS_WARDNAME = $scope.wardmanagerdata[i].wardname;
  }

  if($scope.wardmanagerdata[i].wardname===selected_ward_to_transfer){
     NEXT_MAXBEDS =  $scope.wardmanagerdata[i].maxbeds;
     NEXT_OCCUPIED = $scope.wardmanagerdata[i].occupied;
     NEXT_WARDNAME = $scope.wardmanagerdata[i].wardname;
  }

}

//Update previously_occupied_ward
firebase_reference.child(previously_occupied_ward).set(
  {
    maxbeds:PREVIOUS_MAXBEDS,
    occupied: parseInt(PREVIOUS_OCCUPIED)-1,
    wardname: previously_occupied_ward
  }
);

//Update selected_ward_to_transfer
firebase_reference.child(selected_ward_to_transfer).set(
  {
    maxbeds:NEXT_MAXBEDS,
    occupied: parseInt(NEXT_OCCUPIED)+1,
    wardname: selected_ward_to_transfer
  }
);

//Alert user of successful operation
var alertPopup = $ionicPopup.alert({
title: 'Ward Manager',
template: 'Transferred patient to '+selected_ward_to_transfer+' successfully'
});

//Go back to wardmanager
$state.go('app.wardmanagermain');

}//END performtransfer()

})//END wardviewpatientscontroller

;//END controllers.js
