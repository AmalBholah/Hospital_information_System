app.controller('cashieractivepatientscontroller', function($scope,$ionicActionSheet,$ionicModal,$ionicLoading, $timeout, $state,$ionicPopup,smarthealth) {

function format1(n, currency) {
        return currency + " " + n.toFixed(2).replace(/./g, function(c, i, a) {
                return i > 0 && c !== "." && (a.length - i) % 3 === 0 ? "," + c : c;
            });
}

//Set current patient buffer
    var CURRENT_PATIENT;

//Buffer stack for $ionicView
    $scope.patientdata = {};

//SUM TOTAL
    var SUM_TOTAL = 0;

//AMOUNT_TO_PAY
    var AMOUNT_TO_PAY = 0;

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
$state.go('cashierinvoice');
}



/*
User wants to print an invoice
*/
$scope.printinvoicepdf = function (item_clicked) {
smarthealth.set_object(item_clicked);
$scope.load_itemsconsumed("INVOICE");

}//END printinvoicepdf()


/*
User wants to print a receipt
*/
$scope.printreceiptpdf = function (item_clicked) {
smarthealth.set_object(item_clicked);
$scope.load_itemsconsumed("RECEIPT");

}//END printreceiptpdf()


$scope.load_itemsconsumed = function (MODE) {
    //Reset buffers
    SUM_TOTAL = 0;
    TEMP = 0;
    $scope.invoices = [];
    CURRENT_PATIENT = smarthealth.get_object();

    //Set Discount amount to 0 as default
    $scope.patientdata.discountamount = 0;

    /*
     Fill in patient data
     */

    var date = new Date();

    /**
     * TEMP BUFFER
     */
    var TEMP = 0;

    $scope.patientdata.fullname = CURRENT_PATIENT.firstname + " " + CURRENT_PATIENT.lastname;
    $scope.patientdata.address = CURRENT_PATIENT.address;


    if(CURRENT_PATIENT.discountamount==null){$scope.patientdata.discountamount=0;}else {$scope.patientdata.discountamount = CURRENT_PATIENT.discountamount};



    $scope.patientdata.mrn = CURRENT_PATIENT.mrn;
    //Determine if INPATIENT / OUTPATIENT
    if(CURRENT_PATIENT.facilityoccupied==null||CURRENT_PATIENT.facilityoccupied==""||CURRENT_PATIENT.facilityoccupied=="NONE"){
        $scope.patientdata.facilityoccupied = "Casualty";
    }else{
        $scope.patientdata.facilityoccupied = "Inpatient";
    }

    $scope.patientdata.paymentmethod = CURRENT_PATIENT.paymentmethod;
    $scope.patientdata.facilityissuedate = CURRENT_PATIENT.facilityissuedate;
    $scope.patientdata.currentdate = date.toUTCString();
    $scope.patientdata.invoicenumber = smarthealth.generateInvoiceNumber();

    function convertDate(inputFormat) {
        function pad(s) { return (s < 10) ? '0' + s : s; }
        var d = new Date(inputFormat);
        return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
    }


    /*
     END Fill in patient data
     */
    var firebase_url = "https://medisave-a4903.firebaseio.com/tblitemsconsumed";
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

            //Match uniqueid before pushing to $scope.invoices
            if(smarthealth.get_object().uniqueid===data.activepatientid){

                //Special formatting
                data.itemcost = format1(parseFloat(data.itemcost), "");

                //Convert date to human readable format instead of ISOString()
                var datum = new Date(data.dateofuse);
                var minutes = "";
                if(datum.getMinutes()==0){minutes = "00";}else{minutes = datum.getMinutes().toString();}
                data.dateofuse = convertDate(data.dateofuse) + " at " +datum.getHours()+":"+minutes;

                if(data.quantity==null){
                    data.quantity="1";
                    data.amount = format1(parseFloat(Number(1*data.itemcost.replace(/,/g, ''))), "");

                    TEMP = parseFloat(Number(1*data.itemcost.replace(/,/g, '')));
                }
                else{
                    data.amount = format1(parseFloat(Number(data.quantity*data.itemcost.replace(/,/g, ''))), "");


                    TEMP = parseFloat(Number(data.quantity*data.itemcost.replace(/,/g, '')));
                }


                SUM_TOTAL = SUM_TOTAL + TEMP;
                console.log('SUM TOTAL ',SUM_TOTAL);

                $scope.patientdata.sumtotal = format1(parseFloat(SUM_TOTAL - Number($scope.patientdata.discountamount)),"");

                //Compute amount to pay
                AMOUNT_TO_PAY = SUM_TOTAL - Number($scope.patientdata.discountamount);
                $scope.patientdata.amounttopay = format1(parseFloat(SUM_TOTAL - Number($scope.patientdata.discountamount)),"");
                data.amounttopay = format1(parseFloat(SUM_TOTAL - Number($scope.patientdata.discountamount)),"");


                $scope.invoices.push(data);
            }


            $scope.$apply();}
        else{$ionicLoading.hide();}
    });


    firebase_reference.once("value", function(snap) {
        //Switch function depending on MODE
        if(MODE==="INVOICE"){
            $scope.printinvoice();
        }//END INVOICE

        if(MODE==="RECEIPT"){
            $scope.printreceipt();
        }//END RECEIPT
    });

   $timeout(function() {
        $ionicLoading.hide();
    }, 3000);



}//END load_itemsconsumed()


    /**
     * Print invoice
     */
    $scope.printinvoice = function(){

        console.log('sumtotal ',$scope.patientdata.sumtotal.toString());//FAULT
        console.log('discountamount ',$scope.patientdata.discountamount.toString());//OK
        console.log('amounttopay ',$scope.patientdata.amounttopay.toString());//FAULT

        var doc = new jsPDF()

        var imgData = smarthealth.return_medisave_logo();

//BEGIN MEDISAVE HEADER
        doc.setFontSize(8);
        doc.setFontType('bold');
        doc.text(100, 10, 'INVOICE');
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

//Construct minibox on the right handside of the page
        doc.rect(125, 50, 75, 15);
        doc.setFontType('bold');
        doc.text(128, 55,"Invoice Number: ");
        doc.text(128, 60,"Date: ");
        doc.setFontType('normal');
        doc.text(155, 55,$scope.patientdata.invoicenumber);
        doc.text(155, 60,smarthealth.get_localtime($scope.patientdata.currentdate));
//END minibox
//Construct patient details box on left hand side (borderless)
        doc.setFontType('bold');
        doc.text(10, 55,"Patient:");
        doc.text(10, 60,"Address:");
        doc.text(10, 65,"Type:");
        doc.text(10, 70,"Payment:");
        doc.text(10, 75,"DOA:");
        doc.text(10, 80,"DOD:");
        doc.text(10, 85,"MRN:");

//Verify if patient is admitted or not
        if($scope.patientdata.facilityissuedate==null){$scope.patientdata.facilityissuedate = "Outpatient";}else{$scope.patientdata.facilityissuedate = smarthealth.get_localtime($scope.patientdata.facilityissuedate);}
        doc.setFontType('normal');
        doc.text(25, 55,$scope.patientdata.fullname);
        doc.text(25, 60,$scope.patientdata.address);
        doc.text(25, 65,$scope.patientdata.facilityoccupied);
        doc.text(25, 70,$scope.patientdata.paymentmethod);
        doc.text(25, 75,$scope.patientdata.facilityissuedate);
        doc.text(25, 80,smarthealth.get_localtime($scope.patientdata.currentdate));
        doc.text(25, 85,$scope.patientdata.mrn.toString());
//END Construct patient details box on left hand side (borderless)
//END MEDISAVE SUBHEADER & PATIENT DETAILS

//Draw a table//BEGIN TABLE
        doc.setFontType('bold');
        doc.text(10, 100,"DESCRIPTION");
        doc.text(55, 100,"PRICE (Rs)");
        doc.text(80, 100,"QUANTITY");
        doc.text(100, 100,"AMOUNT (Rs)");
        doc.text(130, 100,"ITEM CATEGORY");
        doc.text(170, 100,"DATE CONSUMED");
//END table draw
        doc.setFontType('normal');
        var reference_y = 100;
        for(var i = 0; i < $scope.invoices.length;i++){
            var data = $scope.invoices[i];
            reference_y = reference_y + 5;
            doc.text(10, reference_y,data.itemconsumed);
            doc.text(70, reference_y,data.itemcost,null,null,"right");
            doc.text(90, reference_y,data.quantity,null,null,"right");
            doc.text(120, reference_y,data.amount,null,null,"right");
            doc.text(130, reference_y,data.itemcategory);
            doc.text(170, reference_y,data.dateofuse);

        }


//Construct footer on the right handside of the page
        doc.rect(125, reference_y+10, 75, 20);
        doc.setFontType('bold');
        doc.text(128, reference_y+15,"Total (Rs):");
        doc.text(128, reference_y+20,"Discount (Rs):");
        doc.text(128, reference_y+25,"Net to Pay(Rs):");
        doc.setFontType('normal');
        doc.text(195, reference_y+15,$scope.patientdata.sumtotal.toString(),null,null,"right");
        doc.text(195, reference_y+20,$scope.patientdata.discountamount.toString(),null,null,"right");
        doc.text(195, reference_y+25,$scope.patientdata.amounttopay.toString(),null,null,"right");
//END footer


        doc.output('dataurlnewwindow');

    }//END printinvoice()



    /**
     * Print receipt
     */
    $scope.printreceipt = function() {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Medisave Patient Management',
            template: 'Do you confirm that this patient has successfully paid and can be counted as discharged?'
        });

        confirmPopup.then(function(res) {
            confirmPopup.close();
            if(res) {


                //Mark patient as being now inactive -- remove the instance from the tblactivepatients and send the patient instance to tblpastpatients


                //console.log(smarthealth.get_object());

                var firebase_url = "https://medisave-a4903.firebaseio.com/tblactivepatients";
                var firebase_reference = new Firebase(firebase_url);

                firebase_reference.child(smarthealth.get_object().uniqueid).remove();

                var firebase_url = "https://medisave-a4903.firebaseio.com/tblpastpatients";
                var firebase_reference = new Firebase(firebase_url);

                firebase_reference.child(smarthealth.get_object().uniqueid).set({
                    address:smarthealth.NullFilter(smarthealth.get_object().address),
                    dateofbirthday:smarthealth.NullFilter(smarthealth.get_object().dateofbirthday),
                    dateofbirthmonth:smarthealth.NullFilter(smarthealth.get_object().dateofbirthmonth),
                    dateofbirthyear:smarthealth.NullFilter(smarthealth.get_object().dateofbirthyear),
                    datetime:smarthealth.NullFilter(smarthealth.get_object().datetime),
                    email:smarthealth.NullFilter(smarthealth.get_object().email),
                    facilityissuedate:smarthealth.NullFilter(smarthealth.get_object().facilityissuedate),
                    facilityoccupied:smarthealth.NullFilter(smarthealth.get_object().facilityoccupied),
                    firstname:smarthealth.NullFilter(smarthealth.get_object().firstname),
                    lastname:smarthealth.NullFilter(smarthealth.get_object().lastname),
                    gender:smarthealth.NullFilter(smarthealth.get_object().gender),
                    paymentmethod:smarthealth.NullFilter(smarthealth.get_object().paymentmethod),
                    phonenumber:smarthealth.NullFilter(smarthealth.get_object().phonenumber),
                    referringdoctor:smarthealth.NullFilter(smarthealth.get_object().referringdoctor),
                    uniqueid:smarthealth.NullFilter(smarthealth.get_object().uniqueid),
                    dischargedate:smarthealth.get_date(),
                    mrn:smarthealth.get_object().mrn
                });


                $scope.makereceipt();
            } else {
                $scope.makereceipt();
            }
        });



    }//END printreceipt()

    $scope.makereceipt = function () {
        var doc = new jsPDF()

        var imgData = smarthealth.return_medisave_logo();

//BEGIN MEDISAVE HEADER
        doc.setFontSize(8);
        doc.setFontType('bold');
        doc.text(100, 10, 'INVOICE');
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

//Construct patient details box on left hand side (borderless)
        doc.setFontType('bold');
        doc.text(10, 55,"Patient:");
        doc.text(10, 60,"Address:");
        doc.text(10, 65,"Type:");
        doc.text(10, 70,"Payment:");
        doc.text(10, 75,"DOA:");
        doc.text(10, 80,"DOD:");
        doc.text(10, 85,"MRN:");
        doc.text(10, 90,"Receipt Number:");
        doc.text(10, 95,"Total (Rs):");
        doc.text(10, 100,"Discount (Rs):");
        doc.text(10, 105,"Net to Pay (Rs):");
        doc.text(10, 115,"Received with thanks the amount of:");
        //Verify if patient is admitted or not
        if($scope.patientdata.facilityissuedate==null){$scope.patientdata.facilityissuedate = "Outpatient";}else{$scope.patientdata.facilityissuedate = smarthealth.get_localtime($scope.patientdata.facilityissuedate);}
        doc.setFontType('normal');
        doc.text(45, 55,$scope.patientdata.fullname);
        doc.text(45, 60,$scope.patientdata.address);
        doc.text(45, 65,$scope.patientdata.facilityoccupied);
        doc.text(45, 70,$scope.patientdata.paymentmethod);
        doc.text(45, 75,$scope.patientdata.facilityissuedate);
        doc.text(45, 80,smarthealth.get_localtime($scope.patientdata.currentdate));
        doc.text(45, 85,$scope.patientdata.mrn.toString());
        doc.text(45, 90,$scope.patientdata.invoicenumber);
        doc.text(55, 95,$scope.patientdata.sumtotal.toString(),null,null,"right");
        doc.text(55, 100,$scope.patientdata.discountamount.toString(),null,null,"right");
        doc.text(55, 105,$scope.patientdata.amounttopay.toString(),null,null,"right");



        var DELIM = parseFloat(smarthealth.remove_separators($scope.patientdata.amounttopay)).toFixed(2).toString().split('.');
        $scope.patientdata.amounttopay = "(Rs) "+smarthealth.toWords(DELIM[0])+ " , "+smarthealth.toWords(DELIM[1])+ " cents";




        doc.text(130, 115,$scope.patientdata.amounttopay,null,null,"right");
//END Construct patient details box on left hand side (borderless)



        doc.output('dataurlnewwindow');

    }//END makereceipt();

})//END cashieractivepatientscontroller

;//END controllers.js
