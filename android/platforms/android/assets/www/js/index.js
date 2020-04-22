/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/* Page Location */
var page_location = window.location.pathname.split('/').reverse()[0];

/* Email Verification */
var verify_email = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

/* Phone Number Verification*/
var verify_phoneno = /^\d{10}$/;

/* Name Verification */
var verify_name = /^[a-zA-Z-,]+(\s{0,1}[a-zA-Z-, ])*$/;

/* PIN/ZIP Code Verification */
var verify_zip = /^[0-9]{6}$/;

/* API URL */
var curl = 'http://www.terasoltechnologies.com/laundry/web_service.php?method_name=';

/* Toast Timeout */
var toasttimeout;

/* Coupon Price */
var coupon_price = 0;

/* IAP Checker */
var iab_status = false;

var app = {
    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('backbutton', this.backkeypress, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        console.log("app-ready");
    },

    backkeypress: function () {
        if (page_location == 'start.html' || page_location == 'home.html') {
            navigator.app.exitApp();
        } else {
            window.history.back();
        }
    }
};

app.initialize();

/*------------------------ Custom Alert ------------------------*/

function custom_alert(message, click_function) {
    document.getElementById('popup').style.display = 'block';
    document.getElementById('popup-text').innerText = message;
    document.getElementById('popup').addEventListener('click', function () {
        document.getElementById('popup').style.display = 'none';
    });
    document.getElementById('popup').onclick = (click_function) ? click_function : '';
}

/*------------------------ Custom Alert Ends------------------------*/

function toast(message) {
    if (toasttimeout) {
        clearTimeout(toasttimeout);
    }
    document.getElementById('toast').style.display = 'block';
    document.getElementById('toast-message').innerText = message;
    toasttimeout = setTimeout(function () {
        document.getElementById('toast').style.display = 'none';
    }, 1000);
}

function begin() {
    window.localStorage.setItem('package_purchase', '');
    window.localStorage.setItem('cart_count', '0');
    window.localStorage.setItem('packages', '');
    window.localStorage.setItem('prices', '');
    window.localStorage.setItem('profile', '');
    setTimeout(function () {
        if (window.localStorage.getItem('uid') == '' || window.localStorage.getItem('uid') == null) {
            window.location = 'start.html';
        } else {
            window.location = 'home.html';
        }
    }, 3000);
}

function check_availability() {
    var pin = document.getElementById('pin').value;

    if (!pin.match(verify_zip)) {
        custom_alert('Please enter valid PIN/ZIP Code', function () {
            document.getElementById('pin').focus();
        });
    } else {
        document.getElementById('loading').style.display = 'block';
        var xmlhttp = new XMLHttpRequest();
        //monitor response
        xmlhttp.onreadystatechange = function () {
            //alert(xmlhttp.responseText);
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var response = JSON.parse(xmlhttp.responseText);
                if (response.data != "") {
                    if (response.data.success == true) {
                        custom_alert(response.data.message, function () {
                            window.location = 'login.html';
                        });
                    } else {
                        custom_alert(response.data.message);
                    }
                } else {
                    custom_alert('Not Available');
                }
                document.getElementById('loading').style.display = 'none';
            } else if (xmlhttp.status == 404 || (xmlhttp.readyState == 4 && xmlhttp.status == 0)) {
                custom_alert('Network Error! Check Network Settings');
                document.getElementById('loading').style.display = 'none';
            }
        }
        xmlhttp.open('POST', curl + 'check_availability', true);
        xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xmlhttp.send('pin_code=' + pin);
    }
}

function login() {
    var phone = document.getElementById('phone').value;
    var password = document.getElementById('password').value;

    if (!phone.match(verify_phoneno)) {
        custom_alert('Please enter a phone number', function () {
            document.getElementById('phone').focus();
        });
    } else {
        if (password.length < 6) {
            custom_alert('Password must have minimum 6 characters', function () {
                document.getElementById('password').focus();
            });
        } else {
            document.getElementById('loading').style.display = 'block';
            var xmlhttp = new XMLHttpRequest();
            //monitor response
            xmlhttp.onreadystatechange = function () {
                //alert(xmlhttp.responseText);
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    var response = JSON.parse(xmlhttp.responseText);
                    if (response.data != "") {
                        if (response.data.success == true) {
                            window.localStorage.setItem('uid', response.data.uid);
                            custom_alert(response.data.message, function () {
                                window.location = 'home.html';
                            });
                        } else {
                            custom_alert(response.data.message);
                        }
                    } else {
                        custom_alert('Incorrect Login Credentials');
                    }
                    document.getElementById('loading').style.display = 'none';
                } else if (xmlhttp.status == 404 || (xmlhttp.readyState == 4 && xmlhttp.status == 0)) {
                    custom_alert('Network Error! Check Network Settings');
                    document.getElementById('loading').style.display = 'none';
                }
            }
            xmlhttp.open('POST', curl + 'login', true);
            xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xmlhttp.send('phone_number=' + phone + '&password=' + password);
        }
    }
}

function signup() {
    var name = document.getElementById('name').value;
    var email = document.getElementById('email').value;
    var phone = document.getElementById('phone').value;
    var password = document.getElementById('password').value;

    if (!(name.match(verify_name)) || name.length < 3) {
        custom_alert('Please enter correct Full Name.', function () {
            document.getElementById('name').focus();
        });
    } else {
        if (!(email.match(verify_email))) {
            custom_alert('Please provide a valid email ID', function () {
                document.getElementById('email').focus();
            })
        } else {
            if (!(phone.match(verify_phoneno))) {
                custom_alert('Please enter valid phone number', function () {
                    document.getElementById('phone').focus();
                });
            } else {
                if (password.length < 6) {
                    custom_alert('Password must have minimum 6 characters', function () {
                        document.getElementById('password').focus();
                    });
                } else {
                    document.getElementById('loading').style.display = 'block';
                    var xmlhttp = new XMLHttpRequest();
                    //monitor response
                    xmlhttp.onreadystatechange = function () {
                        //alert(xmlhttp.responseText);
                        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                            var response = JSON.parse(xmlhttp.responseText);
                            if (response.data != "") {
                                if (response.data.success == true) {
                                    custom_alert(response.data.message, function () {
                                        window.history.back();
                                    });
                                } else {
                                    custom_alert(response.data.message);
                                }
                            } else {
                                custom_alert('Error! Please try again later');
                            }
                            document.getElementById('loading').style.display = 'none';
                        } else if (xmlhttp.status == 404 || (xmlhttp.readyState == 4 && xmlhttp.status == 0)) {
                            custom_alert('Network Error! Check Network Settings');
                            document.getElementById('loading').style.display = 'none';
                        }
                    }
                    xmlhttp.open('POST', curl + 'sign_up', true);
                    xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                    xmlhttp.send('name=' + name + '&email=' + email + '&phone_number=' + phone + '&password=' + password);
                }
            }
        }
    }
}

