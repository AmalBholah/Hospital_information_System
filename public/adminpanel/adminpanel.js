app.controller('adminmaincontroller', function($scope,$rootScope,$ionicActionSheet,$ionicModal,$ionicLoading, $timeout, $state,$ionicPopup,smarthealth) {

/**
 * User wants to go to facilitymanager
 */
$scope.openfacilitymanager = function(){
$state.go('facilitymanager');
};//END facilitymanager()

/**
 * User wants to go to useraccess
 */
$scope.openuseraccess = function(){
$state.go('useraccess');
};//END openuseraccess()

/**
 * User wants to open services manager
 */
$scope.openservices = function(){
$state.go('servicesmanager');
};//END openservices()

/**
 * User wants to open suppliers manager
 */
$scope.opensuppliers = function(){
$state.go('suppliermanager');
}//END opensuppliers()

/*
*User wants to open bankmanager
*/
$scope.openbankmanager = function(){
$state.go('bankmanager');
}//END openbankmanager()

/*
*User wants to open parameters
*/
$scope.openparameters = function(){
$state.go('parameters');
}//END openparameters()

/**
 * User wants to open MRA Accounts
 */
$scope.openmra = function(){
$state.go('mra');
}//END openmra()



})//END adminmaincontroller()

app.controller('facilitymanagercontroller', function($scope,$rootScope,$ionicActionSheet,$ionicModal,$ionicLoading, $timeout, $state,$ionicPopup,smarthealth) {

//Buffer to store ward listings
$scope.objects = [];
$scope.mainpopup = {};

var FACILITY_MODE ="";
var CREATE = "CREATEFACILITY";
var EDIT = "EDITFACILITY";

var firebase_url = smarthealth.DATABASE_ROOT_URL + "/tblperipherals"
var firebase_reference = new Firebase(firebase_url);

  //Popup initialisation
  $ionicModal.fromTemplateUrl('adminpanel/createfacilitypopup.html', {
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
 * Refresh listing
 */
$scope.refresh_listing = function(){
$scope.percent = 0;
$scope.objects = [];
var firebase_url = smarthealth.DATABASE_ROOT_URL + "/tblperipherals"
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
$scope.objects.push(data);
$ionicLoading.hide();
}


});
    $timeout(function() {
    $ionicLoading.hide();

    }, 3000);
};//END refresh_listing()

$scope.$on("$ionicView.enter",function(){
$rootScope.$emit("CallParentMethod", {});
$scope.refresh_listing();
});//END $ionicView.enter


/**
 * User wants to edit a facility
 */
$scope.editfacility = function(object){
FACILITY_MODE = EDIT;
$scope.mainpopup.facility = object.facility;
$scope.mainpopup.category = object.category;
$scope.mainpopup.key = object.key;
$scope.showPopup();
};//END editfacility()

/**
 * User wants go to adminmain
 */
$scope.handleback = function(){
$state.go('app.adminmain');
};//END handleback()

/**
 * Create facility
 * @Show Popup
 */
$scope.createfacility = function(){
FACILITY_MODE = CREATE;
$scope.mainpopup.category = "WARD";
$scope.showPopup();
};//END createfacility()

/**
 * Submit button clicked on popup
 */
$scope.submititem = function(mainpopup){
if(FACILITY_MODE==CREATE){
if(mainpopup.facility==null||mainpopup.facility==""||mainpopup.category==null||mainpopup.category==""){
UIkit.notification('Please fill in the fields correctly', {pos: 'top-right'});
}else{
var obj = firebase_reference.push();
obj.set({
facility:mainpopup.facility,
category:mainpopup.category,
key:obj.key()
});
$scope.refresh_listing();
UIkit.notification('Facility created successfully', {pos: 'top-right'});
$scope.closePopup();
}
}

if(FACILITY_MODE==EDIT){
if(mainpopup.facility==null||mainpopup.facility==""||mainpopup.category==null||mainpopup.category==""){
UIkit.notification('Please fill in the fields correctly', {pos: 'top-right'});
}else{
var obj = firebase_reference.child(mainpopup.key);
obj.set({
facility:mainpopup.facility,
category:mainpopup.category,
key:obj.key()
});
$scope.refresh_listing();
UIkit.notification('Facility updated successfully', {pos: 'top-right'});
$scope.closePopup();
}
}

};//END submititem()

/**
 * User wants to remove the facility
 * @Confirm then proceed
 */
var ITEM_TO_DELETE;
$scope.bufferitem = function(object){ITEM_TO_DELETE = object;}

$scope.removefacility = function(){
firebase_reference.child(ITEM_TO_DELETE.key).remove();
$scope.refresh_listing();
UIkit.notification(ITEM_TO_DELETE.facility+' removed', {pos: 'top-right'});
};//END removefacility()

})//END facilitymanagercontroller()

