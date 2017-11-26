
/*
	
	JavaScript functions to control navigation and data flows
	It's kinda like a SmartCarShare-website Framework
	
	Created:     15/10/17
	Author:      Thomas Reichert
	Last edit:   20/10/17
	
*/

"use strict";

// AJAX parameters
var ajaxTimeout = 12000;
var ajaxRequestRunning = false;
var locationRequestRunning = false;

// Pending error message
var pendingError = null;
var pendingErrorMightBringHappiness = false;
var errorPanelIsShowing = false;

var isLoggedIn = false;
var passID;

// Array mapping vehicle type IDs to image file names
var arrVehicleTypeImages = [
    'i30_Red.png',
    'Yaris_Red.png',
    'Shortbox_White.png',
    'Accent_Silver.png',
    'Corolla_Blue.png',
    'Yaris_Pink.png',
    'Ascension_Black.png',
    'Territory_White.png'
];

/********************************************
* State management and transition functions
* (CONTROLLER)
********************************************/
		
// Include data access logic, and call content-building function
function navigate(href, id) {
	switch(href) {
        case 'start':
            passID = 0;
            if (localStorage.user)
                doActionAsync('validateUser');
            else {
                $('#btnPlus').addClass('hidden');
                build('navLogin');
                build('conLogin');
                build('fotLogin');
            }
            break;
		case 'login':
			build('frmLogin');
			build('fotNewMem');
            break;
        case 'register':
            build('frmNewMem');
            build('fotNone');
            break;
        case 'newMembership':
            build('frmNewMemShip');
            build('fotSignedIn');
            break;
        case 'help':
            build('conHelp');
            break;
        case 'logout':
            removeLoginData();
            navigate('start');
            break;
		case 'home':
			isLoggedIn = true;
			$('#btnPlus').removeClass('hidden');
            build('navAll');
            doActionAsync('displayDashboard');
			build('fotSignedIn');
            break;
		case 'findVehicles':
			$('#btnPlus').addClass('hidden');
            build('frmSearchVehicles');
            break;
		case 'findLocations':
			$('#btnPlus').addClass('hidden');
			build('frmSearchLocations');
            break;
        case 'listVehicles':
			$('#btnPlus').addClass('hidden');
            build('conListVehicles');
            break;
		case 'membership':
			$('#btnPlus').addClass('hidden');
			build('frmEditMem');
            break;
		case 'bookings':
            $('#btnPlus').removeClass('hidden');
            doActionAsync('displayAllBookings');
            break;
		case 'damageReport':
			$('#btnPlus').addClass('hidden');
			build('frmDamage');
            break;
		case 'bookVehicleOfType':
			$('#btnPlus').addClass('hidden');
			build('frmBookingOfType', id);
            break;
		case 'bookLocation':
			$('#btnPlus').addClass('hidden');
			build('frmBooking', {'location': id});
            break;
		case 'newBooking':
			$('#btnPlus').addClass('hidden');
			build('frmBooking', null);
            break;
        case 'editBooking':
            $('#btnPlus').addClass('hidden');
            build('frmEditBooking', id);
            break;
        case 'completeBooking':
            build('frmCompleteBooking', id);
            break;
        case 'leaveReview':
            build('frmReview', id);
            break;
        case 'getLocationVehicles':
            build('frmVehiclesAtPlace', id);
            break;
    }
    showPendingError();
}

/********************************************
* Builder function
* (VIEWS)
********************************************/