function resetpassword() {
    var email = document.getElementById('email').value;
    var phone = document.getElementById('phone').value;

    if (!email.match(verify_email)) {
        custom_alert('Please enter valid email ID', function () {
            document.getElementById('email').focus();
        });
    } else {
        if (!(phone.match(verify_phoneno))) {
            custom_alert('Please enter correct phone number', function () {
                document.getElementById('phone').focus();
            });
        } else {
            document.getElementById('loading').style.display = 'block';
            var xmlhttp = new XMLHttpRequest();
            //monitor response
            xmlhttp.onreadystatechange = function () {
                //alert(xmlhttp.responseText);
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    var response = JSON.parse(xmlhttp.responseText);
                    if (response.data != "") {
                        if (response.data.success == true) {
                            custom_alert(response.data.message, function () {
                                window.history.back();
                            });
                        } else {
                            custom_alert(response.data.message);
                        }
                    } else {
                        custom_alert('Error! Try agin later');
                    }
                    document.getElementById('loading').style.display = 'none';
                } else if (xmlhttp.status == 404 || (xmlhttp.readyState == 4 && xmlhttp.status == 0)) {
                    custom_alert('Network Error! Check Network Settings');
                    document.getElementById('loading').style.display = 'none';
                }
            }
            xmlhttp.open('POST', curl + 'forgot_password', true);
            xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xmlhttp.send('email=' + email);
        }
    }
}

function load_packages() {
    if (window.localStorage.getItem('packages') == '') {
        document.getElementById('loading').style.display = 'block';
        var xmlhttp = new XMLHttpRequest();
        //monitor response
        xmlhttp.onreadystatechange = function () {
            //alert(xmlhttp.responseText);
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var response = JSON.parse(xmlhttp.responseText);
                if (response != "") {
                    if (response.success == true) {
                        window.localStorage.setItem('packages', xmlhttp.responseText);
                        show_packages();
                    } else {
                        custom_alert(response.data.message);
                    }
                } else {
                    custom_alert('Error! Try agin later');
                }
                document.getElementById('loading').style.display = 'none';
            } else if (xmlhttp.status == 404 || (xmlhttp.readyState == 4 && xmlhttp.status == 0)) {
                custom_alert('Network Error! Check Network Settings');
                document.getElementById('loading').style.display = 'none';
            }
        }
        xmlhttp.open('POST', curl + 'package_list', true);
        xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xmlhttp.send();
    } else {
        show_packages();
    }
}

function show_packages() {
    var res = JSON.parse(window.localStorage.getItem('packages'));
    var show_data = '';
    for (var i = 0; i < res.data.length; i++) {
        if (res.data[i].ptype == '1') {
            show_data += '<div class="package-detail">' +
                            '<div class="package-detail-element"><img style="background-image:url(\'img/default.jpg\')" src="img/demo.png"/></div>' +
                            '<div class="package-detail-element">' + ((res.data[i].package_name != null && res.data[i].package_name != 'null')?res.data[i].package_name:'') + '</div>' +
                            '<div class="package-detail-element" style="font-size:75%">Get ' + res.data[i].weight + ' For ' + res.data[i].validity + '</div>' +
                            '<div class="package-detail-element">&#x20B9 ' + res.data[i].price + '</div>' +
                            '<div class="package-detail-element" onclick="buypackage(\'' + res.data[i].id + '\')"><p>Buy</p></div>' +
                        '</div>';
            //show_data += '<div class="package-details">' +
            //                '<div class="package-details-element">' + res.data[i].package_name + '</div>' +
            //                '<div class="package-details-element">You Get- ' + res.data[i].weight + '<br/>Validity- ' + res.data[i].validity + '<br/>' + res.data[i].unit + '</div>' +
            //                '<div class="package-details-element" onclick="buypackage(\'' + res.data[i].id + '\')">Rs. ' + res.data[i].price + '<br /><img src="img/shop_icon_row.png" /></div>' +
            //            '</div>';
        }
    }
    document.getElementById('page-data').innerHTML = show_data;
}

function buypackage(id) {
    window.localStorage.setItem('package_purchase', id);
    window.location = 'checkout.html';
}

function change_package_type() {
    var res = JSON.parse(window.localStorage.getItem('packages'));
    var show_data = '';
    for (var i = 0; i < res.data.length; i++) {
        if (res.data[i].ptype == document.getElementById('package_type').value) {
            show_data += '<div class="package-detail">' +
                            '<div class="package-detail-element"><img style="background-image:url(\'img/default.jpg\')" src="img/demo.png"/></div>' +
                            '<div class="package-detail-element">' + ((res.data[i].package_name != null && res.data[i].package_name != 'null') ? res.data[i].package_name : '') + '</div>' +
                            '<div class="package-detail-element" style="font-size:75%">Get ' + res.data[i].weight + ' For ' + res.data[i].validity + '</div>' +
                            '<div class="package-detail-element">&#x20B9 ' + res.data[i].price + '</div>' +
                            '<div class="package-detail-element" onclick="buypackage(\'' + res.data[i].id + '\')"><p>Buy</p></div>' +
                        '</div>';
            //show_data += '<div class="package-details">' +
            //                '<div class="package-details-element">' + res.data[i].package_name + '</div>' +
            //                '<div class="package-details-element">You Get- ' + res.data[i].weight + '<br/>Validity- ' + res.data[i].validity + '<br/>' + res.data[i].unit + '</div>' +
            //                '<div class="package-details-element" onclick="buypackage(\'' + res.data[i].id + '\')">Rs. ' + res.data[i].price + '<br /><img src="img/shop_icon_row.png" /></div>' +
            //            '</div>';
        }
    }
    document.getElementById('page-data').innerHTML = show_data;
}