app.controller('useraccesscontroller', function($scope,$ionicActionSheet,$ionicModal,$ionicLoading, $timeout, $state,$ionicPopup,smarthealth) {

$scope.mainpopup = {};
var MODE;
var USER;
var CREATE = "create";
var EDIT = "edit";
var SELECTED_USER;
$scope.user = {};

var firebase_url = smarthealth.DATABASE_ROOT_URL + "/tbluseraccess"
var firebase_reference = new Firebase(firebase_url);

//Popup initialisation
  $ionicModal.fromTemplateUrl('adminpanel/useraccesspopup.html', {
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
     * User has been clicked in listview
     */

    $scope.userclicked = function (object) {
    SELECTED_USER = object;
    $scope.user.useridentification = object.username;
        $scope.loading = $ionicLoading.show({
            content: '<i class="icon ion-loading-c"></i>',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 50,
            showDelay: 0
        });

    //Load user access rights
        var firebase_url = smarthealth.DATABASE_ROOT_URL + "/tbluseraccess"
        var firebase_reference = new Firebase(firebase_url);

        firebase_reference.on("child_added", function(snapshot, prevChildKey) {
            var data = snapshot.val();

            if(data==null){
                $ionicLoading.hide();
            }else{

              if(snapshot.key()===SELECTED_USER.key){
                  $ionicLoading.hide();
                  $scope.user.clinicalmodule = smarthealth.return_boolean(data.clinicalmodule);
                  $scope.user.patientregistration = smarthealth.return_boolean(data.patientregistration);
                  $scope.user.wardmanager = smarthealth.return_boolean(data.wardmanager);
                  $scope.user.goodsreceivednote = smarthealth.return_boolean(data.goodsreceivednote);
                  $scope.user.stockstransfer = smarthealth.return_boolean(data.stockstransfer);
                  $scope.user.dispenser = smarthealth.return_boolean(data.dispenser);
                  $scope.user.laboratory = smarthealth.return_boolean(data.laboratory);
                  $scope.user.radiology = smarthealth.return_boolean(data.radiology);
                  $scope.user.secretary = smarthealth.return_boolean(data.secretary);
                  $scope.user.cashier = smarthealth.return_boolean(data.cashier);
                  $scope.user.accountant = smarthealth.return_boolean(data.accountant);
                  $scope.user.adminpanel = smarthealth.return_boolean(data.adminpanel);



              }


            }
        });




    }//END userclicked()


    /***
     * User Access update button has been clicked
     */
    $scope.updateuseraccess = function () {

      if(SELECTED_USER==null){
          UIkit.notification('Select a username from the list', {pos: 'top-right'});
      }else{
          var firebase_url = smarthealth.DATABASE_ROOT_URL + "/tbluseraccess"
          var firebase_reference = new Firebase(firebase_url);
          firebase_reference.child(SELECTED_USER.key).set({
              key:SELECTED_USER.key,
              password:SELECTED_USER.password,
              username:SELECTED_USER.username,
              clinicalmodule:$scope.user.clinicalmodule,
              patientregistration:$scope.user.patientregistration,
              wardmanager:$scope.user.wardmanager,
              goodsreceivednote:$scope.user.goodsreceivednote,
              stockstransfer:$scope.user.stockstransfer,
              dispenser:$scope.user.dispenser,
              laboratory:$scope.user.laboratory,
              radiology:$scope.user.radiology,
              secretary:$scope.user.secretary,
              cashier:$scope.user.cashier,
              accountant:$scope.user.accountant,
              adminpanel:$scope.user.adminpanel
          });
          UIkit.notification('User Access updated', {pos: 'top-right'});
      }

    }//END updateuseraccess()


    /**
     * Refresh listing
 */
$scope.refresh_listing = function(){
$scope.mainpopup = {};
$scope.percent = 0;
$scope.objects = [];
var firebase_url = smarthealth.DATABASE_ROOT_URL + "/tbluseraccess"
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
$scope.objects.push(data);
$ionicLoading.hide();
}


});
    $timeout(function() {
    $ionicLoading.hide();

    }, 3000);
};//END refresh_listing()

/**
 * User buffer
 */
$scope.deleteuser = function(user){
  USER = user;
}

$scope.$on('$ionicView.enter',function(){
$scope.user.useridentification = "None";
$scope.refresh_listing();
});//END $ionicView.enter

/**
 * Create a new user
 */
$scope.createuser = function(){
MODE = CREATE;
$scope.showPopup();
};//END createuser()

/**
 * Submit button clicked on useraccesspopup
 */
$scope.submititem = function(mainpopup){
if(mainpopup.username==null||mainpopup.username==""||mainpopup.password==null||mainpopup.password==""){
UIkit.notification('Please fill in the fields correctly', {pos: 'top-right'});
}else{

if(MODE==CREATE){
var pushed_reference = firebase_reference.push();
var key = pushed_reference.key();

pushed_reference.set({
username:mainpopup.username,
password:mainpopup.password,
key:key
});

UIkit.notification('User created', {pos: 'top-right'});
$scope.closePopup();
$scope.refresh_listing();
}

if(MODE==EDIT){
firebase_reference.child(mainpopup.key).set({
username:mainpopup.username,
password:mainpopup.password,
key:mainpopup.key
});
UIkit.notification('User updated', {pos: 'top-right'});
$scope.closePopup();
$scope.refresh_listing();
}


}//END fields verification check

};//END submititem()

/**
 * User wants to edit a user account
 */
$scope.edituser = function(user){
MODE = EDIT;
$scope.mainpopup.username = user.username;
$scope.mainpopup.password = user.password;
$scope.mainpopup.key = user.key;
$scope.showPopup();
};//END edituser()

/**
 * User wants to remove a user account
 * @Ask has confirmated for deletion
 */
$scope.removeuser = function(){
firebase_reference.child(USER.key).remove();
UIkit.notification('User removed', {pos: 'top-right'});
$scope.refresh_listing();
};//END removeuser()

/**
 * User wants go to adminmain
 */
$scope.handleback = function(){
$state.go('app.adminmain');
};//END handleback()

})//END useraccesscontroller()