// Build navigation lists, content things, or forms where appropriate
function build(component, id) {
    switch (component) {
		case 'fotNone':
			$('#footage').html('');
			return;
		case 'navLogin':
			$('#navbarResponsive').html('');
			$('#navbarResponsive').append(buildNavList(
				['My Membership', 'My Bookings', 'Find Vehicles', 'Find Locations', 'Damage Report', 'Help', 'Log Out'],
				[null, null, 'javascript:navigate("findVehicles");', 'javascript:navigate("findLocations");', null, 'javascript:navigate("help");', null]
			));
			return;
		case 'navAll':
			$('#navbarResponsive').html('');
			$('#navbarResponsive').append(buildNavList(
                ['My Membership', 'My Bookings', 'Find Vehicles', 'Find Locations', 'Damage Report', 'Help', 'Log Out'],
                ['javascript:navigate("membership");', 'javascript:navigate("bookings");', 'javascript:navigate("findVehicles");', 'javascript:navigate("findLocations");',
                    'javascript:navigate("damageReport");', 'javascript:navigate("help");', 'javascript:navigate("logout");']
			));
			return;
		case 'conLogin':
			$('#content').html('');
			$('#content').append(buildListPanel(
				'Sign In to Membership',
				['You must be logged in as a current member to use most features of this application.',
				'Log in below, or use the navigation links above to access unrestricted features.'],
				[null, null]
			));
			return;
		case 'conListVehicles':
            if (doActionAsync('listVehiclesOfType') == false) {
                pendingError = 'Could not request vehicle list.';
                navigate('start');
            }
            return;
        case 'conHelp':
            $('#content').html('');
            $('#content').append(buildImagePanel(
                'Registration',
                [
                    'If you are not yet a member, you can register. From the first screen, tap "Sign In / Register" at the bottom, and then "New Member".',
                    'Fill in all details, accept the terms, and press "Submit".You will need to be approved by SmartCarShare staff before yo can log in, so try logging in a little while later.'
                ],
                'shots1.png'
            ));
            $('#content').append(buildImagePanel(
                'Dashboard and Bookings',
                [
                    'Once you are logged in, the first thing you will see is your dashboard. You can return to it later by tapping on the SmartCarShare heading at the top of any screen.',
                    'Your dashboard lists all of your current and future bookings, if you have any. You can create a new booking by tapping the plus sign at the top of your dashboard.',
                    'Fill in all details required for the booking before proceeding. Editing a date or time will display a calendar to easily choose the date and time for the start or finish of your booking.',
                    'After filling out the booking details and submitting the form, you will be shown how much the booking will cost. To complete the booking, you will need to enter payment details.'
                ],
                'shots2.png'
            ));
            $('#content').append(buildImagePanel(
                'Options',
                [
                    'At the top of the screen there is a drop-down options menu. There are various actions you can take, including logging out, or viewing all of your completed bookings.',
                    'By selecting "My Membership", you can update your details. You can also change your password.',
                    'If you select "Find Vehicles", you can search for vehicles of a particular type. You may choose a model from the list, and view where those vehicles are, and then book one of them if you like.'
                ],
                'shots3.png'
            ));
            $('#content').append(buildImagePanel(
                'Finding Vehicles by Location',
                [
                    'A better way to find a vehicle to book is by choosing "Find Locations" from the options menu. You will be shown your position on a map, and may select a distance that you would like to find vehicles within.',
                    'The SmartCarShare parking locations within that range will be displayed on the map, and also listed below the map. By choosing one, you can view which vehicles are currently at that location. From there you can book one.',
                    'This feature relies on knowing the location of your device, so make sure you have that feature turned on.'
                ],
                'shots4.png'
            ));
            $('#content').append(buildImagePanel(
                'More Dashboard Features',
                [
                    'Your dashboard lists your current bookings. From there, you can edit future bookings, or finalise active bookings.',
                    'The dashboard also lists any vehicles that you have booked, but have not yet left a review for. You may review a vehicle, by leaving a rating out of 5, and a description of your experience.'
                ],
                'shots5.png'
            ));
            return;
		case 'frmLogin':
			$('#content').html('');
			$('#content').append(buildForm(
				'Login', 'Please enter your details.',
				['Username', 'Password'],
				['text', 'text'],
				['txtUser', 'txtPass'],
				'Log In',
				'javascript:doActionAsync("login");'
			));
			return;
		case 'frmDamage':
            $('#content').html('');
            $('#content').append(buildForm(
                'Damage Report', 'Enter details.',
                ['Booking', 'Feedback'],
                ['combo', 'textarea'],
                ['txtBookingSelect', 'txtDamageDescription'],
                'Submit',
                'javascript:doActionAsync("submitDamageReport");'
            ));
            if (doActionAsync('fillBookingList') == false)
                navigate('start');
            return;
		case 'frmSearchVehicles':
			$('#content').html('');
			$('#content').append(buildForm(
				'Find Vehicles', 'Choose preference.',
				['Type'],
				['combo'],
				['txtVehicleType'],
				'Submit',
				'javascript:navigate("listVehicles");'
			));
			if (doActionAsync('fillVehicleList') == false)
				navigate('start');
			return;
        case 'frmSearchLocations':
            $('#content').html('');
            useLat = null;
            useLong = null;
            // Create form to choose a radius
			$('#content').append(buildForm(
				'Find Locations', 'Choose preference.',
				['Maximum Distance'],
				['combo'],
				['txtMaxDist'],
				'Submit',
				'javascript:doActionAsync("mapStuff");'
            ));
            // Fill the combo box with radii
            $('#txtMaxDist').children().remove();
            $('#txtMaxDist').append($('<option>', { value: '5', text: '5 km', selected: 'selected' }));
            $('#txtMaxDist').append($('<option>', { value: '15', text: '15 km' }));
            $('#txtMaxDist').append($('<option>', { value: '30', text: '30 km' }));
            $('#content').append(buildMapPanel('Locations Around You', 'Your location is shown as a blue icon.'));
            // Get the user's location
            locationRequestRunning = true;
            navigator.geolocation.getCurrentPosition(function (position) {
                // Store location of user and show on map
                useLat = position.coords.latitude;
                useLong = position.coords.longitude;
                initMapPanel(useLat, useLong);
                locationRequestRunning = false;
            }, function (error) {
                // Use a default location on failure
                useLat = -37.8739381;
                useLong = 145.0849068;
                initMapPanel(useLat, useLong);
                locationRequestRunning = false;
                pendingError = error.message;
                showPendingError();
            });
			return;
		case 'fotLogin':
			$('#footage').html('');
			$('#footage').append(buildFootNavs(
				['Sign In / Register'],
				['javascript:navigate("login");']
			));
			return;
		case 'fotNewMem':
			$('#footage').html('');
			$('#footage').append(buildFootNavs(
				['New Member'],
				['javascript:navigate("register");']
			));
			return;
		case 'fotSignedIn':
			$('#footage').html('');
            $('#footage').append(buildFootNavs(
                ['Signed in as ' + localStorage.name],
				[null]
			));
            return;
        case 'frmNewMem':
            $('#content').html('');
            $('#content').append(buildForm(
                'New Member', 'Please enter your details.',
                ['First Name', 'Last Name', 'Street Address', 'Suburb', 'Post Code',
                    'Phone No. (optional)', 'Email Address', 'License No.', 'License Expiry',
                    'Accept Terms', 'Membership Type', 'Username', 'Password', 'Repeat Password'],
                ['text', 'text', 'text', 'text', 'text',
                    'text', 'text', 'text', 'date',
                    'checkbox', 'combo', 'text', 'text', 'text'],
                ['txtFirstName', 'txtLastName', 'txtStreet', 'txtSuburb', 'txtPostCode',
                    'txtPhone', 'txtEmail', 'txtLicenseNo', 'txtLicenseExpiry',
                    'txtAcceptTerms', 'txtMembershipType', 'txtNewUsername', 'txtNewPassword', 'txtConfirm'],
                'Submit',
                'javascript:doActionAsync("newMember");'
            ));
            $("#txtLicenseExpiry").datetimepicker({ format: "YYYY-MM-DD" });
            if (doActionAsync('fillMembershipTypesList') == false)
                navigate('start');
            return;
        case 'frmNewMemShip':
            $('#content').html('');
            $('#content').append(buildForm(
                'New Membership', 'Please enter your preferences.',
                ['Membership Type'],
                ['text'],
                ['txtMembershipType'],
                'Submit',
                'javascript:doActionAsync("newMembership");'
            ));
            return;
        case 'frmEditMem':
            if (doActionAsync('loadMemberSummary')) {
                $('#content').html('');
                $('#content').append(buildForm(
                    'Change Password', 'You may change your password any time.',
                    ['New Password', 'Confirm New Password'],
                    ['text', 'text'],
                    ['txtNewPass', 'txtConfirmNewPass'],
                    'Change Password',
                    'javascript:doActionAsync("changePassword");'
                ));
            }
			return;
        case 'frmReview':
            bookRego = id.regoNo;
			$('#content').html('');
			$('#content').append(buildForm(
                'Vehicle ' + id.regoNo,
                'Please describe your experience with this vehicle.',
				['Rating','Review'],
				['combo','textarea'],
				['txtRating','txtReview'],
				'Submit',
				'javascript:doActionAsync("postReview");'
            ));
            $('#txtRating').children().remove();
            $('#txtRating').append($('<option>', { value: "1", text: "1" }));
            $('#txtRating').append($('<option>', { value: "2", text: "2" }));
            $('#txtRating').append($('<option>', { value: "3", text: "3", selected: "selected" }));
            $('#txtRating').append($('<option>', { value: "4", text: "4" }));
            $('#txtRating').append($('<option>', { value: "5", text: "5" }));
            return;
        case 'frmCompleteBooking':
            book = id.bookingNo;
            bookRego = id.regoNo;
            $('#content').html('');
            $('#content').append(buildForm(
                'Complete Booking',
                'Nearly done!',
                ['Odometer Reading'],
                ['text'],
                ['txtOdo'],
                'Submit',
                'javascript:doActionAsync("postCompletedBooking");'
            ));
            return;
        case 'frmBooking':
            if (doActionAsync('newBookingForm') == false)
                navigate('bookings');
            return;
        case 'frmBookingOfType':
            $('#content').html('');
            $('#content').append(buildForm(
                'Booking', 'Enter details of the booking.',
                ['Vehicle', 'Start Date', 'Start Time', 'Finish Date', 'Finish Time', 'Notes'],
                ['readonlycombo', 'date', 'date', 'date', 'date', 'text'],
                ['txtVehicle', 'txtStartDate', 'txtStartTime', 'txtFinishDate', 'txtFinishTime', 'txtNotes'],
                'Submit',
                'javascript:doActionAsync("submitBooking");'
            ));
            $('#txtVehicle option:selected').prop('value', id.rego);
            $('#txtVehicle option:selected').text(id.display);
            var now = moment();
            $("#txtStartDate").datetimepicker({ format: "YYYY-MM-DD", useCurrent: false, defaultDate: now });
            $("#txtStartTime").datetimepicker({ format: "HH:mm", useCurrent: false, defaultDate: now });
            $("#txtFinishDate").datetimepicker({ format: "YYYY-MM-DD", useCurrent: false, defaultDate: now });
            $("#txtFinishTime").datetimepicker({ format: "HH:mm", useCurrent: false, defaultDate: now });
            return;
        case 'frmEditBooking':
            passID = id.bookingNo;
            if (doActionAsync('editBookingForm') == false)
                navigate('bookings');
            return;
        case 'frmVehiclesAtPlace':
            $('#content').html('');
            bookClass = id.locID;
            bookNotes = id.addr;
            doActionAsync('loadVehiclesAtPlace');
            return;
	}
}