function change_price_type() {
    var res = JSON.parse(window.localStorage.getItem('prices'));
    var show_data = '';
    for (var i = 0; i < res.data.length; i++) {
        if (res.data[i].cname == document.getElementById('price_type').value) {
            show_data += '<div class="package-detail">' +
                            '<div class="package-detail-element"><img style="background-image:url(\'' + res.data[i].image_path + '\')" src="img/demo.png"/></div>' +
                            '<div class="package-detail-element">' + res.data[i].pname + '</div>' +
                            '<div class="package-detail-element">&#x20B9 ' + res.data[i].price + '</div>' +
                            '<div class="package-detail-element" onclick="addtocart(\'' + res.data[i].id + '\')"><p>Add to Cart</p></div>' +
                        '</div>';
            //show_data += '<div class="package-details">' +
            //            '<div class="package-details-element"><img style="display:block; width:60%; margin:0 auto;" src="' + res.data[i].image_path + '"/></div>' +
            //            '<div class="package-details-element">' + res.data[i].pname + '</div>' +
            //            '<div class="package-details-element" onclick="addtocart(\'' + res.data[i].id + '\')">Rs. ' + res.data[i].price + '<br /><img src="img/shop_icon_row.png" /></div>' +
            //        '</div>';
        }
    }
    document.getElementById('page-data').innerHTML = show_data;
}

function fetch_profile() {
    if (window.localStorage.getItem('profile') == '') {
        document.getElementById('loading').style.display = 'block';
        var xmlhttp = new XMLHttpRequest();
        //monitor response
        xmlhttp.onreadystatechange = function () {
            //alert(xmlhttp.responseText);
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var response = JSON.parse(xmlhttp.responseText);
                if (response != "") {
                    if (response.success == true) {
                        window.localStorage.setItem('profile', xmlhttp.responseText);
                    }
                }
                document.getElementById('loading').style.display = 'none';
            } else if (xmlhttp.status == 404 || (xmlhttp.readyState == 4 && xmlhttp.status == 0)) {
                custom_alert('Network Error! Check Network Settings');
                document.getElementById('loading').style.display = 'none';
            }
        }
        xmlhttp.open('POST', curl + 'profile', true);
        xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xmlhttp.send('customer_id=' + window.localStorage.getItem('uid'));
    }
}

function load_prices() {
    if (window.localStorage.getItem('prices') == '') {
        document.getElementById('loading').style.display = 'block';
        var xmlhttp = new XMLHttpRequest();
        //monitor response
        xmlhttp.onreadystatechange = function () {
            //alert(xmlhttp.responseText);
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var response = JSON.parse(xmlhttp.responseText);
                if (response != "") {
                    if (response.success == true) {
                        window.localStorage.setItem('prices', xmlhttp.responseText);
                        fetch_profile();
                        show_prices();
                    } else {
                        custom_alert(response.data.message);
                    }
                } else {
                    custom_alert('Error! Try agin later');
                }
                document.getElementById('loading').style.display = 'none';
            } else if (xmlhttp.status == 404 || (xmlhttp.readyState == 4 && xmlhttp.status == 0)) {
                custom_alert('Network Error! Check Network Settings');
                document.getElementById('loading').style.display = 'none';
            }
        }
        xmlhttp.open('POST', curl + 'priceListByCategory', true);
        xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xmlhttp.send('category_id=1');
    } else {
        show_prices();
    }
}

function show_prices() {
    var res = JSON.parse(window.localStorage.getItem('prices'));
    var show_data = '';
    for (var i = 0; i < res.data.length; i++) {
        if (res.data[i].cname == '1') {
            show_data += '<div class="package-detail">' +
                            '<div class="package-detail-element"><img style="background-image:url(\'' + res.data[i].image_path + '\')" src="img/demo.png"/></div>' +
                            '<div class="package-detail-element">' + res.data[i].pname + '</div>' +
                            '<div class="package-detail-element">&#x20B9 ' + res.data[i].price + '</div>' +
                            '<div class="package-detail-element" onclick="addtocart(\'' + res.data[i].id + '\')"><p>Add to Cart</p></div>' +
                        '</div>';
            //show_data += '<div class="package-details">' +
            //                '<div class="package-details-element"><img style="display:block; width:60%; margin:0 auto;" src="' + res.data[i].image_path + '"/></div>' +
            //                '<div class="package-details-element">' + res.data[i].pname + '</div>' +
            //                '<div class="package-details-element" onclick="addtocart(\'' + res.data[i].id + '\')">Rs. ' + res.data[i].price + '<br /><img src="img/shop_icon_row.png" /></div>' +
            //            '</div>';
        }
    }
    document.getElementById('page-data').innerHTML = show_data;
    window.localStorage.setItem('package_purchase', '');
}

function addtocart(id) {
    var count = parseInt(window.localStorage.getItem('cart_count'));
    var flag = 0;
    if (count != 0) {
        for (var i = 1; i <= count; i++) {
            if (parseInt(window.localStorage.getItem('cart_item_' + i)) == parseInt(id)) {
                window.localStorage.setItem('cart_item_qty_' + i, (parseInt(window.localStorage.getItem('cart_item_qty_' + i)) + 1));
                flag++;
                break;
            }
        }
    }
    if (flag == 0) {
        count++;
        window.localStorage.setItem('cart_count', count);
        window.localStorage.setItem('cart_item_' + count, id);
        window.localStorage.setItem('cart_item_qty_' + count, '1');
    }
    showcartcount();
    toast('Item added to cart');
}