app.controller('servicesmanagercontroller', function($scope,$ionicActionSheet,$ionicModal,$ionicLoading, $timeout, $state,$ionicPopup,smarthealth) {
$scope.mainpopup = {};
var MODE;
var SERVICE;
var CREATE = "create";
var EDIT = "edit";

var firebase_url = smarthealth.DATABASE_ROOT_URL + "/tblservices"
var firebase_reference = new Firebase(firebase_url);

//Popup initialisation
  $ionicModal.fromTemplateUrl('adminpanel/servicespopup.html', {
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
 * Refresh listing
 */
$scope.refresh_listing = function(){
$scope.objects = [];


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
for(var i = 0;i<$scope.objects.length;i++){
  var item = $scope.objects[i];
  if(item.servicetype==data.servicetype){
    state = false;
  }else{state = true;}
}
if($scope.objects.length < 1){$scope.objects.push(data);}
if(state == true){$scope.objects.push(data);}

$ionicLoading.hide();
}


});

$timeout(function() {
    $ionicLoading.hide();

  }, 8000);
};//END refresh_listing()

$scope.$on('$ionicView.enter',function(){
$scope.refresh_listing();
});//END $ionicView.enter

/**
 * Create a service
 */
$scope.createservice = function(){
MODE = CREATE;
$scope.showPopup();
};//END createservice()

/**
 * Submit Item clicked in popup
 */
$scope.submititem = function(mainpopup){
if(mainpopup.servicetype==null||mainpopup.servicetype==""||mainpopup.servicecost==null||mainpopup.servicecost==""||mainpopup.servicecategory==null||mainpopup.servicecategory==""){
UIkit.notification('Please fill in the fields correctly', {pos: 'top-right'});
}else{

if(MODE==CREATE){
var pushed_reference = firebase_reference.push();
var key = pushed_reference.key();

pushed_reference.set({
servicetype:mainpopup.servicetype,
servicecategory:mainpopup.servicecategory,
servicecost:mainpopup.servicecost,
key:key
});

UIkit.notification('Service created', {pos: 'top-right'});
$scope.closePopup();
$scope.refresh_listing();
}

if(MODE==EDIT){
firebase_reference.child(SERVICE.key).set({
servicetype:mainpopup.servicetype,
servicecategory:mainpopup.servicecategory,
servicecost:mainpopup.servicecost,
key:SERVICE.key
});

UIkit.notification('Service updated', {pos: 'top-right'});
$scope.closePopup();
$scope.refresh_listing();
}

}
};//END submititem()

/**
 * Edit a service
 */
$scope.editservice = function(service){
MODE=EDIT;
SERVICE = service;
$scope.mainpopup.servicecategory = SERVICE.servicecategory;
$scope.mainpopup.servicecost = SERVICE.servicecost;
$scope.mainpopup.servicetype = SERVICE.servicetype;
$scope.showPopup();
};//END editservice()

/**
 * Buffer
 */
$scope.deleteservice = function(service){
SERVICE = service;
};//END deleteservice()

/**
 * Delete service
 */
$scope.removeservice = function(){
firebase_reference.child(SERVICE.key).remove();
UIkit.notification('Service deleted', {pos: 'top-right'});
$scope.closePopup();
$scope.refresh_listing();
};//END removeservice()


/**
 * User wants go to adminmain
 */
$scope.handleback = function(){
$state.go('app.adminmain');
};//END handleback()

})//END servicesmanagercontroller()

