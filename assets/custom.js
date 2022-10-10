/**
 * Include your custom JavaScript here.
 *
 * We also offer some hooks so you can plug your own logic. For instance, if you want to be notified when the variant
 * changes on product page, you can attach a listener to the document:
 *
 * document.addEventListener('variant:changed', function(event) {
 *   var variant = event.detail.variant; // Gives you access to the whole variant details
 * });
 *
 * You can also add a listener whenever a product is added to the cart:
 *
 * document.addEventListener('product:added', function(event) {
 *   var variant = event.detail.variant; // Get the variant that was added
 *   var quantity = event.detail.quantity; // Get the quantity that was added
 * });
 *
 * If you are an app developer and requires the theme to re-render the mini-cart, you can trigger your own event. If
 * you are adding a product, you need to trigger the "product:added" event, and make sure that you pass the quantity
 * that was added so the theme can properly update the quantity:
 *
 * document.documentElement.dispatchEvent(new CustomEvent('product:added', {
 *   bubbles: true,
 *   detail: {
 *     quantity: 1
 *   }
 * }));
 *
 * If you just want to force refresh the mini-cart without adding a specific product, you can trigger the event
 * "cart:refresh" in a similar way (in that case, passing the quantity is not necessary):
 *
 * document.documentElement.dispatchEvent(new CustomEvent('cart:refresh', {
 *   bubbles: true
 * }));
 */

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'EUR'
})

window.addEventListener("load", function() {
  if(document.querySelector('.request_flip_btn') != null){
    document.querySelector('.request_flip_btn').classList.remove("disabled");
  }
});

var attr = jQuery('body').attr('data-curr');
if (typeof attr !== 'undefined' && attr !== false) {
  document.addEventListener('variant:changed', function(event) {
    var variant = event.detail.variant; // Gives you access to the whole variant details
    $('.sticky-selected-dropdown').text(variant.title);
    $('.product-block-list__item--info .price:not(.price--compare)').html(formatter.format(variant.price/100)+'<span class="abr"> EUR</span>');
    $('.product-block-list__item--info .price.price--compare').html(formatter.format(variant.compare_at_price/100)+'<span class="abr"> EUR</span>');
    $('.featured-product .price:not(.price--compare)').html(formatter.format(variant.price/100)+'<span class="abr"> EUR</span>');
    $('.featured-product .price.price--compare').html(formatter.format(variant.compare_at_price/100)+'<span class="abr"> EUR</span>');
  });
}

