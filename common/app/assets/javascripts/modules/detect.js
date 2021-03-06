/*
    Module: detect/detect.js                                                                                                 8
    Description: Used to detect various characteristics of the current browsing environment.
                 layout mode, connection speed, battery level, etc...
*/
/*jshint strict: false */
/*global DocumentTouch: true */

define(function () {

    var BASE_WIDTH     = 600,
        MEDIAN_WIDTH   = 900,
        EXTENDED_WIDTH = 1280;

    /**
     * @param Number width Allow passing in of width, for testing (innerWidth read only
     * in firefox
     */
    function getLayoutMode(width) {
        var mode = "mobile";

        width = (width !== undefined) ? width : (typeof document.body.clientWidth === 'number' ? document.body.clientWidth : window.innerWidth);

        if (width >= BASE_WIDTH) {
            mode = "tablet";
        }

        if (width >= MEDIAN_WIDTH) {
            mode = "desktop";
        }

        if (width >= EXTENDED_WIDTH) {
            mode = "extended";
        }

        return mode;
    }

    /**
     *     Util: returns a function that:
     *     1. takes a callback function
     *     2. calls it if the window width has crossed any of our layout modes since the last call to this function
     *     Usage. Setup:
     *      var hasCrossedTheMagicLines = hasCrossedBreakpoint()
     *     then:
     *       hasCrossedTheMagicLines(function(){ do stuff })
     */
    function hasCrossedBreakpoint(){
        var was = getLayoutMode();
        return function(callback){
            var is = getLayoutMode();
            if ( is !== was ) {
                was = is;
                callback(is);
            }
        };
    }

    function getPixelRatio() {
        return window.devicePixelRatio;
    }

    /**
     * @param Object performance Allow passing in of window.performance, for testing
     */
    function getPageSpeed(performance) {

        //https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/NavigationTiming/Overview.html#sec-window.performance-attribute

        var start_time,
            end_time,
            total_time;

        var perf = performance || window.performance || window.msPerformance || window.webkitPerformance || window.mozPerformance;

        if (perf && perf.timing) {
            start_time =  perf.timing.requestStart || perf.timing.fetchStart || perf.timing.navigationStart;
            end_time = perf.timing.responseEnd;

            if (start_time && end_time) {
                total_time = end_time - start_time;
            }
        }

        return total_time;
    }

    function getConnectionSpeed(performance, connection, reportUnknown) {

        connection = connection || navigator.connection || navigator.mozConnection || navigator.webkitConnection || {type: 'unknown'};

        var isMobileNetwork = connection.type === 3 // connection.CELL_2G
                  || connection.type === 4 // connection.CELL_3G
                  || /^[23]g$/.test( connection.type ); // string value in new spec

        if (isMobileNetwork) {
            return 'low';
        }

        var loadTime = getPageSpeed(performance);

        // Assume high speed for non supporting browsers
        var speed = "high";
        if (reportUnknown) {
            speed = "unknown";
        }

        if (loadTime) {
            if (loadTime > 1000) { // One second
                speed = 'medium';
                if (loadTime > 3000) { // Three seconds
                    speed = 'low';
                }
            }
        }

        return speed;

    }

    function getFontFormatSupport(ua) {
        var format = 'woff';
            ua = ua.toLowerCase();

        if (ua.indexOf('android') > -1) {
            format = 'ttf';
        }
        return format;
    }

    // http://modernizr.com/download/#-svg
    function hasSvgSupport() {
        var ns = {'svg': 'http://www.w3.org/2000/svg'};
        return !!document.createElementNS && !!document.createElementNS(ns.svg, 'svg').createSVGRect;
    }

    function hasTouchScreen() {
        return ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;
    }

    function hasPushStateSupport() {
        return 'pushState' in history;
    }

    return {
        getLayoutMode: getLayoutMode,
        hasCrossedBreakpoint: hasCrossedBreakpoint,
        getPixelRatio: getPixelRatio,
        getConnectionSpeed: getConnectionSpeed,
        getFontFormatSupport: getFontFormatSupport,
        hasSvgSupport: hasSvgSupport,
        hasTouchScreen: hasTouchScreen,
        hasPushStateSupport: hasPushStateSupport
    };

});