function load_cart() {
    var count = parseInt(window.localStorage.getItem('cart_count'));
    var res = JSON.parse(window.localStorage.getItem('prices'));
    var show_data = '';
    for (var i = 1; i <= count; i++) {
        for (var j = 0; j < res.data.length; j++) {
            if (parseInt(window.localStorage.getItem('cart_item_' + i)) == parseInt(res.data[j].id)) {
                show_data += '<div class="package-details">' +
                                '<div class="package-details-element">' + res.data[j].pname + '</div>' +
                                '<div class="package-details-element">Rs. ' + res.data[j].price + '</div>' +
                                '<div class="package-details-element">' +
                                    '<i onclick="delete_item(\'' + res.data[j].id + '\')" class="fa fa-minus-circle" aria-hidden="true"></i>' +
                                    '<span id="' + res.data[j].id + '">' + window.localStorage.getItem('cart_item_qty_' + i) + '</span>' +
                                    '<i onclick="add_item(\'' + res.data[j].id + '\')" class="fa fa-plus-circle" aria-hidden="true"></i>' +
                                '</div>' +
                            '</div>';
            }
        }
    }
    document.getElementById('page-data').innerHTML = show_data;
    showtotal();
}

function showtotal() {
    var count = parseInt(window.localStorage.getItem('cart_count'));
    var res = JSON.parse(window.localStorage.getItem('prices'));
    var total = 0;
    for (var i = 1; i <= count; i++) {
        for (var j = 0; j < res.data.length; j++) {
            if (parseInt(window.localStorage.getItem('cart_item_' + i)) == parseInt(res.data[j].id)) {
                total += (parseInt(res.data[j].price) * parseInt(window.localStorage.getItem('cart_item_qty_' + i)));
            }
        }
    }
    document.getElementById('total').innerText = 'Rs. ' + total + '.00';
}

function add_item(id) {
    var current_qty = parseInt(document.getElementById(id).innerText);
    var count = parseInt(window.localStorage.getItem('cart_count'));
    if (current_qty < 50) {
        for (var i = 1; i <= count; i++) {
            if (parseInt(window.localStorage.getItem('cart_item_' + i)) == parseInt(id)) {
                window.localStorage.setItem('cart_item_qty_' + i, (parseInt(window.localStorage.getItem('cart_item_qty_' + i)) + 1));
                break;
            }
        }
        document.getElementById(id).innerText = current_qty + 1;
        showtotal();
    }
}

function delete_item(id) {
    var current_qty = parseInt(document.getElementById(id).innerText);
    var count = parseInt(window.localStorage.getItem('cart_count'));
    if (current_qty > 1) {
        for (var i = 1; i <= count; i++) {
            if (parseInt(window.localStorage.getItem('cart_item_' + i)) == parseInt(id)) {
                window.localStorage.setItem('cart_item_qty_' + i, (parseInt(window.localStorage.getItem('cart_item_qty_' + i)) - 1));
                break;
            }
        }
        document.getElementById(id).innerText = current_qty - 1;
        showtotal();
    } else if (current_qty == 1) {
        var choice = confirm('Delete item from cart?');
        if (choice) {
            var pos = -1;
            for (var i = 1; i <= count; i++) {
                if (parseInt(window.localStorage.getItem('cart_item_' + i)) == parseInt(id)) {
                    pos = i;
                    break;
                }
            }
            for (var i = pos; i < count; i++) {
                window.localStorage.setItem('cart_item_' + i, window.localStorage.getItem('cart_item_' + (i + 1)));
                window.localStorage.setItem('cart_item_qty_' + i, window.localStorage.getItem('cart_item_qty_' + (i + 1)));
            }
            window.localStorage.setItem('cart_count', (parseInt(window.localStorage.getItem('cart_count')) - 1));
        }
        location.reload();
    }
}

function showcartcount() {
    var count = parseInt(window.localStorage.getItem('cart_count'));
    var cartcount = 0;
    for (var i = 1; i <= count; i++) {
        cartcount += parseInt(window.localStorage.getItem('cart_item_qty_' + i));
    }
    if (cartcount > 1) {
        document.getElementById('cartcount').innerText = cartcount + ' items';
    } else {
        document.getElementById('cartcount').innerText = cartcount + ' item';
    }
}

function load_profile() {
    if (window.localStorage.getItem('profile') == '') {
        document.getElementById('loading').style.display = 'block';
        var xmlhttp = new XMLHttpRequest();
        //monitor response
        xmlhttp.onreadystatechange = function () {
            //alert(xmlhttp.responseText);
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var response = JSON.parse(xmlhttp.responseText);
                if (response != "") {
                    if (response.success == true) {
                        window.localStorage.setItem('profile', xmlhttp.responseText);
                        show_profile();
                    } else {
                        custom_alert(response.data.message);
                    }
                } else {
                    custom_alert('Error! Try agin later');
                }
                document.getElementById('loading').style.display = 'none';
            } else if (xmlhttp.status == 404 || (xmlhttp.readyState == 4 && xmlhttp.status == 0)) {
                custom_alert('Network Error! Check Network Settings');
                document.getElementById('loading').style.display = 'none';
            }
        }
        xmlhttp.open('POST', curl + 'profile', true);
        xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xmlhttp.send('customer_id=' + window.localStorage.getItem('uid'));
    } else {
        show_profile();
    }
}

function show_profile() {
    var res = JSON.parse(window.localStorage.getItem('profile'));
    document.getElementById('fullname').innerText = res.data.fullname;
    document.getElementById('email').innerText = res.data.email;
    document.getElementById('phone').innerText = res.data.phone;
    if (res.data.address != '') {
        var show_data = '';
        for (var i = 0; i < res.data.address.length; i++) {
            show_data += '<div class="profile-details">' +
                            '<div class="profile-details-element width10">' + (i + 1) + '.</div>' +
                            '<div class="profile-details-element width70">' + res.data.address[i].address + ', ' + res.data.address[i].landmark + ', ' + res.data.address[i].city + ', ' + res.data.address[i].state + ' - ' + res.data.address[i].pin + '</div>' +
                            '<div class="profile-details-element width20">' +
                                //'<i onclick="edit_address(\'' + i + '\')" class="fa fa-pencil-square-o address-edit" aria-hidden="true"></i>' +marginleft10
                                '<i onclick="delete_address(\'' + res.data.address[i].id + '\')" class="fa fa-trash-o address-delete" aria-hidden="true"></i>' +
                            '</div>' +
                        '</div>';
        }
        document.getElementById('page_data').innerHTML = show_data;
    }
}