$(document).on("ready", function () {

  /* shipping and billing address button change RAQ */
   $(document).on("change", "input[type='radio'][name='address']", function(){
    if($(this).attr("id") == 'billing_address'){
      var shippingFormHeight = $(".cart_create.cube-face-left").height();
      var billFormHeight = 0; 
      if($(window).width() < 641)
        billFormHeight = 658;
      else
        billFormHeight = 466;
    
      $(".cart-recap").height(parseFloat(shippingFormHeight) + billFormHeight);
      $(".billing_add").stop(true, true).slideDown('slow');
      
    }else{
      var shippingFormHeight = $(".cart_create.cube-face-left").height();
      var billFormHeightUP = 0; 
      if($(window).width() < 641)
        billFormHeightUP = 615;
      else
        billFormHeightUP = 423;
      setTimeout(function(){
      $(".cart-recap").height(parseFloat(shippingFormHeight) - billFormHeightUP);
      },500);
      $(".billing_add").stop(true, true).slideUp(500);
    }
  });
  
  var formObj = {};
  var contact_data = [];
  var shipping_address_data = [];
  var billing_address_data = [];
  var validRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  /* shipping and billing country, state, zipcode, postal code change RAQ */
  $(document).on("change", "#ship_add_country, #bill_add_country, #ship_save_country, #bill_save_country" , function(){
    var provinceData = getProvince($(this).val());
    $(this).parents(".form-group").find(".state_list").html(provinceData);
    const currCountry = $(this).val();
     if(currCountry == "Canada"){
      $(this).parents('.form-group').find('#ship_add_zipcode').attr('placeholder','Postal Code');
      $(this).parents('.form-group').find('#bill_add_zipcode').attr('placeholder','Postal Code');
      $(this).parents('.form-group').find('#ship_zipcode').attr('placeholder','Postal Code');
      $(this).parents('.form-group').find('#bill_zipcode').attr('placeholder','Postal Code');
     }else{
      $(this).parents('.form-group').find('#ship_add_zipcode').attr('placeholder','Zip Code');
      $(this).parents('.form-group').find('#bill_add_zipcode').attr('placeholder','Zip Code');
      $(this).parents('.form-group').find('#ship_zipcode').attr('placeholder','Zip Code');
      $(this).parents('.form-group').find('#bill_zipcode').attr('placeholder','Zip Code');
    }
  });

  /* RAQ submit quote */
  $(document).on('click','.submit_quote',function(e){
    e.preventDefault();
    var obj = $(this);

      var cart_subtotal = obj.parents(".site-i-cart").find('.cart-sub-total-price').data("subtotal");
      var cart_all_data = {};
      var cart_items = getCartData(obj);
      
      cart_all_data.cart_items = cart_items;
      cart_all_data.cart_subtotal = cart_subtotal;
    
    if(validation(obj) == true){
      obj.addClass('loading-true');
      formObj.cart_data = cart_all_data;
      var data = formObj;
      $.ajax({
        type:'POST',
        url: 'https://monitors.com/apps/monitors_quote/user/check',
        dataType:'json',
        data: { payload : btoa(unescape(encodeURIComponent(JSON.stringify(formObj)))), requestToken : enc(JSON.stringify({shop: Shopify.shop,time: (new Date).getTime()}))},
        success:function(response){
          if(response.status == true && formObj.isLogin == false && response.login_require == false){            
            $('.thank_you').trigger('click');
          }else{
            $('#cube').removeClass("show-left show-right show-front-success").addClass('show-back');
            $('.cube-face-back').addClass('is-active');
            $('.cube-face-left').removeClass('is-active');
            setTimeout(function(){
              var bodyHeight = $(".cube-face-back").height();
              $(".cart-recap").height(bodyHeight);
              obj.removeClass('loading-true');
            },200);
            
            if(typeof data['billingAddress'] === 'undefined'){
              obj.parents("#cube").find(".edit_cart").find(".billing-add-content").css("display", "none");
            }else{
              obj.parents("#cube").find(".edit_cart").find(".billing-add-content").css("display", "block");
            }
            
            obj.parents("#cube").find(".edit_cart").find(".form__header .heading").text("Hi "+data['contactData'][0]['firstName']);

            obj.parents("#cube").find(".edit_cart").find(".address-list .address-list__item").each(function(index){
              if(index == 0){
                $(this).find(".address-list__item-info").html('<p class="heading h5">'+data['contactData'][0]['firstName']+' '+data['contactData'][0]['lastName']+'</p><span>'+data['contactData'][0]['email']+'</span><span>'+data['contactData'][0]['company']+'</span><span>'+data['contactData'][0]['phoneNumber']+'</span>');
              }
              if(index == 1){
                $(this).find(".address-list__item-info").html('<p class="heading h5">'+data['shippingAddress'][0]['firstName']+' '+data['shippingAddress'][0]['lastName']+'</p><span>'+data['shippingAddress'][0]['phoneNumber']+'</span><span>'+data['shippingAddress'][0]['address1']+' - '+data['shippingAddress'][0]['zipcode']+'<br>'+data['shippingAddress'][0]['address2']+'<br>'+data['shippingAddress'][0]['state']+', '+data['shippingAddress'][0]['country']+'</span>');
              }
              if(index == 2 && typeof data['billingAddress'] !== 'undefined'){
                $(this).find(".address-list__item-info").html('<p class="heading h5">'+data['billingAddress'][0]['firstName']+' '+data['billingAddress'][0]['lastName']+'</p><span>'+data['billingAddress'][0]['phoneNumber']+'</span><span>'+data['billingAddress'][0]['address1']+' - '+data['billingAddress'][0]['zipcode']+'<br>'+data['billingAddress'][0]['address2']+'<br>'+data['billingAddress'][0]['state']+', '+data['billingAddress'][0]['country']+'</span>');
              }
            });
          }
          obj.removeClass('loading-true');
        }
      });
    } 
  });
  
  /* RAQ button click on cart */
  $(document).on('click','.request_flip_btn',function(e){
    /* if customer login get user data */
    if(ShopifyAnalytics.meta.page.customerId != undefined){
      
      $('.cube-face-back .address-list__item .address-list__item-info').addClass('loading-true');
      $('#cube').prepend('<div class="bg_loader"></div>').fadeIn();
      
      const obj = $(this);
      const formObjData = formObj;
      
      var dataObj = {};
      dataObj.shop = Shopify.shop;
      dataObj.customerId = ShopifyAnalytics.meta.page.customerId;

      $.ajax({
        type:'POST',
        url: `${window.location.origin}/apps/monitors_quote/user/quote`,
        dataType:'json',
        data: { payload : btoa(unescape(encodeURIComponent(JSON.stringify(dataObj)))), requestToken : enc(JSON.stringify({shop: Shopify.shop,time: (new Date).getTime()}))},
        success:function(response){
          if(response.status === true){
            $('.bg_loader').fadeOut();
            $('#cube').removeClass("show-left show-right show-front-success").addClass('show-back');
            $('.cube-face-front').removeClass('is-active');
            $('.cube-face-back').addClass('is-active');

            setTimeout(function(){ 
              const bodyHeight = $(".cube-face-back").height();
              $(".cart-recap").height(bodyHeight);
            },200);
            
            var result = response.data;
            var billingAddress = JSON.parse(result.billing_address);
            var contactData = JSON.parse(result.contact_data);
            var cartData = JSON.parse(result.cart_data);
            var shippingAddress = JSON.parse(result.shipping_address);
            var cart_subtotal = obj.parents(".site-i-cart").find('.cart-sub-total-price').data("subtotal");
            var cart_all_data = {};
            var cart_items = getCartData(obj);

            cart_all_data.cart_items = cart_items;
            cart_all_data.cart_subtotal = cart_subtotal;

            formObj.shop = dataObj.shop;
            formObj.isLogin = true;
            formObj.customerId = dataObj.customerId;
            formObj.contactData = contactData;
            formObj.shippingAddress = shippingAddress;
            formObj.cart_data = cart_all_data;

            if(typeof billingAddress === 'undefined'){
              obj.parents("#cube").find(".edit_cart").find(".billing-add-content").css("display", "none");
            }else{
              obj.parents("#cube").find(".edit_cart").find(".billing-add-content").css("display", "block");
              formObj.billingAddress = billingAddress;
            }

            obj.parents("#cube").find(".edit_cart").find(".form__header .heading").text("Hi "+contactData[0]['firstName']);

            obj.parents("#cube").find(".edit_cart").find(".address-list .address-list__item").each(function(index){
              if(index == 0){
                $(this).find(".address-list__item-info").html('<p class="heading h5">'+contactData[0]['firstName']+' '+contactData[0]['lastName']+'</p><span>'+contactData[0]['email']+'</span><span>'+contactData[0]['company']+'</span><span>'+contactData[0]['phoneNumber']+'</span>');
              }
              if(index == 1){
                $(this).find(".address-list__item-info").html('<p class="heading h5">'+shippingAddress[0]['firstName']+' '+shippingAddress[0]['lastName']+'</p><span>'+shippingAddress[0]['phoneNumber']+'</span>'+'<span>'+shippingAddress[0]['company']+'</span>'+'<span>'+shippingAddress[0]['address1']+' - '+shippingAddress[0]['zipcode']+'</span>'+'<span>'+shippingAddress[0]['address2']+'</span>'+'<span>'+shippingAddress[0]['state']+', '+shippingAddress[0]['country']+'</span>');
              }
              if(index == 2 && typeof billingAddress !== 'undefined'){
                $(this).find(".address-list__item-info").html('<p class="heading h5">'+billingAddress[0]['firstName']+' '+billingAddress[0]['lastName']+'</p><span>'+billingAddress[0]['phoneNumber']+'</span>'+'<span>'+billingAddress[0]['company']+'</span>'+'<span>'+billingAddress[0]['address1']+' - '+billingAddress[0]['zipcode']+'</span>'+'<span>'+billingAddress[0]['address2']+'</span>'+'<span>'+billingAddress[0]['state']+', '+billingAddress[0]['country']+'</span>');
              }

            });

            $('.cube-face-back .address-list__item .address-list__item-info').removeClass('loading-true');
            const bodyHeight = $(".cube-face-back").height();
            $(".cart-recap").height(bodyHeight);

          }
        }
      });
      
    }else{
      $('#cube').removeClass("show-back show-right show-front-success show-left").addClass('show-first');
      $('.cube-face-first').addClass('is-active');
      $('.cube-face-front').removeClass('is-active');
    }
      
    var bodyHeight = $(".cube-face-first").height() + 30;
    $(".cart-recap").height(bodyHeight);
    
    var currCountry = $('body').attr('data-country');
    if(currCountry != undefined && currCountry == "CA"){
      $('#ship_add_zipcode').attr('placeholder','Postal Code');
      $('#bill_add_zipcode').attr('placeholder','Postal Code');
    }

    $('#ship_add_country .select__item[data-value="US"]').prop('selected',true).trigger('change');
    $('#bill_add_country .select__item[data-value="US"]').prop('selected',true).trigger('change');
  });

  /* RAQ for new customer continue button */
   $(document).on('click','.request_quote_continue',function(){
     const obj = $(this);
     if(validation(obj) == true){
       var data = formObj;
       obj.addClass('loading-true');
       
       obj.parents("#cube").find(".first-contact-data").find(".form__header .heading").text("Hi "+data['contactData'][0]['firstName']);

       obj.parents("#cube").find(".first-contact-data").find(".address-list .address-list__item").each(function(index){
         if(index == 0){
           $(this).find(".address-list__item-info").html('<p class="heading h5">'+data['contactData'][0]['firstName']+' '+data['contactData'][0]['lastName']+'</p><span>'+data['contactData'][0]['email']+'</span><span>'+data['contactData'][0]['company']+'</span><span>'+data['contactData'][0]['phoneNumber']+'</span>');
         }
         
         $.ajax({
           type:'POST',
           url: 'https://monitors.com/apps/monitors_quote/user/check',
           dataType:'json',
           data: { payload : btoa(unescape(encodeURIComponent(JSON.stringify(formObj)))), requestToken : enc(JSON.stringify({shop: Shopify.shop,time: (new Date).getTime()}))},
           success:function(response){

             if(response.status == true && formObj.isLogin == false && response.login_require == true){
               $('#cube').removeClass("show-back show-right show-front-success show-first").addClass('show-left');
               $('.cube-face-left .cart_create_in').hide();
               $('.cube-face-left .cart_create_out').show();
               $('.cube-face-left').addClass('is-active').siblings().removeClass('is-active');
               $('.cube-face-front').removeClass('is-active');
            
             }else{
               /* If customer register with same email open login form */
               
               $('#cube').removeClass("show-back show-right show-front-success show-first").addClass('show-left');
               $('.cube-face-left').addClass('is-active');
               $('.cube-face-first').removeClass('is-active');
               var bodyHeight = $(".cube-face-left").height() + 30;
               $(".cart-recap").height(bodyHeight);
             }
             obj.removeClass('loading-true');
           }
         });

       });
       
     }
   });
  
  $(document).on('click','.sign-in-click',function(){
    $('#account-popover').attr('aria-hidden',"false");
  });
  
  $(document).on('click','.login-btn',function(){
    $('#cube').removeClass("show-left show-back show-front-success show-first").addClass('show-back');
    $('.cube-face-back').addClass('is-active');
    $('.cube-face-left').removeClass('is-active');
    $('.cube-face-front').removeClass('is-active');
    setTimeout(function(){
      var bodyHeight = $(".cube-face-back").height();
      $(".cart-recap").height(bodyHeight);
    },500);
  });
  
  /* RAQ final submition */
  
  var shop_url = window.location.origin +"/apps/monitors_quote/quote/save";
  
  $(document).on('click','.thank_you',function(){
    var obj = $(this);
    obj.addClass('loading-true');
   $.ajax({
      type:'POST',
      url:shop_url,
      dataType:'json',
      data: { payload : btoa(unescape(encodeURIComponent(JSON.stringify(formObj)))), requestToken : enc(JSON.stringify({shop: Shopify.shop,time: (new Date).getTime()}))},
      success:function(response){
        if(response.status == true){
          $.ajax({
            type: "POST",
            url: '/cart/clear.js',
            success: function(cartData){ 
              $('.cart-main-wrapper').hide();
              $('.header__cart-count').text(0);
              $('.thanku_page_wrap').show();
              $('html, body').animate({scrollTop:0}, 500);
            },
            dataType: 'json'
          });

          /* New user login after quote submit */
          setTimeout(function(){
            if(formObj.isLogin == false && response.login_require == true){
              var txtEmail = formObj.contactData[0].email;
              var txtPass = formObj.contactData[0].password;

              login(txtEmail, txtPass).done(function (responseHtml){
//                 location.href = '/account#my-quotes';
              }).fail(function (failResponse){
                console.log('failResponse',failResponse);
              });
            }
          },500);
          
        }else{
          /* If customer register with same email open login form */
          
          if(formObj.isLogin == false && response.login_require == true){
            $('#cube').removeClass("show-back show-right show-front-success show-first").addClass('show-left');
            $('.cube-face-left .cart_create_in').hide();
            $('.cube-face-left .cart_create_out').show();
            $('.cube-face-left').addClass('is-active').siblings().removeClass('is-active');
            $('.cube-face-front').removeClass('is-active');
          }
        }
        obj.removeClass('loading-true');
      }
    });
    
  });

  /* close icon in thanks popup */
  $(document).on('click','.thnks_close',function(){
    $('#cube').removeClass("show-left show-back show-right show-first").addClass('show-front-success');
    $('.cube-face-front').addClass('is-active');
    $('.cube-face-right').removeClass('is-active');
    var bodyHeight = $(".cube-face-front").height();
    $(".cart-recap").height(bodyHeight);
  });

  /* Edit contact, shipping and billing address data RAQ */
  $(document).on('click','.btn-edit',function(){
    var _this = $(this);
    _this.toggleClass('active');
    var data = formObj;
    if(!$(this).parents(".address-list__item").find(".edit_form").is(":visible")){
      if($(this).data("id") == 'contact-data'){
        _this.parents(".address-list__item").find(".edit_form").find(".err").remove();
        $.each(data['contactData'][0], function(key, val){
          _this.parents(".address-list__item:not(.first-form-data)").find(".edit_form").find("#contact_"+key).val(val);
          _this.parents(".address-list__item.first-form-data").find(".edit_form").find("#"+key).val(val);        
        });
      }
 
      if($(this).data("id") == 'shipping-add-data'){
        _this.parents(".address-list__item").find(".edit_form").find(".err").remove();
        var provinceData = getProvince(data['shippingAddress'][0]['country']);
        _this.parents(".address-list__item").find(".edit_form").find("#ship_state").html(provinceData);
        
        $.each(data['shippingAddress'][0], function(key, val){
          if(key == 'country'){
            _this.parents(".address-list__item").find(".edit_form").find("#ship_save_country").val(val);
          }
          else{
          _this.parents(".address-list__item").find(".edit_form").find("#ship_"+key).val(val);
          }
        });
        
      }
      
      if($(this).data("id") == 'billing-add-data'){
        _this.parents(".address-list__item").find(".edit_form").find(".err").remove();
        var provinceData = getProvince(data['billingAddress'][0]['country']);
        _this.parents(".address-list__item").find(".edit_form").find("#bill_state").html(provinceData);
        
        $.each(data['billingAddress'][0], function(key, val){
          if(key == 'country'){
            _this.parents(".address-list__item").find(".edit_form").find("#bill_save_country").val(val);
          }
          else{
          _this.parents(".address-list__item").find(".edit_form").find("#bill_"+key).val(val);
          }
        });
        
      }
    }
    $(this).parents(".address-list__item").find(".edit_form").slideToggle();
    setTimeout(function(){
      if($(".cart_create.cube-face-left").hasClass('is-active')){
        var cubeFormHeight = $(".cart_create.cube-face-left").height();
        $(".cart-recap").height(parseFloat(cubeFormHeight));
      }else{

        var shippingFormHeight = $(".cart_create.cube-face-back").height();
        $(".cart-recap").height(parseFloat(shippingFormHeight));
      }
    },500);
  });

  /* After Edit and update data save button RAQ */
  $(document).on("click", ".save-data", function(){
    var data = formObj;
    var objct = $(this);
    var id = $(this).parents(".address-list__item").find(".btn-edit").data("id");
    $(this).parents(".address-list__item").find(".btn-edit").removeClass('active');
    if(id == 'contact-data'){
      $(this).parents(".edit_form").find(".err").remove();
      $(this).parents(".edit_form").find(".form__field").each(function(){
        var contactKeyID = $(this).attr("id");
        if(contactKeyID.indexOf('_') > 0){
          contactKeyID = contactKeyID.split("_");
          var contactKey = contactKeyID[1];
        }else{
          var contactKey = $(this).attr("id");   
        }
        if($(this).val() == '' || typeof $(this).val() === 'undefined'){
          $(this).after("<span class='err'>Please fill the data</span>");
        }else{
          data['contactData'][0][contactKey] = $(this).val();
        }
      });
      var newInfo = '';
      newInfo+= '<p class="heading h5">'+data['contactData'][0]['firstName']+' '+data['contactData'][0]['lastName']+'</p><span>'+data['contactData'][0]['email']+'</span><span>'+data['contactData'][0]['company']+'</span><span>'+data['contactData'][0]['phoneNumber']+'</span>';
      $(this).parents(".address-list__item").find(".address-list__item-info").html(newInfo);
    }
    if(id == 'shipping-add-data'){
      $(this).parents(".edit_form").find(".err").remove();
      $(this).parents(".edit_form").find(".form__field").each(function(){

      var shipKeyID = $(this).attr("id");
      shipKeyID = shipKeyID.split("_");
      var shipKey = shipKeyID[1];
        
        if($(this).val() == '' && $(this).attr('id') != 'ship_address2' || typeof $(this).val() === 'undefined'){
          $(this).after("<span class='err'>Please fill the data</span>");
        }else if($(this).attr('id') == 'ship_save_country'){
          data['shippingAddress'][0]['country'] = $(this).val();
        }else{
          data['shippingAddress'][0][shipKey] = $(this).val();
        }
      });
      var newInfoShipping = '';
      newInfoShipping+= '<p class="heading h5">'+data['shippingAddress'][0]['firstName']+' '+data['shippingAddress'][0]['lastName']+'</p><span>'+data['shippingAddress'][0]['phoneNumber']+'</span>';
      newInfoShipping+= '<span>'+data['shippingAddress'][0]['company']+'</span>';
      newInfoShipping+= '<span>'+data['shippingAddress'][0]['address1']+' - '+data['shippingAddress'][0]['zipcode']+'</span>';
      if(data['shippingAddress'][0]['address2'] != '')
      newInfoShipping+= '<span>'+data['shippingAddress'][0]['address2']+'</span>';
      newInfoShipping+= '<span>'+data['shippingAddress'][0]['state']+', '+data['shippingAddress'][0]['country']+'</span>';
      $(this).parents(".address-list__item").find(".address-list__item-info").html(newInfoShipping);
    }
    if(id == 'billing-add-data'){
      $(this).parents(".edit_form").find(".err").remove();
      $(this).parents(".edit_form").find(".form__field").each(function(){
        
      var billKeyID = $(this).attr("id");
      billKeyID = billKeyID.split("_");
      var billKey = billKeyID[1];
        
        if($(this).val() == '' && $(this).attr('id') != 'bill_address2' || typeof $(this).val() === 'undefined'){
          $(this).after("<span class='err'>Please fill the data</span>");
        }else if($(this).attr('id') == 'bill_save_country'){
          data['billingAddress'][0]['country'] = $(this).val();
        }else{
          data['billingAddress'][0][billKey] = $(this).val();
        }
      });
      var newInfoBilling = '';
      newInfoBilling+= '<p class="heading h5">'+data['billingAddress'][0]['firstName']+' '+data['billingAddress'][0]['lastName']+'</p><span>'+data['billingAddress'][0]['phoneNumber']+'</span>';
      newInfoBilling+= '<span>'+data['billingAddress'][0]['company']+'</span>';
      newInfoBilling+= '<span>'+data['billingAddress'][0]['address1']+' - '+data['billingAddress'][0]['zipcode']+'</span>';
      if(data['billingAddress'][0]['address2'] != '')
      newInfoBilling+= '<span>'+data['billingAddress'][0]['address2']+'</span>';
      newInfoBilling+= '<span>'+data['billingAddress'][0]['state']+', '+data['billingAddress'][0]['country']+'</span>';
      $(this).parents(".address-list__item").find(".address-list__item-info").html(newInfoBilling);
    }
    objct.parents(".address-list__item").find(".edit_form").slideToggle();
    setTimeout(function(){
      if($(".cart_create.cube-face-left").hasClass('is-active')){
        var cubeFormHeight = $(".cart_create.cube-face-left").height();
        $(".cart-recap").height(parseFloat(cubeFormHeight));
      }else{

        var shippingFormHeight = $(".cart_create.cube-face-back").height();
        $(".cart-recap").height(parseFloat(shippingFormHeight));
      }
    },500);
  });
  
  
  $(document).on('click','.form__input-wrapper',function(){
    $(this).parents('.cart_create_in').find('.err').remove();
  });

  /* All the fields validation RAQ */
  function validation(obj){
    
    shipping_address_data.length = 0;
    billing_address_data.length = 0;
    
    var form = obj.parents(".cart_create_in");
    var fname = form.find("#first_name");
    var lname = form.find("#last_name");
    var email = form.find("#first_email");
    var password = form.find("#first_password");
    var phoneNumber = form.find("#phone_number");
    var company = form.find("#first_company");
    
    var addressType = form.find("input[type='radio'][name='address']:checked").attr("id");
    
    form.find(".err").remove();
    
    if(obj.parents('.cube-face-first').hasClass('is-active')){

      if(empty(fname) == false && fname.val() == '') {
        fname.after("<span class='err'>Enter your first name</span>");
        fname.focus();
        return false;
      }else if(empty(lname) == false && lname.val() == '') {
        lname.after("<span class='err'>Enter your last name</span>");
        lname.focus();
        return false;
      }else if(empty(phoneNumber) == false && phoneNumber.val() == ''){
        phoneNumber.after("<span class='err'>Enter your phone number</span>");
        phoneNumber.focus();
        return false;
      }else if(empty(company) == false && company.val() == ''){
        company.after("<span class='err'>Enter your company name</span>");
        company.focus();
        return false;
      }else if(empty(email) == false && email.val() == ''){
        email.after("<span class='err'>Enter your email address</span>");
        email.focus();
        return false;
      }else if(empty(email) == false && !validRegex.test(email.val())){
        email.after("<span class='err'>Enter your valid email address</span>");
        email.focus();
        return false;
      }else if(empty(password) == false && password.length > 0 && password.val() == ''){
        password.after("<span class='err'>Enter new password</span>");
        password.focus();
        return false;
      }else{
        formObj.shop = Shopify.shop;
        formObj.isLogin = obj.data("user") == true ? true : false;
        formObj.customerId = typeof obj.data("customer-id") !== 'undefined' ? obj.data("customer-id") : '' ;

        contact_data.push({
          firstName : fname.val(),
          lastName : lname.val(),
          phoneNumber : phoneNumber.val(),
          company : company.val(),
          email : email.val(),
          password : password.length > 0 ? password.val() : ''
        });

        formObj.contactData = contact_data;
        form.find(".err").remove();
        return true;
      }
    }
      
      var shipAddFirstName = form.find("#ship_add_first_name");
      var shipAddLastName = form.find("#ship_add_last_name");
      var shipAddPhoneNumber = form.find("#ship_add_phone_number");
      var shipAddCompany = form.find("#ship_add_company");
      var shipAddAddress1 = form.find("#ship_add_address1");
      var shipAddAddress2 = form.find("#ship_add_address2");
      var shipAddCity = form.find("#ship_add_city");
      var shipAddState = form.find("#ship_add_state");
      var shipAddStateCode = form.find("#ship_add_state option:selected").data('code');
      var shipAddZipcode = form.find("#ship_add_zipcode");
      var shipAddCountry = form.find("#ship_add_country");
      var shipAddCountryCode = form.find("#ship_add_country option:selected").data('value');
    
      if(addressType == 'billing_address'){
        var billAddFirstName = form.find("#bill_add_first_name");
        var billAddLastName = form.find("#bill_add_last_name");
        var billAddPhoneNumber = form.find("#bill_add_phone_number");
        var billAddCompany = form.find("#bill_add_company");
        var billAddAddress1 = form.find("#bill_add_address1");
        var billAddAddress2 = form.find("#bill_add_address2");
        var billAddCity = form.find("#bill_add_city");
        var billAddState = form.find("#bill_add_state");
        var billAddStateCode = form.find("#bill_add_state option:selected").data('code');
        var billAddZipcode = form.find("#bill_add_zipcode");
        var billAddCountry = form.find("#bill_add_country");
        var billAddCountryCode = form.find("#bill_add_country option:selected").data('value');
      }
      
      if(empty(shipAddFirstName) == false && shipAddFirstName.val() == ''){
        shipAddFirstName.after("<span class='err'>Enter your first name</span>");
        shipAddFirstName.focus();
        return false;
      }else if(empty(shipAddLastName) == false && shipAddLastName.val() == ''){
        shipAddLastName.after("<span class='err'>Enter your last name</span>");
        shipAddLastName.focus();
        return false;
      }else if(empty(shipAddLastName) == false && !shipAddPhoneNumber.val()){
        shipAddPhoneNumber.after("<span class='err'>Enter your phone number</span>");
        shipAddPhoneNumber.focus();
        return false;
      }else if(empty(shipAddCompany) == false && !shipAddCompany.val()){
        shipAddCompany.after("<span class='err'>Enter your company name</span>");
        shipAddCompany.focus();
        return false;
      }else if(empty(shipAddAddress1) == false && !shipAddAddress1.val()){
        shipAddAddress1.after("<span class='err'>Enter your address1</span>");
        shipAddAddress1.focus();
        return false;
      }
     /* else if(empty(shipAddAddress2) == false && !shipAddAddress2.val()){
        shipAddAddress2.after("<span class='err'>Enter your address2</span>");
        shipAddAddress2.focus();
        return false;
      }*/
    else if(empty(shipAddCity) == false && !shipAddCity.val()){
        shipAddCity.after("<span class='err'>Enter your city</span>");
        shipAddCity.focus();
        return false;
      }else if(empty(shipAddState) == false && shipAddState.val() == 0 && shipAddCountry.val() == 0){
        shipAddState.parents('.select-wrapper').after("<span class='err'>First select your country</span>");
        shipAddState.focus();
        return false;
      }else if(empty(shipAddState) == false && shipAddState.val() == 0 && shipAddCountry.val() != 0){
        shipAddState.parents('.select-wrapper').after("<span class='err'>Select your state</span>");
        shipAddState.focus();
        return false;
      }else if(empty(shipAddZipcode) == false && !shipAddZipcode.val()){
        shipAddZipcode.after("<span class='err'>Enter your zipcode</span>");
        shipAddZipcode.focus();
        return false;
      }else if(empty(shipAddCountry) == false && shipAddCountry.val() == 0){
        shipAddCountry.parents('.select-wrapper').after("<span class='err'>Select your country</span>");
        shipAddCountry.focus();
        return false;
      }
      else if(addressType == 'billing_address' && empty(billAddFirstName) == false && !billAddFirstName.val()){
        billAddFirstName.after("<span class='err'>Enter your first name</span>");
        billAddFirstName.focus();
        return false;
      }else if(addressType == 'billing_address' && empty(billAddLastName) == false && !billAddLastName.val()){
        billAddLastName.after("<span class='err'>Enter your last name</span>");
        billAddLastName.focus();
        return false;
      }else if(addressType == 'billing_address' && empty(billAddPhoneNumber) == false && !billAddPhoneNumber.val()){
        billAddPhoneNumber.after("<span class='err'>Enter your phone number</span>");
        billAddPhoneNumber.focus();
        return false;
      }else if(addressType == 'billing_address' && empty(billAddCompany) == false && !billAddCompany.val()){
        billAddCompany.after("<span class='err'>Enter your company name</span>");
        billAddCompany.focus();
        return false;
      }else if(addressType == 'billing_address' && empty(billAddAddress1) == false && !billAddAddress1.val()){
        billAddAddress1.after("<span class='err'>Enter your address1</span>");
        billAddAddress1.focus();
        return false;
      }
      /*else if(addressType == 'billing_address' && empty(billAddAddress2) == false && !billAddAddress2.val()){
        billAddAddress2.after("<span class='err'>Enter your address2</span>");
        billAddAddress2.focus();
        return false;
      }*/
      else if(addressType == 'billing_address' && empty(billAddCity) == false && !billAddCity.val()){
        billAddCity.after("<span class='err'>Enter your city</span>");
        billAddCity.focus();
        return false;
      }else if(addressType == 'billing_address' && empty(billAddState) == false && billAddState.val() == 0 && billAddCountry.val() == 0){
        billAddState.parents('.select-wrapper').after("<span class='err'>First select your country</span>");
        billAddState.focus();
        return false;
      }else if(addressType == 'billing_address' && empty(billAddState) == false && billAddState.val() == 0 && billAddCountry.val() != 0){
        billAddState.parents('.select-wrapper').after("<span class='err'>Select your state</span>");
        billAddState.focus();
        return false;
      }else if(addressType == 'billing_address' && empty(billAddZipcode) == false && !billAddZipcode.val()){
        billAddZipcode.after("<span class='err'>Enter your zipcode</span>");
        billAddZipcode.focus();
        return false;
      }else if(addressType == 'billing_address' && empty(billAddCountry) == false && billAddCountry.val() == 0){
        billAddCountry.parents('.select-wrapper').after("<span class='err'>Select your country</span>");
        billAddCountry.focus();
        return false;
      }else{
        
        shipping_address_data.push({
          "firstName":shipAddFirstName.val(),
          "lastName":shipAddLastName.val(),
          "phoneNumber":shipAddPhoneNumber.val(),
          "company":shipAddCompany.val(),
          "address1":shipAddAddress1.val(),
          "address2":shipAddAddress2.val(),
          "city":shipAddCity.val(),
          "state":shipAddState.val(),
          "stateCode":shipAddStateCode,
          "zipcode":shipAddZipcode.val(),
          "country":shipAddCountry.val(),
          "countryCode": shipAddCountryCode
        });
        formObj.shippingAddress = shipping_address_data;

        if(addressType == 'billing_address'){
          billing_address_data.push({
            "firstName":billAddFirstName.val(),
            "lastName":billAddLastName.val(),
            "phoneNumber":billAddPhoneNumber.val(),
            "company":billAddCompany.val(),
            "address1":billAddAddress1.val(),
            "address2":billAddAddress2.val(),
            "city":billAddCity.val(),
            "state":billAddState.val(),
            "stateCode":billAddStateCode,
            "zipcode":billAddZipcode.val(),
            "country":billAddCountry.val(),
            "countryCode": billAddCountryCode
          });
          formObj.billingAddress = billing_address_data;
        }

        form.find(".err").remove();
        return true;
      }
  }
  
  $(document).on('click','.error_close', function(){
    $('.cube-face-left').removeClass('is-active');
    $('.cube-face-front').addClass('is-active');
    $('#cube').removeClass("show-back show-right show-front-success show-first show-left").addClass('show-front');
    $('.form-group .form__input-wrapper .form__field').val('');
  });

  /* Already customer then login first */
  $(document).on('click','.btn-login-submit', function(){
   $('#cube').prepend('<div class="bg_loader"></div>').fadeIn();
    var $this = $(this);
    var $form = $(this).parents('form');
    var email = $form.find('#cart-login-customer-email').val();
    var pass = $form.find('#cart-login-customer-password').val();
    
    const formObjData = formObj;
    var data = {
      'customer[email]': email,
      'customer[password]': pass,
      form_type: 'customer_login',
      utf8: '✓'
    };
    
    $.ajax({
      url: '/account/login',
      method: 'post',
      data: data,
      dataType: 'html',
      success:function(data){
        var dataHtml = new DOMParser().parseFromString(data, "text/html");
        var customerID = $(dataHtml).find('body').data('customer-id');
        const formObjData = formObj;
        var dataObj = {};
        dataObj.shop = Shopify.shop;
        dataObj.customerId = customerID;
        
      $.ajax({
        type:'POST',
        url: `${window.location.origin}/apps/monitors_quote/user/quote`,
        dataType:'json',
        data: { payload : btoa(unescape(encodeURIComponent(JSON.stringify(dataObj)))), requestToken : enc(JSON.stringify({shop: Shopify.shop,time: (new Date).getTime()}))},
        success:function(response){
          if(response.status === true){
            var result = response.data;
            var billingAddress = JSON.parse(result.billing_address);
            var contactData = JSON.parse(result.contact_data);
            var cartData = JSON.parse(result.cart_data);
            var shippingAddress = JSON.parse(result.shipping_address);
            var cart_subtotal = $this.parents(".site-i-cart").find('.cart-sub-total-price').data("subtotal");
            var cart_all_data = {};
            var cart_items = getCartData($this);

            cart_all_data.cart_items = cart_items;
            cart_all_data.cart_subtotal = cart_subtotal;

            formObj.shop = dataObj.shop;
            formObj.isLogin = true;
            formObj.customerId = dataObj.customerId;
            formObj.contactData = contactData;
            formObj.shippingAddress = shippingAddress;
            formObj.cart_data = cart_all_data;

            if(typeof billingAddress === 'undefined'){
              $this.parents("#cube").find(".edit_cart").find(".billing-add-content").css("display", "none");
            }else{
              $this.parents("#cube").find(".edit_cart").find(".billing-add-content").css("display", "block");
              formObj.billingAddress = billingAddress;
            }

            $this.parents("#cube").find(".edit_cart").find(".form__header .heading").text("Hi "+contactData[0]['firstName']);

            $this.parents("#cube").find(".edit_cart").find(".address-list .address-list__item").each(function(index){
              if(index == 0){
                $(this).find(".address-list__item-info").html('<p class="heading h5">'+contactData[0]['firstName']+' '+contactData[0]['lastName']+'</p><span>'+contactData[0]['email']+'</span><span>'+contactData[0]['company']+'</span><span>'+contactData[0]['phoneNumber']+'</span>');
              }
              if(index == 1){
                $(this).find(".address-list__item-info").html('<p class="heading h5">'+shippingAddress[0]['firstName']+' '+shippingAddress[0]['lastName']+'</p><span>'+shippingAddress[0]['phoneNumber']+'</span>'+'<span>'+shippingAddress[0]['company']+'</span>'+'<span>'+shippingAddress[0]['address1']+' - '+shippingAddress[0]['zipcode']+'</span>'+'<span>'+shippingAddress[0]['address2']+'</span>'+'<span>'+shippingAddress[0]['state']+', '+shippingAddress[0]['country']+'</span>');
              }
              if(index == 2 && typeof billingAddress !== 'undefined'){
                $(this).find(".address-list__item-info").html('<p class="heading hey h5">'+billingAddress[0]['firstName']+' '+billingAddress[0]['lastName']+'</p><span>'+billingAddress[0]['phoneNumber']+'</span>'+'<span>'+shippingAddress[0]['company']+'</span>'+'<span>'+billingAddress[0]['address1']+' - '+billingAddress[0]['zipcode']+'</span>'+'<span>'+billingAddress[0]['address2']+'</span>'+'<span>'+billingAddress[0]['state']+', '+billingAddress[0]['country']+'</span>');
              }

            });

            $('.bg_loader').fadeOut();

            const bodyHeight = $(".cube-face-back").height();
            $(".cart-recap").height(bodyHeight);

          }
        }
      });
        
      }
    });
  });
  
  /* Notify me custom code */
  $('.esc-btns').click(function(){
    var $this = $(this);
    var URL = "https://v2.outofstock.eastsideco.io/api/public/subscribe/email";
    var email = $(this).parents('.esc-email').find('.esc-emailInput');
    var shopDomain = Shopify.shop;
    var variantId = $('.select-variant-cart-id option[selected="selected"]').attr('value');

    $('.esc-email-notification').removeClass('esc-error esc-success');

    if(empty(email.val()) == true){
      $this.parents('#esc-inputs').find('.esc-email-notification').text('Enter your email address').addClass('esc-error');
      email.focus();
      return false;
    }else if(empty(email.val()) == false && !validRegex.test(email.val())){
      $this.parents('#esc-inputs').find('.esc-email-notification').text('Enter your valid email address').addClass('esc-error');
      email.focus();
      return false;
    }else{
      $.ajax({
        type:'POST',
        url: URL,
        dataType:'json',
        data: {
          alertType: "email",
          country: null,
          destination: email.val(),
          domain: shopDomain,
          marketing: true,
          product_id: null,
          variant_id: variantId
        },
        success:function(response){
          if(response.success == 1){
            $this.parents('#esc-inputs').find('.esc-email-notification').text('Your email notification request has been registered').addClass('esc-success');
            $this.parents('#esc-inputs').find('.esc-email').hide();
          }else{
            $this.parents('#esc-inputs').find('.esc-email-notification').text(response.message).addClass('esc-error');
          }
        }
      });

    }
  });

});

