/* ========================================================================
 * Calcite Maps (http://github.com/esri/calcite-maps)
 * Copyright 2016 Esri
 * Licensed under Apache (http://www.apache.org/licenses/LICENSE-2.0)
 * ======================================================================== */

/* ========================================================================
 * Calcite Maps: calcitemaps-arcgis-support.js (dojo)
 * ========================================================================
 * Generic handlers for mapping-specific UI
 *
 * ======================================================================== */

define([ 
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/query",
  "dojo/on",
  "dojo/domReady!"
], function(declare, lang, query, on) {

  var CalciteMapsArcGISSupport = declare(null, {

    searchEventsSet: false,

    constructor: function () {
      this._syncTabs();
    },

    //--------------------------------------------------------------------------
    //
    //  Private
    //
    //--------------------------------------------------------------------------

    _syncTabs: function() {
      query(".calcite-navbar li a[data-toggle='tab']").on("click", function(e) {
        query(".calcite-navbar li.active").removeClass("active");       
        query(e.target).addClass("active");
      });
    },

    //--------------------------------------------------------------------------
    //
    //  Public
    //
    //--------------------------------------------------------------------------

    //----------------------------------
    // Popup/Panel Synchronization - TODO
    //----------------------------------

    setPopupPanelSync: function(view) {

      if (!view) {
        return;
      }

      var popup = view.popup;
      var screenSize = view.size;
      
      view.watch("size", function viewSizeChange(size) {
        if (screenSize[0] !== size[0] || screenSize[1] !== size[1]) {
          screenSize = size;
          setPanelVisibility();
        }
      });

      // Popups - Listen to popup changes to show/hide panels
      popup.watch(["visible", "dockEnabled", "currentDockPosition"], setPanelVisibility);

      function isDesktopCollision() {
        var collision = false;
        var panelsRight = query(".calcite-panels-right");
        if (panelsRight.length > 0) {
          collision = (popup.currentDockPosition && popup.currentDockPosition === "top-right");
        } else {
          collision = (popup.currentDockPosition && popup.currentDockPosition === "top-left")
        }
        return collision;
      }

      function setPanelVisibility() {
        var isMobileScreen = view.widthBreakpoint === "xsmall" || view.widthBreakpoint === "small";
        var isDocked = popup.visible && popup.dockEnabled;
        var isDockedBottom = view.popup.currentDockPosition && view.popup.currentDockPosition.indexOf("bottom") > -1;

        // Mobile (xsmall/small)
        if (isMobileScreen) {
          if (isDocked && isDockedBottom) {
            query(".calcite-panels").addClass("invisible");
          } else {
            query(".calcite-panels").removeClass("invisible");
          }
        } else { // Desktop (medium+)
          if (isDocked && isDesktopCollision()) {
            query(".calcite-panels").addClass("invisible");
          } else {
            query(".calcite-panels").removeClass("invisible");          
          }
        }
      }

      // Panels - Listen to panel changes to hide popup at mobile size
      query(".calcite-panels .panel").on("show.bs.collapse", function(e) {
        if (view.popup.dockEnabled || view.widthBreakpoint === "xsmall") {
          view.popup.dockEnabled = false;
        }
      });
    },

    //----------------------------------
    // Search Expander
    //----------------------------------

    setSearchExpandEvents: function(search) {

      if (!search) {
        return;
      }

      function setExpanded(e, expand) {
        var searchExpander = query(".calcite-search-expander .esri-search");
        var searchSourceMenu = query(".calcite-search-expander .esri-search__sources-menu");
        if (searchExpander && searchExpander.length > 0) {
          if (expand) {
            query(searchExpander[0]).addClass("calcite-search-expanded");
            query(searchSourceMenu[0]).addClass("calcite-search-source-menu-expanded");
            search._expanded = true;
          } else {
            query(searchExpander[0]).removeClass("calcite-search-expanded");
            query(searchSourceMenu[0]).removeClass("calcite-search-source-menu-expanded");
            search._expanded = false;
          }
        }            
      }
      
      // Set-up handlers 
      var handle = query(".calcite-search-expander").on("click", function(e) {
        if (!this.searchEventsSet) {
          
          // Initial expand
          setExpanded(e, true);

          // Expand search
          query(".calcite-search-expander .esri-search__submit-button").on("click", function(e){
            if (!search._expanded) {
              setExpanded(e, true);
            }
          }.bind(this));

          // Collapse search
          search.view.on("immediate-click", function(e){
            if (search._expanded) {
              setExpanded(e, false);
            }
          });

          this.searchEventsSet = true;
          handle.remove();
        }
      }.bind(this));
    }

  });
      
  return new CalciteMapsArcGISSupport();
});