function save_address() {
    var address = document.getElementById('address').value;
    var landmark = document.getElementById('landmark').value;
    var city = document.getElementById('city').value;
    var state = document.getElementById('state').value;
    var pin = document.getElementById('pin').value;

    if (address.length < 10) {
        custom_alert('Please enter correct Address.', function () {
            document.getElementById('address').focus();
        });
    } else {
        if (landmark.length < 5) {
            custom_alert('Please provide Landmark', function () {
                document.getElementById('landmark').focus();
            });
        } else {
            if (city.length < 3) {
                custom_alert('Please enter City', function () {
                    document.getElementById('city').focus();
                });
            } else {
                if (state.length < 3) {
                    custom_alert('Please enter State', function () {
                        document.getElementById('state').focus();
                    });
                } else {
                    if (!pin.match(verify_zip)) {
                        custom_alert('Please enter correct Pin/Zip Code', function () {
                            document.getElementById('pin').focus();
                        });
                    } else {
                        document.getElementById('loading').style.display = 'block';
                        var xmlhttp = new XMLHttpRequest();
                        //monitor response
                        xmlhttp.onreadystatechange = function () {
                            //alert(xmlhttp.responseText);
                            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                                var response = JSON.parse(xmlhttp.responseText);
                                if (response.data != "") {
                                    if (response.data.success == true) {
                                        custom_alert(response.data.message, function () {
                                            window.localStorage.setItem('profile', '');
                                            window.location = 'profile.html';
                                        });
                                    } else {
                                        custom_alert(response.data.message);
                                    }
                                } else {
                                    custom_alert('Error! Please try again later');
                                }
                                document.getElementById('loading').style.display = 'none';
                            } else if (xmlhttp.status == 404 || (xmlhttp.readyState == 4 && xmlhttp.status == 0)) {
                                custom_alert('Network Error! Check Network Settings');
                                document.getElementById('loading').style.display = 'none';
                            }
                        }
                        xmlhttp.open('POST', curl + 'add_address', true);
                        xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                        xmlhttp.send('uid=' + window.localStorage.getItem('uid') + '&address=' + encodeURIComponent(address) + '&landmark=' + encodeURIComponent(landmark) + '&city=' + encodeURIComponent(city) + '&state=' + encodeURIComponent(state) + '&pin_code=' + pin);
                    }
                }
            }
        }
    }
}

/*function edit_address(id) {
    window.localStorage.setItem('edit_address_id', id);
    window.location = 'editlocation.html';
}

function loadeditaddress() {
    var res = JSON.parse(window.localStorage.getItem('profile'));
    var id = window.localStorage.getItem('edit_address_id');
    document.getElementById('address').value = res.data.address[id].address;
    document.getElementById('landmark').value = res.data.address[id].landmark;
    document.getElementById('city').value = res.data.address[id].city;
    document.getElementById('state').value = res.data.address[id].state;
    document.getElementById('pin').value = res.data.address[id].pin;
}

function update_address() {
    var address = document.getElementById('address').value;
    var landmark = document.getElementById('landmark').value;
    var city = document.getElementById('city').value;
    var state = document.getElementById('state').value;
    var pin = document.getElementById('pin').value;

    if (address.length < 10) {
        custom_alert('Please enter correct Address.', function () {
            document.getElementById('address').focus();
        });
    } else {
        if (landmark.length < 5) {
            custom_alert('Please provide Landmark', function () {
                document.getElementById('landmark').focus();
            });
        } else {
            if (city.length < 3) {
                custom_alert('Please enter City', function () {
                    document.getElementById('city').focus();
                });
            } else {
                if (state.length < 3) {
                    custom_alert('Please enter State', function () {
                        document.getElementById('state').focus();
                    });
                } else {
                    if (!pin.match(verify_zip)) {
                        custom_alert('Please enter correct Pin/Zip Code', function () {
                            document.getElementById('pin').focus();
                        });
                    } else {
                        document.getElementById('loading').style.display = 'block';
                        var xmlhttp = new XMLHttpRequest();
                        //monitor response
                        xmlhttp.onreadystatechange = function () {
                            //alert(xmlhttp.responseText);
                            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                                var response = JSON.parse(xmlhttp.responseText);
                                if (response.data != "") {
                                    if (response.data.success == true) {
                                        custom_alert(response.data.message, function () {
                                            window.localStorage.setItem('profile', '');
                                        });
                                    } else {
                                        custom_alert(response.data.message);
                                    }
                                } else {
                                    custom_alert('Error! Please try again later');
                                }
                                document.getElementById('loading').style.display = 'none';
                            } else if (xmlhttp.status == 404 || (xmlhttp.readyState == 4 && xmlhttp.status == 0)) {
                                custom_alert('Network Error! Check Network Settings');
                                document.getElementById('loading').style.display = 'none';
                            }
                        }
                        xmlhttp.open('POST', curl + 'add_address', true);
                        xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                        xmlhttp.send('uid=' + window.localStorage.getItem('uid') + '&address=' + encodeURIComponent(address) + '&landmark=' + encodeURIComponent(landmark) + '&city=' + encodeURIComponent(city) + '&state=' + encodeURIComponent(state) + '&pin_code=' + pin);
                    }
                }
            }
        }
    }
}*/

function delete_address(id) {
    var choice = confirm('Are you sure, you want to delete address?');
    if (choice) {
        document.getElementById('loading').style.display = 'block';
        var xmlhttp = new XMLHttpRequest();
        //monitor response
        xmlhttp.onreadystatechange = function () {
            //alert(xmlhttp.responseText);
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var response = JSON.parse(xmlhttp.responseText);
                if (response.data != "") {
                    if (response.data.success == true) {
                        window.localStorage.setItem('profile', '');
                        custom_alert(response.data.message, function () {
                            location.reload();
                        });
                    } else {
                        custom_alert(response.data.message);
                    }
                } else {
                    custom_alert('Error! Please try again later');
                }
                document.getElementById('loading').style.display = 'none';
            } else if (xmlhttp.status == 404 || (xmlhttp.readyState == 4 && xmlhttp.status == 0)) {
                custom_alert('Network Error! Check Network Settings');
                document.getElementById('loading').style.display = 'none';
            }
        }
        xmlhttp.open('POST', curl + 'delete_address', true);
        xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xmlhttp.send('address_id=' + id);
    }
}