function empty(data){
  return data == '' || data == undefined || data == null
}

function login(email, password) {
  var data = {
    'customer[email]': email,
    'customer[password]': password,
    form_type: 'customer_login',
    utf8: '✓'
  };

  var promise = $.ajax({
    url: '/account/login',
    method: 'post',
    data: data,
    dataType: 'html',
    async: true
  });

  return promise;
}

  /* get and return cart data RAQ */
function getCartData(_this){
  var cart_items = [];
  _this.parents(".site-i-cart").find(".line-item").each(function(){
    var product_id = $(this).data("pro-id");
    var var_id = $(this).data("var-id");
    var quantity = $(this).find(".quantity-selector__value").val();
    var price = $(this).find(".line-item__price:not(.line-item__price--compare)").data("price");
    var pro_title = $.trim($(this).find(".line-item__title").text());
    var var_title = $.trim($(this).find(".line-item__title").data("var-title"));
    var linePrice = $(this).find(".line-item--line-price").data("line-price");
    var vendorTitle = $.trim($(this).find(".line-item__vendor").text());
    var vendorLink = $(this).find(".line-item__vendor").attr("href");
    var Image = $(this).find(".line-item__image-wrapper img").attr("src");
    var productUrl = $(this).find(".line-item__title").attr("href");

    cart_items.push({
      "productId": product_id,
      "variantId": var_id,
      "productTitle": pro_title,
      "variantTitle": var_title,
      "price": price,
      "quantity": Number(quantity),
      "linePrice": linePrice,
      "vendorTitle": vendorTitle,
      "vendorLink": vendorLink,
      "image": Image,
      "productUrl": productUrl
    })
  });
  return cart_items;
}

