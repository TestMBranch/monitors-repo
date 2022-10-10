/****PLEASE DON'T MAKE CHANGES IN THIS FILE IT'S AFFECT THE CODE IF YOU NEED ANY HELP PLEASE CONTACT TO FLITS TEAM support@getflits.com ****/
(function(Flits) {
  /* To load js in all pages */
  if(window.flitsObjects.allCssJs.socialLoginJs){
    Flits.LoadStyleScript('socialLoginJs',window.flitsObjects.allCssJs.socialLoginJs.url);
  }


  Flits.fn.extend({
    appendSocialLoginDivAdded: function(socialLoginBtnGroup, isTrue) {
      var settings = Flits.SocialLogin.settings;
      return this.filter(':not([data-flits="social-login-added"])').each(function(index, el) {
        if (el = Flits(el),
            isTrue && (el.css('display') == 'none'))
          return;
        if (typeof el[0].addEventListener != 'function')
          return;
        var parent = el;
        var cloneNode = socialLoginBtnGroup.clone(!0);
        parent.append(cloneNode),
          el.attr('data-flits', 'social-login-added'),
          parent.attr('data-flits', 'social-login-parent'),
          settings.automaticAppendDivFunction.apply(this, [el, parent, cloneNode]),
          Flits.dispatchEvent('Flits:SocialLoginAutomaticCode:Loaded', {
          el: el,
          parent: parent,
          cloneNode: cloneNode
        });
      }),
        this;
    }
  })

  var  buttonAppendButtons =  function() {
    let selector = Flits.SocialLogin.settings.domSelector;
    let selectorLength = Flits.SocialLogin.settings.domSelector.length;
    let items = Flits.SocialLogin.settings.buttonConfig;
    let socialLoginBtnGroup = Flits('<div />');
    socialLoginBtnGroup.addClass('flits-social-login-btn-grp');
    let socialLoginErrorDiv = Flits('<div />');
    socialLoginErrorDiv.addClass('flits-social-login-error'),
      Flits.each(items, function(index, item) {
      if (Flits.Metafields[item.metafieldName] && item.isDisplay) {
        let btnClone = Flits('#flits-social-login-btn-template').clone();
        btnClone.removeAttr('id');
        let hrefAttr = btnClone.attr('href').replace('proxy_name', Flits.proxy_name).replace('app_id', Flits.app_id).replace('shop_id', Flits.shop_id).replace('shop_token', Flits.token).replace('login_type', item.login_type);
        btnClone.attr('href', hrefAttr),
          btnClone.addClass(item.btn_class),
          btnClone.css('order', item.order),
          Flits(btnClone).find('.flits-social-login-btn-img').html(item.icon_img),
          Flits(btnClone).find('.flits-social-login-btn-text').html(item.login_name),
          socialLoginBtnGroup.append(btnClone);
      }
    });
    let code = Flits('<div />');
    for (code.addClass('flits-social-login-container'),
         code.append(socialLoginBtnGroup),
         code.append(socialLoginErrorDiv),
         i = 0; Flits.SocialLogin.settings.domSelector.length > i; i++)
      Flits.SocialLogin.settings.domSelector,
        Flits(Flits.SocialLogin.settings.domSelector[i][0]).appendSocialLoginDivAdded(code, Flits.SocialLogin.settings.domSelector[i][1]);
  };


  Flits(document).on('Flits:SocialLogin:Loaded', function(event){
    buttonAppendButtons();
  });

  Flits(document).on('Flits:SocialLogin:Loaded', function(event){  
    var data = event.detail.settings;
    data.redirectUrlFormSelector = ['form#header_customer_login', 'form#create_customer', 'form#RegisterForm', '.shopify-challenge__container form', '.shopify-challenge__container form'];
  });
  //   Flits(document).on('Flits:SocialLogin:Loaded', function(event){  
  //     setTimeout(function(){
  //       if (location.pathname.indexOf("/account") == -1){  
  //         Flits.setLocalStorage('flits_before_login_url','/account');
  //       }
  //     }, 800);
  //   });

  //   Flits(window).load(function() {  
  //     if (location.pathname.indexOf("/account") == -1){     
  //       if (location.pathname.indexOf("checkout") != -1)
  //       {
  //         Flits.setLocalStorage('flits_before_login_url',location.pathname);
  //       }else{
  //         Flits.setLocalStorage('flits_before_login_url','/account');
  //       }
  //     }
  //   });

  Flits(document).on('Flits:SocialLoginAutomaticCode:Loaded', function(event){

    var data = event.detail;
    var el = data.el;
    var parent = data.parent; // parent
    var cloneNode = data.cloneNode; // cloned social login div
    parent.find(".form__secondary-action").prepend(cloneNode);
    //     cloneNode.insertAfter(el.find("button.form__submit"));
    //     Flits(el.find("button.form__submit")).after(cloneNode);

  });

  if(location.pathname.indexOf("/account") != -1){
    Flits(document).on('click', '.flits-custom-tab-add', function(e){
      var elem = Flits(this).attr('href');
      var el = elem.replace('#', '');
      //     Flits('.flits-account-container').addClass('flits-active');

      Flits('.flits-menu-nav .flits-menu-item').removeClass('flits-menu-active');
      Flits('.flits-custom-tab-add').removeClass('flits-active');
      Flits('.flits-account-container a[href="'+elem+'"]').closest(".flits-menu-item").addClass("flits-menu-active")

      Flits('.flits-account-box').removeClass('flits-account-box-active');
      Flits('.flits-mobile-account-box').removeClass('flits-account-box-active');
      Flits('#flits_tab_'+el).addClass('flits-account-box-active');
      Flits('#flits_mobile_tab_'+el).addClass('flits-account-box-active');
      // To change the location.hash of the URL
      location.hash = el;
    });
  }





  //   REDIRECT AFTER LOGIN CODE  START
  Flits(document).on('Flits:SocialLogin:Loaded', function(event){  
    setTimeout(function(){
      if (location.pathname.indexOf("/account") == -1){  
        if(Flits.request.page_type == "cart"){
          Flits.setLocalStorage('flits_before_login_url','/cart');
        }else{
          Flits.setLocalStorage('flits_before_login_url','/account');
        }
      }
    }, 800);
  });

  Flits(window).load(function() {  
    setTimeout(function(){
      if (location.pathname.indexOf("/account") == -1){     
        if (location.pathname.indexOf("cart") != -1)
        {
          Flits.setLocalStorage('flits_before_login_url','/checkout');
        }else if(Flits.request.page_type == "cart"){
          Flits.setLocalStorage('flits_before_login_url','/cart');
        }else{
          Flits.setLocalStorage('flits_before_login_url','/account');
        }

      }
    }, 800);
  });

  Flits.fn.extend({
    addRedirectUrlcustom: function(urlcustom) {
      var settings = Flits.SocialLogin.settings;
      var names = ['return_to'];
      return this.each(function(index, item) {
        Flits.each(names, function(name_index, name) {
          var name_elem = Flits(item).find("[name='" + name + "']");
          name_elem.length < 1 && (name_elem = Flits('<input />'),
                                   name_elem.attr('type', 'hidden'),
                                   name_elem.attr('name', name),
                                   Flits(item).append(name_elem)),
            name_elem.attr('value', urlcustom);
        });
      }),
        this;
    }
  });

  Flits(window).load(function() {  
    if (location.pathname.indexOf("/account") == -1){     
      if (location.pathname.indexOf("checkout") != -1)
      {
        Flits.setLocalStorage('flits_before_login_url',location.pathname);
      }else if(Flits.request.page_type == "cart"){
        Flits.setLocalStorage('flits_before_login_url','/cart');
      }else{
        Flits.setLocalStorage('flits_before_login_url','/account');
      }
    }
    var redirectUrl;
    if(Flits.request.page_type == "cart"){
      redirectUrl = "/cart";
    }else{
      redirectUrl = Flits.getLocalStorage('flits_before_login_url');
    }
    var redirectUrlFormSelectorCustom = ['form#customer_login', 'form#create_customer', 'form#RegisterForm', '.shopify-challenge__container form', '.shopify-challenge__container form'];
    location.hash.indexOf('contact-form') == -1 && Flits(redirectUrlFormSelectorCustom.join(',')).addRedirectUrlcustom(redirectUrl);
  });
  //   REDIRECT AFTER LOGIN CODE  END

}(Flits));