function loadeditprofile() {
    var res = JSON.parse(window.localStorage.getItem('profile'));
    document.getElementById('name').value = res.data.fullname;
    document.getElementById('email').value = res.data.email;
    document.getElementById('phone').value = res.data.phone;
}

function updateprofile() {
    var name = document.getElementById('name').value;
    var email = document.getElementById('email').value;
    var phone = document.getElementById('phone').value;

    if (!(name.match(verify_name)) || name.length < 3) {
        custom_alert('Please enter correct Full Name.', function () {
            document.getElementById('name').focus();
        });
    } else {
        if (!(email.match(verify_email))) {
            custom_alert('Please provide a valid email ID', function () {
                document.getElementById('email').focus();
            })
        } else {
            if (!(phone.match(verify_phoneno))) {
                custom_alert('Please enter valid phone number', function () {
                    document.getElementById('phone').focus();
                });
            } else {
                document.getElementById('loading').style.display = 'block';
                var xmlhttp = new XMLHttpRequest();
                //monitor response
                xmlhttp.onreadystatechange = function () {
                    //alert(xmlhttp.responseText);
                    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                        var response = JSON.parse(xmlhttp.responseText);
                        if (response.data != "") {
                            if (response.data.success == true) {
                                window.localStorage.setItem('profile', '');
                                custom_alert(response.data.message, function () {
                                    window.history.back();
                                });
                            } else {
                                custom_alert(response.data.message);
                            }
                        } else {
                            custom_alert('Error! Please try again later');
                        }
                        document.getElementById('loading').style.display = 'none';
                    } else if (xmlhttp.status == 404 || (xmlhttp.readyState == 4 && xmlhttp.status == 0)) {
                        custom_alert('Network Error! Check Network Settings');
                        document.getElementById('loading').style.display = 'none';
                    }
                }
                xmlhttp.open('POST', curl + 'update_profile', true);
                xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                xmlhttp.send('customer_id=' + window.localStorage.getItem('uid') + '&name=' + name + '&email=' + email + '&phone=' + phone);
            }
        }
    }
}

function movetocheckout() {
    if (document.getElementById('total').innerText == 'Rs. 0.00') {
        toast('Cart Empty');
    } else {
        window.location = 'checkout.html';
    }
}

function loadcheckout() {
    if (window.localStorage.getItem('profile') == '') {
        custom_alert('Please add address', function () {
            window.location = 'profile.html';
        });
    } else {
        var res = JSON.parse(window.localStorage.getItem('profile'));
        if (res.data.address != '') {
            var show_data = '';
            for (var i = 0; i < res.data.address.length; i++) {
                show_data += '<option value="' + res.data.address[i].id + '">' + res.data.address[i].address + '</option>';
            }
            document.getElementById('location_list').innerHTML = show_data;
            document.getElementById('add_location_button').style.display = 'none';
        } else {
            document.getElementById('location_list_box').style.display = 'none';
        }
    }
}

function preplaceorder() {
    var couponcode = document.getElementById('couponcode').value;
    if (couponcode == "") {
        placeorder();
    } else {
        getcoupons(couponcode);
    }
}