/* Province data RAQ */
var candaProvince = [{"text":"Alberta","value":"AB"},{"text":"British Columbia","value":"BC"},{"text":"Manitoba","value":"MB"},{"text":"New Brunswick","value":"NB"},{"text":"Newfoundland and Labrador","value":"NL"},{"text":"Northwest Territories","value":"NT"},{"text":"Nova Scotia","value":"NS"},{"text":"Nunavut","value":"NU"},{"text":"Ontario","value":"ON"},{"text":"Prince Edward Island","value":"PE"},{"text":"Quebec","value":"QC"},{"text":"Saskatchewan","value":"SK"},{"text":"Yukon Territory","value":"YT"}];
var usStates = [{"value":"AK","text":"Alaska"},{"value":"AL","text":"Alabama"},{"value":"AR","text":"Arkansas"},{"value":"AS","text":"American Samoa"},{"value":"AZ","text":"Arizona"},{"value":"CA","text":"California"},{"value":"CO","text":"Colorado"},{"value":"CT","text":"Connecticut"},{"value":"DC","text":"District of Columbia"},{"value":"DE","text":"Delaware"},{"value":"FL","text":"Florida"},{"value":"GA","text":"Georgia"},{"value":"GU","text":"Guam"},{"value":"HI","text":"Hawaii"},{"value":"IA","text":"Iowa"},{"value":"ID","text":"Idaho"},{"value":"IL","text":"Illinois"},{"value":"IN","text":"Indiana"},{"value":"KS","text":"Kansas"},{"value":"KY","text":"Kentucky"},{"value":"LA","text":"Louisiana"},{"value":"MA","text":"Massachusetts"},{"value":"MD","text":"Maryland"},{"value":"ME","text":"Maine"},{"value":"MI","text":"Michigan"},{"value":"MN","text":"Minnesota"},{"value":"MO","text":"Missouri"},{"value":"MS","text":"Mississippi"},{"value":"MT","text":"Montana"},{"value":"NC","text":"North Carolina"},{"value":"ND","text":"North Dakota"},{"value":"NE","text":"Nebraska"},{"value":"NH","text":"New Hampshire"},{"value":"NJ","text":"New Jersey"},{"value":"NM","text":"New Mexico"},{"value":"NV","text":"Nevada"},{"value":"NY","text":"New York"},{"value":"OH","text":"Ohio"},{"value":"OK","text":"Oklahoma"},{"value":"OR","text":"Oregon"},{"value":"PA","text":"Pennsylvania"},{"value":"PR","text":"Puerto Rico"},{"value":"RI","text":"Rhode Island"},{"value":"SC","text":"South Carolina"},{"value":"SD","text":"South Dakota"},{"value":"TN","text":"Tennessee"},{"value":"TX","text":"Texas"},{"value":"UT","text":"Utah"},{"value":"VA","text":"Virginia"},{"value":"VI","text":"Virgin Islands"},{"value":"VT","text":"Vermont"},{"value":"WA","text":"Washington"},{"value":"WI","text":"Wisconsin"},{"value":"WV","text":"West Virginia"},{"value":"WY","text":"Wyoming"}];

