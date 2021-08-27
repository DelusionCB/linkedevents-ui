import React from 'react';
/**
 * Returns script string with siteId according to param
 * @param piwikSiteId
 * @returns {string|null}
 */
function renderAnalyticsCode(piwikSiteId = 5) {
    // setVisitorCookieTimeout sets expiration (in seconds) for the _pk_id cookie, currently 90 days
    return `
      var _paq = _paq || [];
      _paq.push(['trackPageView']);
      _paq.push(['enableLinkTracking']);
      (function() {
        var u="https://testivaraamo.turku.fi:8003/";
        _paq.push(['setTrackerUrl', u+'piwik.php']);
        _paq.push(['setSiteId', ${piwikSiteId}]);
        _paq.push(['setVisitorCookieTimeout','7776000']);
        var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
        g.type='text/javascript';
        g.async=true;
        g.defer=true;
        g.src=u+'matomo.js';
        s.parentNode.insertBefore(g,s);
      })();
    `;
}
/**
 * Returns the Cookiebot <script> element
 * @returns {JSX.Element}
 */
function getConsentScripts() {
    return (
        <script
            id="Cookiebot"
            src="https://consent.cookiebot.com/uc.js"
            data-cbid="d539e734-20ad-43d1-a211-72007f8ec1f4"
            data-blockingmode="auto"
            type="text/javascript"
        >
        </script>
    );
}
/**
 * Returns a <script> element with src urls.analytics
 * @returns {JSX.Element}
 */
function getCookieScripts() {
    return (
        <script type="text/javascript">{renderAnalyticsCode()}</script>
    );
}


export default {getCookieScripts, getConsentScripts, renderAnalyticsCode};