app.controller('suppliermanagercontroller', function($scope,$ionicActionSheet,$ionicModal,$ionicLoading, $timeout, $state,$ionicPopup,smarthealth) {
  $scope.mainpopup = {};
  var MODE;
  var SUPPLIER;
  var CREATE = "create";
  var EDIT = "edit";

  var firebase_url = smarthealth.DATABASE_ROOT_URL + "/tblsupplier"
  var firebase_reference = new Firebase(firebase_url);

    //Popup initialisation
    $ionicModal.fromTemplateUrl('adminpanel/supplierpopup.html', {
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
     * Refresh listing
     */
    $scope.refresh_listing = function(){
    $scope.suppliers = [];


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
    for(var i = 0;i<$scope.suppliers.length;i++){
      var item = $scope.suppliers[i];
      if(item.suppliername==data.suppliername){
        state = false;
      }else{state = true;}
    }
    if($scope.suppliers.length < 1){$scope.suppliers.push(data);}
    if(state == true){$scope.suppliers.push(data);}

    $ionicLoading.hide();
    }


    });
        $timeout(function() {
        $ionicLoading.hide();

        }, 3000);
    };//END refresh_listing()

    $scope.$on('$ionicView.enter',function(){
    $scope.refresh_listing();
    });//END $ionicView.enter

    /**
     * Create a supplier
     */
    $scope.createsupplier = function(){
    $scope.mainpopup = {};
    MODE = CREATE;
    $scope.showPopup();
    };//END createsupplier()

    /**
     * Submit Item clicked in popup
     */
    $scope.submititem = function(mainpopup){
    if(mainpopup.suppliername==null||mainpopup.suppliername==""||
    mainpopup.supplierbrn==null||mainpopup.supplierbrn==""||
    mainpopup.supplierglaccount==null||mainpopup.supplierglaccount==""){
    UIkit.notification('Please fill in the fields correctly', {pos: 'top-right'});
    }else{

    if(MODE==CREATE){
    $scope.mainpopup = {};
    var pushed_reference = firebase_reference.push();
    var key = pushed_reference.key();

    pushed_reference.set({
    supplierbalance:mainpopup.supplierbalance,
    suppliername:mainpopup.suppliername,
    supplierbrn:mainpopup.supplierbrn,
    supplierglaccount:mainpopup.supplierglaccount,
    key:key
    });

    UIkit.notification('Supplier created', {pos: 'top-right'});
    $scope.closePopup();
    $scope.refresh_listing();
    }

    if(MODE==EDIT){
    firebase_reference.child(SUPPLIER.key).set({
    suppliername:mainpopup.suppliername,
    supplierbrn:mainpopup.supplierbrn,
    supplierglaccount:mainpopup.supplierglaccount,
    supplierbalance:SUPPLIER.supplierbalance,
    key:SUPPLIER.key
    });

    UIkit.notification('Supplier updated', {pos: 'top-right'});
    $scope.closePopup();
    $scope.refresh_listing();
    }

    }
    };//END submititem()

    /**
     * Edit a supplier
     */
    $scope.editsupplier = function(supplier){
    MODE=EDIT;
    SUPPLIER = supplier;
    $scope.mainpopup.suppliername = SUPPLIER.suppliername;
    $scope.mainpopup.supplierbrn = SUPPLIER.supplierbrn;
    $scope.mainpopup.supplierglaccount = SUPPLIER.supplierglaccount;
    $scope.showPopup();
    };//END editsupplier()

    /**
     * Buffer
     */
    $scope.deletesupplier = function(supplier){
    SUPPLIER = supplier;
    };//END deletesupplier()

    /**
     * Delete supplier
     */
    $scope.removesupplier = function(){
    firebase_reference.child(SUPPLIER.key).remove();
    UIkit.notification('Supplier deleted', {pos: 'top-right'});
    $scope.closePopup();
    $scope.refresh_listing();
    };//END removesupplier()

  /**
   * User wants go to adminmain
   */
  $scope.handleback = function(){
  $state.go('app.adminmain');
  };//END handleback()

})//END suppliermanagercontroller()