function getProvince(value){
  var html = '';
  if(value == 'United States'){
    html+= '<option class="select__item" value="0">State</option>';
    $.each(usStates, function(ind, val){
      html+= '<option class="select__item" value="'+val.text+'" data-code="'+val.value+'">'+val.text+'</option>';
    });

  }else if(value == 'Canada'){
    html+= '<option class="select__item" value="0">Province</option>';
    $.each(candaProvince, function(ind, val){
      html+= '<option class="select__item" value="'+val.text+'" data-code="'+val.value+'">'+val.text+'</option>';
    });
  }
  return html;
}

document.documentElement.dispatchEvent(new CustomEvent('cart:refresh', {
  bubbles: true
}));

$(document).on('click','.findify-add-to-cart',function(){
  $('html').addClass('item-added-cart');
});

function enc(r,t=2){if(!r)return!1;r=btoa(r);var n="";function e(r=!1){var t=[],n="a";if(!0===r)n="A";for(const r of Array(26).keys())t.push(String.fromCharCode(n.charCodeAt(0)+r));return t}return r.split("").forEach(function(r){n+=function(r,t){if(!0!==/[a-zA-Z]/.test(r))return r;var n=e();/[A-Z]/.test(r)&&(n=e(!0));for(var o=n.indexOf(r),a=1;a<=t;a++)o=n[parseInt(o)+1]?parseInt(o)+1:0;return n[o]}(r,t)}),n}

// Account page view details on click elements RAQ
$(document).ready(function () {
  var IS_ACTIVE = $(".active"); var accordButton = $(".flits-view-quote-button"); var accordPanel = $(".flits-collaps-quote-details");

  function accordResetFunction(){
    accordButton.removeClass("active");
    //accordButton.find("span").text("View Detail");
    $(accordPanel).css("display", "");
  }
  function accordFunction(el){
    var $this = $(el.currentTarget);
    $this.parent().siblings(".flits-collaps-quote-details").stop().slideToggle();
    //console.log(b);
    $this.stop().toggleClass("active");
  }
  accordButton.on("click", accordFunction);
  $(window).on("load", accordResetFunction);

});