// Perform some decisive action, and return whether or not the async task was successfully initiated (regardless of whether that task completes successdfully or not)
var payTotal, bookClass, days, hours, odo;
var bookRego, bookStartDate, bookStartTime, bookEndDate, bookEndTime, bookNotes, bookAmount, bookPayNo;
var processedBooks, books, book, i, len;
var useLat, useLong;
var dx, dy, rad;
function doActionAsync(actionID) {
    var get_user, get_key, newMemType;
    var nameFirst, nameLast, addrStreet, addrSuburb, addrPostCode, phoneNumber, emailAddr, licenseNumber, licenseExpiry;
    switch (actionID) {
        case 'login':
            get_user = $('#txtUser').val();
            var get_pass = $('#txtPass').val();
			return sendRequestAsync(
				'POST',
				'/member/login',
				{ user: get_user, pass: get_pass },
				function (data) {
					if (data.key !== 0) {
						localStorage.user = get_user;
						localStorage.authKey = data.key;
						navigate('start');
					}
					else {
                        removeLoginData();
                        pendingError = 'The credentials you provided are incorrect.';
                        showPendingError();
					}
				},
				function(jqXHR, status) {
                    removeLoginData();
                    pendingError = 'Login request failed.';
                    showPendingError();
				}
			);
        case 'validateUser':
            get_user = localStorage.user;
            get_key = localStorage.authKey;
            return sendRequestAsync(
				'POST',
				'/member/auth',
                { user: get_user, key: get_key },
                function (data) {
                    if (data.key !== 0) {
                        if (data.membershipStatus === 'Approved') {
                            isLoggedIn = true;
                            localStorage.name = data.name;
                            localStorage.memberNo = data.memID;
                            navigate('home');
                            return;
                        }
                        else if (data.membershipStatus === 'Cancelled') {
                            pendingError = 'Your membership is cancelled and you may not use this service.';
                            removeLoginData();
                            navigate('start');
                            return;
                        }
                        else if (data.membershipStatus === 'Suspended') {
                            pendingError = 'Your membership is suspended. Please contact administration for more information.';
                            removeLoginData();
                            navigate('start');
                            return;
                        }
                        else if (data.membershipStatus === 'Pending') {
                            pendingError = 'Membership awaiting approval. Please be patient, or contact administration.';
                            removeLoginData();
                            navigate('start');
                            return;
                        }
                        else if (data.membershipStatus === 'None')
                            pendingError = 'There are no memberships on the account. You must create a membership in order to use this service.';
                        else if (data.membershipStatus === 'Expired')
                            pendingError = 'Your membership is expired. A new membership may be created.';
                        localStorage.user = get_user;
                        localStorage.name = data.name;
                        localStorage.memberNo = data.memID;
                        navigate('newMembership');
                    }
                    else {
                        removeLoginData();
                        pendingError = 'Login validation failed.';
                        navigate('start');
                    }
                },
                function (jqXHR, status) {
                    isLoggedIn = false;
                });
        case 'fillMembershipTypesList':
            return sendRequestAsync(
                'GET',
                '/memtypes',
                {},
                function (data) {
                    // Make sure it was successful
                    if (data.err) {
                        pendingError = 'Membership types were not obtained properly.';
                        navigate('start');
                        return;
                    }
                    // Clear the select box
                    $('#txtMembershipType').children().remove();
                    // Add each vehicle to the select box
                    books = data.memTypes;
                    len = books.length;
                    if (len === 0) {
                        pendingError = 'No current membership types are available.';
                        navigate('start');
                        return;
                    }
                    for (i = 0; i < len; i++) {
                        book = books[i];
                        get_user = $('<option>', { value: book.MemType_Id, text: book.Type_Name + ', valid until ' + book.Valid_To.substr(0, 10) });
                        $('#txtMembershipType').append(get_user);
                    }
                },
                function (jqHXR, status) {
                    pendingError = 'Failed to retrieve membership type information.';
                    showPendingError();
                }
            );
        case 'newMember':
            // Get fields
            nameFirst = $('#txtFirstName').val().trim();
            nameLast = $('#txtLastName').val().trim();
            addrStreet = $('#txtStreet').val().trim();
            addrSuburb = $('#txtSuburb').val().trim();
            addrPostCode = $('#txtPostCode').val().trim();
            phoneNumber = $('#txtPhone').val().trim();
            emailAddr = $('#txtEmail').val().trim();
            licenseNumber = $('#txtLicenseNo').val().trim();
            licenseExpiry = $('#txtLicenseExpiry').val().trim();
            var acceptedTerms = $('#txtAcceptTerms').is(':checked') ? '1' : '0';
            newMemType = $('#txtMembershipType').val().trim();
            var newUsername = $('#txtNewUsername').val().trim();
            var newPassword = $('#txtNewPassword').val().trim();
            var confirmPassword = $('#txtConfirm').val().trim();
            // Validate fields
            if (nameFirst.length === 0) { pendingError = 'Please enter a first name.'; showPendingError(); $('#txtFirstName').focus(); return false; }
            if (nameLast.length === 0) { pendingError = 'Please enter a last name.'; showPendingError(); $('#txtLastName').focus(); return false; }
            if (addrStreet.length === 0) { pendingError = 'Please enter a street address.'; showPendingError(); $('#txtStreet').focus(); return false; }
            if (addrSuburb.length === 0) { pendingError = 'Please enter a suburb.'; showPendingError(); $('#txtSuburb').focus(); return false; }
            if (addrPostCode.length === 0) { pendingError = 'Please enter a postcode.'; showPendingError(); $('#txtPostCode').focus(); return false; }
            if (phoneNumber.length === 0) phoneNumber = null;
            if (emailAddr.length === 0) { pendingError = 'Please enter an email address.'; showPendingError(); $('#txtEmail').focus(); return false; }
            if (licenseNumber.length === 0) { pendingError = 'Please enter a license number.'; showPendingError(); $('#txtLicenseNo').focus(); return false; }
            if (licenseExpiry.length === 0) { pendingError = 'Please enter a license expiry date.'; showPendingError(); $('#txtLicenseExpiry').focus(); return false; }
            if (acceptedTerms !== '1') { pendingError = 'Please read and accept the terms.'; showPendingError(); $('#txtAcceptTerms').focus(); return false; }
            if (newMemType.length === 0) { pendingError = 'Please choose a membership type.'; showPendingError(); $('#txtMembershipType').focus(); return false; }
            if (newUsername.length === 0) { pendingError = 'Please enter a username.'; showPendingError(); $('#txtNewUsername').focus(); return false; }
            if (newPassword.length === 0) { pendingError = 'Please enter a password.'; showPendingError(); $('#txtNewPassword').focus(); return false; }
            if (confirmPassword.length === 0) { pendingError = 'Please confirm your password.'; showPendingError(); $('#txtConfirm').focus(); return false; }
            if (newPassword !== confirmPassword) { pendingError = 'Password fields do not match.'; showPendingError(); $('#txtConfirm').focus(); return false; }
            // Post member
            return sendRequestAsync(
                'POST',
                '/member',
                {
                    firstName: nameFirst,
                    lastName: nameLast,
                    streetAddress: addrStreet,
                    suburb: addrSuburb,
                    postCode: addrPostCode,
                    phoneNo: phoneNumber,
                    email: emailAddr,
                    licenceNo: licenseNumber,
                    licenceExp: licenseExpiry,
                    termsAccepted: true,
                    userName: newUsername,
                    password: newPassword
                },
                function (data) {
                    if (data.memID !== 0) {
                        localStorage.user = newUsername;
                        localStorage.authKey = data.key;
                        localStorage.memberNo = data.memID;
                        // Post membership
                        sendRequestAsync(
                            'POST',
                            '/membership',
                            {
                                memberID: data.memID,
                                membershipType: newMemType
                            },
                            function (data) {
                                navigate('start');
                            },
                            function (jqHXR, status) {
                                pendingError = 'Membership creation request failed.';
                                showPendingError();
                            }
                        );
                    }
                    else {
                        pendingError = 'A problem prevented the member record from being created.';
                        showPendingError();
                    }
                },
                function (jqXHR, status) {
                    pendingError = 'Member creation request failed.';
                    showPendingError();
                }
            );
        case 'newMembership':
            newMemType = $('#txtMembershipType').val().trim();
            if (newMemType.length === 0) { pendingError = 'Please choose a membership type.'; showPendingError(); $('#txtMembershipType').focus(); return false; }
            return sendRequestAsync(
                'POST',
                '/membership',
                {
                    memberID: localStorage.memberNo,
                    membershipType: newMemType
                },
                function (data) {
                    navigate('start');
                },
                function (jqHXR, status) {
                    pendingError = 'Membership creation request failed.';
                    showPendingError();
                }
            );
        case 'loadMemberSummary':
            return sendRequestAsync(
                'GET',
                '/member/' + localStorage.memberNo,
                {},
                function (data) {
                    // Build update form
                    $('#content').prepend(buildForm(
                        'Edit Details', 'Edit details as required, and click \'Submit\'.',
                        ['First Name', 'Last Name', 'Street Address', 'Suburb', 'Post Code',
                            'Phone No.', 'Email Address', 'License No.', 'License Expiry'],
                        ['text', 'text', 'text', 'text', 'text',
                            'text', 'text', 'text', 'date'],
                        ['txtFirstName', 'txtLastName', 'txtStreet', 'txtSuburb', 'txtPostCode',
                            'txtPhone', 'txtEmail', 'txtLicenseNo', 'txtLicenseExpiry'],
                        'Submit',
                        'javascript:doActionAsync("updateMember");'
                    ));
                    $("#txtLicenseExpiry").datetimepicker({ format: "YYYY-MM-DD", useCurrent: false, defaultDate: data.Licence_Exp });
                    // Fill out current details
                    $('#txtFirstName').val(data.First_Name);
                    $('#txtLastName').val(data.Last_Name);
                    $('#txtStreet').val(data.Street_Address);
                    $('#txtSuburb').val(data.Suburb);
                    $('#txtPostCode').val(data.Postcode);
                    $('#txtPhone').val(data.Phone_No);
                    $('#txtEmail').val(data.Email_Add);
                    $('#txtLicenseNo').val(data.Licence_No);
                    // Add member booking summary
                    sendRequestAsync(
                        'GET',
                        '/booking/bookings/' + localStorage.memberNo,
                        {},
                        function (data) {
                            var book, allBooks = data.bookings;
                            var i, noOfBookings = allBooks.length;
                            // Count bookings of different types
                            var booksActive = 0, booksFuture = 0, booksCompleted = 0;
                            for (i = 0; i < noOfBookings; i++) {
                                book = allBooks[i];
                                if (book.Actual_Return_Date == null) {
                                    if (moment(book.Start_Date).isBefore(moment()))
                                        booksActive++;
                                    else
                                        booksFuture++;
                                }
                                else
                                    booksCompleted++;
                            }
                            $('#content').prepend(buildListPanel(
                                'Signed in as ' + localStorage.name,
                                [
                                    'Active bookings: ' + booksActive,
                                    'Future bookings: ' + booksFuture,
                                    'Total completed bookings: ' + booksCompleted
                                ],
                                [null, null, null, null]
                            ));
                            // 
                        },
                        function (jqHXR, status) {
                            pendingError = 'Failed to retrieve booking information.';
                            showPendingError();
                        }
                    );
                },
                function (jqHXR, status) {
                    pendingError = 'Failed to retrieve member information.';
                    showPendingError();
                }
            );
        case 'updateMember':
            nameFirst = $('#txtFirstName').val().trim();
            nameLast = $('#txtLastName').val().trim();
            addrStreet = $('#txtStreet').val().trim();
            addrSuburb = $('#txtSuburb').val().trim();
            addrPostCode = $('#txtPostCode').val().trim();
            phoneNumber = $('#txtPhone').val().trim();
            emailAddr = $('#txtEmail').val().trim();
            licenseNumber = $('#txtLicenseNo').val().trim();
            licenseExpiry = $('#txtLicenseExpiry').val().trim();
            // Validate fields
            if (nameFirst.length === 0) { pendingError = 'Please enter a first name.'; showPendingError(); $('#txtFirstName').focus(); return false; }
            if (nameLast.length === 0) { pendingError = 'Please enter a last name.'; showPendingError(); $('#txtLastName').focus(); return false; }
            if (addrStreet.length === 0) { pendingError = 'Please enter a street address.'; showPendingError(); $('#txtStreet').focus(); return false; }
            if (addrSuburb.length === 0) { pendingError = 'Please enter a suburb.'; showPendingError(); $('#txtSuburb').focus(); return false; }
            if (addrPostCode.length === 0) { pendingError = 'Please enter a postcode.'; showPendingError(); $('#txtPostCode').focus(); return false; }
            if (phoneNumber.length === 0) { pendingError = 'Please enter a phone number.'; showPendingError(); $('#txtPhone').focus(); return false; }
            if (emailAddr.length === 0) { pendingError = 'Please enter an email address.'; showPendingError(); $('#txtEmail').focus(); return false; }
            if (licenseNumber.length === 0) { pendingError = 'Please enter a license number.'; showPendingError(); $('#txtLicenseNo').focus(); return false; }
            if (licenseExpiry.length === 0) { pendingError = 'Please enter a license expiry date.'; showPendingError(); $('#txtLicenseExpiry').focus(); return false; }
            return sendRequestAsync(
                'PUT',
                '/member',
                {
                    memberID: localStorage.memberNo,
                    firstName: nameFirst,
                    lastName: nameLast,
                    streetAddress: addrStreet,
                    suburb: addrSuburb,
                    postCode: addrPostCode,
                    phoneNo: phoneNumber,
                    email: emailAddr,
                    licenceNo: licenseNumber,
                    licenceExp: licenseExpiry
                },
                function (data) {
                    if (data.err === 0) navigate('start');
                    else {
                        pendingError = 'Member information could not be updated.';
                        showPendingError();
                    }
                },
                function (jqHXR, status) {
                    pendingError = 'Membership creation request failed.';
                    showPendingError();
                }
            );
        case 'changePassword':
            var newPass = $('#txtNewPass').val().trim();
            var confirmNewPass = $('#txtConfirmNewPass').val().trim();
            // Validate fields
            if (newPass.length === 0) { pendingError = 'Please enter a new password.'; showPendingError(); $('#txtNewPass').focus(); return false; }
            if (newPass != confirmNewPass) { pendingError = 'Please repeat the new password exactly.'; showPendingError(); $('#txtConfirmNewPass').focus(); return false; }
            return sendRequestAsync(
                'PUT',
                '/member/pass',
                {
                    user: localStorage.user,
                    key: localStorage.authKey,
                    pass: newPass
                },
                function (data) {
                    if (data.new_key === 0)
                        pendingError = 'Password could not be changed.';
                    else {
                        localStorage.authKey = data.new_key;
                        $('#txtNewPass').val('');
                        $('#txtConfirmNewPass').val('');
                        pendingError = 'Password changed.';
                        pendingErrorMightBringHappiness = true;
                    }
                    showPendingError();
                },
                function (jqHXR, status) {
                    pendingError = 'The request to change your password failed.';
                    showPendingError();
                }
            );
        case 'displayDashboard':
            $('#content').html('');
            return sendRequestAsync(
                'GET',
                '/booking/bookings/' + localStorage.memberNo,
                {},
                function (data) {
                    // Sort bookings into current ones, future ones, and fully completed ones (don't list completed ones)')
                    processedBooks = {
                        activeImages: [], activeFinishes: [], activeRefs: [],
                        futureImages: [], futureStarts: [], futureFinishes: []
                    };
                    books = data.bookings;
                    len = books.length;
                    for (i = 0; i < len; i++) {
                        book = books[i];
                        if (book.Actual_Return_Date != null) {
                            // Skip completed bookings
                            continue;
                        }
                        else {
                            // Note future bookings
                            if (moment().isBefore(book.Start_Date)) {
                                processedBooks.futureImages.push(arrVehicleTypeImages[parseInt(book.Type_Id) - 1]);
                                processedBooks.futureStarts.push(book.Start_Date);
                                processedBooks.futureFinishes.push(['Edit', 'javascript:navigate("editBooking", {"bookingNo": ' + book.Booking_No + '});']);
                            }
                            // Note current bookings
                            else {
                                processedBooks.activeImages.push(arrVehicleTypeImages[parseInt(book.Type_Id) - 1]);
                                processedBooks.activeFinishes.push(book.Return_Date);
                                processedBooks.activeRefs.push(['Finish', 'javascript:navigate("completeBooking", {"bookingNo": ' + book.Booking_No + ', "regoNo": "' + book.Rego_No + '"});']);
                            }
                        }
                    }
                    // Build content panels with the sorted data
                    var noOfPanels = 0;
                    if (processedBooks.activeImages.length > 0) {
                        noOfPanels++;
                        $('#content').append(buildRecordList(
                            'Active Bookings',
                            ['Finish Time', null],
                            [processedBooks.activeImages, processedBooks.activeFinishes, processedBooks.activeRefs]
                        ));
                    }
                    if (processedBooks.futureImages.length > 0) {
                        noOfPanels++;
                        $('#content').append(buildRecordList(
                            'Future Bookings',
                            ['Start Time', null],
                            [ processedBooks.futureImages, processedBooks.futureStarts, processedBooks.futureFinishes ]
                        ));
                    }
                    if (noOfPanels == 0) {
                        $('#content').append(buildListPanel(
                            'Booking Summary',
                            ['If you have any bookings that are yet to be completed, they will appear here.',
                                "If you have completed bookings, they will not show here. However, you may view them by choosing 'My Bookings' in the top menu."],
                            [null, null]
                        ));
                    }
                    // Add a panel for any vehicles which haven't been reviewed
                    doActionAsync('listPendingReviews');
                },
                function (jqHXR, status) {
                    pendingError = 'Failed to retrieve your booking data.';
                    showPendingError();
                }
            );
        case 'displayAllBookings':
            $('#content').html('');
            return sendRequestAsync(
                'GET',
                '/booking/bookings/' + localStorage.memberNo,
                {},
                function (data) {
                    // Sort bookings into current ones, future ones, and fully completed ones
                    processedBooks = {
                        activeImages: [], activeFinishes: [], activeRefs: [],
                        futureImages: [], futureStarts: [], futureFinishes: [],
                        completeImages: [], completeModels: [], completeFinishes: []
                    };
                    books = data.bookings;
                    len = books.length;
                    for (i = 0; i < len; i++) {
                        book = books[i];
                        if (book.Actual_Return_Date != null) {
                            // Note completed bookings
                            processedBooks.completeImages.push(arrVehicleTypeImages[parseInt(book.Type_Id) - 1]);
                            processedBooks.completeModels.push(book.Make + ' ' + book.Model);
                            processedBooks.completeFinishes.push(book.Actual_Return_Date);
                        }
                        else {
                            // Note future bookings
                            if (moment().isBefore(book.Start_Date)) {
                                processedBooks.futureImages.push(arrVehicleTypeImages[parseInt(book.Type_Id) - 1]);
                                processedBooks.futureStarts.push(book.Start_Date);
                                processedBooks.futureFinishes.push(['Edit', 'javascript:navigate("editBooking", {"bookingNo": ' + book.Booking_No + '});']);
                            }
                            // Note current bookings
                            else {
                                processedBooks.activeImages.push(arrVehicleTypeImages[parseInt(book.Type_Id) - 1]);
                                processedBooks.activeFinishes.push(book.Return_Date);
                                processedBooks.activeRefs.push(['Finish', 'javascript:navigate("completeBooking", {"bookingNo": ' + book.Booking_No + ', "regoNo": "' + book.Rego_No + '"});']);
                            }
                        }
                    }
                    // Build content panels with the sorted data
                    var noOfPanels = 0;
                    if (processedBooks.activeImages.length > 0) {
                        noOfPanels++;
                        $('#content').append(buildRecordList(
                            'Active Bookings',
                            ['Finish Time', null],
                            [processedBooks.activeImages, processedBooks.activeFinishes, processedBooks.activeRefs]
                        ));
                    }
                    if (processedBooks.futureImages.length > 0) {
                        noOfPanels++;
                        $('#content').append(buildRecordList(
                            'Future Bookings',
                            ['Start Time', null],
                            [processedBooks.futureImages, processedBooks.futureStarts, processedBooks.futureFinishes]
                        ));
                    }
                    if (processedBooks.completeImages.length > 0) {
                        noOfPanels++;
                        $('#content').append(buildRecordList(
                            'Completed Bookings',
                            ['Model', 'Return Date'],
                            [processedBooks.completeImages, processedBooks.completeModels, processedBooks.completeFinishes]
                        ));
                    }
                    if (noOfPanels == 0) {
                        $('#content').append(buildListPanel(
                            'Booking List',
                            ['All bookings you make will appear here.',
                                'To make your first booking, press the plus '+' button at the top of the page.'],
                            [null, null]
                        ));
                    }
                    // Add a panel for any vehicles which haven't been reviewed
                    doActionAsync('listPendingReviews');
                },
                function (jqHXR, status) {
                    pendingError = 'Failed to retrieve your booking data.';
                    showPendingError();
                }
            );
        case 'listPendingReviews':
            return sendRequestAsync(
                'GET',
                '/vehicle/review/pending/' + localStorage.memberNo,
                {},
                function (data) {
                    // Load these vehicles into arrays
                    processedBooks = {
                        pendingImages: [], pendingFinished: [], pendingLinks: []
                    };
                    books = data.vehicles;
                    len = books.length;
                    for (i = 0; i < len; i++) {
                        book = books[i];
                        processedBooks.pendingImages.push(arrVehicleTypeImages[parseInt(book.Type_Id) - 1]);
                        processedBooks.pendingFinished.push(book.Latest_Return);
                        processedBooks.pendingLinks.push(['Review', 'javascript:navigate("leaveReview", {"regoNo": "' + book.Rego_No + '"});']);
                    }
                    // Show this in a panel
                    if (len > 0) {
                        $('#content').prepend(buildRecordList(
                            'Vehicles Awaiting Review',
                            ['Booking Return Date', null],
                            [processedBooks.pendingImages, processedBooks.pendingFinished, processedBooks.pendingLinks]
                        ));
                    }
                    else {
                        $('#content').prepend(buildListPanel(
                            'Unreviewed Vehicles',
                            ['You have no vehicles waiting to be reviewed.'],
                            [null]
                        ));
                    }
                },
                function (jqHXR, status) {
                    pendingError = 'Failed to retrieve your review data.';
                    showPendingError();
                }
            );
        case 'newBookingForm':
            $('#content').html('');
            $('#content').append(buildForm(
                'Booking', 'Enter details of the booking.',
                ['Vehicle', 'Start Date', 'Start Time', 'Finish Date', 'Finish Time', 'Notes'],
                ['combo', 'date', 'date', 'date', 'date', 'text'],
                ['txtVehicle', 'txtStartDate', 'txtStartTime', 'txtFinishDate', 'txtFinishTime', 'txtNotes'],
                'Submit',
                'javascript:doActionAsync("submitBooking");'
            ));
            var now = moment();
            $("#txtStartDate").datetimepicker({ format: "YYYY-MM-DD", useCurrent: false, defaultDate: now });
            $("#txtStartTime").datetimepicker({ format: "HH:mm", useCurrent: false, defaultDate: now });
            $("#txtFinishDate").datetimepicker({ format: "YYYY-MM-DD", useCurrent: false, defaultDate: now });
            $("#txtFinishTime").datetimepicker({ format: "HH:mm", useCurrent: false, defaultDate: now });
            return sendRequestAsync(
                'GET',
                '/vehicle',
                {},
                function (data) {
                    // Clear the select box
                    $('#txtVehicle').children().remove();
                    // Add each vehicle to the select box
                    books = data.vehicles;
                    len = books.length;
                    for (i = 0; i < len; i++) {
                        book = books[i];
                        get_user = $('<option>', { value: book.Rego_No, text: book.Rego_No + ' - ' + book.Make + ' ' + book.Model + ', ' + book.Colour + ' (' + book.Class + ')' });
                        $('#txtVehicle').append(get_user);
                    }
                },
                function (jqHXR, status) {
                    pendingError = 'Failed to retrieve vehicle information.';
                    showPendingError();
                }
            );
        case 'submitBooking':
            // Get fields
            bookRego = $('#txtVehicle').val().trim();
            bookStartDate = $('#txtStartDate').val().trim();
            bookStartTime = $('#txtStartTime').val().trim();
            bookEndDate = $('#txtFinishDate').val().trim();
            bookEndTime = $('#txtFinishTime').val().trim();
            bookNotes = $('#txtNotes').val().trim();
            bookClass = $('#txtVehicle option:selected').text();
            bookClass = bookClass.substring(bookClass.length - 6, bookClass.length - 1);
            // Validate fields
            if (bookRego === -1) { pendingError = 'Please select a valid vehicle.'; showPendingError(); return false; }
            if (bookStartDate.length === 0) { pendingError = 'Please enter a last name.'; showPendingError(); return false; }
            if (bookStartTime.length === 0) { pendingError = 'Please enter a street address.'; showPendingError(); return false; }
            if (bookEndDate.length === 0) { pendingError = 'Please enter a suburb.'; showPendingError(); return false; }
            if (bookEndTime.length === 0) { pendingError = 'Please enter a postcode.'; showPendingError(); return false; }
            if (bookNotes.length === 0) bookNotes = null;
            // Check that finish date is after start date, and the start date is after now
            var dateStart = moment(bookStartDate + ' ' + bookStartTime);
            var dateEnd = moment(bookEndDate + ' ' + bookEndTime);
            if (dateStart.isAfter(dateEnd)) { pendingError = 'Finish time must be after start time.'; showPendingError(); return false; }
            if (dateStart.isBefore(moment())) { pendingError = 'Booking must start in the future.'; showPendingError(); return false; }
            // Find number of days and hours between dates, to determine the booking cost
            hours = 0;
            while (dateEnd.isAfter(dateStart)) {
                dateStart.add(1, 'hours');
                hours++;
                if (hours > 240) {
                    pendingError = 'You cannot book a vehicle for more than 10 days.';
                    showPendingError();
                    return false;
                }
            }
            days = Math.floor(hours / 24) + 1;
            // Load the payment form
            $('#content').html('');
            $('#content').append(buildForm(
                'Payment', 'Enter details of the payment.',
                ['Name on card', 'Card number', 'Card expiry date', 'CCV number'],
                ['text', 'text', 'date', 'text'],
                ['txtCardName', 'txtCardNumber', 'txtCardExpiry', 'txtCCV'],
                'Submit',
                'javascript:doActionAsync("submitPayment");'
            ));
            $("#txtCardExpiry").datetimepicker({ format: "YYYY-MM-DD", useCurrent: false, defaultDate: moment() });
            return doActionAsync('loadPaymentForm');
        case 'submitBookingEdit':
            // Get fields
            bookRego = $('#txtVehicle').val().trim();
            bookStartDate = $('#txtStartDate').val().trim();
            bookStartTime = $('#txtStartTime').val().trim();
            bookEndDate = $('#txtFinishDate').val().trim();
            bookEndTime = $('#txtFinishTime').val().trim();
            bookNotes = $('#txtNotes').val().trim();
            bookClass = $('#txtVehicle option:selected').text();
            bookClass = bookClass.substring(bookClass.length - 6, bookClass.length - 1);
            bookAmount = $('#txtAmount').val();
            // Validate fields
            if (bookRego === -1) { pendingError = 'Please select a valid vehicle.'; showPendingError(); return false; }
            if (bookStartDate.length === 0) { pendingError = 'Please enter a last name.'; showPendingError(); return false; }
            if (bookStartTime.length === 0) { pendingError = 'Please enter a street address.'; showPendingError(); return false; }
            if (bookEndDate.length === 0) { pendingError = 'Please enter a suburb.'; showPendingError(); return false; }
            if (bookEndTime.length === 0) { pendingError = 'Please enter a postcode.'; showPendingError(); return false; }
            if (bookNotes.length === 0) bookNotes = null;
            if (bookAmount.length === 0) { pendingError = 'Amount paid has not been loaded.'; showPendingError(); return false; }
            // Check that finish date is after start date, and the start date is after now
            var dateStart = moment(bookStartDate + ' ' + bookStartTime);
            var dateEnd = moment(bookEndDate + ' ' + bookEndTime);
            if (dateStart.isAfter(dateEnd)) { pendingError = 'Finish time must be after start time.'; showPendingError(); return false; }
            if (dateStart.isBefore(moment())) { pendingError = 'Booking must start in the future.'; showPendingError(); return false; }
            // Find number of days and hours between dates, to determine the booking cost
            hours = 0;
            while (dateEnd.isAfter(dateStart)) {
                dateStart.add(1, 'hours');
                hours++;
                if (hours > 240) {
                    pendingError = 'You cannot book a vehicle for more than 10 days.';
                    showPendingError();
                    return false;
                }
            }
            days = Math.floor(hours / 24) + 1;
            // Calculate value of booking and check that it has been paid for
            return doActionAsync('validateBookingEdit');
        case 'loadPaymentForm':
            // Fill in calculated cost, based on membership type
            return sendRequestAsync(
                'GET',
                '/membership/type/' + localStorage.memberNo,
                {},
                function (data) {
                    var hourlyRate = 0.0, dailyRate = 0.0;
                    if (bookClass === 'Large') {
                        hourlyRate = data.LargeVch_HrRate;
                        dailyRate = data.LargeVch_Dly_Rate;
                    }
                    else if (bookClass === 'Small') {
                        hourlyRate = data.SmallVch_HrRate;
                        dailyRate = data.SmallVch_Dly_Rate;
                    }
                    else {
                        pendingError = "'" + bookClass + "' is not a valid vehicle class.";
                        showPendingError();
                        return;
                    }
                    payTotal = days * (dailyRate + 10) + hours * hourlyRate;
                    $('#content').prepend(buildListPanel(
                        'Payment Summary',
                        [days + ' days at $' + dailyRate + ' per day',
                        hours + ' hours at $' + hourlyRate + ' per hour',
                            'Insurance charged at $10 per day',
                        'Total payable amount including 10% GST of $' + payTotal],
                        [null, null, null, null]
                    ));
                },
                function (jqXHR, status) {
                    pendingError = 'Failed to retrieve membership rates.';
                    navigate('start');
                }
            );
        case 'validateBookingEdit':
            // Find calculated cost, based on membership type
            return sendRequestAsync(
                'GET',
                '/membership/type/' + localStorage.memberNo,
                {},
                function (data) {
                    var hourlyRate = 0.0, dailyRate = 0.0;
                    if (bookClass === 'Large') {
                        hourlyRate = data.LargeVch_HrRate;
                        dailyRate = data.LargeVch_Dly_Rate;
                    }
                    else if (bookClass === 'Small') {
                        hourlyRate = data.SmallVch_HrRate;
                        dailyRate = data.SmallVch_Dly_Rate;
                    }
                    else {
                        pendingError = "'" + bookClass + "' is not a valid vehicle class.";
                        showPendingError();
                        return;
                    }
                    payTotal = days * (dailyRate + 10) + hours * hourlyRate;
                    // Disallow bookings that are more valuable than what money is already down (further payments are NOT allowed)
                    if (payTotal - 0.1 > bookAmount) {
                        if ($('#content').children().length > 1)
                            $('#content').children().first().remove();
                        $('#content').prepend(buildListPanel(
                            'Booking Too Expensive',
                            [
                                days + ' days at $' + dailyRate + ' per day',
                                hours + ' hours at $' + hourlyRate + ' per hour',
                                'Insurance charged at $10 per day',
                                'Total booking value including 10% GST of $' + payTotal,
                                'You have only paid $' + bookAmount + '. Cannot save these changes',
                                'Return to dashboard'
                            ],
                            [null, null, null, null, null, 'javascript:navigate("start");']
                        ));
                    }
                    // Summarise booking changes where the booking is within the money already down
                    else {
                        $('#content').html('');
                        $('#content').prepend(buildListPanel(
                            'Payment Summary',
                            [
                                days + ' days at $' + dailyRate + ' per day',
                                hours + ' hours at $' + hourlyRate + ' per hour',
                                'Insurance charged at $10 per day',
                                'Total payable amount including 10% GST of $' + payTotal,
                                'You have paid $' + bookAmount,
                                'Update booking'
                            ],
                            [null, null, null, null, null, 'javascript:doActionAsync("finaliseBookingEdit");']
                        ));
                    }
                },
                function (jqXHR, status) {
                    pendingError = 'Failed to retrieve membership rates.';
                    navigate('start');
                }
            );
        case 'submitPayment':
            // Get fields
            var payCardName = $('#txtCardName').val().trim();
            var payCardNumber = $('#txtCardNumber').val().trim();
            var payCardExpiry = $('#txtCardExpiry').val().trim();
            var payCCV = $('#txtCCV').val().trim();
            // Validate fields
            if (payCardName.length === 0) { pendingError = 'Please enter the name on the card.'; showPendingError(); $('#txtCardName').focus(); return false; }
            if (payCardNumber.length === 0) { pendingError = 'Please enter the number of the card.'; showPendingError(); $('#txtCardNumber').focus(); return false; }
            if (payCardExpiry.length === 0) { pendingError = 'Please enter the expiry date of your cards.'; showPendingError(); return false; }
            if (payCCV.length !== 3) { pendingError = 'Please enter a 3-digit CCV. This should be on the reverse side of your card.'; showPendingError(); return false; }
            // Submit the payment
            return sendRequestAsync(
                'POST',
                '/payment',
                {
                    memberID: localStorage.memberNo,
                    paymentType: 'Credit',
                    amount: payTotal,
                    cardName: payCardName,
                    cardNo: payCardNumber,
                    cardExp: payCardExpiry,
                    ccv: payCCV,
                    authCode: 'ABC'
                },
                function (data) {
                    if (data.err != null) {
                        pendingError = 'Payment could not be processed.';
                        showPendingError();
                        return;
                    }
                    bookPayNo = data.paymentNo;
                    // Get the vehicle odometer reading
                    sendRequestAsync(
                        'GET',
                        '/vehicle/' + bookRego,
                        {},
                        function (data) {
                            if (data.err != null) {
                                pendingError = 'The booking could not be entered, and the vehicle updated, though the payment was processed and cannot be undone. Please contact staff to arrange a refund.';
                                showPendingError();
                                return;
                            }
                            // With the payment saved (and the payment number obtained), and the current odometer reading accessible, SAVE THE BOOKING
                            sendRequestAsync(
                                'POST',
                                '/booking',
                                {
                                    regoNo: bookRego,
                                    memberID: localStorage.memberNo,
                                    startDateTime: bookStartDate + ' ' + bookStartTime,
                                    returnDateTime: bookEndDate + ' ' + bookEndTime,
                                    startKlm: data.Odo_Reading,
                                    paymentNo: bookPayNo,
                                    notes: bookNotes,
                                    fuelFee: 0,
                                    insuranceFee: 10 * days,
                                    totalExGST: payTotal * 0.90909090909090,
                                    gstAmount: payTotal * 0.09090909090909
                                },
                                function (data) {
                                    if (data.err == null || data.err !== 0) {
                                        pendingError = 'The booking could not be entered, though the payment was processed and cannot be undone. Please contact staff to arrange a refund.';
                                        navigate('bookings');
                                        return;
                                    }
                                    pendingError = 'Booking successful.';
                                    pendingErrorMightBringHappiness = true;
                                    navigate('bookings');
                                },
                                function (jqHXR, status) {
                                    pendingError = 'The booking attempt failed, though the payment was processed and cannot be undone. Please contact staff to arrange a refund.';
                                    navigate('bookings');
                                }
                            );
                        },
                        function (jqHXR, status) {
                            pendingError = 'The booking could not be entered, though the payment was processed and cannot be undone. Please contact staff to arrange a refund\nAttempt to retrieve vehicle record failed.';
                            navigate('bookings');
                        }
                    );
                },
                function (jqXHR, status) {
                    pendingError = 'Payment for this booking failed.';
                    showPendingError();
                }
            );
        case 'finaliseBookingEdit':
            // Submit the details for the booking
            return sendRequestAsync(
                'PUT',
                '/booking',
                {
                    bookingNo: passID,
                    regoNo: bookRego,
                    startDateTime: bookStartDate + ' ' + bookStartTime,
                    returnDateTime: bookEndDate + ' ' + bookEndTime,
                    notes: bookNotes
                },
                function (data) {
                    pendingError = 'Booking updated.';
                    pendingErrorMightBringHappiness = true;
                    navigate('bookings');
                },
                function (jqXHR, status) {
                    pendingError = 'Booking could not be updated.';
                    navigate('start');
                }
            );
        case 'editBookingForm':
            // Create the booking edit form
            $('#content').html('');
            $('#content').append(buildForm(
                'Booking', 'Enter details of the booking.',
                ['Vehicle', 'Start Date', 'Start Time', 'Finish Date', 'Finish Time', 'Notes', 'Amount Paid'],
                ['combo', 'date', 'date', 'date', 'date', 'text', 'readonly'],
                ['txtVehicle', 'txtStartDate', 'txtStartTime', 'txtFinishDate', 'txtFinishTime', 'txtNotes', 'txtAmount'],
                'Submit',
                'javascript:doActionAsync("submitBookingEdit");'
            ));
            return sendRequestAsync(
                'GET',
                '/vehicle',
                {},
                function (data) {
                    // Clear the select box
                    $('#txtVehicle').children().remove();
                    // Add each vehicle to the select box
                    books = data.vehicles;
                    len = books.length;
                    for (i = 0; i < len; i++) {
                        book = books[i];
                        get_user = $('<option>', { value: book.Rego_No, text: book.Rego_No + ' - ' + book.Make + ' ' + book.Model + ', ' + book.Colour + ' (' + book.Class + ')' });
                        $('#txtVehicle').append(get_user);
                    }
                    // Get the member's bookings again
                    if (sendRequestAsync(
                        'GET',
                        '/booking/bookings/' + localStorage.memberNo,
                        {},
                        function (data) {
                            // Find the current booking
                            var findID = 0;
                            while (findID < data.bookings.length && data.bookings[findID].Booking_No != passID)
                                findID++;
                            if (findID >= data.bookings.length) {
                                pendingError = 'Could not locate booking ' + passID;
                                navigate('start');
                            }
                            else {
                                // Fill out details in the form
                                book = data.bookings[findID];
                                $("#txtStartDate").datetimepicker({ format: "YYYY-MM-DD", useCurrent: false, defaultDate: moment(book.Start_Date) });
                                $("#txtStartTime").datetimepicker({ format: "HH:mm", useCurrent: false, defaultDate: moment(book.Start_Date) });
                                $("#txtFinishDate").datetimepicker({ format: "YYYY-MM-DD", useCurrent: false, defaultDate: moment(book.Return_Date) });
                                $("#txtFinishTime").datetimepicker({ format: "HH:mm", useCurrent: false, defaultDate: moment(book.Return_Date) });
                                $('#txtNotes').val(book.Booking_Notes);
                                $('#txtAmount').val(parseFloat(book.Total_exGST) + parseFloat(book.GST_Amount));
                                findID = 0;
                                $('#txtVehicle option').each(function () {
                                    this.selected = this.value == book.Rego_No;
                                });
                            }
                        },
                        function (jqHXR, status) {
                            pendingError = 'Failed to retrieve vehicle type information.';
                            showPendingError();
                        }
                    ) == false) {
                        pendingError = 'Failed to pre-fill details of that booking.';
                        showPendingError();
                    }
                },
                function (jqHXR, status) {
                    pendingError = 'Failed to retrieve vehicle information.';
                    showPendingError();
                }
            );
		case 'fillVehicleList':
			return sendRequestAsync(
                'GET',
                '/vehicletype',
                {},
                function (data) {
                    // Clear the select box
                    $('#txtVehicleType').children().remove();
                    // Add each vehicle to the select box
                    books = data.vehicle_types;
                    len = books.length;
                    for (i = 0; i < len; i++) {
                        book = books[i];
                        get_user = $('<option>', { value: book.Type_Id, text: book.Type_Id + ' - ' + book.Make + ' ' + book.Model + ', ' + book.Colour + ' (' + book.Class + ')' });
                        $('#txtVehicleType').append(get_user);
                    }
                },
                function (jqHXR, status) {
                    pendingError = 'Failed to retrieve vehicle type information.';
                    showPendingError();
                }
            );
        case 'listVehiclesOfType':
            bookClass = $('#txtVehicleType').val();
            bookNotes = $('#txtVehicleType option:selected').text();
            if (bookClass == '-1') return false;
            $('#content').html('');
            return sendRequestAsync(
                'GET',
                '/vehicle/type/' + bookClass,
                {},
                function (data) {
                    // Check if an error was returned
                    if (data.err != null) {
                        pendingError = 'Could not get the vehicle list.';
                        navigate('start');
                    }
                    // Get the data and put in arrays
                    books = data.vehicles;
                    len = books.length;
                    processedBooks = {
                        images: [], locations: [], refs: []
                    };
                    for (i = 0; i < len; i++) {
                        book = books[i];
                        processedBooks.images.push(arrVehicleTypeImages[parseInt(book.Type_Id) - 1]);
                        processedBooks.locations.push(book.Street_Address + ', ' + book.Suburb);
                        if (book.Date_Disposed != null) processedBooks.refs.push(['(Unavailable)', 'javascript:;']);
                        else processedBooks.refs.push(['Book', 'javascript:navigate("bookVehicleOfType",{rego: "' + book.Rego_No + '", display: "' + book.Make + ' ' + book.Model + ' (' + book.Class + ')"});']);
                    }
                    // Display form
                    $('#content').append(buildRecordList(
                        'Vehicles of Type: ' + bookNotes,
                        ['Current Location', null],
                        [
                            processedBooks.images,
                            processedBooks.locations,
                            processedBooks.refs
                        ]
                    ));
                },
                function (jqHXR, status) {
                    pendingError = 'Failed to retrieve vehicle type information.';
                    showPendingError();
                }
            );
        case 'fillBookingList':
            if (localStorage.memberNo)
                return sendRequestAsync(
                    'GET',
                    '/booking/bookings/' + localStorage.memberNo,
                    {},
                    function (data) {
                        // Clear the select box
                        $('#txtBookingSelect').children().remove();
                        // Add each booking to the select box
                        books = data.bookings;
                        len = books.length;
                        for (i = 0; i < len; i++) {
                            book = books[i];
                            if (book.Actual_Return_Date != null)
                                get_user = $('<option>', { value: book.Rego_No, text: book.Rego_No + ' - ' + book.Make + ' ' + book.Model + ' (returned ' + book.Actual_Return_Date.substring(0, 10) + ')' });
                            else
                                get_user = $('<option>', { value: book.Rego_No, text: book.Rego_No + ' - ' + book.Make + ' ' + book.Model + ' (booked from ' + book.Start_Date.substring(0, 10) + ')' });
                            $('#txtBookingSelect').append(get_user);
                        }
                    },
                    function (jqHXR, status) {
                        pendingError = 'Failed to retrieve booking information.';
                        navigate('start');
                    }
                );
            else return false;
        case 'submitDamageReport':
            // Get text fields and validate
            bookRego = $('#txtBookingSelect').val();
            bookNotes = $('#txtDamageDescription').val();
            if (bookRego.length === 0) { pendingError = 'Registration number is not available.'; navigate('start'); return; }
            if (bookNotes.length === 0) { pendingError = 'Please enter a description of the damage.'; showPendingError(); $('#txtDamageDescription').focus(); return; }
            return sendRequestAsync(
                'POST',
                '/damagereport',
                {
                    regoNo: bookRego,
                    memberID: localStorage.memberNo,
                    feedback: bookNotes
                },
                function (data) {
                    pendingError = 'Thank you for your information.';
                    pendingErrorMightBringHappiness = true;
                    navigate('start');
                },
                function (jqXHR, status) {
                    pendingError = 'Could not process your feedback.';
                    showPendingError();
                }
            );
        case 'postReview':
            // Get text fields and validate
            bookNotes = $('#txtReview').val();
            if (bookNotes.length < 10) { pendingError = 'Please enter longer description of your experience.'; showPendingError(); $('#txtReview').focus(); return; }
            bookAmount = $('#txtRating').val();
            // Do the posting
            return sendRequestAsync(
                'POST',
                '/vehicle/review',
                {
                    regoNo: bookRego,
                    memberID: localStorage.memberNo,
                    rating: bookAmount,
                    feedback: bookNotes
                },
                function (data) {
                    pendingError = 'Thank you for your information.';
                    pendingErrorMightBringHappiness = true;
                    navigate('start');
                },
                function (jqXHR, status) {
                    pendingError = 'Could not process your review.';
                    showPendingError();
                }
            );
        case 'postCompletedBooking':
            // Get text field and validate
            odo = $('#txtOdo').val();
            if (odo.length === 0) { pendingError = 'Please enter the current odometer reading.'; showPendingError(); $('#txtOdo').focus(); return; }
            if (isNaN(odo)) { pendingError = 'Please enter only numeric digits.'; showPendingError(); $('#txtOdo').focus(); return; }
            // Put that update
            return sendRequestAsync(
                'PUT',
                '/booking',
                {
                    bookingNo: book,
                    actualreturnDateTime: moment().format('YYYY-MM-DD HH:mm:ss'),
                    actualReturnKlm: bookAmount
                },
                function (data) {
                    if (sendRequestAsync(
                        'PUT',
                        '/vehicle/odo',
                        {
                            regoNo: bookRego,
                            currentOdo: odo
                        },
                        function (data) {
                            if (data.err === 0) {
                                pendingError = 'Booking completed! Thank you for your business.';
                                pendingErrorMightBringHappiness = true;
                                navigate('start');
                            }
                            else {
                                pendingError = 'Could not finalise the booking.';
                                showPendingError();
                            }
                        },
                        function (jqXHR, status) {
                            pendingError = 'Could not finalise the booking.';
                            showPendingError();
                        }
                    ) == false) {
                        pendingError = 'Booking completed, but vehicle was not updated.';
                        navigate('start');
                    }
                },
                function (jqXHR, status) {
                    pendingError = 'Could not finalise the booking.';
                    showPendingError();
                }
            );
        case 'mapStuff':
            // Don't do this if a location request is running
            if (locationRequestRunning == true) {
                pendingError = 'Please wait until your location has been found.';
                showPendingError();
                return false;
            }
            // Remove existing markers and panel
            len = markers.length;
            for (i = 0; i < len; i++)
                markers[i].setMap(null);
            markers = [];
            if ($('#pnlLocList'))
                $('#pnlLocList').remove();
            // Find locations in some radius
            return sendRequestAsync(
                'GET',
                '/location',
                {},
                function (data) {
                    processedBooks = {
                        images: [], locations: [], refs: []
                    };
                    // Get desired radius and other variables
                    var radius = parseFloat($('#txtMaxDist').val());
                    useLat = parseFloat(useLat);
                    useLong = parseFloat(useLong);
                    books = data.locations;
                    len = books.length;
                    for (i = 0; i < len; i++) {
                        book = books[i];
                        // Find distance away in latitude and longitude components
                        dx = (useLong - book.Longitude) * 111.2 * Math.cos(useLat * Math.PI);
                        dy = (useLat - book.Latitude) * 111.2;
                        if ((dx * dx + dy * dy) < (radius * radius)) {
                            // Add marker to the map if it's near enough, and give it a click event listener
                            var newMarker = new google.maps.Marker({
                                position: { lat: parseFloat(book.Latitude), lng: parseFloat(book.Longitude) },
                                map: map
                            });
                            var refString = 'navigate("getLocationVehicles",{"locID": ' + book.Location_Id + ', "addr": "' + book.Street_Address + ', ' + book.Suburb + '"});';
                            eval("newMarker.addListener('click', function () { eval('" + refString + "'); });");
                            markers.push(newMarker);
                            // Push details into the form builder object
                            processedBooks.images.push('good_loc.png');
                            processedBooks.locations.push(book.Street_Address + ', ' + book.Suburb);
                            processedBooks.refs.push([
                                'View',
                                'javascript:navigate("getLocationVehicles",{"locID": ' + book.Location_Id + ', "addr": "' + book.Street_Address + ', ' + book.Suburb + '"});'
                            ]);
                        }
                    }
                    // Display form
                    if (processedBooks.images.length > 0) {
                        $('#content').append(buildRecordList(
                            'Nearby Locations',
                            ['Address', null],
                            [
                                processedBooks.images,
                                processedBooks.locations,
                                processedBooks.refs
                            ]
                        ).prop('id', 'pnlLocList'));
                    }
                    else
                        $('#content').append(buildListPanel('Nearby Locations', ['No locations found within that range.'], [null]));
                },
                function (jqXHR, status) {
                    pendingError = 'Could not retrieve location informations.';
                    showPendingError();
                }
            );
        case 'loadVehiclesAtPlace':
            return sendRequestAsync(
                'GET',
                '/vehicle',
                {},
                function (data) {
                    // Load these vehicles into arrays
                    processedBooks = {
                        pendingImages: [], pendingModels: [], refs: []
                    };
                    books = data.vehicles;
                    len = books.length;
                    var found = 0;
                    for (i = 0; i < len; i++) {
                        book = books[i];
                        if (book.Location_Id != bookClass)
                            continue;
                        found++;
                        processedBooks.pendingImages.push(arrVehicleTypeImages[parseInt(book.Type_Id) - 1]);
                        processedBooks.pendingModels.push(book.Make + ' ' + book.Model);
                        if (book.Date_Disposed != null) processedBooks.refs.push(['(Unavailable)', 'javascript:;']);
                        else processedBooks.refs.push(['Book', 'javascript:navigate("bookVehicleOfType",{rego: "' + book.Rego_No + '", display: "' + book.Make + ' ' + book.Model + ' (' + book.Class + ')"});']);
                    }
                    // Display the arrays in tabular form
                    if (found > 0) {
                        $('#content').append(buildRecordList(
                            'Vehicles at ' + bookNotes,
                            ['Model', null],
                            [processedBooks.pendingImages, processedBooks.pendingModels, processedBooks.refs]
                        ));
                    }
                    else {
                        $('#content').append(buildListPanel(
                            'Vehicles at ' + bookNotes,
                            ['There are no vehicles at this location.'],
                            [null]
                        ));
                    }
                },
                function (jqHXR, status) {
                    pendingError = 'Failed to retrieve vehicle information.';
                    showPendingError();
                }
            );
    }
}