app.controller('bankmanagercontroller', function($scope,$ionicActionSheet,$ionicModal,$ionicLoading, $timeout, $state,$ionicPopup,smarthealth) {

  $scope.mainpopup = {};
  var MODE;
  var BANKACCOUNT;
  var CREATE = "create";
  var EDIT = "edit";$scope.mainpopup = {};

  var firebase_url = smarthealth.DATABASE_ROOT_URL + "/tblaccountentries"
  var firebase_reference = new Firebase(firebase_url);

  //Point to bankaccount main directory listing
  firebase_reference = firebase_reference.child(smarthealth.get_bankaccount());

    //Popup initialisation
    $ionicModal.fromTemplateUrl('adminpanel/bankaccountpopup.html', {
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
     * Refresh listing
     */
    $scope.refresh_listing = function(){
    $scope.objects = [];


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

    data.moneyin = smarthealth.get_with_commas(data.moneyin.toString());
    data.moneyout = smarthealth.get_with_commas(data.moneyout.toString());
    data.balance = smarthealth.get_with_commas(data.balance.toString());
    $scope.objects.push(data);
    $ionicLoading.hide();
    }


    });
        $timeout(function() {
        $ionicLoading.hide();

        }, 3000);
    };//END refresh_listing()

    $scope.$on('$ionicView.enter',function(){
      //Dynamically populate years
    $scope.refresh_listing();
    });//END $ionicView.enter

  /**
   * Create a bankaccount
   */
  $scope.createbankaccount = function(){
  $scope.mainpopup = {};
  MODE = CREATE;
  $scope.showPopup();
};//END bankaccount()

//Remove commas
$scope.remove_commas = function(input){

 var INPUT = input.toString();

  $scope.x = INPUT.split(',');
  return parseInt($scope.x[0]+$scope.x[1]);
}

    /**
     * Edit a bankaccount
     */
    $scope.editbankaccount = function(bankaccount){
    MODE=EDIT;
    BANKACCOUNT = bankaccount;
    $scope.mainpopup.bankname = BANKACCOUNT.bankname;
    $scope.mainpopup.ccard = parseFloat(BANKACCOUNT.ccard);
    $scope.mainpopup.moneyin = $scope.remove_commas(BANKACCOUNT.moneyin);
    $scope.mainpopup.moneyout = $scope.remove_commas(BANKACCOUNT.moneyout);
    $scope.mainpopup.balance = $scope.remove_commas(BANKACCOUNT.balance);
    $scope.showPopup();
    };//END bankaccount()

    /**
     * Buffer
     */
    $scope.deletebankaccount = function(bankaccount){
    BANKACCOUNT = bankaccount;
    };//END deletebankaccount()

/**
 * Submit Item clicked in popup
 */
$scope.submititem = function(mainpopup){

if(mainpopup.bankname==null||mainpopup.bankname==""
){
UIkit.notification('Please fill in the fields correctly', {pos: 'top-right'});
}else{
var date = new Date();
if(MODE==CREATE){
$scope.mainpopup = {};

var pushed_reference = firebase_reference.push();
var key = pushed_reference.key();
date.toUTCString
pushed_reference.set({
bankname:mainpopup.bankname,
ccard:mainpopup.ccard,
moneyin:mainpopup.moneyin,
moneyout:mainpopup.moneyout,
balance:mainpopup.balance,
date:date.toUTCString(),
key:key
});

UIkit.notification('Bank Account created', {pos: 'top-right'});
$scope.closePopup();
$scope.refresh_listing();
}

if(MODE==EDIT){
firebase_reference.child(BANKACCOUNT.key).set({
bankname:mainpopup.bankname,
ccard:mainpopup.ccard,
moneyin:mainpopup.moneyin,
moneyout:mainpopup.moneyout,
balance:mainpopup.balance,
date:smarthealth.get_date(),
key:BANKACCOUNT.key
});

UIkit.notification('Bank Account updated', {pos: 'top-right'});
$scope.closePopup();
$scope.refresh_listing();
}

}
};//END submititem()
/**
 * Delete bankaccount
 */
$scope.removebankaccount = function(){
firebase_reference.child(BANKACCOUNT.key).remove();
UIkit.notification('Bank Account deleted', {pos: 'top-right'});
$scope.closePopup();
$scope.refresh_listing();
};//END removebankaccount()

$scope.calculatebalance = function(){
  $scope.mainpopup.balance = $scope.mainpopup.moneyin - $scope.mainpopup.moneyout;
}

  /**
   * User wants go to adminmain
   */
  $scope.handleback = function(){
  $state.go('app.adminmain');
  };//END handleback()

})//END bankmanagercontroller()