function placeorder() {
    var location = document.getElementById('location_list').value;
    var wash = document.getElementById('wash').checked ? 'Wash & Iron' : '0';
    var dry = document.getElementById('dry').checked ? 'Dry Clean' : '0';
    var pickup = document.getElementById('pickup').value;
    var delivery = document.getElementById('delivery').value;
    var pickuptime = document.getElementById('pickuptime').value;
    var deliverytime = document.getElementById('deliverytime').value;
    var cod = document.getElementById('cod').checked ? 'cod' : '0';
    var online_pay = document.getElementById('online_pay').checked ? 'pay' : '0';
    if (location == '0') {
        custom_alert('Please add location');
    } else {
        if (wash == '0' && dry == '0') {
            custom_alert('Please select one wash type');
        } else {
            if (pickup == '') {
                custom_alert('Please select pickup date');
            } else {
                if (delivery == '') {
                    custom_alert('Please select delivery date');
                } else {
                    if (cod == '0' && online_pay == '0') {
                        custom_alert('Please select payment mode');
                    } else {
                        var wash_type = ((wash == '0') ? '' : wash);
                        if (wash_type == '' && dry == '0') {
                            wash_type = '';
                        } else if(wash_type==''){
                            wash_type = dry;
                        } else if (dry != '0') {
                            wash_type += ',' + dry;
                        }
                        //console.log(wash_type);
                        if (window.localStorage.getItem('package_purchase') == '') {
                            var count = parseInt(window.localStorage.getItem('cart_count'));
                            var res = JSON.parse(window.localStorage.getItem('prices'));
                            var arg = '&item_count=' + count;
                            var total = 0;
                            for (var i = 1; i <= count; i++) {
                                for (var j = 0; j < res.data.length; j++) {
                                    if (parseInt(window.localStorage.getItem('cart_item_' + i)) == parseInt(res.data[j].id)) {
                                        arg += '&pid' + i + '=' + res.data[j].id + '&qty' + i + '=' + parseInt(window.localStorage.getItem('cart_item_qty_' + i)) + '&price' + i + '=' + res.data[j].price;
                                        total += (parseInt(res.data[j].price) * parseInt(window.localStorage.getItem('cart_item_qty_' + i)));
                                    }
                                }
                            }
                            var res = JSON.parse(window.localStorage.getItem('profile'));
                            var name = res.data.fullname;
                            var email = res.data.email;
                            var phone = res.data.phone;
                            if (cod == 'cod') {
                                document.getElementById('loading').style.display = 'block';
                                var xmlhttp = new XMLHttpRequest();
                                //monitor response
                                xmlhttp.onreadystatechange = function () {
                                    //alert(xmlhttp.responseText);
                                    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                                        var response = JSON.parse(xmlhttp.responseText);
                                        if (response.data != "") {
                                            if (response.data.success == true) {
                                                custom_alert(response.data.message, function () {
                                                    window.localStorage.setItem('cart_count', '0');
                                                    window.location = 'home.html';
                                                });
                                            } else {
                                                custom_alert(response.data.message);
                                            }
                                        } else {
                                            custom_alert('Error! Please try again later');
                                        }
                                        document.getElementById('loading').style.display = 'none';
                                    } else if (xmlhttp.status == 404 || (xmlhttp.readyState == 4 && xmlhttp.status == 0)) {
                                        custom_alert('Network Error! Check Network Settings');
                                        document.getElementById('loading').style.display = 'none';
                                    }
                                }
                                xmlhttp.open('POST', curl + 'add_detailed_order', true);
                                xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                                xmlhttp.send('uid=' + window.localStorage.getItem('uid') + '&address=' + location + '&wash_type=' + encodeURIComponent(wash_type) + '&pickup_date=' + pickup + '&pickup_time=' + pickuptime + '&delivery_date=' + delivery + '&delivery_time=' + deliverytime + '&payment_type=' + cod + '&order_status=1' + arg);
                            } else {
                                total -= coupon_price;
                                //alert(total);
                                custom_alert('You are redirected to payment gateway! Please be paitent and wait for response!!!',
                                    function () {
                                        //alert('http://terasol.in/laundry/web_service/payu_init.php?method_name=add_detailed_order&uid=' + window.localStorage.getItem('uid') + '&firstname=' + name + '&email=' + email + '&phone=' + phone + '&address=' + location + '&wash_type=' + encodeURIComponent(wash_type) + '&pickup_date=' + pickup + '&pickup_time=' + pickuptime + '&delivery_date=' + delivery + '&delivery_time=' + deliverytime + '&payment_type=' + online_pay + '&order_status=1&total=' + total + arg);
                                        paymentWindow = window.open('http://terasol.in/laundry/web_service/payu_init.php?method_name=add_detailed_order&uid=' + window.localStorage.getItem('uid') + '&firstname=' + name + '&email=' + email + '&phone=' + phone + '&address=' + location + '&wash_type=' + encodeURIComponent(wash_type) + '&pickup_date=' + pickup + '&pickup_time=' + pickuptime + '&delivery_date=' + delivery + '&delivery_time=' + deliverytime + '&payment_type=' + online_pay + '&order_status=1&total=' + total + arg, '_blank', 'location=no');
                                        var response = "";
                                        paymentWindow.addEventListener('loadstart',
                                            function (event) {
                                                iab_status = "true";
                                            });
                                        paymentWindow.addEventListener('loadstop',
                                            function (event) {
                                                //alert('stop: ' + event.url);
                                                if (event.url == 'http://terasol.in/laundry/web_service/pay/pay_success_mobile.html') {
                                                    response = "success";
                                                    paymentWindow.close();
                                                } else if (event.url == 'http://terasol.in/laundry/web_service/pay/pay_fail_mobile.html') {
                                                    response = "fail";
                                                    paymentWindow.close();
                                                }
                                            });
                                        paymentWindow.addEventListener('loaderror',
                                            function (event) {
                                                //alert('error: ' + event.message);
                                            });
                                        paymentWindow.addEventListener('exit',
                                            function (event) {
                                                if (response == "success") {
                                                    custom_alert('Purchase Successful', function () {
                                                        window.localStorage.setItem('cart_count', '0');
                                                        window.location = 'home.html';
                                                    });
                                                } else if (response == "fail") {
                                                    custom_alert('Purchase Unsuccessful | Transaction Declined');
                                                } else {
                                                    custom_alert('Purchase Unsuccessful | Connectivity Error');
                                                }
                                                iab_status = "false";
                                                //alert(event.type);
                                            });
                                    });
                            }
                        } else {
                            var packid = parseInt(window.localStorage.getItem('package_purchase'));
                            var res = JSON.parse(window.localStorage.getItem('packages'));
                            var arg = '';
                            var total = 0;
                            for (var i = 0; i < res.data.length; i++) {
                                if (parseInt(res.data[i].id) == packid) {
                                    arg += '&pid=' + res.data[i].id + '&qty=1&price=' + res.data[i].price;
                                    total += (parseInt(res.data[i].price));
                                }
                            }
                            var res = JSON.parse(window.localStorage.getItem('profile'));
                            var name = res.data.fullname;
                            var email = res.data.email;
                            var phone = res.data.phone;
                            if (cod == 'cod') {
                                document.getElementById('loading').style.display = 'block';
                                var xmlhttp = new XMLHttpRequest();
                                //monitor response
                                xmlhttp.onreadystatechange = function () {
                                    //alert(xmlhttp.responseText);
                                    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                                        var response = JSON.parse(xmlhttp.responseText);
                                        if (response.data != "") {
                                            if (response.data.success == true) {
                                                custom_alert(response.data.message, function () {
                                                    window.localStorage.setItem('package_purchase', '');
                                                    window.location = 'home.html';
                                                });
                                            } else {
                                                custom_alert(response.data.message);
                                            }
                                        } else {
                                            custom_alert('Error! Please try again later');
                                        }
                                        document.getElementById('loading').style.display = 'none';
                                    } else if (xmlhttp.status == 404 || (xmlhttp.readyState == 4 && xmlhttp.status == 0)) {
                                        custom_alert('Network Error! Check Network Settings');
                                        document.getElementById('loading').style.display = 'none';
                                    }
                                }
                                xmlhttp.open('POST', curl + 'add_package_order', true);
                                xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                                xmlhttp.send('uid=' + window.localStorage.getItem('uid') + '&address=' + location + '&wash_type=' + encodeURIComponent(wash_type) + '&pickup_date=' + pickup + '&pickup_time=' + pickuptime + '&delivery_date=' + delivery + '&delivery_time=' + deliverytime + '&payment_type=' + cod + '&order_status=1' + arg);
                            } else {
                                total -= coupon_price;
                                //alert(total);
                                custom_alert('You are redirected to payment gateway! Please be paitent and wait for response!!!',
                                    function () {
                                        //alert('http://terasol.in/laundry/web_service/payu_init.php?method_name=add_package_order&uid=' + window.localStorage.getItem('uid') + '&firstname=' + name + '&email=' + email + '&phone=' + phone + '&address=' + location + '&wash_type=' + encodeURIComponent(wash_type) + '&pickup_date=' + pickup + '&pickup_time=' + pickuptime + '&delivery_date=' + delivery + '&delivery_time=' + deliverytime + '&payment_type=' + online_pay + '&order_status=1&total=' + total + arg);
                                        paymentWindow = window.open('http://terasol.in/laundry/web_service/payu_init.php?method_name=add_package_order&uid=' + window.localStorage.getItem('uid') + '&firstname=' + name + '&email=' + email + '&phone=' + phone + '&address=' + location + '&wash_type=' + encodeURIComponent(wash_type) + '&pickup_date=' + pickup + '&pickup_time=' + pickuptime + '&delivery_date=' + delivery + '&delivery_time=' + deliverytime + '&payment_type=' + online_pay + '&order_status=1&total=' + total + arg, '_blank', 'location=no');
                                        var response = "";
                                        paymentWindow.addEventListener('loadstart',
                                            function (event) {
                                                iab_status = "true";
                                            });
                                        paymentWindow.addEventListener('loadstop',
                                            function (event) {
                                                //alert('stop: ' + event.url);
                                                if (event.url == 'http://terasol.in/laundry/web_service/pay/pay_success_mobile.html') {
                                                    response = "success";
                                                    paymentWindow.close();
                                                } else if (event.url == 'http://terasol.in/laundry/web_service/pay/pay_fail_mobile.html') {
                                                    response = "fail";
                                                    paymentWindow.close();
                                                }
                                            });
                                        paymentWindow.addEventListener('loaderror',
                                            function (event) {
                                                //alert('error: ' + event.message);
                                            });
                                        paymentWindow.addEventListener('exit',
                                            function (event) {
                                                if (response == "success") {
                                                    custom_alert('Purchase Successful', function () {
                                                        window.localStorage.setItem('cart_count', '0');
                                                        window.location = 'home.html';
                                                    });
                                                } else if (response == "fail") {
                                                    custom_alert('Purchase Unsuccessful | Transaction Declined');
                                                } else {
                                                    custom_alert('Purchase Unsuccessful | Connectivity Error');
                                                }
                                                iab_status = "false";
                                                //alert(event.type);
                                            });
                                    });
                            }
                        }
                    }
                }
            }
        }
    }
}

