// Helper functions
function replaceUrlParam(url, paramName, paramValue) {
  var pattern = new RegExp('('+paramName+'=).*?(&|$)'),
      newUrl = url.replace(pattern,'$1' + paramValue + '$2');
  if ( newUrl == url ) {
    newUrl = newUrl + (newUrl.indexOf('?')>0 ? '&' : '?') + paramName + '=' + paramValue;
  }
  return newUrl;
}

// Timber functions
window.timber = window.timber || {};

timber.cacheSelectors = function () {
  timber.cache = {
    // General
    $html: $('html'),
    $body: $('body'),
   $changeView: $('.change-view'), 
    // Navigation
    $navigation: $('#AccessibleNav'),
    $productImage: $('.product-single__media img'),
    $thumbImages: $('#ProductThumbs').find('.product-single__thumbnail')
  }
};

timber.init = function () {  
  timber.cacheSelectors();  
  timber.autoResponsiveElements();
 timber.productImageSwitch();
};


timber.productPage = function (options) {
  var moneyFormat = options.money_format,
      variant = options.variant,
      selector = options.selector,
      translations = options.translations;

  // Selectors
  var $productImage = $('#product-featured-image'),
      $addToCart = $('#AddToCart'),
      $productPrice = $('#ProductPrice'),
      $comparePrice = $('#ComparePrice'),
    //  $quantityElements = $('.quantity-selector, label + .js-qty, .qtyminus, .qtyplus, .product-single__quantity'),
      
      $productItem = $('.product-infor'),
      
      $productsku = $('#product-sku'),
      $addToCartText = $('#AddToCartText');
      

  if (variant) {
    
     //update variant inventory    

    
      var inventorySpan = $productItem.find('.product-inventory span');
    if (variant.available) {
      if (variant.inventory_management!=null) {
        jQuery("#product-inventory span").text(variant.inventory_quantity + " " + window.in_stock);
              inventorySpan.addClass('items-count');
              inventorySpan.removeClass('many-in-stock');
              inventorySpan.removeClass('out-of-stock');
              inventorySpan.removeClass('unavailable');
        
      } else {
        jQuery("#product-inventory span").text(window.many_in_stock);
        inventorySpan.addClass('many-in-stock')
        inventorySpan.removeClass('items-count');
        inventorySpan.removeClass('out-of-stock');
        inventorySpan.removeClass('unavailable');
      }
    } else {
      jQuery("#product-inventory span").text(window.out_of_stock);
       		inventorySpan.addClass('out-of-stock')            
            inventorySpan.removeClass('items-count');
            inventorySpan.removeClass('many-in-stock');
            inventorySpan.removeClass('unavailable');
    }
    
    
    
    

    // Select a valid variant if available
    if (variant.available) {
      // Available, enable the submit button, change text, show quantity elements
      $addToCart.removeClass('disabled').prop('disabled', false);
      $addToCartText.html(translations.add_to_cart);
      $productsku.text(variant.sku);
      //$quantityElements.show();
    } else {
      // Sold out, disable the submit button, change text, hide quantity elements
      $addToCart.addClass('disabled').prop('disabled', true);
      $addToCartText.html(translations.sold_out);
      //$quantityElements.hide();
    }

    // Regardless of stock, update the product price
    $productPrice.html( Shopify.formatMoney(variant.price, moneyFormat) );

    // Also update and show the product's compare price if necessary
    if (variant.compare_at_price > variant.price) {
      $comparePrice
        .html(Shopify.formatMoney(variant.compare_at_price, moneyFormat))
        .show();
    } else {
      $comparePrice.hide();
    }

  } else {
    // The variant doesn't exist, disable submit button.
    // This may be an error or notice that a specific variant is not available.
    // To only show available variants, implement linked product options:
    //   - http://docs.shopify.com/manual/configuration/store-customization/advanced-navigation/linked-product-options
    $addToCart.addClass('disabled').prop('disabled', true);
    $addToCartText.html(translations.unavailable);
    
    $('.product-infor .product-inventory span').addClass("unavailable");
    $('.product-infor .product-inventory span').removeClass("many-in-stock");
    $('.product-infor .product-inventory span').removeClass("items-count");
    $('.product-infor .product-inventory span').removeClass("out-of-stock");
    $('.product-infor .product-inventory span').text(window.unavailable);
    
    
   // $quantityElements.hide();
  
  }
 
  
  if (variant && variant.featured_image) {
    var originalImage = $("img[id|='product-featured-image']");
    var newImage = variant.featured_image;
    var element = originalImage[0];
    Shopify.Image.switchImage(newImage, element, function (newImageSizedSrc, newImage, element) {
      jQuery('.product-photo-thumbs img').each(function() {
        var grandSize = $(this).attr('src').split('?')[0].replace('_medium','');                    
        newImageSizedSrc = newImageSizedSrc.split('?')[0].replace('https:','');
        if(grandSize === newImageSizedSrc) {
          $('.product-photo-container .featured_media').each(function() {
            if($(this).hasClass('show')) {
              $(this).removeClass('show').addClass('hide');
            }
          });
          $('.product-photo-container .featured_media').first().removeClass('hide');
          timber.switchImage(newImageSizedSrc, null, $('.product-single__media:first img'));
          $('.product-single__media:first').attr('href', newImageSizedSrc);
          return false;
        }
      });
    });          
  };

    updatePricing();
};

timber.productImageSwitch = function () {
  if (timber.cache.$thumbImages.length) {  
    timber.cache.$thumbImages.on('click', function(evt) {
      evt.preventDefault();  
        $('.product-photo-container .featured_media').each(function() {
          if($(this).hasClass('show')) {
            $(this).removeClass('show').addClass('hide');
          }
        });
      if($(this).hasClass('video')) {                
        $('.product-single__media[data-media-id="'+$(this).attr('data-thumbnail-id')+'"]').parents('.featured_media').removeClass('hide').addClass('show');
      } else {
        $('.product-photo-container .featured_media').first().removeClass('hide');
        var newImage = $(this).attr('href');
        var zoomImage = $(this).attr('href');
        timber.switchImage(newImage, null, $('.product-single__media:first img'));
        $('.product-single__media:first').attr('href', newImage);
       
      }
    });
  }
};

timber.switchImage = function (src, imgObject, el) {  
  // Make sure element is a jquery object
  var $el = $(el);  
  $el.attr('src', src).parents('.featured_media').addClass('show');
};

timber.autoResponsiveElements = function () {
  var $iframeVideo = $('iframe[src*="youtube.com/embed"], iframe[src*="player.vimeo"]');
  var $iframeReset = $iframeVideo.add('iframe#admin_bar_iframe');

  $('table').wrap('<div class="table-wrapper"></div>');

  $iframeVideo.each(function () {
    // Add wrapper to make video responsive
    $(this).wrap('<div class="video-wrapper"></div>');
  });

  $iframeReset.each(function () {
    // Re-set the src attribute on each iframe after page load
    // for Chrome's "incorrect iFrame content on 'back'" bug.
    // https://code.google.com/p/chromium/issues/detail?id=395791
    // Need to specifically target video and admin bar
    this.src = this.src;
  });
};


if(window.location.href.indexOf("?customer_posted=true") > -1) {
  $(".success").addClass("show");
}   

// Initialize Timber's JS on docready
$(timber.init)