app.controller('parameterscontroller', function($scope,$ionicActionSheet,$ionicModal,$ionicLoading, $timeout, $state,$ionicPopup,smarthealth) {

  var firebase_url = smarthealth.DATABASE_ROOT_URL + "/tblparameters"
  var firebase_reference = new Firebase(firebase_url);
  var PARAM;

  //Popup initialisation
  $scope.mainpopup={};
  $ionicModal.fromTemplateUrl('adminpanel/parameterspopup.html', {
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


  $scope.$on("$ionicView.enter",function(){
  $scope.refresh_listing();
  });//END $ionicView.enter



  $scope.refresh_listing = function(){
  $scope.mainpopup = {};
  $scope.percent = 0;
  $scope.objects = [];
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
  $scope.objects.push(data);
  $ionicLoading.hide();
  }


  });

      firebase_reference.on("value", function(snapshot){$ionicLoading.hide();});

  };//END refresh_listing()

$scope.editparameter = function(object){
$scope.mainpopup={};
PARAM = object;
$scope.mainpopup.parameter = PARAM.parameter;
$scope.mainpopup.value = PARAM.value;
$scope.showPopup();
}

$scope.submititem = function(mainpopup){
if(mainpopup.parameter==null||mainpopup.parameter==""||
mainpopup.value==null||mainpopup.value==""){
UIkit.notification('Please fill in the fields correctly', {pos: 'top-right'});
}else{
  firebase_reference.child(PARAM.parameterkey).set({
    parameter:mainpopup.parameter,
    value:mainpopup.value,
    parameterkey:PARAM.parameterkey,
    identifier:PARAM.identifier
  });
  $scope.closePopup();
  UIkit.notification('Updated successfully', {pos: 'top-right'});
  $scope.refresh_listing();
}

}//END submititem()


  /**
   * User wants go to adminmain
   */
  $scope.handleback = function(){
  $state.go('app.adminmain');
  };//END handleback()
})//END parameterscontroller()

app.controller('mracontroller', function($scope,$ionicActionSheet,$ionicModal,$ionicLoading, $timeout, $state,$ionicPopup,smarthealth) {

$scope.mra = {};
$scope.mraitems=[];
$scope.bufferitems = [];

var ACCOUNT_STARTS;
var ACCOUNT_ENDS;
var MRA_VALUE_DOCTORS;

//Static Parameters for Printing invoice
var STATIC_DOCTORNAME;
var STATIC_DATESTART;
var STATIC_DATEEND;
var STATIC_GLCODE;
var STATIC_SUMTOTAL;

$scope.$on("$ionicView.enter",function(){
/**
 * Preload accounts beginning and end dates
 * @Use current_date as default for both
 *
 */
var SELECTED_YEAR = $scope.mra.year;
var SELECTED_MONTH = $scope.mra.month;
var SELECTED_DAY = $scope.mra.day;

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

ACCOUNT_STARTS = new Date();
ACCOUNT_STARTS.setFullYear($scope.mra.year);
ACCOUNT_STARTS.setMonth($scope.rebuild_month($scope.mra.month));
ACCOUNT_STARTS.setDate($scope.mra.day);


ACCOUNT_ENDS = new Date();
ACCOUNT_ENDS.setFullYear($scope.mra.yeartransfer);
ACCOUNT_ENDS.setMonth($scope.rebuild_month($scope.mra.monthtransfer));
ACCOUNT_ENDS.setDate($scope.mra.daytransfer);

console.log('ACCOUNT_STARTS '+ACCOUNT_STARTS);
console.log('ACCOUNT_ENDS '+ACCOUNT_ENDS);
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

$scope.mra.day = $scope.daybuffer[0];
$scope.mra.daytransfer = $scope.daybuffer[0];

$scope.mra.month = $scope.monthbuffer[0];
$scope.mra.monthtransfer = $scope.monthbuffer[0];

var date = new Date();

$scope.mra.year = date.getFullYear()-1;
$scope.mra.yeartransfer = date.getFullYear();

$scope.get_doctors_list();
$scope.get_mravalue();
});//END $ionicView.enter

/**
 * Doctor has been selected from list
 */
$scope.selecteddoctor = function(doctor){
$scope.refresh_list(doctor.glcode);
};//END selecteddoctor()

/*
*Returns system MRA value
*/
$scope.get_mravalue = function () {
    var firebase_url = smarthealth.DATABASE_ROOT_URL + "/tblparameters"
    var firebase_reference = new Firebase(firebase_url);

    firebase_reference.on("child_added", function(snapshot, prevChildKey) {
        var data = snapshot.val();

        if(data!=null){
         if(data.identifier==smarthealth.get_MRA_doctors().toString()){
             MRA_VALUE_DOCTORS = parseInt(data.value.toString());
         }
        }


    });

    firebase_reference.on("value", function(snapshot){$ionicLoading.hide();});

};//END get_mravalue()

/**
 * Refresh contents of view
 */
$scope.refresh_list = function(GLCODE){
$scope.mraitems=[];
var firebase_url = smarthealth.DATABASE_ROOT_URL + "/tblmraaccounts";
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

var data = snapshot.val();
data.uniquekey = snapshot.key();

//Check if date range is matching -- then only push to buffer
var date_db = new Date(data.dateofuse);

if(date_db>=ACCOUNT_STARTS && date_db<=ACCOUNT_ENDS && smarthealth.remove_separators(data.itemcost)>0 && GLCODE===data.glcode){
$ionicLoading.hide();
//Pump data to view
data.utctime = data.dateofuse;
data.dateofuse = smarthealth.get_localtime(data.dateofuse);
$scope.mraitems.push(data);
$scope.add_tds();
}

//$scope.$apply();
}
else{}

});//END LOOPING

