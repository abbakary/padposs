// Tanzania phone number validation, UI enhancement, and normalized submission
// Applies to any text input whose name contains "phone" or has a TZ pattern
(function(){
  function normalizeTZ(value){
    if(!value) return '';
    var v = String(value).replace(/[^\d+]/g,'');
    if(v.startsWith('+255')){
      return '+255' + v.replace('+255','').replace(/\D/g,'');
    }
    if(v.startsWith('0')){
      return '+255' + v.slice(1).replace(/\D/g,'');
    }
    // Fallback: if 9 digits provided, assume local without leading 0
    var digits = v.replace(/\D/g,'');
    if(digits.length === 9){ return '+255' + digits; }
    return v;
  }

  function enhanceInput(input){
    if(input.dataset.tzPhoneEnhanced === '1') return;
    input.dataset.tzPhoneEnhanced = '1';

    // Attributes to aid mobile keyboards and validation
    if(!input.getAttribute('inputmode')) input.setAttribute('inputmode','tel');
    if(!input.getAttribute('autocomplete')) input.setAttribute('autocomplete','tel');
    if(!input.getAttribute('placeholder')) input.setAttribute('placeholder','+255 712 345 678');

    // Create hidden normalized field submitted alongside
    var hiddenName = (input.getAttribute('name') || 'phone') + '_normalized';
    var hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.name = hiddenName;
    hidden.value = normalizeTZ(input.value);

    // Wrap with a simple flag addon without breaking existing layout
    var wrapper = document.createElement('div');
    wrapper.className = 'tz-phone-group';

    var addon = document.createElement('span');
    addon.className = 'tz-flag-addon';
    var img = document.createElement('img');
    img.src = '/static/assets/images/flags/tz.svg';
    img.alt = 'TZ';
    img.className = 'tz-flag';
    addon.appendChild(img);

    // Insert DOM: replace input with wrapper [addon][input]
    var parent = input.parentNode;
    parent.insertBefore(wrapper, input);
    wrapper.appendChild(addon);
    wrapper.appendChild(input);
    parent.insertBefore(hidden, wrapper.nextSibling);

    // Sync hidden normalized on input/blur
    function onInput(e){
      var value = e.target.value.replace(/[^\d+\s]/g,'');
      // Length guards
      if(value.startsWith('+255')){ if(value.length>16) value = value.substring(0,16); }
      else if(value.startsWith('0')){ if(value.length>14) value = value.substring(0,14); }
      else { if(value.length>16) value = value.substring(0,16); }
      e.target.value = value;
      hidden.value = normalizeTZ(value);
    }
    input.addEventListener('input', onInput);
    input.addEventListener('blur', onInput);

    // Keydown guard
    input.addEventListener('keydown', function(e){
      var allowed = ['Backspace','Delete','Tab','Escape','Enter','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'];
      if(allowed.includes(e.key) || e.ctrlKey || e.metaKey) return;
      if(!/[\d+\s]/.test(e.key)) e.preventDefault();
    });

    // Paste guard
    input.addEventListener('paste', function(e){
      e.preventDefault();
      var paste = (e.clipboardData||window.clipboardData).getData('text')||'';
      paste = paste.replace(/[^\d+\s]/g,'');
      if(paste.startsWith('+255')) paste = paste.substring(0,16);
      else if(paste.startsWith('0')) paste = paste.substring(0,14);
      else paste = paste.substring(0,16);
      input.value = paste; onInput({target: input});
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    var selector = 'input[type="text"][name*="phone"], input[pattern*="255"], input[name*="whatsapp"]';
    document.querySelectorAll(selector).forEach(enhanceInput);
  });
})();
