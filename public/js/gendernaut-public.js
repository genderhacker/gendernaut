(function ($) {
  'use strict';

  $ = $ && $.hasOwnProperty('default') ? $['default'] : $;

  /*!
   * Isotope PACKAGED v3.0.6
   *
   * Licensed GPLv3 for open source use
   * or Isotope Commercial License for commercial use
   *
   * https://isotope.metafizzy.co
   * Copyright 2010-2018 Metafizzy
   */

  /**
   * Bridget makes jQuery widgets
   * v2.0.1
   * MIT license
   */

  /* jshint browser: true, strict: true, undef: true, unused: true */

  ( function( window, factory ) {
    // universal module definition
    /*jshint strict: false */ /* globals define, module, require */
    if ( typeof define == 'function' && define.amd ) {
      // AMD
      define( 'jquery-bridget/jquery-bridget',[ 'jquery' ], function( jQuery ) {
        return factory( window, jQuery );
      });
    } else if ( typeof module == 'object' && module.exports ) {
      // CommonJS
      module.exports = factory(
        window,
        require('jquery')
      );
    } else {
      // browser global
      window.jQueryBridget = factory(
        window,
        window.jQuery
      );
    }

  }( window, function factory( window, jQuery ) {

  // ----- utils ----- //

  var arraySlice = Array.prototype.slice;

  // helper function for logging errors
  // $.error breaks jQuery chaining
  var console = window.console;
  var logError = typeof console == 'undefined' ? function() {} :
    function( message ) {
      console.error( message );
    };

  // ----- jQueryBridget ----- //

  function jQueryBridget( namespace, PluginClass, $ ) {
    $ = $ || jQuery || window.jQuery;
    if ( !$ ) {
      return;
    }

    // add option method -> $().plugin('option', {...})
    if ( !PluginClass.prototype.option ) {
      // option setter
      PluginClass.prototype.option = function( opts ) {
        // bail out if not an object
        if ( !$.isPlainObject( opts ) ){
          return;
        }
        this.options = $.extend( true, this.options, opts );
      };
    }

    // make jQuery plugin
    $.fn[ namespace ] = function( arg0 /*, arg1 */ ) {
      if ( typeof arg0 == 'string' ) {
        // method call $().plugin( 'methodName', { options } )
        // shift arguments by 1
        var args = arraySlice.call( arguments, 1 );
        return methodCall( this, arg0, args );
      }
      // just $().plugin({ options })
      plainCall( this, arg0 );
      return this;
    };

    // $().plugin('methodName')
    function methodCall( $elems, methodName, args ) {
      var returnValue;
      var pluginMethodStr = '$().' + namespace + '("' + methodName + '")';

      $elems.each( function( i, elem ) {
        // get instance
        var instance = $.data( elem, namespace );
        if ( !instance ) {
          logError( namespace + ' not initialized. Cannot call methods, i.e. ' +
            pluginMethodStr );
          return;
        }

        var method = instance[ methodName ];
        if ( !method || methodName.charAt(0) == '_' ) {
          logError( pluginMethodStr + ' is not a valid method' );
          return;
        }

        // apply method, get return value
        var value = method.apply( instance, args );
        // set return value if value is returned, use only first value
        returnValue = returnValue === undefined ? value : returnValue;
      });

      return returnValue !== undefined ? returnValue : $elems;
    }

    function plainCall( $elems, options ) {
      $elems.each( function( i, elem ) {
        var instance = $.data( elem, namespace );
        if ( instance ) {
          // set options & init
          instance.option( options );
          instance._init();
        } else {
          // initialize new instance
          instance = new PluginClass( elem, options );
          $.data( elem, namespace, instance );
        }
      });
    }

    updateJQuery( $ );

  }

  // ----- updateJQuery ----- //

  // set $.bridget for v1 backwards compatibility
  function updateJQuery( $ ) {
    if ( !$ || ( $ && $.bridget ) ) {
      return;
    }
    $.bridget = jQueryBridget;
  }

  updateJQuery( jQuery || window.jQuery );

  // -----  ----- //

  return jQueryBridget;

  }));

  /**
   * EvEmitter v1.1.0
   * Lil' event emitter
   * MIT License
   */

  /* jshint unused: true, undef: true, strict: true */

  ( function( global, factory ) {
    // universal module definition
    /* jshint strict: false */ /* globals define, module, window */
    if ( typeof define == 'function' && define.amd ) {
      // AMD - RequireJS
      define( 'ev-emitter/ev-emitter',factory );
    } else if ( typeof module == 'object' && module.exports ) {
      // CommonJS - Browserify, Webpack
      module.exports = factory();
    } else {
      // Browser globals
      global.EvEmitter = factory();
    }

  }( typeof window != 'undefined' ? window : undefined, function() {



  function EvEmitter() {}

  var proto = EvEmitter.prototype;

  proto.on = function( eventName, listener ) {
    if ( !eventName || !listener ) {
      return;
    }
    // set events hash
    var events = this._events = this._events || {};
    // set listeners array
    var listeners = events[ eventName ] = events[ eventName ] || [];
    // only add once
    if ( listeners.indexOf( listener ) == -1 ) {
      listeners.push( listener );
    }

    return this;
  };

  proto.once = function( eventName, listener ) {
    if ( !eventName || !listener ) {
      return;
    }
    // add event
    this.on( eventName, listener );
    // set once flag
    // set onceEvents hash
    var onceEvents = this._onceEvents = this._onceEvents || {};
    // set onceListeners object
    var onceListeners = onceEvents[ eventName ] = onceEvents[ eventName ] || {};
    // set flag
    onceListeners[ listener ] = true;

    return this;
  };

  proto.off = function( eventName, listener ) {
    var listeners = this._events && this._events[ eventName ];
    if ( !listeners || !listeners.length ) {
      return;
    }
    var index = listeners.indexOf( listener );
    if ( index != -1 ) {
      listeners.splice( index, 1 );
    }

    return this;
  };

  proto.emitEvent = function( eventName, args ) {
    var listeners = this._events && this._events[ eventName ];
    if ( !listeners || !listeners.length ) {
      return;
    }
    // copy over to avoid interference if .off() in listener
    listeners = listeners.slice(0);
    args = args || [];
    // once stuff
    var onceListeners = this._onceEvents && this._onceEvents[ eventName ];

    for ( var i=0; i < listeners.length; i++ ) {
      var listener = listeners[i];
      var isOnce = onceListeners && onceListeners[ listener ];
      if ( isOnce ) {
        // remove listener
        // remove before trigger to prevent recursion
        this.off( eventName, listener );
        // unset once flag
        delete onceListeners[ listener ];
      }
      // trigger listener
      listener.apply( this, args );
    }

    return this;
  };

  proto.allOff = function() {
    delete this._events;
    delete this._onceEvents;
  };

  return EvEmitter;

  }));

  /*!
   * getSize v2.0.3
   * measure size of elements
   * MIT license
   */

  /* jshint browser: true, strict: true, undef: true, unused: true */
  /* globals console: false */

  ( function( window, factory ) {
    /* jshint strict: false */ /* globals define, module */
    if ( typeof define == 'function' && define.amd ) {
      // AMD
      define( 'get-size/get-size',factory );
    } else if ( typeof module == 'object' && module.exports ) {
      // CommonJS
      module.exports = factory();
    } else {
      // browser global
      window.getSize = factory();
    }

  })( window, function factory() {

  // -------------------------- helpers -------------------------- //

  // get a number from a string, not a percentage
  function getStyleSize( value ) {
    var num = parseFloat( value );
    // not a percent like '100%', and a number
    var isValid = value.indexOf('%') == -1 && !isNaN( num );
    return isValid && num;
  }

  function noop() {}

  var logError = typeof console == 'undefined' ? noop :
    function( message ) {
      console.error( message );
    };

  // -------------------------- measurements -------------------------- //

  var measurements = [
    'paddingLeft',
    'paddingRight',
    'paddingTop',
    'paddingBottom',
    'marginLeft',
    'marginRight',
    'marginTop',
    'marginBottom',
    'borderLeftWidth',
    'borderRightWidth',
    'borderTopWidth',
    'borderBottomWidth'
  ];

  var measurementsLength = measurements.length;

  function getZeroSize() {
    var size = {
      width: 0,
      height: 0,
      innerWidth: 0,
      innerHeight: 0,
      outerWidth: 0,
      outerHeight: 0
    };
    for ( var i=0; i < measurementsLength; i++ ) {
      var measurement = measurements[i];
      size[ measurement ] = 0;
    }
    return size;
  }

  // -------------------------- getStyle -------------------------- //

  /**
   * getStyle, get style of element, check for Firefox bug
   * https://bugzilla.mozilla.org/show_bug.cgi?id=548397
   */
  function getStyle( elem ) {
    var style = getComputedStyle( elem );
    if ( !style ) {
      logError( 'Style returned ' + style +
        '. Are you running this code in a hidden iframe on Firefox? ' +
        'See https://bit.ly/getsizebug1' );
    }
    return style;
  }

  // -------------------------- setup -------------------------- //

  var isSetup = false;

  var isBoxSizeOuter;

  /**
   * setup
   * check isBoxSizerOuter
   * do on first getSize() rather than on page load for Firefox bug
   */
  function setup() {
    // setup once
    if ( isSetup ) {
      return;
    }
    isSetup = true;

    // -------------------------- box sizing -------------------------- //

    /**
     * Chrome & Safari measure the outer-width on style.width on border-box elems
     * IE11 & Firefox<29 measures the inner-width
     */
    var div = document.createElement('div');
    div.style.width = '200px';
    div.style.padding = '1px 2px 3px 4px';
    div.style.borderStyle = 'solid';
    div.style.borderWidth = '1px 2px 3px 4px';
    div.style.boxSizing = 'border-box';

    var body = document.body || document.documentElement;
    body.appendChild( div );
    var style = getStyle( div );
    // round value for browser zoom. desandro/masonry#928
    isBoxSizeOuter = Math.round( getStyleSize( style.width ) ) == 200;
    getSize.isBoxSizeOuter = isBoxSizeOuter;

    body.removeChild( div );
  }

  // -------------------------- getSize -------------------------- //

  function getSize( elem ) {
    setup();

    // use querySeletor if elem is string
    if ( typeof elem == 'string' ) {
      elem = document.querySelector( elem );
    }

    // do not proceed on non-objects
    if ( !elem || typeof elem != 'object' || !elem.nodeType ) {
      return;
    }

    var style = getStyle( elem );

    // if hidden, everything is 0
    if ( style.display == 'none' ) {
      return getZeroSize();
    }

    var size = {};
    size.width = elem.offsetWidth;
    size.height = elem.offsetHeight;

    var isBorderBox = size.isBorderBox = style.boxSizing == 'border-box';

    // get all measurements
    for ( var i=0; i < measurementsLength; i++ ) {
      var measurement = measurements[i];
      var value = style[ measurement ];
      var num = parseFloat( value );
      // any 'auto', 'medium' value will be 0
      size[ measurement ] = !isNaN( num ) ? num : 0;
    }

    var paddingWidth = size.paddingLeft + size.paddingRight;
    var paddingHeight = size.paddingTop + size.paddingBottom;
    var marginWidth = size.marginLeft + size.marginRight;
    var marginHeight = size.marginTop + size.marginBottom;
    var borderWidth = size.borderLeftWidth + size.borderRightWidth;
    var borderHeight = size.borderTopWidth + size.borderBottomWidth;

    var isBorderBoxSizeOuter = isBorderBox && isBoxSizeOuter;

    // overwrite width and height if we can get it from style
    var styleWidth = getStyleSize( style.width );
    if ( styleWidth !== false ) {
      size.width = styleWidth +
        // add padding and border unless it's already including it
        ( isBorderBoxSizeOuter ? 0 : paddingWidth + borderWidth );
    }

    var styleHeight = getStyleSize( style.height );
    if ( styleHeight !== false ) {
      size.height = styleHeight +
        // add padding and border unless it's already including it
        ( isBorderBoxSizeOuter ? 0 : paddingHeight + borderHeight );
    }

    size.innerWidth = size.width - ( paddingWidth + borderWidth );
    size.innerHeight = size.height - ( paddingHeight + borderHeight );

    size.outerWidth = size.width + marginWidth;
    size.outerHeight = size.height + marginHeight;

    return size;
  }

  return getSize;

  });

  /**
   * matchesSelector v2.0.2
   * matchesSelector( element, '.selector' )
   * MIT license
   */

  /*jshint browser: true, strict: true, undef: true, unused: true */

  ( function( window, factory ) {
    // universal module definition
    if ( typeof define == 'function' && define.amd ) {
      // AMD
      define( 'desandro-matches-selector/matches-selector',factory );
    } else if ( typeof module == 'object' && module.exports ) {
      // CommonJS
      module.exports = factory();
    } else {
      // browser global
      window.matchesSelector = factory();
    }

  }( window, function factory() {

    var matchesMethod = ( function() {
      var ElemProto = window.Element.prototype;
      // check for the standard method name first
      if ( ElemProto.matches ) {
        return 'matches';
      }
      // check un-prefixed
      if ( ElemProto.matchesSelector ) {
        return 'matchesSelector';
      }
      // check vendor prefixes
      var prefixes = [ 'webkit', 'moz', 'ms', 'o' ];

      for ( var i=0; i < prefixes.length; i++ ) {
        var prefix = prefixes[i];
        var method = prefix + 'MatchesSelector';
        if ( ElemProto[ method ] ) {
          return method;
        }
      }
    })();

    return function matchesSelector( elem, selector ) {
      return elem[ matchesMethod ]( selector );
    };

  }));

  /**
   * Fizzy UI utils v2.0.7
   * MIT license
   */

  /*jshint browser: true, undef: true, unused: true, strict: true */

  ( function( window, factory ) {
    // universal module definition
    /*jshint strict: false */ /*globals define, module, require */

    if ( typeof define == 'function' && define.amd ) {
      // AMD
      define( 'fizzy-ui-utils/utils',[
        'desandro-matches-selector/matches-selector'
      ], function( matchesSelector ) {
        return factory( window, matchesSelector );
      });
    } else if ( typeof module == 'object' && module.exports ) {
      // CommonJS
      module.exports = factory(
        window,
        require('desandro-matches-selector')
      );
    } else {
      // browser global
      window.fizzyUIUtils = factory(
        window,
        window.matchesSelector
      );
    }

  }( window, function factory( window, matchesSelector ) {



  var utils = {};

  // ----- extend ----- //

  // extends objects
  utils.extend = function( a, b ) {
    for ( var prop in b ) {
      a[ prop ] = b[ prop ];
    }
    return a;
  };

  // ----- modulo ----- //

  utils.modulo = function( num, div ) {
    return ( ( num % div ) + div ) % div;
  };

  // ----- makeArray ----- //

  var arraySlice = Array.prototype.slice;

  // turn element or nodeList into an array
  utils.makeArray = function( obj ) {
    if ( Array.isArray( obj ) ) {
      // use object if already an array
      return obj;
    }
    // return empty array if undefined or null. #6
    if ( obj === null || obj === undefined ) {
      return [];
    }

    var isArrayLike = typeof obj == 'object' && typeof obj.length == 'number';
    if ( isArrayLike ) {
      // convert nodeList to array
      return arraySlice.call( obj );
    }

    // array of single index
    return [ obj ];
  };

  // ----- removeFrom ----- //

  utils.removeFrom = function( ary, obj ) {
    var index = ary.indexOf( obj );
    if ( index != -1 ) {
      ary.splice( index, 1 );
    }
  };

  // ----- getParent ----- //

  utils.getParent = function( elem, selector ) {
    while ( elem.parentNode && elem != document.body ) {
      elem = elem.parentNode;
      if ( matchesSelector( elem, selector ) ) {
        return elem;
      }
    }
  };

  // ----- getQueryElement ----- //

  // use element as selector string
  utils.getQueryElement = function( elem ) {
    if ( typeof elem == 'string' ) {
      return document.querySelector( elem );
    }
    return elem;
  };

  // ----- handleEvent ----- //

  // enable .ontype to trigger from .addEventListener( elem, 'type' )
  utils.handleEvent = function( event ) {
    var method = 'on' + event.type;
    if ( this[ method ] ) {
      this[ method ]( event );
    }
  };

  // ----- filterFindElements ----- //

  utils.filterFindElements = function( elems, selector ) {
    // make array of elems
    elems = utils.makeArray( elems );
    var ffElems = [];

    elems.forEach( function( elem ) {
      // check that elem is an actual element
      if ( !( elem instanceof HTMLElement ) ) {
        return;
      }
      // add elem if no selector
      if ( !selector ) {
        ffElems.push( elem );
        return;
      }
      // filter & find items if we have a selector
      // filter
      if ( matchesSelector( elem, selector ) ) {
        ffElems.push( elem );
      }
      // find children
      var childElems = elem.querySelectorAll( selector );
      // concat childElems to filterFound array
      for ( var i=0; i < childElems.length; i++ ) {
        ffElems.push( childElems[i] );
      }
    });

    return ffElems;
  };

  // ----- debounceMethod ----- //

  utils.debounceMethod = function( _class, methodName, threshold ) {
    threshold = threshold || 100;
    // original method
    var method = _class.prototype[ methodName ];
    var timeoutName = methodName + 'Timeout';

    _class.prototype[ methodName ] = function() {
      var timeout = this[ timeoutName ];
      clearTimeout( timeout );

      var args = arguments;
      var _this = this;
      this[ timeoutName ] = setTimeout( function() {
        method.apply( _this, args );
        delete _this[ timeoutName ];
      }, threshold );
    };
  };

  // ----- docReady ----- //

  utils.docReady = function( callback ) {
    var readyState = document.readyState;
    if ( readyState == 'complete' || readyState == 'interactive' ) {
      // do async to allow for other scripts to run. metafizzy/flickity#441
      setTimeout( callback );
    } else {
      document.addEventListener( 'DOMContentLoaded', callback );
    }
  };

  // ----- htmlInit ----- //

  // http://jamesroberts.name/blog/2010/02/22/string-functions-for-javascript-trim-to-camel-case-to-dashed-and-to-underscore/
  utils.toDashed = function( str ) {
    return str.replace( /(.)([A-Z])/g, function( match, $1, $2 ) {
      return $1 + '-' + $2;
    }).toLowerCase();
  };

  var console = window.console;
  /**
   * allow user to initialize classes via [data-namespace] or .js-namespace class
   * htmlInit( Widget, 'widgetName' )
   * options are parsed from data-namespace-options
   */
  utils.htmlInit = function( WidgetClass, namespace ) {
    utils.docReady( function() {
      var dashedNamespace = utils.toDashed( namespace );
      var dataAttr = 'data-' + dashedNamespace;
      var dataAttrElems = document.querySelectorAll( '[' + dataAttr + ']' );
      var jsDashElems = document.querySelectorAll( '.js-' + dashedNamespace );
      var elems = utils.makeArray( dataAttrElems )
        .concat( utils.makeArray( jsDashElems ) );
      var dataOptionsAttr = dataAttr + '-options';
      var jQuery = window.jQuery;

      elems.forEach( function( elem ) {
        var attr = elem.getAttribute( dataAttr ) ||
          elem.getAttribute( dataOptionsAttr );
        var options;
        try {
          options = attr && JSON.parse( attr );
        } catch ( error ) {
          // log error, do not initialize
          if ( console ) {
            console.error( 'Error parsing ' + dataAttr + ' on ' + elem.className +
            ': ' + error );
          }
          return;
        }
        // initialize
        var instance = new WidgetClass( elem, options );
        // make available via $().data('namespace')
        if ( jQuery ) {
          jQuery.data( elem, namespace, instance );
        }
      });

    });
  };

  // -----  ----- //

  return utils;

  }));

  /**
   * Outlayer Item
   */

  ( function( window, factory ) {
    // universal module definition
    /* jshint strict: false */ /* globals define, module, require */
    if ( typeof define == 'function' && define.amd ) {
      // AMD - RequireJS
      define( 'outlayer/item',[
          'ev-emitter/ev-emitter',
          'get-size/get-size'
        ],
        factory
      );
    } else if ( typeof module == 'object' && module.exports ) {
      // CommonJS - Browserify, Webpack
      module.exports = factory(
        require('ev-emitter'),
        require('get-size')
      );
    } else {
      // browser global
      window.Outlayer = {};
      window.Outlayer.Item = factory(
        window.EvEmitter,
        window.getSize
      );
    }

  }( window, function factory( EvEmitter, getSize ) {

  // ----- helpers ----- //

  function isEmptyObj( obj ) {
    for ( var prop in obj ) {
      return false;
    }
    prop = null;
    return true;
  }

  // -------------------------- CSS3 support -------------------------- //


  var docElemStyle = document.documentElement.style;

  var transitionProperty = typeof docElemStyle.transition == 'string' ?
    'transition' : 'WebkitTransition';
  var transformProperty = typeof docElemStyle.transform == 'string' ?
    'transform' : 'WebkitTransform';

  var transitionEndEvent = {
    WebkitTransition: 'webkitTransitionEnd',
    transition: 'transitionend'
  }[ transitionProperty ];

  // cache all vendor properties that could have vendor prefix
  var vendorProperties = {
    transform: transformProperty,
    transition: transitionProperty,
    transitionDuration: transitionProperty + 'Duration',
    transitionProperty: transitionProperty + 'Property',
    transitionDelay: transitionProperty + 'Delay'
  };

  // -------------------------- Item -------------------------- //

  function Item( element, layout ) {
    if ( !element ) {
      return;
    }

    this.element = element;
    // parent layout class, i.e. Masonry, Isotope, or Packery
    this.layout = layout;
    this.position = {
      x: 0,
      y: 0
    };

    this._create();
  }

  // inherit EvEmitter
  var proto = Item.prototype = Object.create( EvEmitter.prototype );
  proto.constructor = Item;

  proto._create = function() {
    // transition objects
    this._transn = {
      ingProperties: {},
      clean: {},
      onEnd: {}
    };

    this.css({
      position: 'absolute'
    });
  };

  // trigger specified handler for event type
  proto.handleEvent = function( event ) {
    var method = 'on' + event.type;
    if ( this[ method ] ) {
      this[ method ]( event );
    }
  };

  proto.getSize = function() {
    this.size = getSize( this.element );
  };

  /**
   * apply CSS styles to element
   * @param {Object} style
   */
  proto.css = function( style ) {
    var elemStyle = this.element.style;

    for ( var prop in style ) {
      // use vendor property if available
      var supportedProp = vendorProperties[ prop ] || prop;
      elemStyle[ supportedProp ] = style[ prop ];
    }
  };

   // measure position, and sets it
  proto.getPosition = function() {
    var style = getComputedStyle( this.element );
    var isOriginLeft = this.layout._getOption('originLeft');
    var isOriginTop = this.layout._getOption('originTop');
    var xValue = style[ isOriginLeft ? 'left' : 'right' ];
    var yValue = style[ isOriginTop ? 'top' : 'bottom' ];
    var x = parseFloat( xValue );
    var y = parseFloat( yValue );
    // convert percent to pixels
    var layoutSize = this.layout.size;
    if ( xValue.indexOf('%') != -1 ) {
      x = ( x / 100 ) * layoutSize.width;
    }
    if ( yValue.indexOf('%') != -1 ) {
      y = ( y / 100 ) * layoutSize.height;
    }
    // clean up 'auto' or other non-integer values
    x = isNaN( x ) ? 0 : x;
    y = isNaN( y ) ? 0 : y;
    // remove padding from measurement
    x -= isOriginLeft ? layoutSize.paddingLeft : layoutSize.paddingRight;
    y -= isOriginTop ? layoutSize.paddingTop : layoutSize.paddingBottom;

    this.position.x = x;
    this.position.y = y;
  };

  // set settled position, apply padding
  proto.layoutPosition = function() {
    var layoutSize = this.layout.size;
    var style = {};
    var isOriginLeft = this.layout._getOption('originLeft');
    var isOriginTop = this.layout._getOption('originTop');

    // x
    var xPadding = isOriginLeft ? 'paddingLeft' : 'paddingRight';
    var xProperty = isOriginLeft ? 'left' : 'right';
    var xResetProperty = isOriginLeft ? 'right' : 'left';

    var x = this.position.x + layoutSize[ xPadding ];
    // set in percentage or pixels
    style[ xProperty ] = this.getXValue( x );
    // reset other property
    style[ xResetProperty ] = '';

    // y
    var yPadding = isOriginTop ? 'paddingTop' : 'paddingBottom';
    var yProperty = isOriginTop ? 'top' : 'bottom';
    var yResetProperty = isOriginTop ? 'bottom' : 'top';

    var y = this.position.y + layoutSize[ yPadding ];
    // set in percentage or pixels
    style[ yProperty ] = this.getYValue( y );
    // reset other property
    style[ yResetProperty ] = '';

    this.css( style );
    this.emitEvent( 'layout', [ this ] );
  };

  proto.getXValue = function( x ) {
    var isHorizontal = this.layout._getOption('horizontal');
    return this.layout.options.percentPosition && !isHorizontal ?
      ( ( x / this.layout.size.width ) * 100 ) + '%' : x + 'px';
  };

  proto.getYValue = function( y ) {
    var isHorizontal = this.layout._getOption('horizontal');
    return this.layout.options.percentPosition && isHorizontal ?
      ( ( y / this.layout.size.height ) * 100 ) + '%' : y + 'px';
  };

  proto._transitionTo = function( x, y ) {
    this.getPosition();
    // get current x & y from top/left
    var curX = this.position.x;
    var curY = this.position.y;

    var didNotMove = x == this.position.x && y == this.position.y;

    // save end position
    this.setPosition( x, y );

    // if did not move and not transitioning, just go to layout
    if ( didNotMove && !this.isTransitioning ) {
      this.layoutPosition();
      return;
    }

    var transX = x - curX;
    var transY = y - curY;
    var transitionStyle = {};
    transitionStyle.transform = this.getTranslate( transX, transY );

    this.transition({
      to: transitionStyle,
      onTransitionEnd: {
        transform: this.layoutPosition
      },
      isCleaning: true
    });
  };

  proto.getTranslate = function( x, y ) {
    // flip cooridinates if origin on right or bottom
    var isOriginLeft = this.layout._getOption('originLeft');
    var isOriginTop = this.layout._getOption('originTop');
    x = isOriginLeft ? x : -x;
    y = isOriginTop ? y : -y;
    return 'translate3d(' + x + 'px, ' + y + 'px, 0)';
  };

  // non transition + transform support
  proto.goTo = function( x, y ) {
    this.setPosition( x, y );
    this.layoutPosition();
  };

  proto.moveTo = proto._transitionTo;

  proto.setPosition = function( x, y ) {
    this.position.x = parseFloat( x );
    this.position.y = parseFloat( y );
  };

  // ----- transition ----- //

  /**
   * @param {Object} style - CSS
   * @param {Function} onTransitionEnd
   */

  // non transition, just trigger callback
  proto._nonTransition = function( args ) {
    this.css( args.to );
    if ( args.isCleaning ) {
      this._removeStyles( args.to );
    }
    for ( var prop in args.onTransitionEnd ) {
      args.onTransitionEnd[ prop ].call( this );
    }
  };

  /**
   * proper transition
   * @param {Object} args - arguments
   *   @param {Object} to - style to transition to
   *   @param {Object} from - style to start transition from
   *   @param {Boolean} isCleaning - removes transition styles after transition
   *   @param {Function} onTransitionEnd - callback
   */
  proto.transition = function( args ) {
    // redirect to nonTransition if no transition duration
    if ( !parseFloat( this.layout.options.transitionDuration ) ) {
      this._nonTransition( args );
      return;
    }

    var _transition = this._transn;
    // keep track of onTransitionEnd callback by css property
    for ( var prop in args.onTransitionEnd ) {
      _transition.onEnd[ prop ] = args.onTransitionEnd[ prop ];
    }
    // keep track of properties that are transitioning
    for ( prop in args.to ) {
      _transition.ingProperties[ prop ] = true;
      // keep track of properties to clean up when transition is done
      if ( args.isCleaning ) {
        _transition.clean[ prop ] = true;
      }
    }

    // set from styles
    if ( args.from ) {
      this.css( args.from );
      // force redraw. http://blog.alexmaccaw.com/css-transitions
      var h = this.element.offsetHeight;
      // hack for JSHint to hush about unused var
      h = null;
    }
    // enable transition
    this.enableTransition( args.to );
    // set styles that are transitioning
    this.css( args.to );

    this.isTransitioning = true;

  };

  // dash before all cap letters, including first for
  // WebkitTransform => -webkit-transform
  function toDashedAll( str ) {
    return str.replace( /([A-Z])/g, function( $1 ) {
      return '-' + $1.toLowerCase();
    });
  }

  var transitionProps = 'opacity,' + toDashedAll( transformProperty );

  proto.enableTransition = function(/* style */) {
    // HACK changing transitionProperty during a transition
    // will cause transition to jump
    if ( this.isTransitioning ) {
      return;
    }

    // make `transition: foo, bar, baz` from style object
    // HACK un-comment this when enableTransition can work
    // while a transition is happening
    // var transitionValues = [];
    // for ( var prop in style ) {
    //   // dash-ify camelCased properties like WebkitTransition
    //   prop = vendorProperties[ prop ] || prop;
    //   transitionValues.push( toDashedAll( prop ) );
    // }
    // munge number to millisecond, to match stagger
    var duration = this.layout.options.transitionDuration;
    duration = typeof duration == 'number' ? duration + 'ms' : duration;
    // enable transition styles
    this.css({
      transitionProperty: transitionProps,
      transitionDuration: duration,
      transitionDelay: this.staggerDelay || 0
    });
    // listen for transition end event
    this.element.addEventListener( transitionEndEvent, this, false );
  };

  // ----- events ----- //

  proto.onwebkitTransitionEnd = function( event ) {
    this.ontransitionend( event );
  };

  proto.onotransitionend = function( event ) {
    this.ontransitionend( event );
  };

  // properties that I munge to make my life easier
  var dashedVendorProperties = {
    '-webkit-transform': 'transform'
  };

  proto.ontransitionend = function( event ) {
    // disregard bubbled events from children
    if ( event.target !== this.element ) {
      return;
    }
    var _transition = this._transn;
    // get property name of transitioned property, convert to prefix-free
    var propertyName = dashedVendorProperties[ event.propertyName ] || event.propertyName;

    // remove property that has completed transitioning
    delete _transition.ingProperties[ propertyName ];
    // check if any properties are still transitioning
    if ( isEmptyObj( _transition.ingProperties ) ) {
      // all properties have completed transitioning
      this.disableTransition();
    }
    // clean style
    if ( propertyName in _transition.clean ) {
      // clean up style
      this.element.style[ event.propertyName ] = '';
      delete _transition.clean[ propertyName ];
    }
    // trigger onTransitionEnd callback
    if ( propertyName in _transition.onEnd ) {
      var onTransitionEnd = _transition.onEnd[ propertyName ];
      onTransitionEnd.call( this );
      delete _transition.onEnd[ propertyName ];
    }

    this.emitEvent( 'transitionEnd', [ this ] );
  };

  proto.disableTransition = function() {
    this.removeTransitionStyles();
    this.element.removeEventListener( transitionEndEvent, this, false );
    this.isTransitioning = false;
  };

  /**
   * removes style property from element
   * @param {Object} style
  **/
  proto._removeStyles = function( style ) {
    // clean up transition styles
    var cleanStyle = {};
    for ( var prop in style ) {
      cleanStyle[ prop ] = '';
    }
    this.css( cleanStyle );
  };

  var cleanTransitionStyle = {
    transitionProperty: '',
    transitionDuration: '',
    transitionDelay: ''
  };

  proto.removeTransitionStyles = function() {
    // remove transition
    this.css( cleanTransitionStyle );
  };

  // ----- stagger ----- //

  proto.stagger = function( delay ) {
    delay = isNaN( delay ) ? 0 : delay;
    this.staggerDelay = delay + 'ms';
  };

  // ----- show/hide/remove ----- //

  // remove element from DOM
  proto.removeElem = function() {
    this.element.parentNode.removeChild( this.element );
    // remove display: none
    this.css({ display: '' });
    this.emitEvent( 'remove', [ this ] );
  };

  proto.remove = function() {
    // just remove element if no transition support or no transition
    if ( !transitionProperty || !parseFloat( this.layout.options.transitionDuration ) ) {
      this.removeElem();
      return;
    }

    // start transition
    this.once( 'transitionEnd', function() {
      this.removeElem();
    });
    this.hide();
  };

  proto.reveal = function() {
    delete this.isHidden;
    // remove display: none
    this.css({ display: '' });

    var options = this.layout.options;

    var onTransitionEnd = {};
    var transitionEndProperty = this.getHideRevealTransitionEndProperty('visibleStyle');
    onTransitionEnd[ transitionEndProperty ] = this.onRevealTransitionEnd;

    this.transition({
      from: options.hiddenStyle,
      to: options.visibleStyle,
      isCleaning: true,
      onTransitionEnd: onTransitionEnd
    });
  };

  proto.onRevealTransitionEnd = function() {
    // check if still visible
    // during transition, item may have been hidden
    if ( !this.isHidden ) {
      this.emitEvent('reveal');
    }
  };

  /**
   * get style property use for hide/reveal transition end
   * @param {String} styleProperty - hiddenStyle/visibleStyle
   * @returns {String}
   */
  proto.getHideRevealTransitionEndProperty = function( styleProperty ) {
    var optionStyle = this.layout.options[ styleProperty ];
    // use opacity
    if ( optionStyle.opacity ) {
      return 'opacity';
    }
    // get first property
    for ( var prop in optionStyle ) {
      return prop;
    }
  };

  proto.hide = function() {
    // set flag
    this.isHidden = true;
    // remove display: none
    this.css({ display: '' });

    var options = this.layout.options;

    var onTransitionEnd = {};
    var transitionEndProperty = this.getHideRevealTransitionEndProperty('hiddenStyle');
    onTransitionEnd[ transitionEndProperty ] = this.onHideTransitionEnd;

    this.transition({
      from: options.visibleStyle,
      to: options.hiddenStyle,
      // keep hidden stuff hidden
      isCleaning: true,
      onTransitionEnd: onTransitionEnd
    });
  };

  proto.onHideTransitionEnd = function() {
    // check if still hidden
    // during transition, item may have been un-hidden
    if ( this.isHidden ) {
      this.css({ display: 'none' });
      this.emitEvent('hide');
    }
  };

  proto.destroy = function() {
    this.css({
      position: '',
      left: '',
      right: '',
      top: '',
      bottom: '',
      transition: '',
      transform: ''
    });
  };

  return Item;

  }));

  /*!
   * Outlayer v2.1.1
   * the brains and guts of a layout library
   * MIT license
   */

  ( function( window, factory ) {
    // universal module definition
    /* jshint strict: false */ /* globals define, module, require */
    if ( typeof define == 'function' && define.amd ) {
      // AMD - RequireJS
      define( 'outlayer/outlayer',[
          'ev-emitter/ev-emitter',
          'get-size/get-size',
          'fizzy-ui-utils/utils',
          './item'
        ],
        function( EvEmitter, getSize, utils, Item ) {
          return factory( window, EvEmitter, getSize, utils, Item);
        }
      );
    } else if ( typeof module == 'object' && module.exports ) {
      // CommonJS - Browserify, Webpack
      module.exports = factory(
        window,
        require('ev-emitter'),
        require('get-size'),
        require('fizzy-ui-utils'),
        require('./item')
      );
    } else {
      // browser global
      window.Outlayer = factory(
        window,
        window.EvEmitter,
        window.getSize,
        window.fizzyUIUtils,
        window.Outlayer.Item
      );
    }

  }( window, function factory( window, EvEmitter, getSize, utils, Item ) {

  // ----- vars ----- //

  var console = window.console;
  var jQuery = window.jQuery;
  var noop = function() {};

  // -------------------------- Outlayer -------------------------- //

  // globally unique identifiers
  var GUID = 0;
  // internal store of all Outlayer intances
  var instances = {};


  /**
   * @param {Element, String} element
   * @param {Object} options
   * @constructor
   */
  function Outlayer( element, options ) {
    var queryElement = utils.getQueryElement( element );
    if ( !queryElement ) {
      if ( console ) {
        console.error( 'Bad element for ' + this.constructor.namespace +
          ': ' + ( queryElement || element ) );
      }
      return;
    }
    this.element = queryElement;
    // add jQuery
    if ( jQuery ) {
      this.$element = jQuery( this.element );
    }

    // options
    this.options = utils.extend( {}, this.constructor.defaults );
    this.option( options );

    // add id for Outlayer.getFromElement
    var id = ++GUID;
    this.element.outlayerGUID = id; // expando
    instances[ id ] = this; // associate via id

    // kick it off
    this._create();

    var isInitLayout = this._getOption('initLayout');
    if ( isInitLayout ) {
      this.layout();
    }
  }

  // settings are for internal use only
  Outlayer.namespace = 'outlayer';
  Outlayer.Item = Item;

  // default options
  Outlayer.defaults = {
    containerStyle: {
      position: 'relative'
    },
    initLayout: true,
    originLeft: true,
    originTop: true,
    resize: true,
    resizeContainer: true,
    // item options
    transitionDuration: '0.4s',
    hiddenStyle: {
      opacity: 0,
      transform: 'scale(0.001)'
    },
    visibleStyle: {
      opacity: 1,
      transform: 'scale(1)'
    }
  };

  var proto = Outlayer.prototype;
  // inherit EvEmitter
  utils.extend( proto, EvEmitter.prototype );

  /**
   * set options
   * @param {Object} opts
   */
  proto.option = function( opts ) {
    utils.extend( this.options, opts );
  };

  /**
   * get backwards compatible option value, check old name
   */
  proto._getOption = function( option ) {
    var oldOption = this.constructor.compatOptions[ option ];
    return oldOption && this.options[ oldOption ] !== undefined ?
      this.options[ oldOption ] : this.options[ option ];
  };

  Outlayer.compatOptions = {
    // currentName: oldName
    initLayout: 'isInitLayout',
    horizontal: 'isHorizontal',
    layoutInstant: 'isLayoutInstant',
    originLeft: 'isOriginLeft',
    originTop: 'isOriginTop',
    resize: 'isResizeBound',
    resizeContainer: 'isResizingContainer'
  };

  proto._create = function() {
    // get items from children
    this.reloadItems();
    // elements that affect layout, but are not laid out
    this.stamps = [];
    this.stamp( this.options.stamp );
    // set container style
    utils.extend( this.element.style, this.options.containerStyle );

    // bind resize method
    var canBindResize = this._getOption('resize');
    if ( canBindResize ) {
      this.bindResize();
    }
  };

  // goes through all children again and gets bricks in proper order
  proto.reloadItems = function() {
    // collection of item elements
    this.items = this._itemize( this.element.children );
  };


  /**
   * turn elements into Outlayer.Items to be used in layout
   * @param {Array or NodeList or HTMLElement} elems
   * @returns {Array} items - collection of new Outlayer Items
   */
  proto._itemize = function( elems ) {

    var itemElems = this._filterFindItemElements( elems );
    var Item = this.constructor.Item;

    // create new Outlayer Items for collection
    var items = [];
    for ( var i=0; i < itemElems.length; i++ ) {
      var elem = itemElems[i];
      var item = new Item( elem, this );
      items.push( item );
    }

    return items;
  };

  /**
   * get item elements to be used in layout
   * @param {Array or NodeList or HTMLElement} elems
   * @returns {Array} items - item elements
   */
  proto._filterFindItemElements = function( elems ) {
    return utils.filterFindElements( elems, this.options.itemSelector );
  };

  /**
   * getter method for getting item elements
   * @returns {Array} elems - collection of item elements
   */
  proto.getItemElements = function() {
    return this.items.map( function( item ) {
      return item.element;
    });
  };

  // ----- init & layout ----- //

  /**
   * lays out all items
   */
  proto.layout = function() {
    this._resetLayout();
    this._manageStamps();

    // don't animate first layout
    var layoutInstant = this._getOption('layoutInstant');
    var isInstant = layoutInstant !== undefined ?
      layoutInstant : !this._isLayoutInited;
    this.layoutItems( this.items, isInstant );

    // flag for initalized
    this._isLayoutInited = true;
  };

  // _init is alias for layout
  proto._init = proto.layout;

  /**
   * logic before any new layout
   */
  proto._resetLayout = function() {
    this.getSize();
  };


  proto.getSize = function() {
    this.size = getSize( this.element );
  };

  /**
   * get measurement from option, for columnWidth, rowHeight, gutter
   * if option is String -> get element from selector string, & get size of element
   * if option is Element -> get size of element
   * else use option as a number
   *
   * @param {String} measurement
   * @param {String} size - width or height
   * @private
   */
  proto._getMeasurement = function( measurement, size ) {
    var option = this.options[ measurement ];
    var elem;
    if ( !option ) {
      // default to 0
      this[ measurement ] = 0;
    } else {
      // use option as an element
      if ( typeof option == 'string' ) {
        elem = this.element.querySelector( option );
      } else if ( option instanceof HTMLElement ) {
        elem = option;
      }
      // use size of element, if element
      this[ measurement ] = elem ? getSize( elem )[ size ] : option;
    }
  };

  /**
   * layout a collection of item elements
   * @api public
   */
  proto.layoutItems = function( items, isInstant ) {
    items = this._getItemsForLayout( items );

    this._layoutItems( items, isInstant );

    this._postLayout();
  };

  /**
   * get the items to be laid out
   * you may want to skip over some items
   * @param {Array} items
   * @returns {Array} items
   */
  proto._getItemsForLayout = function( items ) {
    return items.filter( function( item ) {
      return !item.isIgnored;
    });
  };

  /**
   * layout items
   * @param {Array} items
   * @param {Boolean} isInstant
   */
  proto._layoutItems = function( items, isInstant ) {
    this._emitCompleteOnItems( 'layout', items );

    if ( !items || !items.length ) {
      // no items, emit event with empty array
      return;
    }

    var queue = [];

    items.forEach( function( item ) {
      // get x/y object from method
      var position = this._getItemLayoutPosition( item );
      // enqueue
      position.item = item;
      position.isInstant = isInstant || item.isLayoutInstant;
      queue.push( position );
    }, this );

    this._processLayoutQueue( queue );
  };

  /**
   * get item layout position
   * @param {Outlayer.Item} item
   * @returns {Object} x and y position
   */
  proto._getItemLayoutPosition = function( /* item */ ) {
    return {
      x: 0,
      y: 0
    };
  };

  /**
   * iterate over array and position each item
   * Reason being - separating this logic prevents 'layout invalidation'
   * thx @paul_irish
   * @param {Array} queue
   */
  proto._processLayoutQueue = function( queue ) {
    this.updateStagger();
    queue.forEach( function( obj, i ) {
      this._positionItem( obj.item, obj.x, obj.y, obj.isInstant, i );
    }, this );
  };

  // set stagger from option in milliseconds number
  proto.updateStagger = function() {
    var stagger = this.options.stagger;
    if ( stagger === null || stagger === undefined ) {
      this.stagger = 0;
      return;
    }
    this.stagger = getMilliseconds( stagger );
    return this.stagger;
  };

  /**
   * Sets position of item in DOM
   * @param {Outlayer.Item} item
   * @param {Number} x - horizontal position
   * @param {Number} y - vertical position
   * @param {Boolean} isInstant - disables transitions
   */
  proto._positionItem = function( item, x, y, isInstant, i ) {
    if ( isInstant ) {
      // if not transition, just set CSS
      item.goTo( x, y );
    } else {
      item.stagger( i * this.stagger );
      item.moveTo( x, y );
    }
  };

  /**
   * Any logic you want to do after each layout,
   * i.e. size the container
   */
  proto._postLayout = function() {
    this.resizeContainer();
  };

  proto.resizeContainer = function() {
    var isResizingContainer = this._getOption('resizeContainer');
    if ( !isResizingContainer ) {
      return;
    }
    var size = this._getContainerSize();
    if ( size ) {
      this._setContainerMeasure( size.width, true );
      this._setContainerMeasure( size.height, false );
    }
  };

  /**
   * Sets width or height of container if returned
   * @returns {Object} size
   *   @param {Number} width
   *   @param {Number} height
   */
  proto._getContainerSize = noop;

  /**
   * @param {Number} measure - size of width or height
   * @param {Boolean} isWidth
   */
  proto._setContainerMeasure = function( measure, isWidth ) {
    if ( measure === undefined ) {
      return;
    }

    var elemSize = this.size;
    // add padding and border width if border box
    if ( elemSize.isBorderBox ) {
      measure += isWidth ? elemSize.paddingLeft + elemSize.paddingRight +
        elemSize.borderLeftWidth + elemSize.borderRightWidth :
        elemSize.paddingBottom + elemSize.paddingTop +
        elemSize.borderTopWidth + elemSize.borderBottomWidth;
    }

    measure = Math.max( measure, 0 );
    this.element.style[ isWidth ? 'width' : 'height' ] = measure + 'px';
  };

  /**
   * emit eventComplete on a collection of items events
   * @param {String} eventName
   * @param {Array} items - Outlayer.Items
   */
  proto._emitCompleteOnItems = function( eventName, items ) {
    var _this = this;
    function onComplete() {
      _this.dispatchEvent( eventName + 'Complete', null, [ items ] );
    }

    var count = items.length;
    if ( !items || !count ) {
      onComplete();
      return;
    }

    var doneCount = 0;
    function tick() {
      doneCount++;
      if ( doneCount == count ) {
        onComplete();
      }
    }

    // bind callback
    items.forEach( function( item ) {
      item.once( eventName, tick );
    });
  };

  /**
   * emits events via EvEmitter and jQuery events
   * @param {String} type - name of event
   * @param {Event} event - original event
   * @param {Array} args - extra arguments
   */
  proto.dispatchEvent = function( type, event, args ) {
    // add original event to arguments
    var emitArgs = event ? [ event ].concat( args ) : args;
    this.emitEvent( type, emitArgs );

    if ( jQuery ) {
      // set this.$element
      this.$element = this.$element || jQuery( this.element );
      if ( event ) {
        // create jQuery event
        var $event = jQuery.Event( event );
        $event.type = type;
        this.$element.trigger( $event, args );
      } else {
        // just trigger with type if no event available
        this.$element.trigger( type, args );
      }
    }
  };

  // -------------------------- ignore & stamps -------------------------- //


  /**
   * keep item in collection, but do not lay it out
   * ignored items do not get skipped in layout
   * @param {Element} elem
   */
  proto.ignore = function( elem ) {
    var item = this.getItem( elem );
    if ( item ) {
      item.isIgnored = true;
    }
  };

  /**
   * return item to layout collection
   * @param {Element} elem
   */
  proto.unignore = function( elem ) {
    var item = this.getItem( elem );
    if ( item ) {
      delete item.isIgnored;
    }
  };

  /**
   * adds elements to stamps
   * @param {NodeList, Array, Element, or String} elems
   */
  proto.stamp = function( elems ) {
    elems = this._find( elems );
    if ( !elems ) {
      return;
    }

    this.stamps = this.stamps.concat( elems );
    // ignore
    elems.forEach( this.ignore, this );
  };

  /**
   * removes elements to stamps
   * @param {NodeList, Array, or Element} elems
   */
  proto.unstamp = function( elems ) {
    elems = this._find( elems );
    if ( !elems ){
      return;
    }

    elems.forEach( function( elem ) {
      // filter out removed stamp elements
      utils.removeFrom( this.stamps, elem );
      this.unignore( elem );
    }, this );
  };

  /**
   * finds child elements
   * @param {NodeList, Array, Element, or String} elems
   * @returns {Array} elems
   */
  proto._find = function( elems ) {
    if ( !elems ) {
      return;
    }
    // if string, use argument as selector string
    if ( typeof elems == 'string' ) {
      elems = this.element.querySelectorAll( elems );
    }
    elems = utils.makeArray( elems );
    return elems;
  };

  proto._manageStamps = function() {
    if ( !this.stamps || !this.stamps.length ) {
      return;
    }

    this._getBoundingRect();

    this.stamps.forEach( this._manageStamp, this );
  };

  // update boundingLeft / Top
  proto._getBoundingRect = function() {
    // get bounding rect for container element
    var boundingRect = this.element.getBoundingClientRect();
    var size = this.size;
    this._boundingRect = {
      left: boundingRect.left + size.paddingLeft + size.borderLeftWidth,
      top: boundingRect.top + size.paddingTop + size.borderTopWidth,
      right: boundingRect.right - ( size.paddingRight + size.borderRightWidth ),
      bottom: boundingRect.bottom - ( size.paddingBottom + size.borderBottomWidth )
    };
  };

  /**
   * @param {Element} stamp
  **/
  proto._manageStamp = noop;

  /**
   * get x/y position of element relative to container element
   * @param {Element} elem
   * @returns {Object} offset - has left, top, right, bottom
   */
  proto._getElementOffset = function( elem ) {
    var boundingRect = elem.getBoundingClientRect();
    var thisRect = this._boundingRect;
    var size = getSize( elem );
    var offset = {
      left: boundingRect.left - thisRect.left - size.marginLeft,
      top: boundingRect.top - thisRect.top - size.marginTop,
      right: thisRect.right - boundingRect.right - size.marginRight,
      bottom: thisRect.bottom - boundingRect.bottom - size.marginBottom
    };
    return offset;
  };

  // -------------------------- resize -------------------------- //

  // enable event handlers for listeners
  // i.e. resize -> onresize
  proto.handleEvent = utils.handleEvent;

  /**
   * Bind layout to window resizing
   */
  proto.bindResize = function() {
    window.addEventListener( 'resize', this );
    this.isResizeBound = true;
  };

  /**
   * Unbind layout to window resizing
   */
  proto.unbindResize = function() {
    window.removeEventListener( 'resize', this );
    this.isResizeBound = false;
  };

  proto.onresize = function() {
    this.resize();
  };

  utils.debounceMethod( Outlayer, 'onresize', 100 );

  proto.resize = function() {
    // don't trigger if size did not change
    // or if resize was unbound. See #9
    if ( !this.isResizeBound || !this.needsResizeLayout() ) {
      return;
    }

    this.layout();
  };

  /**
   * check if layout is needed post layout
   * @returns Boolean
   */
  proto.needsResizeLayout = function() {
    var size = getSize( this.element );
    // check that this.size and size are there
    // IE8 triggers resize on body size change, so they might not be
    var hasSizes = this.size && size;
    return hasSizes && size.innerWidth !== this.size.innerWidth;
  };

  // -------------------------- methods -------------------------- //

  /**
   * add items to Outlayer instance
   * @param {Array or NodeList or Element} elems
   * @returns {Array} items - Outlayer.Items
  **/
  proto.addItems = function( elems ) {
    var items = this._itemize( elems );
    // add items to collection
    if ( items.length ) {
      this.items = this.items.concat( items );
    }
    return items;
  };

  /**
   * Layout newly-appended item elements
   * @param {Array or NodeList or Element} elems
   */
  proto.appended = function( elems ) {
    var items = this.addItems( elems );
    if ( !items.length ) {
      return;
    }
    // layout and reveal just the new items
    this.layoutItems( items, true );
    this.reveal( items );
  };

  /**
   * Layout prepended elements
   * @param {Array or NodeList or Element} elems
   */
  proto.prepended = function( elems ) {
    var items = this._itemize( elems );
    if ( !items.length ) {
      return;
    }
    // add items to beginning of collection
    var previousItems = this.items.slice(0);
    this.items = items.concat( previousItems );
    // start new layout
    this._resetLayout();
    this._manageStamps();
    // layout new stuff without transition
    this.layoutItems( items, true );
    this.reveal( items );
    // layout previous items
    this.layoutItems( previousItems );
  };

  /**
   * reveal a collection of items
   * @param {Array of Outlayer.Items} items
   */
  proto.reveal = function( items ) {
    this._emitCompleteOnItems( 'reveal', items );
    if ( !items || !items.length ) {
      return;
    }
    var stagger = this.updateStagger();
    items.forEach( function( item, i ) {
      item.stagger( i * stagger );
      item.reveal();
    });
  };

  /**
   * hide a collection of items
   * @param {Array of Outlayer.Items} items
   */
  proto.hide = function( items ) {
    this._emitCompleteOnItems( 'hide', items );
    if ( !items || !items.length ) {
      return;
    }
    var stagger = this.updateStagger();
    items.forEach( function( item, i ) {
      item.stagger( i * stagger );
      item.hide();
    });
  };

  /**
   * reveal item elements
   * @param {Array}, {Element}, {NodeList} items
   */
  proto.revealItemElements = function( elems ) {
    var items = this.getItems( elems );
    this.reveal( items );
  };

  /**
   * hide item elements
   * @param {Array}, {Element}, {NodeList} items
   */
  proto.hideItemElements = function( elems ) {
    var items = this.getItems( elems );
    this.hide( items );
  };

  /**
   * get Outlayer.Item, given an Element
   * @param {Element} elem
   * @param {Function} callback
   * @returns {Outlayer.Item} item
   */
  proto.getItem = function( elem ) {
    // loop through items to get the one that matches
    for ( var i=0; i < this.items.length; i++ ) {
      var item = this.items[i];
      if ( item.element == elem ) {
        // return item
        return item;
      }
    }
  };

  /**
   * get collection of Outlayer.Items, given Elements
   * @param {Array} elems
   * @returns {Array} items - Outlayer.Items
   */
  proto.getItems = function( elems ) {
    elems = utils.makeArray( elems );
    var items = [];
    elems.forEach( function( elem ) {
      var item = this.getItem( elem );
      if ( item ) {
        items.push( item );
      }
    }, this );

    return items;
  };

  /**
   * remove element(s) from instance and DOM
   * @param {Array or NodeList or Element} elems
   */
  proto.remove = function( elems ) {
    var removeItems = this.getItems( elems );

    this._emitCompleteOnItems( 'remove', removeItems );

    // bail if no items to remove
    if ( !removeItems || !removeItems.length ) {
      return;
    }

    removeItems.forEach( function( item ) {
      item.remove();
      // remove item from collection
      utils.removeFrom( this.items, item );
    }, this );
  };

  // ----- destroy ----- //

  // remove and disable Outlayer instance
  proto.destroy = function() {
    // clean up dynamic styles
    var style = this.element.style;
    style.height = '';
    style.position = '';
    style.width = '';
    // destroy items
    this.items.forEach( function( item ) {
      item.destroy();
    });

    this.unbindResize();

    var id = this.element.outlayerGUID;
    delete instances[ id ]; // remove reference to instance by id
    delete this.element.outlayerGUID;
    // remove data for jQuery
    if ( jQuery ) {
      jQuery.removeData( this.element, this.constructor.namespace );
    }

  };

  // -------------------------- data -------------------------- //

  /**
   * get Outlayer instance from element
   * @param {Element} elem
   * @returns {Outlayer}
   */
  Outlayer.data = function( elem ) {
    elem = utils.getQueryElement( elem );
    var id = elem && elem.outlayerGUID;
    return id && instances[ id ];
  };


  // -------------------------- create Outlayer class -------------------------- //

  /**
   * create a layout class
   * @param {String} namespace
   */
  Outlayer.create = function( namespace, options ) {
    // sub-class Outlayer
    var Layout = subclass( Outlayer );
    // apply new options and compatOptions
    Layout.defaults = utils.extend( {}, Outlayer.defaults );
    utils.extend( Layout.defaults, options );
    Layout.compatOptions = utils.extend( {}, Outlayer.compatOptions  );

    Layout.namespace = namespace;

    Layout.data = Outlayer.data;

    // sub-class Item
    Layout.Item = subclass( Item );

    // -------------------------- declarative -------------------------- //

    utils.htmlInit( Layout, namespace );

    // -------------------------- jQuery bridge -------------------------- //

    // make into jQuery plugin
    if ( jQuery && jQuery.bridget ) {
      jQuery.bridget( namespace, Layout );
    }

    return Layout;
  };

  function subclass( Parent ) {
    function SubClass() {
      Parent.apply( this, arguments );
    }

    SubClass.prototype = Object.create( Parent.prototype );
    SubClass.prototype.constructor = SubClass;

    return SubClass;
  }

  // ----- helpers ----- //

  // how many milliseconds are in each unit
  var msUnits = {
    ms: 1,
    s: 1000
  };

  // munge time-like parameter into millisecond number
  // '0.4s' -> 40
  function getMilliseconds( time ) {
    if ( typeof time == 'number' ) {
      return time;
    }
    var matches = time.match( /(^\d*\.?\d*)(\w*)/ );
    var num = matches && matches[1];
    var unit = matches && matches[2];
    if ( !num.length ) {
      return 0;
    }
    num = parseFloat( num );
    var mult = msUnits[ unit ] || 1;
    return num * mult;
  }

  // ----- fin ----- //

  // back in global
  Outlayer.Item = Item;

  return Outlayer;

  }));

  /**
   * Isotope Item
  **/

  ( function( window, factory ) {
    // universal module definition
    /* jshint strict: false */ /*globals define, module, require */
    if ( typeof define == 'function' && define.amd ) {
      // AMD
      define( 'isotope-layout/js/item',[
          'outlayer/outlayer'
        ],
        factory );
    } else if ( typeof module == 'object' && module.exports ) {
      // CommonJS
      module.exports = factory(
        require('outlayer')
      );
    } else {
      // browser global
      window.Isotope = window.Isotope || {};
      window.Isotope.Item = factory(
        window.Outlayer
      );
    }

  }( window, function factory( Outlayer ) {

  // -------------------------- Item -------------------------- //

  // sub-class Outlayer Item
  function Item() {
    Outlayer.Item.apply( this, arguments );
  }

  var proto = Item.prototype = Object.create( Outlayer.Item.prototype );

  var _create = proto._create;
  proto._create = function() {
    // assign id, used for original-order sorting
    this.id = this.layout.itemGUID++;
    _create.call( this );
    this.sortData = {};
  };

  proto.updateSortData = function() {
    if ( this.isIgnored ) {
      return;
    }
    // default sorters
    this.sortData.id = this.id;
    // for backward compatibility
    this.sortData['original-order'] = this.id;
    this.sortData.random = Math.random();
    // go thru getSortData obj and apply the sorters
    var getSortData = this.layout.options.getSortData;
    var sorters = this.layout._sorters;
    for ( var key in getSortData ) {
      var sorter = sorters[ key ];
      this.sortData[ key ] = sorter( this.element, this );
    }
  };

  var _destroy = proto.destroy;
  proto.destroy = function() {
    // call super
    _destroy.apply( this, arguments );
    // reset display, #741
    this.css({
      display: ''
    });
  };

  return Item;

  }));

  /**
   * Isotope LayoutMode
   */

  ( function( window, factory ) {
    // universal module definition
    /* jshint strict: false */ /*globals define, module, require */
    if ( typeof define == 'function' && define.amd ) {
      // AMD
      define( 'isotope-layout/js/layout-mode',[
          'get-size/get-size',
          'outlayer/outlayer'
        ],
        factory );
    } else if ( typeof module == 'object' && module.exports ) {
      // CommonJS
      module.exports = factory(
        require('get-size'),
        require('outlayer')
      );
    } else {
      // browser global
      window.Isotope = window.Isotope || {};
      window.Isotope.LayoutMode = factory(
        window.getSize,
        window.Outlayer
      );
    }

  }( window, function factory( getSize, Outlayer ) {

    // layout mode class
    function LayoutMode( isotope ) {
      this.isotope = isotope;
      // link properties
      if ( isotope ) {
        this.options = isotope.options[ this.namespace ];
        this.element = isotope.element;
        this.items = isotope.filteredItems;
        this.size = isotope.size;
      }
    }

    var proto = LayoutMode.prototype;

    /**
     * some methods should just defer to default Outlayer method
     * and reference the Isotope instance as `this`
    **/
    var facadeMethods = [
      '_resetLayout',
      '_getItemLayoutPosition',
      '_manageStamp',
      '_getContainerSize',
      '_getElementOffset',
      'needsResizeLayout',
      '_getOption'
    ];

    facadeMethods.forEach( function( methodName ) {
      proto[ methodName ] = function() {
        return Outlayer.prototype[ methodName ].apply( this.isotope, arguments );
      };
    });

    // -----  ----- //

    // for horizontal layout modes, check vertical size
    proto.needsVerticalResizeLayout = function() {
      // don't trigger if size did not change
      var size = getSize( this.isotope.element );
      // check that this.size and size are there
      // IE8 triggers resize on body size change, so they might not be
      var hasSizes = this.isotope.size && size;
      return hasSizes && size.innerHeight != this.isotope.size.innerHeight;
    };

    // ----- measurements ----- //

    proto._getMeasurement = function() {
      this.isotope._getMeasurement.apply( this, arguments );
    };

    proto.getColumnWidth = function() {
      this.getSegmentSize( 'column', 'Width' );
    };

    proto.getRowHeight = function() {
      this.getSegmentSize( 'row', 'Height' );
    };

    /**
     * get columnWidth or rowHeight
     * segment: 'column' or 'row'
     * size 'Width' or 'Height'
    **/
    proto.getSegmentSize = function( segment, size ) {
      var segmentName = segment + size;
      var outerSize = 'outer' + size;
      // columnWidth / outerWidth // rowHeight / outerHeight
      this._getMeasurement( segmentName, outerSize );
      // got rowHeight or columnWidth, we can chill
      if ( this[ segmentName ] ) {
        return;
      }
      // fall back to item of first element
      var firstItemSize = this.getFirstItemSize();
      this[ segmentName ] = firstItemSize && firstItemSize[ outerSize ] ||
        // or size of container
        this.isotope.size[ 'inner' + size ];
    };

    proto.getFirstItemSize = function() {
      var firstItem = this.isotope.filteredItems[0];
      return firstItem && firstItem.element && getSize( firstItem.element );
    };

    // ----- methods that should reference isotope ----- //

    proto.layout = function() {
      this.isotope.layout.apply( this.isotope, arguments );
    };

    proto.getSize = function() {
      this.isotope.getSize();
      this.size = this.isotope.size;
    };

    // -------------------------- create -------------------------- //

    LayoutMode.modes = {};

    LayoutMode.create = function( namespace, options ) {

      function Mode() {
        LayoutMode.apply( this, arguments );
      }

      Mode.prototype = Object.create( proto );
      Mode.prototype.constructor = Mode;

      // default options
      if ( options ) {
        Mode.options = options;
      }

      Mode.prototype.namespace = namespace;
      // register in Isotope
      LayoutMode.modes[ namespace ] = Mode;

      return Mode;
    };

    return LayoutMode;

  }));

  /*!
   * Masonry v4.2.1
   * Cascading grid layout library
   * https://masonry.desandro.com
   * MIT License
   * by David DeSandro
   */

  ( function( window, factory ) {
    // universal module definition
    /* jshint strict: false */ /*globals define, module, require */
    if ( typeof define == 'function' && define.amd ) {
      // AMD
      define( 'masonry-layout/masonry',[
          'outlayer/outlayer',
          'get-size/get-size'
        ],
        factory );
    } else if ( typeof module == 'object' && module.exports ) {
      // CommonJS
      module.exports = factory(
        require('outlayer'),
        require('get-size')
      );
    } else {
      // browser global
      window.Masonry = factory(
        window.Outlayer,
        window.getSize
      );
    }

  }( window, function factory( Outlayer, getSize ) {



  // -------------------------- masonryDefinition -------------------------- //

    // create an Outlayer layout class
    var Masonry = Outlayer.create('masonry');
    // isFitWidth -> fitWidth
    Masonry.compatOptions.fitWidth = 'isFitWidth';

    var proto = Masonry.prototype;

    proto._resetLayout = function() {
      this.getSize();
      this._getMeasurement( 'columnWidth', 'outerWidth' );
      this._getMeasurement( 'gutter', 'outerWidth' );
      this.measureColumns();

      // reset column Y
      this.colYs = [];
      for ( var i=0; i < this.cols; i++ ) {
        this.colYs.push( 0 );
      }

      this.maxY = 0;
      this.horizontalColIndex = 0;
    };

    proto.measureColumns = function() {
      this.getContainerWidth();
      // if columnWidth is 0, default to outerWidth of first item
      if ( !this.columnWidth ) {
        var firstItem = this.items[0];
        var firstItemElem = firstItem && firstItem.element;
        // columnWidth fall back to item of first element
        this.columnWidth = firstItemElem && getSize( firstItemElem ).outerWidth ||
          // if first elem has no width, default to size of container
          this.containerWidth;
      }

      var columnWidth = this.columnWidth += this.gutter;

      // calculate columns
      var containerWidth = this.containerWidth + this.gutter;
      var cols = containerWidth / columnWidth;
      // fix rounding errors, typically with gutters
      var excess = columnWidth - containerWidth % columnWidth;
      // if overshoot is less than a pixel, round up, otherwise floor it
      var mathMethod = excess && excess < 1 ? 'round' : 'floor';
      cols = Math[ mathMethod ]( cols );
      this.cols = Math.max( cols, 1 );
    };

    proto.getContainerWidth = function() {
      // container is parent if fit width
      var isFitWidth = this._getOption('fitWidth');
      var container = isFitWidth ? this.element.parentNode : this.element;
      // check that this.size and size are there
      // IE8 triggers resize on body size change, so they might not be
      var size = getSize( container );
      this.containerWidth = size && size.innerWidth;
    };

    proto._getItemLayoutPosition = function( item ) {
      item.getSize();
      // how many columns does this brick span
      var remainder = item.size.outerWidth % this.columnWidth;
      var mathMethod = remainder && remainder < 1 ? 'round' : 'ceil';
      // round if off by 1 pixel, otherwise use ceil
      var colSpan = Math[ mathMethod ]( item.size.outerWidth / this.columnWidth );
      colSpan = Math.min( colSpan, this.cols );
      // use horizontal or top column position
      var colPosMethod = this.options.horizontalOrder ?
        '_getHorizontalColPosition' : '_getTopColPosition';
      var colPosition = this[ colPosMethod ]( colSpan, item );
      // position the brick
      var position = {
        x: this.columnWidth * colPosition.col,
        y: colPosition.y
      };
      // apply setHeight to necessary columns
      var setHeight = colPosition.y + item.size.outerHeight;
      var setMax = colSpan + colPosition.col;
      for ( var i = colPosition.col; i < setMax; i++ ) {
        this.colYs[i] = setHeight;
      }

      return position;
    };

    proto._getTopColPosition = function( colSpan ) {
      var colGroup = this._getTopColGroup( colSpan );
      // get the minimum Y value from the columns
      var minimumY = Math.min.apply( Math, colGroup );

      return {
        col: colGroup.indexOf( minimumY ),
        y: minimumY,
      };
    };

    /**
     * @param {Number} colSpan - number of columns the element spans
     * @returns {Array} colGroup
     */
    proto._getTopColGroup = function( colSpan ) {
      if ( colSpan < 2 ) {
        // if brick spans only one column, use all the column Ys
        return this.colYs;
      }

      var colGroup = [];
      // how many different places could this brick fit horizontally
      var groupCount = this.cols + 1 - colSpan;
      // for each group potential horizontal position
      for ( var i = 0; i < groupCount; i++ ) {
        colGroup[i] = this._getColGroupY( i, colSpan );
      }
      return colGroup;
    };

    proto._getColGroupY = function( col, colSpan ) {
      if ( colSpan < 2 ) {
        return this.colYs[ col ];
      }
      // make an array of colY values for that one group
      var groupColYs = this.colYs.slice( col, col + colSpan );
      // and get the max value of the array
      return Math.max.apply( Math, groupColYs );
    };

    // get column position based on horizontal index. #873
    proto._getHorizontalColPosition = function( colSpan, item ) {
      var col = this.horizontalColIndex % this.cols;
      var isOver = colSpan > 1 && col + colSpan > this.cols;
      // shift to next row if item can't fit on current row
      col = isOver ? 0 : col;
      // don't let zero-size items take up space
      var hasSize = item.size.outerWidth && item.size.outerHeight;
      this.horizontalColIndex = hasSize ? col + colSpan : this.horizontalColIndex;

      return {
        col: col,
        y: this._getColGroupY( col, colSpan ),
      };
    };

    proto._manageStamp = function( stamp ) {
      var stampSize = getSize( stamp );
      var offset = this._getElementOffset( stamp );
      // get the columns that this stamp affects
      var isOriginLeft = this._getOption('originLeft');
      var firstX = isOriginLeft ? offset.left : offset.right;
      var lastX = firstX + stampSize.outerWidth;
      var firstCol = Math.floor( firstX / this.columnWidth );
      firstCol = Math.max( 0, firstCol );
      var lastCol = Math.floor( lastX / this.columnWidth );
      // lastCol should not go over if multiple of columnWidth #425
      lastCol -= lastX % this.columnWidth ? 0 : 1;
      lastCol = Math.min( this.cols - 1, lastCol );
      // set colYs to bottom of the stamp

      var isOriginTop = this._getOption('originTop');
      var stampMaxY = ( isOriginTop ? offset.top : offset.bottom ) +
        stampSize.outerHeight;
      for ( var i = firstCol; i <= lastCol; i++ ) {
        this.colYs[i] = Math.max( stampMaxY, this.colYs[i] );
      }
    };

    proto._getContainerSize = function() {
      this.maxY = Math.max.apply( Math, this.colYs );
      var size = {
        height: this.maxY
      };

      if ( this._getOption('fitWidth') ) {
        size.width = this._getContainerFitWidth();
      }

      return size;
    };

    proto._getContainerFitWidth = function() {
      var unusedCols = 0;
      // count unused columns
      var i = this.cols;
      while ( --i ) {
        if ( this.colYs[i] !== 0 ) {
          break;
        }
        unusedCols++;
      }
      // fit container to columns that have been used
      return ( this.cols - unusedCols ) * this.columnWidth - this.gutter;
    };

    proto.needsResizeLayout = function() {
      var previousWidth = this.containerWidth;
      this.getContainerWidth();
      return previousWidth != this.containerWidth;
    };

    return Masonry;

  }));

  /*!
   * Masonry layout mode
   * sub-classes Masonry
   * https://masonry.desandro.com
   */

  ( function( window, factory ) {
    // universal module definition
    /* jshint strict: false */ /*globals define, module, require */
    if ( typeof define == 'function' && define.amd ) {
      // AMD
      define( 'isotope-layout/js/layout-modes/masonry',[
          '../layout-mode',
          'masonry-layout/masonry'
        ],
        factory );
    } else if ( typeof module == 'object' && module.exports ) {
      // CommonJS
      module.exports = factory(
        require('../layout-mode'),
        require('masonry-layout')
      );
    } else {
      // browser global
      factory(
        window.Isotope.LayoutMode,
        window.Masonry
      );
    }

  }( window, function factory( LayoutMode, Masonry ) {

  // -------------------------- masonryDefinition -------------------------- //

    // create an Outlayer layout class
    var MasonryMode = LayoutMode.create('masonry');

    var proto = MasonryMode.prototype;

    var keepModeMethods = {
      _getElementOffset: true,
      layout: true,
      _getMeasurement: true
    };

    // inherit Masonry prototype
    for ( var method in Masonry.prototype ) {
      // do not inherit mode methods
      if ( !keepModeMethods[ method ] ) {
        proto[ method ] = Masonry.prototype[ method ];
      }
    }

    var measureColumns = proto.measureColumns;
    proto.measureColumns = function() {
      // set items, used if measuring first item
      this.items = this.isotope.filteredItems;
      measureColumns.call( this );
    };

    // point to mode options for fitWidth
    var _getOption = proto._getOption;
    proto._getOption = function( option ) {
      if ( option == 'fitWidth' ) {
        return this.options.isFitWidth !== undefined ?
          this.options.isFitWidth : this.options.fitWidth;
      }
      return _getOption.apply( this.isotope, arguments );
    };

    return MasonryMode;

  }));

  /**
   * fitRows layout mode
   */

  ( function( window, factory ) {
    // universal module definition
    /* jshint strict: false */ /*globals define, module, require */
    if ( typeof define == 'function' && define.amd ) {
      // AMD
      define( 'isotope-layout/js/layout-modes/fit-rows',[
          '../layout-mode'
        ],
        factory );
    } else if ( typeof exports == 'object' ) {
      // CommonJS
      module.exports = factory(
        require('../layout-mode')
      );
    } else {
      // browser global
      factory(
        window.Isotope.LayoutMode
      );
    }

  }( window, function factory( LayoutMode ) {

  var FitRows = LayoutMode.create('fitRows');

  var proto = FitRows.prototype;

  proto._resetLayout = function() {
    this.x = 0;
    this.y = 0;
    this.maxY = 0;
    this._getMeasurement( 'gutter', 'outerWidth' );
  };

  proto._getItemLayoutPosition = function( item ) {
    item.getSize();

    var itemWidth = item.size.outerWidth + this.gutter;
    // if this element cannot fit in the current row
    var containerWidth = this.isotope.size.innerWidth + this.gutter;
    if ( this.x !== 0 && itemWidth + this.x > containerWidth ) {
      this.x = 0;
      this.y = this.maxY;
    }

    var position = {
      x: this.x,
      y: this.y
    };

    this.maxY = Math.max( this.maxY, this.y + item.size.outerHeight );
    this.x += itemWidth;

    return position;
  };

  proto._getContainerSize = function() {
    return { height: this.maxY };
  };

  return FitRows;

  }));

  /**
   * vertical layout mode
   */

  ( function( window, factory ) {
    // universal module definition
    /* jshint strict: false */ /*globals define, module, require */
    if ( typeof define == 'function' && define.amd ) {
      // AMD
      define( 'isotope-layout/js/layout-modes/vertical',[
          '../layout-mode'
        ],
        factory );
    } else if ( typeof module == 'object' && module.exports ) {
      // CommonJS
      module.exports = factory(
        require('../layout-mode')
      );
    } else {
      // browser global
      factory(
        window.Isotope.LayoutMode
      );
    }

  }( window, function factory( LayoutMode ) {

  var Vertical = LayoutMode.create( 'vertical', {
    horizontalAlignment: 0
  });

  var proto = Vertical.prototype;

  proto._resetLayout = function() {
    this.y = 0;
  };

  proto._getItemLayoutPosition = function( item ) {
    item.getSize();
    var x = ( this.isotope.size.innerWidth - item.size.outerWidth ) *
      this.options.horizontalAlignment;
    var y = this.y;
    this.y += item.size.outerHeight;
    return { x: x, y: y };
  };

  proto._getContainerSize = function() {
    return { height: this.y };
  };

  return Vertical;

  }));

  /*!
   * Isotope v3.0.6
   *
   * Licensed GPLv3 for open source use
   * or Isotope Commercial License for commercial use
   *
   * https://isotope.metafizzy.co
   * Copyright 2010-2018 Metafizzy
   */

  ( function( window, factory ) {
    // universal module definition
    /* jshint strict: false */ /*globals define, module, require */
    if ( typeof define == 'function' && define.amd ) {
      // AMD
      define( [
          'outlayer/outlayer',
          'get-size/get-size',
          'desandro-matches-selector/matches-selector',
          'fizzy-ui-utils/utils',
          'isotope-layout/js/item',
          'isotope-layout/js/layout-mode',
          // include default layout modes
          'isotope-layout/js/layout-modes/masonry',
          'isotope-layout/js/layout-modes/fit-rows',
          'isotope-layout/js/layout-modes/vertical'
        ],
        function( Outlayer, getSize, matchesSelector, utils, Item, LayoutMode ) {
          return factory( window, Outlayer, getSize, matchesSelector, utils, Item, LayoutMode );
        });
    } else if ( typeof module == 'object' && module.exports ) {
      // CommonJS
      module.exports = factory(
        window,
        require('outlayer'),
        require('get-size'),
        require('desandro-matches-selector'),
        require('fizzy-ui-utils'),
        require('isotope-layout/js/item'),
        require('isotope-layout/js/layout-mode'),
        // include default layout modes
        require('isotope-layout/js/layout-modes/masonry'),
        require('isotope-layout/js/layout-modes/fit-rows'),
        require('isotope-layout/js/layout-modes/vertical')
      );
    } else {
      // browser global
      window.Isotope = factory(
        window,
        window.Outlayer,
        window.getSize,
        window.matchesSelector,
        window.fizzyUIUtils,
        window.Isotope.Item,
        window.Isotope.LayoutMode
      );
    }

  }( window, function factory( window, Outlayer, getSize, matchesSelector, utils,
    Item, LayoutMode ) {



  // -------------------------- vars -------------------------- //

  var jQuery = window.jQuery;

  // -------------------------- helpers -------------------------- //

  var trim = String.prototype.trim ?
    function( str ) {
      return str.trim();
    } :
    function( str ) {
      return str.replace( /^\s+|\s+$/g, '' );
    };

  // -------------------------- isotopeDefinition -------------------------- //

    // create an Outlayer layout class
    var Isotope = Outlayer.create( 'isotope', {
      layoutMode: 'masonry',
      isJQueryFiltering: true,
      sortAscending: true
    });

    Isotope.Item = Item;
    Isotope.LayoutMode = LayoutMode;

    var proto = Isotope.prototype;

    proto._create = function() {
      this.itemGUID = 0;
      // functions that sort items
      this._sorters = {};
      this._getSorters();
      // call super
      Outlayer.prototype._create.call( this );

      // create layout modes
      this.modes = {};
      // start filteredItems with all items
      this.filteredItems = this.items;
      // keep of track of sortBys
      this.sortHistory = [ 'original-order' ];
      // create from registered layout modes
      for ( var name in LayoutMode.modes ) {
        this._initLayoutMode( name );
      }
    };

    proto.reloadItems = function() {
      // reset item ID counter
      this.itemGUID = 0;
      // call super
      Outlayer.prototype.reloadItems.call( this );
    };

    proto._itemize = function() {
      var items = Outlayer.prototype._itemize.apply( this, arguments );
      // assign ID for original-order
      for ( var i=0; i < items.length; i++ ) {
        var item = items[i];
        item.id = this.itemGUID++;
      }
      this._updateItemsSortData( items );
      return items;
    };


    // -------------------------- layout -------------------------- //

    proto._initLayoutMode = function( name ) {
      var Mode = LayoutMode.modes[ name ];
      // set mode options
      // HACK extend initial options, back-fill in default options
      var initialOpts = this.options[ name ] || {};
      this.options[ name ] = Mode.options ?
        utils.extend( Mode.options, initialOpts ) : initialOpts;
      // init layout mode instance
      this.modes[ name ] = new Mode( this );
    };


    proto.layout = function() {
      // if first time doing layout, do all magic
      if ( !this._isLayoutInited && this._getOption('initLayout') ) {
        this.arrange();
        return;
      }
      this._layout();
    };

    // private method to be used in layout() & magic()
    proto._layout = function() {
      // don't animate first layout
      var isInstant = this._getIsInstant();
      // layout flow
      this._resetLayout();
      this._manageStamps();
      this.layoutItems( this.filteredItems, isInstant );

      // flag for initalized
      this._isLayoutInited = true;
    };

    // filter + sort + layout
    proto.arrange = function( opts ) {
      // set any options pass
      this.option( opts );
      this._getIsInstant();
      // filter, sort, and layout

      // filter
      var filtered = this._filter( this.items );
      this.filteredItems = filtered.matches;

      this._bindArrangeComplete();

      if ( this._isInstant ) {
        this._noTransition( this._hideReveal, [ filtered ] );
      } else {
        this._hideReveal( filtered );
      }

      this._sort();
      this._layout();
    };
    // alias to _init for main plugin method
    proto._init = proto.arrange;

    proto._hideReveal = function( filtered ) {
      this.reveal( filtered.needReveal );
      this.hide( filtered.needHide );
    };

    // HACK
    // Don't animate/transition first layout
    // Or don't animate/transition other layouts
    proto._getIsInstant = function() {
      var isLayoutInstant = this._getOption('layoutInstant');
      var isInstant = isLayoutInstant !== undefined ? isLayoutInstant :
        !this._isLayoutInited;
      this._isInstant = isInstant;
      return isInstant;
    };

    // listen for layoutComplete, hideComplete and revealComplete
    // to trigger arrangeComplete
    proto._bindArrangeComplete = function() {
      // listen for 3 events to trigger arrangeComplete
      var isLayoutComplete, isHideComplete, isRevealComplete;
      var _this = this;
      function arrangeParallelCallback() {
        if ( isLayoutComplete && isHideComplete && isRevealComplete ) {
          _this.dispatchEvent( 'arrangeComplete', null, [ _this.filteredItems ] );
        }
      }
      this.once( 'layoutComplete', function() {
        isLayoutComplete = true;
        arrangeParallelCallback();
      });
      this.once( 'hideComplete', function() {
        isHideComplete = true;
        arrangeParallelCallback();
      });
      this.once( 'revealComplete', function() {
        isRevealComplete = true;
        arrangeParallelCallback();
      });
    };

    // -------------------------- filter -------------------------- //

    proto._filter = function( items ) {
      var filter = this.options.filter;
      filter = filter || '*';
      var matches = [];
      var hiddenMatched = [];
      var visibleUnmatched = [];

      var test = this._getFilterTest( filter );

      // test each item
      for ( var i=0; i < items.length; i++ ) {
        var item = items[i];
        if ( item.isIgnored ) {
          continue;
        }
        // add item to either matched or unmatched group
        var isMatched = test( item );
        // item.isFilterMatched = isMatched;
        // add to matches if its a match
        if ( isMatched ) {
          matches.push( item );
        }
        // add to additional group if item needs to be hidden or revealed
        if ( isMatched && item.isHidden ) {
          hiddenMatched.push( item );
        } else if ( !isMatched && !item.isHidden ) {
          visibleUnmatched.push( item );
        }
      }

      // return collections of items to be manipulated
      return {
        matches: matches,
        needReveal: hiddenMatched,
        needHide: visibleUnmatched
      };
    };

    // get a jQuery, function, or a matchesSelector test given the filter
    proto._getFilterTest = function( filter ) {
      if ( jQuery && this.options.isJQueryFiltering ) {
        // use jQuery
        return function( item ) {
          return jQuery( item.element ).is( filter );
        };
      }
      if ( typeof filter == 'function' ) {
        // use filter as function
        return function( item ) {
          return filter( item.element );
        };
      }
      // default, use filter as selector string
      return function( item ) {
        return matchesSelector( item.element, filter );
      };
    };

    // -------------------------- sorting -------------------------- //

    /**
     * @params {Array} elems
     * @public
     */
    proto.updateSortData = function( elems ) {
      // get items
      var items;
      if ( elems ) {
        elems = utils.makeArray( elems );
        items = this.getItems( elems );
      } else {
        // update all items if no elems provided
        items = this.items;
      }

      this._getSorters();
      this._updateItemsSortData( items );
    };

    proto._getSorters = function() {
      var getSortData = this.options.getSortData;
      for ( var key in getSortData ) {
        var sorter = getSortData[ key ];
        this._sorters[ key ] = mungeSorter( sorter );
      }
    };

    /**
     * @params {Array} items - of Isotope.Items
     * @private
     */
    proto._updateItemsSortData = function( items ) {
      // do not update if no items
      var len = items && items.length;

      for ( var i=0; len && i < len; i++ ) {
        var item = items[i];
        item.updateSortData();
      }
    };

    // ----- munge sorter ----- //

    // encapsulate this, as we just need mungeSorter
    // other functions in here are just for munging
    var mungeSorter = ( function() {
      // add a magic layer to sorters for convienent shorthands
      // `.foo-bar` will use the text of .foo-bar querySelector
      // `[foo-bar]` will use attribute
      // you can also add parser
      // `.foo-bar parseInt` will parse that as a number
      function mungeSorter( sorter ) {
        // if not a string, return function or whatever it is
        if ( typeof sorter != 'string' ) {
          return sorter;
        }
        // parse the sorter string
        var args = trim( sorter ).split(' ');
        var query = args[0];
        // check if query looks like [an-attribute]
        var attrMatch = query.match( /^\[(.+)\]$/ );
        var attr = attrMatch && attrMatch[1];
        var getValue = getValueGetter( attr, query );
        // use second argument as a parser
        var parser = Isotope.sortDataParsers[ args[1] ];
        // parse the value, if there was a parser
        sorter = parser ? function( elem ) {
          return elem && parser( getValue( elem ) );
        } :
        // otherwise just return value
        function( elem ) {
          return elem && getValue( elem );
        };

        return sorter;
      }

      // get an attribute getter, or get text of the querySelector
      function getValueGetter( attr, query ) {
        // if query looks like [foo-bar], get attribute
        if ( attr ) {
          return function getAttribute( elem ) {
            return elem.getAttribute( attr );
          };
        }

        // otherwise, assume its a querySelector, and get its text
        return function getChildText( elem ) {
          var child = elem.querySelector( query );
          return child && child.textContent;
        };
      }

      return mungeSorter;
    })();

    // parsers used in getSortData shortcut strings
    Isotope.sortDataParsers = {
      'parseInt': function( val ) {
        return parseInt( val, 10 );
      },
      'parseFloat': function( val ) {
        return parseFloat( val );
      }
    };

    // ----- sort method ----- //

    // sort filteredItem order
    proto._sort = function() {
      if ( !this.options.sortBy ) {
        return;
      }
      // keep track of sortBy History
      var sortBys = utils.makeArray( this.options.sortBy );
      if ( !this._getIsSameSortBy( sortBys ) ) {
        // concat all sortBy and sortHistory, add to front, oldest goes in last
        this.sortHistory = sortBys.concat( this.sortHistory );
      }
      // sort magic
      var itemSorter = getItemSorter( this.sortHistory, this.options.sortAscending );
      this.filteredItems.sort( itemSorter );
    };

    // check if sortBys is same as start of sortHistory
    proto._getIsSameSortBy = function( sortBys ) {
      for ( var i=0; i < sortBys.length; i++ ) {
        if ( sortBys[i] != this.sortHistory[i] ) {
          return false;
        }
      }
      return true;
    };

    // returns a function used for sorting
    function getItemSorter( sortBys, sortAsc ) {
      return function sorter( itemA, itemB ) {
        // cycle through all sortKeys
        for ( var i = 0; i < sortBys.length; i++ ) {
          var sortBy = sortBys[i];
          var a = itemA.sortData[ sortBy ];
          var b = itemB.sortData[ sortBy ];
          if ( a > b || a < b ) {
            // if sortAsc is an object, use the value given the sortBy key
            var isAscending = sortAsc[ sortBy ] !== undefined ? sortAsc[ sortBy ] : sortAsc;
            var direction = isAscending ? 1 : -1;
            return ( a > b ? 1 : -1 ) * direction;
          }
        }
        return 0;
      };
    }

    // -------------------------- methods -------------------------- //

    // get layout mode
    proto._mode = function() {
      var layoutMode = this.options.layoutMode;
      var mode = this.modes[ layoutMode ];
      if ( !mode ) {
        // TODO console.error
        throw new Error( 'No layout mode: ' + layoutMode );
      }
      // HACK sync mode's options
      // any options set after init for layout mode need to be synced
      mode.options = this.options[ layoutMode ];
      return mode;
    };

    proto._resetLayout = function() {
      // trigger original reset layout
      Outlayer.prototype._resetLayout.call( this );
      this._mode()._resetLayout();
    };

    proto._getItemLayoutPosition = function( item  ) {
      return this._mode()._getItemLayoutPosition( item );
    };

    proto._manageStamp = function( stamp ) {
      this._mode()._manageStamp( stamp );
    };

    proto._getContainerSize = function() {
      return this._mode()._getContainerSize();
    };

    proto.needsResizeLayout = function() {
      return this._mode().needsResizeLayout();
    };

    // -------------------------- adding & removing -------------------------- //

    // HEADS UP overwrites default Outlayer appended
    proto.appended = function( elems ) {
      var items = this.addItems( elems );
      if ( !items.length ) {
        return;
      }
      // filter, layout, reveal new items
      var filteredItems = this._filterRevealAdded( items );
      // add to filteredItems
      this.filteredItems = this.filteredItems.concat( filteredItems );
    };

    // HEADS UP overwrites default Outlayer prepended
    proto.prepended = function( elems ) {
      var items = this._itemize( elems );
      if ( !items.length ) {
        return;
      }
      // start new layout
      this._resetLayout();
      this._manageStamps();
      // filter, layout, reveal new items
      var filteredItems = this._filterRevealAdded( items );
      // layout previous items
      this.layoutItems( this.filteredItems );
      // add to items and filteredItems
      this.filteredItems = filteredItems.concat( this.filteredItems );
      this.items = items.concat( this.items );
    };

    proto._filterRevealAdded = function( items ) {
      var filtered = this._filter( items );
      this.hide( filtered.needHide );
      // reveal all new items
      this.reveal( filtered.matches );
      // layout new items, no transition
      this.layoutItems( filtered.matches, true );
      return filtered.matches;
    };

    /**
     * Filter, sort, and layout newly-appended item elements
     * @param {Array or NodeList or Element} elems
     */
    proto.insert = function( elems ) {
      var items = this.addItems( elems );
      if ( !items.length ) {
        return;
      }
      // append item elements
      var i, item;
      var len = items.length;
      for ( i=0; i < len; i++ ) {
        item = items[i];
        this.element.appendChild( item.element );
      }
      // filter new stuff
      var filteredInsertItems = this._filter( items ).matches;
      // set flag
      for ( i=0; i < len; i++ ) {
        items[i].isLayoutInstant = true;
      }
      this.arrange();
      // reset flag
      for ( i=0; i < len; i++ ) {
        delete items[i].isLayoutInstant;
      }
      this.reveal( filteredInsertItems );
    };

    var _remove = proto.remove;
    proto.remove = function( elems ) {
      elems = utils.makeArray( elems );
      var removeItems = this.getItems( elems );
      // do regular thing
      _remove.call( this, elems );
      // bail if no items to remove
      var len = removeItems && removeItems.length;
      // remove elems from filteredItems
      for ( var i=0; len && i < len; i++ ) {
        var item = removeItems[i];
        // remove item from collection
        utils.removeFrom( this.filteredItems, item );
      }
    };

    proto.shuffle = function() {
      // update random sortData
      for ( var i=0; i < this.items.length; i++ ) {
        var item = this.items[i];
        item.sortData.random = Math.random();
      }
      this.options.sortBy = 'random';
      this._sort();
      this._layout();
    };

    /**
     * trigger fn without transition
     * kind of hacky to have this in the first place
     * @param {Function} fn
     * @param {Array} args
     * @returns ret
     * @private
     */
    proto._noTransition = function( fn, args ) {
      // save transitionDuration before disabling
      var transitionDuration = this.options.transitionDuration;
      // disable transition
      this.options.transitionDuration = 0;
      // do it
      var returnValue = fn.apply( this, args );
      // re-enable transition for reveal
      this.options.transitionDuration = transitionDuration;
      return returnValue;
    };

    // ----- helper methods ----- //

    /**
     * getter method for getting filtered item elements
     * @returns {Array} elems - collection of item elements
     */
    proto.getFilteredItemElements = function() {
      return this.filteredItems.map( function( item ) {
        return item.element;
      });
    };

    // -----  ----- //

    return Isotope;

  }));

  /*!
   * imagesLoaded PACKAGED v4.1.4
   * JavaScript is all like "You images are done yet or what?"
   * MIT License
   */

  /**
   * EvEmitter v1.1.0
   * Lil' event emitter
   * MIT License
   */

  /* jshint unused: true, undef: true, strict: true */

  ( function( global, factory ) {
    // universal module definition
    /* jshint strict: false */ /* globals define, module, window */
    if ( typeof define == 'function' && define.amd ) {
      // AMD - RequireJS
      define( 'ev-emitter/ev-emitter',factory );
    } else if ( typeof module == 'object' && module.exports ) {
      // CommonJS - Browserify, Webpack
      module.exports = factory();
    } else {
      // Browser globals
      global.EvEmitter = factory();
    }

  }( typeof window != 'undefined' ? window : undefined, function() {



  function EvEmitter() {}

  var proto = EvEmitter.prototype;

  proto.on = function( eventName, listener ) {
    if ( !eventName || !listener ) {
      return;
    }
    // set events hash
    var events = this._events = this._events || {};
    // set listeners array
    var listeners = events[ eventName ] = events[ eventName ] || [];
    // only add once
    if ( listeners.indexOf( listener ) == -1 ) {
      listeners.push( listener );
    }

    return this;
  };

  proto.once = function( eventName, listener ) {
    if ( !eventName || !listener ) {
      return;
    }
    // add event
    this.on( eventName, listener );
    // set once flag
    // set onceEvents hash
    var onceEvents = this._onceEvents = this._onceEvents || {};
    // set onceListeners object
    var onceListeners = onceEvents[ eventName ] = onceEvents[ eventName ] || {};
    // set flag
    onceListeners[ listener ] = true;

    return this;
  };

  proto.off = function( eventName, listener ) {
    var listeners = this._events && this._events[ eventName ];
    if ( !listeners || !listeners.length ) {
      return;
    }
    var index = listeners.indexOf( listener );
    if ( index != -1 ) {
      listeners.splice( index, 1 );
    }

    return this;
  };

  proto.emitEvent = function( eventName, args ) {
    var listeners = this._events && this._events[ eventName ];
    if ( !listeners || !listeners.length ) {
      return;
    }
    // copy over to avoid interference if .off() in listener
    listeners = listeners.slice(0);
    args = args || [];
    // once stuff
    var onceListeners = this._onceEvents && this._onceEvents[ eventName ];

    for ( var i=0; i < listeners.length; i++ ) {
      var listener = listeners[i];
      var isOnce = onceListeners && onceListeners[ listener ];
      if ( isOnce ) {
        // remove listener
        // remove before trigger to prevent recursion
        this.off( eventName, listener );
        // unset once flag
        delete onceListeners[ listener ];
      }
      // trigger listener
      listener.apply( this, args );
    }

    return this;
  };

  proto.allOff = function() {
    delete this._events;
    delete this._onceEvents;
  };

  return EvEmitter;

  }));

  /*!
   * imagesLoaded v4.1.4
   * JavaScript is all like "You images are done yet or what?"
   * MIT License
   */

  ( function( window, factory ) {  // universal module definition

    /*global define: false, module: false, require: false */

    if ( typeof define == 'function' && define.amd ) {
      // AMD
      define( [
        'ev-emitter/ev-emitter'
      ], function( EvEmitter ) {
        return factory( window, EvEmitter );
      });
    } else if ( typeof module == 'object' && module.exports ) {
      // CommonJS
      module.exports = factory(
        window,
        require('ev-emitter')
      );
    } else {
      // browser global
      window.imagesLoaded = factory(
        window,
        window.EvEmitter
      );
    }

  })( typeof window !== 'undefined' ? window : undefined,

  // --------------------------  factory -------------------------- //

  function factory( window, EvEmitter ) {



  var $ = window.jQuery;
  var console = window.console;

  // -------------------------- helpers -------------------------- //

  // extend objects
  function extend( a, b ) {
    for ( var prop in b ) {
      a[ prop ] = b[ prop ];
    }
    return a;
  }

  var arraySlice = Array.prototype.slice;

  // turn element or nodeList into an array
  function makeArray( obj ) {
    if ( Array.isArray( obj ) ) {
      // use object if already an array
      return obj;
    }

    var isArrayLike = typeof obj == 'object' && typeof obj.length == 'number';
    if ( isArrayLike ) {
      // convert nodeList to array
      return arraySlice.call( obj );
    }

    // array of single index
    return [ obj ];
  }

  // -------------------------- imagesLoaded -------------------------- //

  /**
   * @param {Array, Element, NodeList, String} elem
   * @param {Object or Function} options - if function, use as callback
   * @param {Function} onAlways - callback function
   */
  function ImagesLoaded( elem, options, onAlways ) {
    // coerce ImagesLoaded() without new, to be new ImagesLoaded()
    if ( !( this instanceof ImagesLoaded ) ) {
      return new ImagesLoaded( elem, options, onAlways );
    }
    // use elem as selector string
    var queryElem = elem;
    if ( typeof elem == 'string' ) {
      queryElem = document.querySelectorAll( elem );
    }
    // bail if bad element
    if ( !queryElem ) {
      console.error( 'Bad element for imagesLoaded ' + ( queryElem || elem ) );
      return;
    }

    this.elements = makeArray( queryElem );
    this.options = extend( {}, this.options );
    // shift arguments if no options set
    if ( typeof options == 'function' ) {
      onAlways = options;
    } else {
      extend( this.options, options );
    }

    if ( onAlways ) {
      this.on( 'always', onAlways );
    }

    this.getImages();

    if ( $ ) {
      // add jQuery Deferred object
      this.jqDeferred = new $.Deferred();
    }

    // HACK check async to allow time to bind listeners
    setTimeout( this.check.bind( this ) );
  }

  ImagesLoaded.prototype = Object.create( EvEmitter.prototype );

  ImagesLoaded.prototype.options = {};

  ImagesLoaded.prototype.getImages = function() {
    this.images = [];

    // filter & find items if we have an item selector
    this.elements.forEach( this.addElementImages, this );
  };

  /**
   * @param {Node} element
   */
  ImagesLoaded.prototype.addElementImages = function( elem ) {
    // filter siblings
    if ( elem.nodeName == 'IMG' ) {
      this.addImage( elem );
    }
    // get background image on element
    if ( this.options.background === true ) {
      this.addElementBackgroundImages( elem );
    }

    // find children
    // no non-element nodes, #143
    var nodeType = elem.nodeType;
    if ( !nodeType || !elementNodeTypes[ nodeType ] ) {
      return;
    }
    var childImgs = elem.querySelectorAll('img');
    // concat childElems to filterFound array
    for ( var i=0; i < childImgs.length; i++ ) {
      var img = childImgs[i];
      this.addImage( img );
    }

    // get child background images
    if ( typeof this.options.background == 'string' ) {
      var children = elem.querySelectorAll( this.options.background );
      for ( i=0; i < children.length; i++ ) {
        var child = children[i];
        this.addElementBackgroundImages( child );
      }
    }
  };

  var elementNodeTypes = {
    1: true,
    9: true,
    11: true
  };

  ImagesLoaded.prototype.addElementBackgroundImages = function( elem ) {
    var style = getComputedStyle( elem );
    if ( !style ) {
      // Firefox returns null if in a hidden iframe https://bugzil.la/548397
      return;
    }
    // get url inside url("...")
    var reURL = /url\((['"])?(.*?)\1\)/gi;
    var matches = reURL.exec( style.backgroundImage );
    while ( matches !== null ) {
      var url = matches && matches[2];
      if ( url ) {
        this.addBackground( url, elem );
      }
      matches = reURL.exec( style.backgroundImage );
    }
  };

  /**
   * @param {Image} img
   */
  ImagesLoaded.prototype.addImage = function( img ) {
    var loadingImage = new LoadingImage( img );
    this.images.push( loadingImage );
  };

  ImagesLoaded.prototype.addBackground = function( url, elem ) {
    var background = new Background( url, elem );
    this.images.push( background );
  };

  ImagesLoaded.prototype.check = function() {
    var _this = this;
    this.progressedCount = 0;
    this.hasAnyBroken = false;
    // complete if no images
    if ( !this.images.length ) {
      this.complete();
      return;
    }

    function onProgress( image, elem, message ) {
      // HACK - Chrome triggers event before object properties have changed. #83
      setTimeout( function() {
        _this.progress( image, elem, message );
      });
    }

    this.images.forEach( function( loadingImage ) {
      loadingImage.once( 'progress', onProgress );
      loadingImage.check();
    });
  };

  ImagesLoaded.prototype.progress = function( image, elem, message ) {
    this.progressedCount++;
    this.hasAnyBroken = this.hasAnyBroken || !image.isLoaded;
    // progress event
    this.emitEvent( 'progress', [ this, image, elem ] );
    if ( this.jqDeferred && this.jqDeferred.notify ) {
      this.jqDeferred.notify( this, image );
    }
    // check if completed
    if ( this.progressedCount == this.images.length ) {
      this.complete();
    }

    if ( this.options.debug && console ) {
      console.log( 'progress: ' + message, image, elem );
    }
  };

  ImagesLoaded.prototype.complete = function() {
    var eventName = this.hasAnyBroken ? 'fail' : 'done';
    this.isComplete = true;
    this.emitEvent( eventName, [ this ] );
    this.emitEvent( 'always', [ this ] );
    if ( this.jqDeferred ) {
      var jqMethod = this.hasAnyBroken ? 'reject' : 'resolve';
      this.jqDeferred[ jqMethod ]( this );
    }
  };

  // --------------------------  -------------------------- //

  function LoadingImage( img ) {
    this.img = img;
  }

  LoadingImage.prototype = Object.create( EvEmitter.prototype );

  LoadingImage.prototype.check = function() {
    // If complete is true and browser supports natural sizes,
    // try to check for image status manually.
    var isComplete = this.getIsImageComplete();
    if ( isComplete ) {
      // report based on naturalWidth
      this.confirm( this.img.naturalWidth !== 0, 'naturalWidth' );
      return;
    }

    // If none of the checks above matched, simulate loading on detached element.
    this.proxyImage = new Image();
    this.proxyImage.addEventListener( 'load', this );
    this.proxyImage.addEventListener( 'error', this );
    // bind to image as well for Firefox. #191
    this.img.addEventListener( 'load', this );
    this.img.addEventListener( 'error', this );
    this.proxyImage.src = this.img.src;
  };

  LoadingImage.prototype.getIsImageComplete = function() {
    // check for non-zero, non-undefined naturalWidth
    // fixes Safari+InfiniteScroll+Masonry bug infinite-scroll#671
    return this.img.complete && this.img.naturalWidth;
  };

  LoadingImage.prototype.confirm = function( isLoaded, message ) {
    this.isLoaded = isLoaded;
    this.emitEvent( 'progress', [ this, this.img, message ] );
  };

  // ----- events ----- //

  // trigger specified handler for event type
  LoadingImage.prototype.handleEvent = function( event ) {
    var method = 'on' + event.type;
    if ( this[ method ] ) {
      this[ method ]( event );
    }
  };

  LoadingImage.prototype.onload = function() {
    this.confirm( true, 'onload' );
    this.unbindEvents();
  };

  LoadingImage.prototype.onerror = function() {
    this.confirm( false, 'onerror' );
    this.unbindEvents();
  };

  LoadingImage.prototype.unbindEvents = function() {
    this.proxyImage.removeEventListener( 'load', this );
    this.proxyImage.removeEventListener( 'error', this );
    this.img.removeEventListener( 'load', this );
    this.img.removeEventListener( 'error', this );
  };

  // -------------------------- Background -------------------------- //

  function Background( url, element ) {
    this.url = url;
    this.element = element;
    this.img = new Image();
  }

  // inherit LoadingImage prototype
  Background.prototype = Object.create( LoadingImage.prototype );

  Background.prototype.check = function() {
    this.img.addEventListener( 'load', this );
    this.img.addEventListener( 'error', this );
    this.img.src = this.url;
    // check if image is already complete
    var isComplete = this.getIsImageComplete();
    if ( isComplete ) {
      this.confirm( this.img.naturalWidth !== 0, 'naturalWidth' );
      this.unbindEvents();
    }
  };

  Background.prototype.unbindEvents = function() {
    this.img.removeEventListener( 'load', this );
    this.img.removeEventListener( 'error', this );
  };

  Background.prototype.confirm = function( isLoaded, message ) {
    this.isLoaded = isLoaded;
    this.emitEvent( 'progress', [ this, this.element, message ] );
  };

  // -------------------------- jQuery -------------------------- //

  ImagesLoaded.makeJQueryPlugin = function( jQuery ) {
    jQuery = jQuery || window.jQuery;
    if ( !jQuery ) {
      return;
    }
    // set local variable
    $ = jQuery;
    // $().imagesLoaded()
    $.fn.imagesLoaded = function( options, callback ) {
      var instance = new ImagesLoaded( this, options, callback );
      return instance.jqDeferred.promise( $(this) );
    };
  };
  // try making plugin
  ImagesLoaded.makeJQueryPlugin();

  // --------------------------  -------------------------- //

  return ImagesLoaded;

  });

  /**
   * Featherlight - ultra slim jQuery lightbox
   * Version 1.7.14 - http://noelboss.github.io/featherlight/
   *
   * Copyright 2019, Noël Raoul Bossart (http://www.noelboss.com)
   * MIT Licensed.
  **/
  !function(a){"function"==typeof define&&define.amd?define(["jquery"],a):"object"==typeof module&&module.exports?module.exports=function(b,c){return void 0===c&&(c="undefined"!=typeof window?require("jquery"):require("jquery")(b)),a(c),c}:a(jQuery);}(function(a){function b(a,c){if(!(this instanceof b)){var d=new b(a,c);return d.open(),d}this.id=b.id++,this.setup(a,c),this.chainCallbacks(b._callbackChain);}function c(a,b){var c={};for(var d in a)d in b&&(c[d]=a[d],delete a[d]);return c}function d(a,b){var c={},d=new RegExp("^"+b+"([A-Z])(.*)");for(var e in a){var f=e.match(d);if(f){var g=(f[1]+f[2].replace(/([A-Z])/g,"-$1")).toLowerCase();c[g]=a[e];}}return c}if("undefined"==typeof a)return void("console"in window&&window.console.info("Too much lightness, Featherlight needs jQuery."));if(a.fn.jquery.match(/-ajax/))return void("console"in window&&window.console.info("Featherlight needs regular jQuery, not the slim version."));var e=[],f=function(b){return e=a.grep(e,function(a){return a!==b&&a.$instance.closest("body").length>0})},g={allow:1,allowfullscreen:1,frameborder:1,height:1,longdesc:1,marginheight:1,marginwidth:1,mozallowfullscreen:1,name:1,referrerpolicy:1,sandbox:1,scrolling:1,src:1,srcdoc:1,style:1,webkitallowfullscreen:1,width:1},h={keyup:"onKeyUp",resize:"onResize"},i=function(c){a.each(b.opened().reverse(),function(){return c.isDefaultPrevented()||!1!==this[h[c.type]](c)?void 0:(c.preventDefault(),c.stopPropagation(),!1)});},j=function(c){if(c!==b._globalHandlerInstalled){b._globalHandlerInstalled=c;var d=a.map(h,function(a,c){return c+"."+b.prototype.namespace}).join(" ");a(window)[c?"on":"off"](d,i);}};b.prototype={constructor:b,namespace:"featherlight",targetAttr:"data-featherlight",variant:null,resetCss:!1,background:null,openTrigger:"click",closeTrigger:"click",filter:null,root:"body",openSpeed:250,closeSpeed:250,closeOnClick:"background",closeOnEsc:!0,closeIcon:"&#10005;",loading:"",persist:!1,otherClose:null,beforeOpen:a.noop,beforeContent:a.noop,beforeClose:a.noop,afterOpen:a.noop,afterContent:a.noop,afterClose:a.noop,onKeyUp:a.noop,onResize:a.noop,type:null,contentFilters:["jquery","image","html","ajax","iframe","text"],setup:function(b,c){"object"!=typeof b||b instanceof a!=!1||c||(c=b,b=void 0);var d=a.extend(this,c,{target:b}),e=d.resetCss?d.namespace+"-reset":d.namespace,f=a(d.background||['<div class="'+e+"-loading "+e+'">','<div class="'+e+'-content">','<button class="'+e+"-close-icon "+d.namespace+'-close" aria-label="Close">',d.closeIcon,"</button>",'<div class="'+d.namespace+'-inner">'+d.loading+"</div>","</div>","</div>"].join("")),g="."+d.namespace+"-close"+(d.otherClose?","+d.otherClose:"");return d.$instance=f.clone().addClass(d.variant),d.$instance.on(d.closeTrigger+"."+d.namespace,function(b){if(!b.isDefaultPrevented()){var c=a(b.target);("background"===d.closeOnClick&&c.is("."+d.namespace)||"anywhere"===d.closeOnClick||c.closest(g).length)&&(d.close(b),b.preventDefault());}}),this},getContent:function(){if(this.persist!==!1&&this.$content)return this.$content;var b=this,c=this.constructor.contentFilters,d=function(a){return b.$currentTarget&&b.$currentTarget.attr(a)},e=d(b.targetAttr),f=b.target||e||"",g=c[b.type];if(!g&&f in c&&(g=c[f],f=b.target&&e),f=f||d("href")||"",!g)for(var h in c)b[h]&&(g=c[h],f=b[h]);if(!g){var i=f;if(f=null,a.each(b.contentFilters,function(){return g=c[this],g.test&&(f=g.test(i)),!f&&g.regex&&i.match&&i.match(g.regex)&&(f=i),!f}),!f)return "console"in window&&window.console.error("Featherlight: no content filter found "+(i?' for "'+i+'"':" (no target specified)")),!1}return g.process.call(b,f)},setContent:function(b){return this.$instance.removeClass(this.namespace+"-loading"),this.$instance.toggleClass(this.namespace+"-iframe",b.is("iframe")),this.$instance.find("."+this.namespace+"-inner").not(b).slice(1).remove().end().replaceWith(a.contains(this.$instance[0],b[0])?"":b),this.$content=b.addClass(this.namespace+"-inner"),this},open:function(b){var c=this;if(c.$instance.hide().appendTo(c.root),!(b&&b.isDefaultPrevented()||c.beforeOpen(b)===!1)){b&&b.preventDefault();var d=c.getContent();if(d)return e.push(c),j(!0),c.$instance.fadeIn(c.openSpeed),c.beforeContent(b),a.when(d).always(function(a){a&&(c.setContent(a),c.afterContent(b));}).then(c.$instance.promise()).done(function(){c.afterOpen(b);})}return c.$instance.detach(),a.Deferred().reject().promise()},close:function(b){var c=this,d=a.Deferred();return c.beforeClose(b)===!1?d.reject():(0===f(c).length&&j(!1),c.$instance.fadeOut(c.closeSpeed,function(){c.$instance.detach(),c.afterClose(b),d.resolve();})),d.promise()},resize:function(a,b){if(a&&b){this.$content.css("width","").css("height","");var c=Math.max(a/(this.$content.parent().width()-1),b/(this.$content.parent().height()-1));c>1&&(c=b/Math.floor(b/c),this.$content.css("width",""+a/c+"px").css("height",""+b/c+"px"));}},chainCallbacks:function(b){for(var c in b)this[c]=a.proxy(b[c],this,a.proxy(this[c],this));}},a.extend(b,{id:0,autoBind:"[data-featherlight]",defaults:b.prototype,contentFilters:{jquery:{regex:/^[#.]\w/,test:function(b){return b instanceof a&&b},process:function(b){return this.persist!==!1?a(b):a(b).clone(!0)}},image:{regex:/\.(png|jpg|jpeg|gif|tiff?|bmp|svg)(\?\S*)?$/i,process:function(b){var c=this,d=a.Deferred(),e=new Image,f=a('<img src="'+b+'" alt="" class="'+c.namespace+'-image" />');return e.onload=function(){f.naturalWidth=e.width,f.naturalHeight=e.height,d.resolve(f);},e.onerror=function(){d.reject(f);},e.src=b,d.promise()}},html:{regex:/^\s*<[\w!][^<]*>/,process:function(b){return a(b)}},ajax:{regex:/./,process:function(b){var c=a.Deferred(),d=a("<div></div>").load(b,function(a,b){"error"!==b&&c.resolve(d.contents()),c.reject();});return c.promise()}},iframe:{process:function(b){var e=new a.Deferred,f=a("<iframe/>"),h=d(this,"iframe"),i=c(h,g);return f.hide().attr("src",b).attr(i).css(h).on("load",function(){e.resolve(f.show());}).appendTo(this.$instance.find("."+this.namespace+"-content")),e.promise()}},text:{process:function(b){return a("<div>",{text:b})}}},functionAttributes:["beforeOpen","afterOpen","beforeContent","afterContent","beforeClose","afterClose"],readElementConfig:function(b,c){var d=this,e=new RegExp("^data-"+c+"-(.*)"),f={};return b&&b.attributes&&a.each(b.attributes,function(){var b=this.name.match(e);if(b){var c=this.value,g=a.camelCase(b[1]);if(a.inArray(g,d.functionAttributes)>=0)c=new Function(c);else try{c=JSON.parse(c);}catch(h){}f[g]=c;}}),f},extend:function(b,c){var d=function(){this.constructor=b;};return d.prototype=this.prototype,b.prototype=new d,b.__super__=this.prototype,a.extend(b,this,c),b.defaults=b.prototype,b},attach:function(b,c,d){var e=this;"object"!=typeof c||c instanceof a!=!1||d||(d=c,c=void 0),d=a.extend({},d);var f,g=d.namespace||e.defaults.namespace,h=a.extend({},e.defaults,e.readElementConfig(b[0],g),d),i=function(g){var i=a(g.currentTarget),j=a.extend({$source:b,$currentTarget:i},e.readElementConfig(b[0],h.namespace),e.readElementConfig(g.currentTarget,h.namespace),d),k=f||i.data("featherlight-persisted")||new e(c,j);"shared"===k.persist?f=k:k.persist!==!1&&i.data("featherlight-persisted",k),j.$currentTarget.blur&&j.$currentTarget.blur(),k.open(g);};return b.on(h.openTrigger+"."+h.namespace,h.filter,i),{filter:h.filter,handler:i}},current:function(){var a=this.opened();return a[a.length-1]||null},opened:function(){var b=this;return f(),a.grep(e,function(a){return a instanceof b})},close:function(a){var b=this.current();return b?b.close(a):void 0},_onReady:function(){var b=this;if(b.autoBind){var c=a(b.autoBind);c.each(function(){b.attach(a(this));}),a(document).on("click",b.autoBind,function(d){if(!d.isDefaultPrevented()){var e=a(d.currentTarget),f=c.length;if(c=c.add(e),f!==c.length){var g=b.attach(e);(!g.filter||a(d.target).parentsUntil(e,g.filter).length>0)&&g.handler(d);}}});}},_callbackChain:{onKeyUp:function(b,c){return 27===c.keyCode?(this.closeOnEsc&&a.featherlight.close(c),!1):b(c)},beforeOpen:function(b,c){return a(document.documentElement).addClass("with-featherlight"),this._previouslyActive=document.activeElement,this._$previouslyTabbable=a("a, input, select, textarea, iframe, button, iframe, [contentEditable=true]").not("[tabindex]").not(this.$instance.find("button")),this._$previouslyWithTabIndex=a("[tabindex]").not('[tabindex="-1"]'),this._previousWithTabIndices=this._$previouslyWithTabIndex.map(function(b,c){return a(c).attr("tabindex")}),this._$previouslyWithTabIndex.add(this._$previouslyTabbable).attr("tabindex",-1),document.activeElement.blur&&document.activeElement.blur(),b(c)},afterClose:function(c,d){var e=c(d),f=this;return this._$previouslyTabbable.removeAttr("tabindex"),this._$previouslyWithTabIndex.each(function(b,c){a(c).attr("tabindex",f._previousWithTabIndices[b]);}),this._previouslyActive.focus(),0===b.opened().length&&a(document.documentElement).removeClass("with-featherlight"),e},onResize:function(a,b){return this.resize(this.$content.naturalWidth,this.$content.naturalHeight),a(b)},afterContent:function(a,b){var c=a(b);return this.$instance.find("[autofocus]:not([disabled])").focus(),this.onResize(b),c}}}),a.featherlight=b,a.fn.featherlight=function(a,c){return b.attach(this,a,c),this},a(document).ready(function(){b._onReady();});});

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  var views = {};

  function run_view_action($view, action, args) {
    var handler = $view.data('gendernaut-view-handler');

    if (!handler) {
      var view_type = $view.data('type');

      if (views[view_type]) {
        var Handler = function Handler() {};

        Handler.prototype = views[view_type];
        handler = new Handler();
        $view.data('gendernaut-view-handler', handler);
      }
    }

    if (handler[action]) {
      var _handler;

      return (_handler = handler)[action].apply(_handler, _toConsumableArray(args));
    }
  }

  function init_view($view) {
    return run_view_action($view, 'init', arguments);
  }
  function display_view($view) {
    return run_view_action($view, 'display', arguments);
  }
  function hide_view($view) {
    return run_view_action($view, 'hide', arguments);
  }
  function filter_view($view, filters) {
    return run_view_action($view, 'filter', arguments);
  }
  function register_view_type(view_types, handler) {
    if (!(view_types instanceof Array)) {
      view_types = [view_types];
    }

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = view_types[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var view_type = _step.value;

        if (!views[view_type]) {
          views[view_type] = handler;
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }

  var filter_types = {};

  function FiltersCollection() {
    var op = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'AND';
    this.filters = {
      operator: op,
      props: []
    };
  }

  FiltersCollection.prototype = {
    add: function add(filter) {
      this.filters.props.push(filter);
    },
    apply_to: function apply_to($item) {
      return item_apply_filters($item, this.filters);
    },
    clear: function clear() {
      this.filters.props = [];
    }
  };
  function create_filters_collection() {
    var op = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'AND';
    return new FiltersCollection(op);
  }

  function run_filter_action($group, action, args, def) {
    var type = $group.data('type');

    if (filter_types[type] && filter_types[type][action]) {
      var _filter_types$type;

      return (_filter_types$type = filter_types[type])[action].apply(_filter_types$type, _toConsumableArray(args));
    }

    return def;
  }

  function init_filter_group($group, update_callback) {
    return run_filter_action($group, 'init_group', arguments, {});
  }
  function register_filter_type(type, handler) {
    if (!filter_types[type]) {
      filter_types[type] = handler;
    }
  }
  register_filter_type('taxonomy', {
    init_group: function init_group($group, update_callback) {
      var self = this;
      var filter = self.init_filter($group);
      update_callback = typeof update_callback === 'function' && update_callback;
      var $clear = this.get_clear_button($group);
      $group.on('change', function (e) {
        var $el = $(e.target);
        self.apply_changes(filter, $el, $group);
        update_callback && update_callback(filter);
      });
      $clear.on('click', function (e) {
        e.preventDefault();
        self.clear_filter(filter, $group);
        update_callback && update_callback(filter);
      });
      return filter;
    },
    init_filter: function init_filter($group) {
      var filter = {
        operator: 'OR',
        props: {}
      };
      return this.update_filter(filter, $group);
    },
    update_filter: function update_filter(filter, $group) {
      var $checkboxes = this.get_checkboxes($group);
      return this.apply_changes(filter, $checkboxes, $group);
    },
    apply_changes: function apply_changes(filter, $changed, $group) {
      $changed.each(function () {
        var $checkbox = $(this);
        var id = $checkbox.attr('id');

        if (!$checkbox.prop('checked')) {
          delete filter.props[id];
        } else {
          filter.props[id] = $.extend({}, $group.data('filter'), $checkbox.data('filter'));
          if (typeof filter.props[id].value === 'undefined') filter.props[id].value = $checkbox.val();
        }
      });
      this.check_clear(filter, $group);
      return filter;
    },
    clear_filter: function clear_filter(filter, $group) {
      var $checkboxes = this.clear_ui($group);
      this.apply_changes(filter, $checkboxes, $group);
    },
    clear_ui: function clear_ui($group) {
      var $checkboxes = this.get_checkboxes($group);
      $checkboxes.prop('checked', false);
      return $checkboxes;
    },
    update_ui: function update_ui(filter, $group) {
      var $checkboxes = this.get_checkboxes($group);
      $checkboxes.each(function () {
        var $checkbox = $(this);
        var id = $checkbox.attr('id');
        this.checked = filter.props && filter.props[id];
      });
      this.check_clear(filter, group);
    },
    is_enabled: function is_enabled(filter, $group) {
      return filter.props && Object.keys(filter.props).length > 0;
    },
    check_clear: function check_clear(filter, $group, $clear) {
      $clear = $clear || this.get_clear_button($group);

      if (this.is_enabled(filter, $group)) {
        $clear.prop('disabled', false);
      } else {
        $clear.prop('disabled', true);
      }
    },
    get_checkboxes: function get_checkboxes($group) {
      return $group.find('.js-gendernaut-term-input');
    },
    get_clear_button: function get_clear_button($group) {
      return $group.find('.js-gendernaut-filter-clear');
    }
  });
  register_filter_type('index', {
    init_group: function init_group($group, update_callback) {
      var $options = this.get_options($group);
      var filter = this.init_filter($group);
      var self = this;
      $options.change(function (e) {
        e.preventDefault();
        self.apply_option(filter, $(this), $group);
        update_callback && update_callback(filter);
      });
      return filter;
    },
    init_filter: function init_filter($group) {
      var filter = {
        field: 'index-name',
        mode: 'IS',
        compare: 'regexp'
      };
      return this.update_filter(filter, $group);
    },
    update_filter: function update_filter(filter, $group) {
      var $current = this.get_options($group).filter(':checked');
      return this.apply_option(filter, $current, $group);
    },
    apply_option: function apply_option(filter, $option, $group) {
      var val = $option.attr('value');

      if (val) {
        filter.value = new RegExp("^".concat(val), 'i');
      } else {
        delete filter.value;
      }

      this.check_clear(filter, $group);
      return filter;
    },
    clear_filter: function clear_filter(filter, $group) {
      delete filter.value;
      return filter;
    },
    check_clear: function check_clear(filter, $group, $clear) {
      $clear = $clear || this.get_clear_button($group);

      if (this.is_enabled(filter, $group)) {
        $clear.prop('disabled', false);
      } else {
        $clear.prop('disabled', true);
      }
    },
    is_enabled: function is_enabled(filter, $group) {
      return !!filter.value;
    },
    get_options: function get_options($group) {
      return $group.find('.js-gendernaut-index-option');
    },
    get_clear_button: function get_clear_button($group) {
      return $group.find('.js-gendernaut-filter-clear');
    }
  });
  register_filter_type('search', {
    init_group: function init_group($group, update_callback) {
      var $input = this.get_input($group);
      var $clear = this.get_clear_button($group);
      var filter = this.init_filter($group);
      var self = this;
      $input.keyup(function (e) {
        e.preventDefault();
        self.apply_input(filter, $input, $group);
        update_callback && update_callback(filter);
      });
      $clear.click(function (e) {
        e.preventDefault();
        $input.val("");
        self.apply_input(filter, $input, $group);
        update_callback && update_callback(filter);
      });
      return filter;
    },
    init_filter: function init_filter($group) {
      var filter = {
        field: function field($item) {
          return $item.data('index-title') + '\n' + $item.text();
        },
        mode: 'IS',
        compare: 'str_includes_i'
      };
      return this.update_filter(filter, $group);
    },
    update_filter: function update_filter(filter, $group) {
      var $input = this.get_input($group);
      return this.apply_input(filter, $input, $group);
    },
    apply_input: function apply_input(filter, $input, $group) {
      var val = $input.prop('value');

      if (val) {
        filter.value = val;
      } else {
        delete filter.value;
      }

      this.check_clear(filter, $group);
      return filter;
    },
    clear_filter: function clear_filter(filter, $group) {
      var $input = this.get_input($group);
      $input.val("");
      return self.apply_input(filter, $input, $group);
    },
    check_clear: function check_clear(filter, $group, $clear) {
      $clear = $clear || this.get_clear_button($group);

      if (this.is_enabled(filter, $group)) {
        $clear.prop('disabled', false);
      } else {
        $clear.prop('disabled', true);
      }
    },
    is_enabled: function is_enabled(filter, $group) {
      return !!filter.value;
    },
    get_input: function get_input($group) {
      return $group.find('.js-gendernaut-search-input');
    },
    get_clear_button: function get_clear_button($group) {
      return $group.find('.js-gendernaut-filter-clear');
    }
  });
  function item_apply_filters($item, filters) {
    if (filters.props) {
      var props = filters.props instanceof Array ? filters.props : Object.values(filters.props);
      if (!props.length) return true;

      switch (filters.operator) {
        case 'AND':
          return props.reduce(function (acc, val) {
            return item_apply_filters($item, val) && acc;
          }, true);

        case 'OR':
          return props.reduce(function (acc, val) {
            return item_apply_filters($item, val) || acc;
          }, false);

        case 'XOR':
          var sum = props.reduce(function (acc, val) {
            return item_apply_filters($item, val) + acc;
          }, 0);
          return sum === 1;
      }
    } else {
      if (typeof filters.value === 'undefined' || typeof filters.compare === 'undefined') return true;
      var field = typeof filters.field === 'function' ? filters.field($item) : $item.data(filters.field);

      var test_value = function test_value(field_value) {
        var result = compare_values(field_value, filters.value, filters.compare);
        return result;
      };

      if (filters.mode === 'IS') {
        return test_value(field);
      } else if (field instanceof Array) {
        switch (filters.mode) {
          case 'SOME':
            return field.some(test_value);
            break;

          case 'EVERY':
            return field.every(test_value);
            break;

          case 'COUNT':
            return test_value(field.length);
        } // TODO: mode error

      } else {
        return filters.mode === 'COUNT' ? test_value(1) : test_value(field);
      }
    }

    return true;
  }
  function compare_values(val1, val2, op) {
    switch (_typeof(op)) {
      case 'string':
        switch (op) {
          case '=':
            return val1 == val2;
            break;

          case '!=':
            return val1 != val2;
            break;

          case '<':
            return val1 < val2;
            break;

          case '>':
            return val1 > val2;
            break;

          case '<=':
            return val1 <= val2;
            break;

          case '>=':
            return val1 >= val2;
            break;

          case 'str_includes':
            return val1.includes(val2);
            break;

          case 'str_includes_not':
            return !val1.includes(val2);
            break;

          case 'str_includes_i':
            return val1.toLowerCase().includes(val2.toLowerCase());
            break;

          case 'str_includes_not_i':
            return !val1.toLowerCase().includes(val2.toLowerCase());
            break;

          case 'regexp':
            return RegExp(val2).test(val1);
            break;

          case 'regexp_not':
            return !RegExp(val2).test(val1);
            break;
        }

        break;

      case 'function':
        return op(val1, val2);
    } // TODO: Op error.


    console.log('Operation error!');
    return false;
  }

  register_view_type('grid', {
    init: function init($view) {
      var self = this;
      self.$container = $view.find('.js-gendernaut-grid');
      self.$container.gndr_isotope({
        itemSelector: '.js-gendernaut-grid-item',
        layoutMode: 'fitRows'
      });
      self.$container.gndr_imagesLoaded().progress(function () {
        self.$container.gndr_isotope('layout');
      });
    },
    display: function display($view) {
      this.$container.gndr_isotope('layout');
    },
    filter: function filter($view, filters) {
      this.$container.gndr_isotope({
        filter: function filter() {
          return item_apply_filters($(this), filters);
        }
      });
    }
  });

  register_view_type('timeline', {
    init: function init($view) {
      this.debug = false;
      this.$timeline = $(".gendernaut-view-timeline"); // Element principal

      this.$timeline_items = $('.gendernaut-view-timeline__items'); // Element amb els elements que fa scroll

      this.timeline_items = this.$timeline_items[0];
      this.$timeline_map = $('.gendernaut-view-timeline__map'); // Element amb els anys

      this.timeline_map = this.$timeline_map[0];
      this.number_of_years = this.timeline_map.children.length;
      this.min_px_per_year = 100; // px

      this.scroll_amount = 200; // píxels moguts amb el teclat o les fletxes

      this.scroll_time = 100; // temps d'scroll amb el teclat o les fletxes

      this.scroll_on_year_click(); // Scroll al clicar els anys de la barra de baix

      this.scroll_on_arrow_click(); // Scroll al clicar les fletxes dels extrems

      this.scroll_on_drag(); // Scroll a l'arrossegar el timeline

      this.scroll_on_mousewheel(); // Scroll amb la roda del ratolí (vertical)

      this.move_map_position(); // Actualitzem la posició de la bola a la barra dels anys de baix

      this.adaptive_show_years(); // Decidim quants anys es mostren a la barra dels anys de baix

      this.keyboard(); // Fem scroll amb el teclat

      this.set_timeline_size();
    },
    display: function display($view) {
      this.update($view);

      this._update_map_position();
    },
    update: function update($view) {},
    hide: function hide($view) {},
    // Mètodes interns
    log: function log() {
      if (this.debug) {
        console.log(arguments);
      }
    },

    /**
     * Retorna el primer any posterior visible, sinó anterior
     * @param year_id identificador de l'any
     * @returns jQuery l'any
     * @private
     */
    _get_visible_year: function _get_visible_year(year_id) {
      var $year = $(year_id);

      if ($year.is(":visible")) {
        return $year;
      } else {
        var $next_visible_year = $year.nextAll(":visible").first();

        if ($next_visible_year.length > 0) {
          return $next_visible_year;
        } else {
          return $year.prevAll(":visible").first();
        }
      }
    },

    /**
     * Fa scroll del timeline d'anys
     * @param scroll_position nova posició d'scroll del timeline
     * @param time temps de transició
     * @private
     */
    _scroll: function _scroll(scroll_position, time) {
      this.$timeline_items.stop().animate({
        scrollLeft: scroll_position
      }, time);
    },

    /**
     * Fem scroll a l'esquerra
     * @private
     */
    _scroll_left: function _scroll_left() {
      var current_scroll = this.$timeline_items.scrollLeft();

      this._scroll(current_scroll - this.scroll_amount, this.scroll_time);
    },

    /**
     * Fem scroll a la dreta
     * @private
     */
    _scroll_right: function _scroll_right() {
      var current_scroll = this.$timeline_items.scrollLeft();

      this._scroll(current_scroll + this.scroll_amount, this.scroll_time);
    },

    /**
     * Scroll al clicar els anys de la barra de baix
     */
    scroll_on_year_click: function scroll_on_year_click() {
      var self = this;
      this.$timeline_map.find('a').on('click', function (event) {
        var $year_link = $(this);
        var year_id = $year_link.attr('href');

        var $year = self._get_visible_year(year_id);

        var year_left = $year.position().left;
        var current_scroll = self.$timeline_items.scrollLeft();

        self._scroll(current_scroll + year_left, 1000); // Canvis el focus a l'any de l'enllaç (https://css-tricks.com/snippets/jquery/smooth-scrolling/)


        var $target = $year;
        $target.focus();

        if ($target.is(":focus")) {
          // Checking if the target was focused
          return false;
        } else {
          $target.attr('tabindex', '-1'); // Adding tabindex for elements not focusable

          $target.focus(); // Set focus again
        }

        event.preventDefault();
      });
    },

    /**
     * Scroll al clicar les fletxes dels extrems
     */
    scroll_on_arrow_click: function scroll_on_arrow_click() {
      var self = this;
      this.$timeline.find('.gendernaut-view-timeline__arrow_left').on('click', self._scroll_left.bind(self));
      this.$timeline.find('.gendernaut-view-timeline__arrow_right').on('click', self._scroll_right.bind(self));
    },

    /**
     * Scroll a l'arrossegar el timeline
     */
    scroll_on_drag: function scroll_on_drag() {
      var _this = this;

      // TODO: revisar en tàctil
      if (!this.timeline_items) {
        return;
      }

      var isDown = false;
      var startX;
      var scrollLeft;

      var onmousedown = function onmousedown(e) {
        isDown = true;

        _this.timeline_items.classList.add('active');

        var touch = undefined;

        if (e.touches) {
          touch = e.touches[0];
        }

        var pageX = e.pageX || touch.pageX;
        startX = pageX - _this.timeline_items.offsetLeft;
        scrollLeft = _this.timeline_items.scrollLeft;
      };

      var onmouseleave = function onmouseleave() {
        isDown = false;

        _this.timeline_items.classList.remove('active');
      };

      var onmouseup = function onmouseup() {
        isDown = false;

        _this.timeline_items.classList.remove('active');
      };

      var onmousemove = function onmousemove(e) {
        if (!isDown) return;
        e.preventDefault();
        var touch = undefined;

        if (e.touches) {
          touch = e.touches[0];
        }

        var pageX = e.pageX || touch.pageX;
        var x = pageX - _this.timeline_items.offsetLeft;
        var walk = (x - startX) * 2; //scroll-fast

        _this.timeline_items.scrollLeft = scrollLeft - walk;
      };

      this.timeline_items.addEventListener('mousedown', onmousedown);
      this.timeline_items.addEventListener('touchstart', onmousedown);
      this.timeline_items.addEventListener('mouseleave', onmouseleave);
      this.timeline_items.addEventListener('mouseup', onmouseup);
      this.timeline_items.addEventListener('ontouchend', onmouseup);
      this.timeline_items.addEventListener('mousemove', onmousemove);
      this.timeline_items.addEventListener('touchmove', onmousemove);
    },

    /**
     * Scroll amb la roda del ratolí (vertical)
     */
    scroll_on_mousewheel: function scroll_on_mousewheel() {
      var self = this;
      this.$timeline_items.on('mousewheel', function (event) {
        var current_scroll = self.$timeline_items.scrollLeft();
        self.$timeline_items[0].scrollLeft -= event.deltaY * event.deltaFactor;
        event.preventDefault();
      });
    },

    /**
     * Actualitzem la posició de la bola a la barra dels anys de baix
     */
    move_map_position: function move_map_position() {
      this.timeline_items.addEventListener("scroll", this._update_map_position.bind(this));
    },
    _update_map_position: function _update_map_position() {
      var pointer = document.getElementById("gendernaut-view-timeline__map_pointer"); // Mirem quin any està al principi del timeline (cantonada dalt esquerra del timeline)

      var offset = this.timeline_items.getBoundingClientRect();
      var x = offset.left + 32 + 20; // 32 per la barra lateral i 20 de marge

      var y = offset.top + 20;
      var element = document.elementFromPoint(x, y);
      var year_element = element.closest(".gendernaut-timeline-year");
      var year = year_element.getAttribute("data-year"); // Agafem l'any a la barra de temps

      var map_year_selector = '[data-year="' + year + '"]';
      var map_year = this.timeline_map.querySelector(map_year_selector);

      function isHidden(el) {
        return el.offsetParent === null;
      }

      if (!isHidden(map_year)) {
        // Si l'any està visible a la barra movem el punter allà
        pointer.style.left = map_year.offsetLeft + Math.floor(map_year.offsetWidth / 2 - pointer.offsetWidth / 2) + "px";
      } else {
        // Si l'any no està visible calculem el % entre l'anterior i el següent visibles
        var $nextVisibleYear = $(map_year).nextAll(".gendernaut-view-timeline__map_item:visible").first();
        var $prevVisibleYear = $(map_year).prevAll(".gendernaut-view-timeline__map_item:visible").first();
        var nextYear = $nextVisibleYear.data("year");
        var prevYear = $prevVisibleYear.data("year");
        var px_per_year = ($nextVisibleYear[0].offsetLeft - $prevVisibleYear[0].offsetLeft) / (nextYear - prevYear);
        var years_past_last = year - prevYear;
        pointer.style.left = $prevVisibleYear[0].offsetLeft + Math.floor(years_past_last * px_per_year + $nextVisibleYear[0].offsetWidth / 2 - pointer.offsetWidth / 2) + "px";
      }
    },

    /**
     * Decidim cada quants anys es mostra el número a la barra
     * @private
     */
    _calculate_show_one_each_year: function _calculate_show_one_each_year() {
      var px_per_year = this.timeline_map.offsetWidth / this.number_of_years;
      var factor = Math.ceil(this.min_px_per_year / px_per_year);

      function removeClassByPrefix(node, prefix) {
        var regx = new RegExp('\\b' + prefix + '[^ ]*[ ]?\\b', 'g');
        node.className = node.className.replace(regx, '');
        return node;
      }

      removeClassByPrefix(this.timeline_map, "show_one_each_");
      this.timeline_map.classList.add("show_one_each_" + factor);
    },

    /**
     * Adaptem quants anys es mostren a la barra de baix
     */
    adaptive_show_years: function adaptive_show_years() {
      var self = this; // Controlem quants anys es mostren

      this._calculate_show_one_each_year(); // Fem que es recalculi al canviar la mida del navegador


      var resizeTimer;
      $(window).on('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          self._calculate_show_one_each_year();
        }, 250);
      });
    },

    /**
     * Funció que aplica els filtres als continguts del timeline
     * @param $view Element de la vista
     * @param filters Filtres a aplicar
     */
    filter: function filter($view, filters) {
      var $timeline_container = $view.find('.js-gendernaut-timeline'); // Filtrem els elemnts individualment

      $timeline_container.find('.gendernaut-timeline-item').each(function () {
        if (item_apply_filters($(this), filters)) {
          $(this).removeClass("hidden");
        } else {
          $(this).addClass("hidden");
        }
      }); // Amaguem els anys que no tenen cap element visible

      $timeline_container.find('.gendernaut-timeline-year').each(function () {
        if ($(this).children('.gendernaut-timeline-item').not(".hidden").length > 0) {
          $(this).removeClass("hidden");
        } else {
          $(this).addClass("hidden");
        }
      });
    },

    /**
     * Fem scroll amb el teclat
     */
    keyboard: function keyboard() {
      var self = this;
      var interval = null; // A l'apretar la tecla fem scroll i posem un interval per seguir movent-se si mantenim la tecla apretada

      this.$timeline_items[0].addEventListener('keydown', function (event) {
        if (event.defaultPrevented) {
          return;
        }

        var key = event.key || event.keyCode;

        if (key === "ArrowLeft" || key === 37) {
          if (interval == null) {
            // Si no tenim la tecla ja apretada
            self._scroll_left();

            interval = window.setInterval(self._scroll_left.bind(self), self.scroll_time);
          }
        } else if (key === "ArrowRight" || key === 39) {
          if (interval == null) {
            // Si no tenim la tecla ja apretada
            self._scroll_right();

            interval = window.setInterval(self._scroll_right.bind(self), self.scroll_time);
          }
        }
      }); // Si deixem anar la tecla parem l'interval per seguir movent

      this.$timeline_items[0].addEventListener('keyup', function (event) {
        if (event.defaultPrevented) {
          return;
        }

        var key = event.key || event.keyCode;

        if (key === "ArrowLeft" || key === 37 || key === "ArrowRight" || key === 39) {
          if (interval != null) {
            self.$timeline_items.stop();
            clearInterval(interval);
            interval = null;
          }
        }
      });
    },

    /**
     * Adapta la mida del timeline en funció de la mida de pantalla pel tema de Filsfem (peak)
     */
    _set_timeline_size: function _set_timeline_size() {
      var peak_logo = document.querySelector(".oy-logo");

      if (peak_logo) {
        var $main_container = $(".main-container");
        var timeline_container = $main_container[0].querySelector(".main-content .page-content");

        if ($main_container.outerWidth() < 940) {
          timeline_container.style.width = "";
          return;
        }

        var $menu_container = $(".menu-container");
        var avialable_space = $main_container.width() - $menu_container.outerWidth();
        timeline_container.style.width = avialable_space + "px";
      }
    },
    set_timeline_size: function set_timeline_size() {
      var self = this;

      this._set_timeline_size();

      var resizeTimer;
      $(window).on('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          self._set_timeline_size();
        }, 250);
      });
    }
  });

  register_view_type(['list', 'long-list'], {
    init: function init($view) {
      var self = this;
      self.$container = $view.find('.js-gendernaut-list');
      self.$container.gndr_isotope({
        itemSelector: '.js-gendernaut-item',
        layoutMode: 'vertical'
      });
      self.$container.gndr_imagesLoaded().progress(function () {
        self.$container.gndr_isotope('layout');
      });
    },
    display: function display($view) {
      this.$container.gndr_isotope('layout');
    },
    filter: function filter($view, filters) {
      this.$container.gndr_isotope({
        filter: function filter() {
          return item_apply_filters($(this), filters);
        }
      });
    }
  });

  /**
   * Classe per gestionar una col·lecció
   */

  var Collection =
  /*#__PURE__*/
  function () {
    function Collection() {
      _classCallCheck(this, Collection);

      this.debug = false;
      this.updated = true; // Indica si l'estat està actualitzat a la BD

      this.storage = window.localStorage;
    }

    _createClass(Collection, [{
      key: "log",
      value: function log() {
        if (this.debug) {
          console.log(arguments);
        }
      }
      /**
       * Retorna la col·lecció guardada al localStorage
       * @returns {any} objecte de la col·lecció
       * @private
       */

    }, {
      key: "_get_collection",
      value: function _get_collection() {
        var collection = JSON.parse(this.storage.getItem('gendernaut_collection'));

        if (!collection) {
          collection = {};
        }

        return collection;
      }
      /**
       * Guarda la col·lecció al localStorage
       * @param {Object} collection objecte de la col·lecció
       * @private
       */

    }, {
      key: "_set_collection",
      value: function _set_collection(collection) {
        // TODO: mirar quan fer-ho
        this.storage.setItem('gendernaut_collection', JSON.stringify(collection));
      }
      /**
       * Retorna un atribut de la col·lecció
       * @param {String} name La clau de l'atribut
       * @param {*} def El valor per defecte de l'atribut si no existeix
       * @returns {*} El valor de l'atribut
       * @private
       */

    }, {
      key: "_get_attr",
      value: function _get_attr(name) {
        var def = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        var collection = this._get_collection();

        var attr = collection[name];

        if (!attr) {
          attr = def;
        }

        return attr;
      }
      /**
       * Guarda un atribut de la col·lecció
       * @param {String} name La clau de l'atribut
       * @param {*} val El valor de l'atribut
       * @private
       */

    }, {
      key: "_set_attr",
      value: function _set_attr(name, val) {
        var collection = this._get_collection();

        collection[name] = val;

        this._set_collection(collection);
      }
      /**
       * Retorna el llistat d'items de la col·lecció
       * @returns {Array} array mapa de si els elements estan a la col·lecció
       * @public
       */
      // TODO: canviar el nom a posts

    }, {
      key: "items",
      get: function get() {
        return this._get_attr("items", []);
      }
      /**
       * Guarda el llistat d'items de la col·lecció
       * @param {Array} items array mapa de si els elements estan a la col·lecció
       * @public
       */
      ,
      set: function set(items) {
        this._set_attr("items", items);
      }
      /**
       * Retorna el títol de la col·lecció
       * @returns {String} Títol de la col·lecció
       * @public
       */

    }, {
      key: "title",
      get: function get() {
        return this._get_attr("title", "");
      }
      /**
       * Guarda el títol de la col·lecció
       * @param {String} title Títol de la col·leció
       * @public
       */
      ,
      set: function set(title) {
        this._set_attr("title", title);
      }
      /**
       * Retorna la descripció de la col·lecció
       * @returns {String} Descripció de la col·lecció
       * @public
       */

    }, {
      key: "description",
      get: function get() {
        return this._get_attr("description", "");
      }
      /**
       * Guarda la descripció de la col·lecció
       * @param {String} description Descripció de la col·leció
       * @public
       */
      ,
      set: function set(description) {
        this._set_attr("description", description);
      }
      /**
       * Retorna el codi de la col·lecció
       * @returns {String} Codi de la col·lecció
       * @public
       */

    }, {
      key: "code",
      get: function get() {
        return this._get_attr("code", "");
      }
      /**
       * Guarda el codi de la col·lecció
       * @param {String} code Codi de la col·leció
       * @public
       */
      ,
      set: function set(code) {
        this._set_attr("code", code);
      }
      /**
       * Retorna l'id de la col·lecció
       * @returns {Number} Id de la col·lecció
       * @public
       */

    }, {
      key: "id",
      get: function get() {
        return this._get_attr("id", -1);
      }
      /**
       * Guarda l'id de la col·lecció
       * @param {Number} id id de la col·leció
       * @public
       */
      ,
      set: function set(id) {
        this._set_attr("id", id);
      }
    }]);

    return Collection;
  }();

  /**
   * Classe per gestionar les col·lecions
   */

  var Collections =
  /*#__PURE__*/
  function () {
    function Collections() {
      _classCallCheck(this, Collections);

      this.debug = false;
      this.updated = true; // Indica si l'estat està actualitzat a la BD

      this.collection_item_selector = 'gendernaut-item__collection'; // El selector de la info de col·leccions dels elements

      this.$collections_overlay = $(".gendernaut-collections-overlay"); // L'overlay per editar la col·lecció

      this.$collections_status = this.$collections_overlay.find("#gendernaut-collections-overlay__collection_status"); // L'element d'estat de la col·lecció

      this.$collections_list = $(".gendernaut-collections"); // El contenidor del llistat de col·leccions de la pàgina de col·leccions

      this.$archive = $('.js-gendernaut-archive');
      this.$items = this.$archive.find('.js-gendernaut-items');
      this.items = this.$items[0];
      this.storage = window.localStorage;
      this.collection = new Collection();
      this.init(); // Inicialitzem el llistat d'items de la col·lecció

      this.unsaved_changes_event(); // Activem l'avís en cas de marxar sense guardar

      this.collection_mode(); // Mirem si activem el mode d'edició

      this.leave_edit_on_quit(); // Abandonem el mode d'edició al sortir de la pàgina

      this.create_collection_click(); // Event handler del botó de crear una col·lecció

      this.save_update_on_click(); // Event handler de guardar l'estat actual

      this.init_filter();
    }

    _createClass(Collections, [{
      key: "log",
      value: function log() {
        if (this.debug) {
          console.log(arguments);
        }
      }
      /**
       * Posa un element a la col·lecció, tant modificant l'html per reflectir-ho com guardant-ho a localStorage
       * @param {jQuery} $item element html de l'item
       * @param {Boolean} state indica si està a la col·lecció o no
       * @private
       */

    }, {
      key: "_set_dom_item_in_collection",
      value: function _set_dom_item_in_collection($item, state) {
        var $item_collection = $item.find("." + this.collection_item_selector);

        if (state) {
          $item_collection.html("-"); // $item_collection.data("gendernaut_collection", "true");
        } else {
          $item_collection.html("+"); // $item_collection.data("gendernaut_collection", "false");
        }
      }
    }, {
      key: "_set_item_in_collection",
      value: function _set_item_in_collection(item_id, state) {
        var collection_items = this.collection.items;
        collection_items[parseInt(item_id)] = state;
        this.collection.items = collection_items;

        this._update_collection_count();
      }
    }, {
      key: "_update_collection_count",
      value: function _update_collection_count() {
        var collection_items = this.collection.items;
        var count = collection_items.reduce(function (acc, cur) {
          return cur ? ++acc : acc;
        }, 0);
        this.$collections_overlay.find("#gendernaut-collections-overlay__collection_counter").html(count);
      }
      /**
       * Si estem a la pàgina d'edició agafem el llistat d'items
       */

    }, {
      key: "init",
      value: function init() {
        var self = this; // TODO: fer-ho només si clica el botó d'editar?

        if (typeof gendernaut_collection !== 'undefined') {
          // Definit només a la pàgina d'edició
          this.collection.id = gendernaut_collection.id;
          this.collection.code = gendernaut_collection.code;

          self._set_collection_mode(true);
        }
      }
    }, {
      key: "unsaved_changes_event",
      value: function unsaved_changes_event() {
        var self = this;
        this.$collections_overlay.find("#title, #description").on('input', function () {
          self._set_update_status(false);
        });
        window.addEventListener('beforeunload', function (e) {
          // If we are in collection edit mode and there ara unsaved changes
          if (self._get_collection_mode() && !self.updated) {
            // Cancel the event
            e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will be allways shown
            // Chrome requires returnValue to be set

            e.returnValue = '';
          } else {
            // the absence of a returnValue property on the event will guarantee the browser unload happens
            delete e['returnValue'];
          }
        });
      }
    }, {
      key: "leave_edit_on_quit",
      value: function leave_edit_on_quit() {
        var self = this;
        window.addEventListener('unload', function (e) {
          // If we are in collection edit mode and there ara unsaved changes
          if (self._get_collection_mode()) {
            self._set_collection_mode(false);
          }
        });
      }
      /**
       * Posa l'event handler de quan afegim o eliminem els elements de la col·lecció
       */

    }, {
      key: "_add_remove_on_click",
      value: function _add_remove_on_click() {
        var self = this;
        this.$items.find("." + self.collection_item_selector).on("click", function () {
          var $item = $(this).closest(".js-gendernaut-item");
          var item_id = $item.data("gendernaut_id");
          var collection_items = self.collection.items;
          var curr_state = collection_items[parseInt(item_id)];

          self._set_item_in_collection(item_id, !curr_state);

          var $items = self.$archive.find(".js-gendernaut-item[data-gendernaut_id=" + item_id + "]");
          $items.each(function () {
            self._set_dom_item_in_collection($(this), !curr_state);
          });

          self._set_update_status(false);

          self.apply_filter();
        });
      }
      /**
       * Posa l'event handler de quan guardem l'estat de la col·lecció enviant-ho per ajax
       */

    }, {
      key: "save_update_on_click",
      value: function save_update_on_click() {
        var self = this;
        this.$collections_status.find(".notupdated").on("click", function () {
          var valid = self.$collections_overlay.find("form")[0].reportValidity();

          if (!valid) {
            return;
          }

          var $save_link = $(this);
          $save_link.find(".save").hide();
          $save_link.find(".saving").show();
          var data = new FormData(self.$collections_overlay.find("form")[0]);
          data.append("action", "collection_save"); // Acció definida al plugin de wordpress

          var items = self.collection.items;
          var selected_items = items.reduce(function (a, o, i) {
            return o && a.push(i), a;
          }, []);
          data.append("posts", JSON.stringify(selected_items));
          data.append("id", self.collection.id.toString());
          data.append("code", self.collection.code);
          fetch(gendernaut_vars.ajax_url, {
            method: 'post',
            credentials: 'same-origin',
            body: data
          }).then(function (response) {
            return response.ok ? response.json() : 'Not Found...';
          }).then(function (json_response) {
            console.log(json_response);
            $save_link.find(".save").show();
            $save_link.find(".saving").hide();

            if (json_response.status >= 0) {
              self._set_update_status(true);

              if (json_response.status === 1) {
                var creation_message = "<p>".concat(json_response.message, "</p><p>URL: ").concat(json_response.url, "</p><p>").concat(gendernaut_vars.collection_url_message, "</p>");
                self.collection.id = json_response.id;
                $.featherlight(creation_message, {});
              }
            } else {
              var error_message = "<p>".concat(json_response.message, "</p><p># ").concat(json_response.status, "</p><p>").concat(json_response.error, "</p>");
              $.featherlight(error_message, {});
            }
          });
        });
      }
      /**
       * Marca l'estat de la col·lecció a actualitzat o no actualitzat
       * @param {Boolean} updated
       * @private
       */

    }, {
      key: "_set_update_status",
      value: function _set_update_status(updated) {
        this.updated = updated;

        if (updated) {
          this.$collections_status.children().hide();
          this.$collections_status.find(".updated").show();
        } else {
          this.$collections_status.children().hide();
          this.$collections_status.find(".notupdated").show();
        }
      }
      /**
       * Canvia l'estat d'edició i actualitzem l'html
       * @param state
       * @private
       */

    }, {
      key: "_set_collection_mode",
      value: function _set_collection_mode(state) {
        if (state) {
          this.storage.setItem('gendernaut_collection_mode', 'on');
          this.$archive.addClass("collection_mode");
          this.$collections_overlay.addClass("collection_mode");
        } else {
          this.storage.setItem('gendernaut_collection_mode', 'off');
          this.$archive.removeClass("collection_mode");
          this.$collections_overlay.removeClass("collection_mode");
        }
      }
      /**
       * Retorna l'estat d'edició
       * @private
       */

    }, {
      key: "_get_collection_mode",
      value: function _get_collection_mode() {
        return this.storage.getItem('gendernaut_collection_mode') === 'on';
      }
      /**
       * Posa l'event handler de quan comencem a crear la col·lecció i els de cancel·lar i continuar
       */

    }, {
      key: "create_collection_click",
      value: function create_collection_click() {
        var $create_button = this.$collections_list.find("#gendernaut-collections__collection_create");
        var $create_info_div = $("#gendernaut-collections__collection_create_info > div");
        $create_button.featherlight($create_info_div, {});
        var $create_cancel_button = $create_info_div.find("#gendernaut-collections__collection_create_cancel");
        $create_cancel_button.on('click', function (ev) {
          ev.preventDefault();
          var current = $.featherlight.current();
          current.close();
        });
        var self = this;
        var $create_create_button = $create_info_div.find("#gendernaut-collections__collection_create_create");
        $create_create_button.on("click", function () {
          // ev.preventDefault();
          console.log("Collection mode: On");
          self.collection.items = [];
          self.collection.title = "";
          self.collection.description = "";
          self.collection.id = -1;
          self.collection.code = null;
          self.storage.setItem('gendernaut_collection_mode_on_next_page', 'on');
        });
      }
    }, {
      key: "_add_collection_info",
      value: function _add_collection_info($item) {
        $item.append('<div class="' + this.collection_item_selector + '"></div>');
      }
    }, {
      key: "_fetch_collection_data",
      value: function _fetch_collection_data() {
        var _this = this;

        var url = new URL(gendernaut_vars.ajax_url);
        var params = [["action", "collection_load"], ["id", this.collection.id], ["code", this.collection.code]];
        url.search = new URLSearchParams(params).toString();
        fetch(url, {
          credentials: 'same-origin'
        }).then(function (response) {
          return response.ok ? response.json() : 'Not Found...';
        }).then(function (json_response) {
          if (json_response.status >= 0) {
            if (_this.collection.id < 0) {
              _this._set_update_status(false);
            }

            _this.collection.title = json_response.title;
            _this.collection.description = json_response.description;
            var collection_items = [];
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
              for (var _iterator = json_response.posts[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var item_id = _step.value;
                collection_items[item_id] = true;
              }
            } catch (err) {
              _didIteratorError = true;
              _iteratorError = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion && _iterator.return != null) {
                  _iterator.return();
                }
              } finally {
                if (_didIteratorError) {
                  throw _iteratorError;
                }
              }
            }

            _this.collection.items = collection_items;

            _this._load_collection_data();
          }
        });
      }
    }, {
      key: "_load_collection_data",
      value: function _load_collection_data() {
        var self = this;

        this._set_collection_mode(true);

        var $stop_button = this.$collections_overlay.find("#gendernaut-collections-overlay__collection_stop");
        $stop_button.on("click", function (ev) {
          ev.preventDefault();

          if (!self.updated) {
            var t = confirm(gendernaut_vars.unsaved_message);

            if (t === false) {
              return;
            }
          }

          self._set_collection_mode(false);

          self.update_filter();
          self.apply_filter();
        });
        var items = this.collection.items;
        this.$items.find(".js-gendernaut-item").each(function (idx, el) {
          var $item = $(el);

          self._add_collection_info($item);

          var item_id = $item.data("gendernaut_id");

          self._set_dom_item_in_collection($item, item_id in items && items[parseInt(item_id)] === true);
        });

        this._update_collection_count();

        this._add_remove_on_click(); // Event handler d'afegir o eliminar elements


        var $form = this.$collections_overlay.find("form");
        $form.find("#title").attr("value", this.collection.title);
        $form.find("#description").val(this.collection.description);
      }
      /**
       * Detecta si estem en mode edició i ho activa
       */

    }, {
      key: "collection_mode",
      value: function collection_mode() {
        var self = this;
        var $collection_edit_link = $(".gendernaut-archive__collection_edit_link");

        if ($collection_edit_link.data("collection_id") === this.collection.id) {
          $collection_edit_link[0].style.display = "block";
          $collection_edit_link.on("click", function () {
            self.storage.setItem('gendernaut_collection_mode_on_next_page', 'on');
          });
        } // TODO: revisar més la condició


        if (this.storage.getItem('gendernaut_collection_mode_on_next_page') === "on" && this.$collections_overlay.length > 0) {
          this.storage.setItem('gendernaut_collection_mode_on_next_page', 'off');

          this._fetch_collection_data();
        }
      }
    }, {
      key: "init_filter",
      value: function init_filter() {
        var self = this;
        self.filter = {
          field: 'gendernaut_id',
          mode: 'IS',
          compare: function compare(id, state) {
            return (id in self.collection.items && self.collection.items[parseInt(id)]) === state;
          }
        };
        self.filter_callbacks = [];
        self.$filter_activate = self.$collections_overlay.find('.js-gendernaut-collection-filter');
        self.$filter_activate.change(function () {
          self.update_filter();
          self.apply_filter();
        });
        return self.update_filter();
      }
    }, {
      key: "update_filter",
      value: function update_filter() {
        if (this._get_collection_mode() && this.$filter_activate.prop('checked')) {
          this.filter.value = true;
        } else {
          delete this.filter.value;
        }

        return this.filter;
      }
    }, {
      key: "add_filter_callback",
      value: function add_filter_callback(callback) {
        if (typeof callback === 'function') {
          this.filter_callbacks.push(callback);
        }
      }
    }, {
      key: "apply_filter",
      value: function apply_filter() {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = this.filter_callbacks[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var callback = _step2.value;
            callback(this.filter);
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      }
    }]);

    return Collections;
  }();

  $.fn.gndr_isotope = $.fn.isotope;
  $.fn.gndr_imagesLoaded = $.fn.imagesLoaded;
  $(function () {
    var collections = new Collections();
    $('.js-gendernaut-view').each(function () {
      init_view($(this));
    });
    $('.js-gendernaut-views-group').each(function () {
      var $view_group = $(this);
      var $all_views = $view_group.find('.js-gendernaut-view');
      var $view_select = $view_group.find('.js-gendernaut-view-select');
      var filters_collection = create_filters_collection();
      var $current_view = $all_views.first();
      var current_view_type = $current_view.data('type');
      console.log(current_view_type);
      var $current_select = get_select_for_view(current_view_type);
      $view_select.removeClass('current');
      $current_select.addClass('current');
      hide_views();
      show_view($current_view);
      $view_select.on('click', function (e) {
        e.preventDefault();
        var view_type = $(this).data('view');
        if (view_type === current_view_type) return;
        $current_view = $all_views.filter('.js-gendernaut-view-' + view_type);
        current_view_type = view_type;
        $current_select.removeClass('current');
        $current_select = get_select_for_view(current_view_type);
        $current_select.addClass('current');
        hide_views();
        show_view($current_view);
      });

      function hide_views() {
        $all_views.hide();
        $all_views.each(function () {
          hide_view($(this));
        });
      }

      function show_view($view) {
        $view.show();
        display_view($view);
      }

      function get_select_for_view(view_type) {
        return $view_select.filter(function () {
          return $(this).data('view') === view_type;
        });
      } // let $filters = $view.find('.js-gendernaut-filters');


      filters_collection.add(collections.filter);
      collections.add_filter_callback(request_update);
      $view_group.find('.js-gendernaut-filters-submit').remove();
      $view_group.find('.js-gendernaut-filter-group').each(function () {
        var $group = $(this);
        var filter = init_filter_group($group, request_update);
        filters_collection.add(filter);
      });
      var timeout;

      function request_update() {
        if (timeout) {
          clearTimeout(timeout);
        }

        timeout = setTimeout(filter_views, 500);
      }

      function filter_views() {
        $all_views.each(function () {
          filter_view($(this), filters_collection.filters);
        });
      }

      filter_views();
    });
    $('.js-gendernaut-dropdown-group').each(function () {
      var $group = $(this);
      var $show_button = $group.find('.js-gendernaut-dropdown-show');
      $show_button.click(function (e) {
        e.preventDefault();
        $group.toggleClass('open');
      });
    });
  });

}(jQuery));
//# sourceMappingURL=gendernaut-public.js.map