firebase_reference.on('value', function(snapshot){


    $ionicLoading.hide();
    for(var i = 0; i < $scope.mraitems.length; i++){
        var data = $scope.mraitems[i];
        var totalmount = (parseInt(data.itemcost)/parseInt(MRA_VALUE_DOCTORS))*100;
        data.totalamount = smarthealth.get_2DP(totalmount);
        STATIC_DOCTORNAME = data.itemconsumed.toString();
        STATIC_GLCODE = data.glcode.toString();
        STATIC_DATESTART = $scope.mra.day+' '+$scope.mra.month+' '+$scope.mra.year;
        STATIC_DATEEND = $scope.mra.daytransfer+' '+$scope.mra.monthtransfer+' '+$scope.mra.yeartransfer;
        $scope.bufferitems.push(data);
    }

    //Emit data
    /*
    console.log('DOCTORNAME ',STATIC_DOCTORNAME);
    console.log('GLCODE ',STATIC_GLCODE);
    console.log('DATESTART ',STATIC_DATESTART);
    console.log('DATEEND ',STATIC_DATEEND);
    console.log('SUMTOTAL ',STATIC_SUMTOTAL);*/
});


};//END refresh_list()


    /**
     * Print invoice
     */
    $scope.printinvoice = function(){

        var doc = new jsPDF()

        var imgData = smarthealth.return_medisave_logo();



//BEGIN MEDISAVE HEADER
        doc.setFontSize(8);
        doc.setFontType('bold');
        doc.text(100, 10, 'TAX DEDUCTION SCHEME (TDS) REPORT');
        doc.setFontType('normal');
        doc.text(100, 15, 'BRN C07007746');
        doc.text(100, 20, 'ST JEAN ROAD');
        doc.text(100, 25, 'QUATRE BORNES');
        doc.text(100, 30, 'Tel: 230 427 7000-4');
        doc.text(100, 35, 'Fax: 230 424 1538');
        doc.text(100, 40, 'Email: hcisgm@intnet.mu');
        doc.addImage(imgData, 'JPEG', 20, 8, 70, 35);
        doc.rect(10, 5, 190, 40);
//END MEDISAVE HEADER

//BEGIN MEDISAVE SUBHEADER & PATIENT DETAILS


//Construct details box on left hand side (borderless)
        doc.setFontType('bold');
        doc.text(10, 55,"Doctor:");
        doc.text(10, 60,"GL CODE:");
        doc.text(10, 65,"TDS Beginning:");
        doc.text(10, 70,"TDS Ending:");


        doc.setFontType('normal');
        doc.text(35, 55,STATIC_DOCTORNAME);
        doc.text(35, 60,STATIC_GLCODE);
        doc.text(35, 65,STATIC_DATESTART);
        doc.text(35, 70,STATIC_DATEEND);

//END Construct patient details box on left hand side (borderless)
//END MEDISAVE SUBHEADER & PATIENT DETAILS

//Draw a table//BEGIN TABLE
        doc.setFontType('bold');
        doc.text(10, 100,"DESCRIPTION");
        doc.text(45, 100,"AMOUNT PAID (Rs)");
        doc.text(80+15, 100,"TDS (Rs)");
        doc.text(130, 100,"DATE OF PAYMENT");
//END table draw
        doc.setFontType('normal');
        var reference_y = 100;
        for(var i = 0; i < $scope.bufferitems.length;i++){
            var data = $scope.bufferitems[i];
            reference_y = reference_y + 5;
            doc.text(10, reference_y,'Patient fees');
            doc.text(70, reference_y,data.totalamount.toString(),null,null,"right");
            doc.text(90+15, reference_y,data.itemcost.toString(),null,null,"right");
            doc.text(130, reference_y,data.dateofuse);

        }


//Construct footer on the right handside of the page
        doc.rect(125, reference_y+10, 75,10);
        doc.setFontType('bold');
        doc.text(128, reference_y+15,"Total TDS (Rs):");
        doc.setFontType('normal');
        doc.text(195, reference_y+15,STATIC_SUMTOTAL.toString(),null,null,"right");
//END footer


        doc.output('dataurlnewwindow');

    }//END printinvoice()