// Send an AJAX request using a standard form of the jQuery ajax() call
function sendRequestAsync(method, urlExt, dataObject, fnDone, fnFail) {
	if (ajaxRequestRunning) {
        pendingError = 'Previous request is still running.';
        showPendingError();
		return false;
	}
    ajaxRequestRunning = true;
    $('#imgCar').attr('src', 'images/car_dynamic.gif');
	$.ajax
		({
			type: method,
			contentType: 'application/json',
			timeout: ajaxTimeout,
			url: rootURL + urlExt,
			dataType: 'json',
			data: JSON.stringify(dataObject)
		})
		.always(function() {
            ajaxRequestRunning = false;
            $('#imgCar').attr('src', 'images/car_static.gif');
		})
		.done(fnDone)
        .fail(fnFail);
    return true;
}

// Remove all login information from local storage
function removeLoginData() {

    isLoggedIn = false;

    localStorage.removeItem('user');
    localStorage.removeItem('authKey');
    localStorage.removeItem('memberNo');
    localStorage.removeItem('name');

}

// Check if there's an error message to post
function showPendingError() {
    if (pendingError != null) {
        if (errorPanelIsShowing) {
            $('#errMsg').html(pendingError);
        }
        else {
            // Panel doesn't exist, create it, start reducing it after 2 seconds, and remove it after another 0.5 seconds
            $('#content').prepend(buildErrorPanel(pendingError, pendingErrorMightBringHappiness));
            errorPanelIsShowing = true;
            window.setTimeout(function () {
                $('#errPanel').prop('height', 0);
                window.setTimeout(function () {
                    $('#errPanel').remove();
                    errorPanelIsShowing = false;
                }, 500);
            }, 2000);
            document.getElementById('errPanel').scrollIntoView();
        }
        pendingError = null;
        pendingErrorMightBringHappiness = false;
    }
}