function loadorderhistory() {
    document.getElementById('loading').style.display = 'block';
    var xmlhttp = new XMLHttpRequest();
    //monitor response
    xmlhttp.onreadystatechange = function () {
        //alert(xmlhttp.responseText);
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var response = JSON.parse(xmlhttp.responseText);
            if (response.data != "") {
                if (response.success == true) {
                    window.localStorage.setItem('orderhistory', xmlhttp.responseText);
                    showhistory();
                } else {
                    custom_alert(response.data.message);
                }
            } else {
                custom_alert('Error! Please try again later');
            }
            document.getElementById('loading').style.display = 'none';
        } else if (xmlhttp.status == 404 || (xmlhttp.readyState == 4 && xmlhttp.status == 0)) {
            custom_alert('Network Error! Check Network Settings');
            document.getElementById('loading').style.display = 'none';
        }
    }
    xmlhttp.open('POST', curl + 'order_history', true);
    xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xmlhttp.send('uid=' + window.localStorage.getItem('uid'));
}

function showhistory() {
    var res = JSON.parse(window.localStorage.getItem('orderhistory'));
    var show_data = '';
    for (var i = 0; i < res.data.length; i++) {
        show_data += '<div class="package-details">' +
                        '<div class="history-details-element">' + res.data[i].order_no + '</div>' +
                        '<div class="history-details-element">' + res.data[i].wash + '</div>' +
                        '<div class="history-details-element">';
        if (res.data[i].order_status == '1') {
            show_data += '<p class="history-pending">Pending<p>';
        } else if (res.data[i].order_status == '2') {
            show_data += '<p class="history-confirm">Confirm<p>';
        } else if (res.data[i].order_status == '3') {
            show_data += '<p class="history-deliver">Delivered<p>';
        }
        show_data += '</div></div>';
    }
    document.getElementById('page-data').innerHTML = show_data;
}

function rateus() {
    //window.location.href = 'market://details?id=com.terasol.washmart';
}

function logout() {
    window.localStorage.clear();
    window.localStorage.setItem('package_purchase', '');
    window.localStorage.setItem('cart_count', '0');
    window.localStorage.setItem('packages', '');
    window.localStorage.setItem('prices', '');
    window.localStorage.setItem('profile', '');
    window.location = 'start.html';
}

function sliding_menu(ref) {
    if (ref == '1') {
        document.getElementById('nav-bar').classList.add('nav-open');
    } else {
        document.getElementById('nav-bar').classList.remove('nav-open');
    }
}

function getcoupons(code) {
    document.getElementById('loading').style.display = 'block';
    var xmlhttp = new XMLHttpRequest();
    //monitor response
    xmlhttp.onreadystatechange = function () {
        //alert(xmlhttp.responseText);
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var response = JSON.parse(xmlhttp.responseText);
            if (response.data != "") {
                if (response.success == true) {
                    var flag = false;
                    for (var i = 0; i < response.data.length; i++) {
                        if (response.data[i].coupon_code == code) {
                            coupon_price = parseInt(response.data[i].coupon_price);
                            flag = true;
                            break;
                        }
                    }
                    if (flag) {
                        placeorder();
                    } else {
                        custom_alert('Invalid Coupon Code');
                        document.getElementById('couponcode').value = "";
                    }
                } else {
                    custom_alert(response.data.message);
                }
            } else {
                custom_alert('Error! Please try again later');
            }
            document.getElementById('loading').style.display = 'none';
        } else if (xmlhttp.status == 404 || (xmlhttp.readyState == 4 && xmlhttp.status == 0)) {
            custom_alert('Network Error! Check Network Settings');
            document.getElementById('loading').style.display = 'none';
        }
    }
    xmlhttp.open('POST', curl + 'get_coupons', true);
    xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xmlhttp.send('uid=' + window.localStorage.getItem('uid'));
}