/**
 * Load list of doctors with their GL CODES
 * @tblaccountentries
 */
$scope.get_doctors_list = function(){
UIkit.notification('Loading doctors list', {pos: 'top-right'});
$scope.doctors=[];
var firebase_url = smarthealth.DATABASE_ROOT_URL + "/tblaccountentries";
var firebase_reference = new Firebase(firebase_url);
  $scope.loading = $ionicLoading.show({
    content: '<i class="icon ion-loading-c"></i>',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 50,
    showDelay: 0
  });
firebase_reference.child(smarthealth.get_doctoraccount()).on("child_added", function(snapshot, prevChildKey) {
var data = snapshot.val();
if(data!=null){
$ionicLoading.hide();
$scope.doctors.push(data);
}
else{$ionicLoading.hide();}

});
};//END get_doctors_list()


//Add up the TDS values and provide a sum total
$scope.add_tds = function(){
var SUM = 0;

for(var i = 0; i <$scope.mraitems.length;i++){
SUM = Number($scope.mraitems[i].itemcost) + SUM;
}
$scope.mra.sumtotalamount = smarthealth.numberWithCommas(smarthealth.get_2DP(SUM));
STATIC_SUMTOTAL = $scope.mra.sumtotalamount;
};//END add_tds()

/**
 * Edit has been selected
 */
$scope.emitIndex_edit = function(mraitem){
$scope.data = {};
  var myPopup = $ionicPopup.show({
    template: '<input type="number" ng-model="data.content">',
    title: 'MRA Accounts for '+mraitem.dateofuse,
    subTitle: 'Original TDS was '+mraitem.itemcost+' Please enter new value.',
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

          var input = Number($scope.data.content);

var firebase_urltblmraaccounts = smarthealth.DATABASE_ROOT_URL + "/tblmraaccounts";
var firebase_referencetblmraaccounts = new Firebase(firebase_urltblmraaccounts);
var OBJ = firebase_referencetblmraaccounts.child(mraitem.uniquekey);


OBJ.set({
  activepatientid:mraitem.activepatientid,
  itemconsumed: mraitem.itemconsumed,
  glcode:mraitem.glcode,
  itemcost:input,
  itemcategory:mraitem.itemcategory,
  doctoraccountkey:mraitem.doctoraccountkey,
  dateofuse: mraitem.utctime,
  patientname: mraitem.patientname,
  patientgender: mraitem.patientgender,
  masterkey:mraitem.masterkey,
  itemkey:mraitem.itemkey

});
UIkit.notification('Edited successfully', {pos: 'top-right'});
$scope.refresh_list(mraitem.glcode);

   }
        }
      }
    ]
  });

};//END emitIndex_edit()

/**
 * Delete has been selected
 */
var ITEM;
$scope.emitIndex_delete = function(mraitem){
ITEM = mraitem;
};//END emitIndex_delete()

//Perform delete and refresh_list()
$scope.removemra = function(){
var firebase_urltblmraaccounts = smarthealth.DATABASE_ROOT_URL + "/tblmraaccounts";
var firebase_referencetblmraaccounts = new Firebase(firebase_urltblmraaccounts);
firebase_referencetblmraaccounts.child(ITEM.uniquekey).remove();
UIkit.notification('Deleted successfully', {pos: 'top-right'});
$scope.refresh_list(ITEM.glcode);
};//END removemra()

  /**
   * User wants go to adminmain
   */
  $scope.handleback = function(){
  $state.go('app.adminmain');
  };//END handleback()
})//END mracontroller()

;//END controller.js
