/* <![CDATA[ */

if (webpg.utils.detectedBrowser['product'] == "chrome") {
    var ext = chrome.extension.getBackgroundPage();
} else {
    var ext = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
       .getInterface(Components.interfaces.nsIWebNavigation)
       .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
       .rootTreeItem
       .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
       .getInterface(Components.interfaces.nsIDOMWindow);
}

jQuery(function(){
    error_map = ext.plugin.webpg_status;
    
    jQuery("#error-text-h1").text(_("Error loading WebPG"));
    jQuery("#error-text-p").text(_("We encountered a problem while attempting to load WebPG"));

    if (error_map["error"]) {
        error_html = "<p>" + _("Error") + " (" + webpg.utils.escape(error_map["gpg_error_code"]) + "): " + error_map["error_string"] + "</p>";
        error_html += "<h3>" + _("Suggestions") + ":</h3>";
        error_html += "<ul>";
        if (error_map["gpg_error_code"] == -1) {
            error_html += "<li>" + _("The plugin was unable to load") + "</li>";
        }
        if (error_map["gpg_error_code"] == "150") {
            error_html += "<li>" + _("There might be a problem with the gpg installation");
            if (window.navigator.platform.toLowerCase().indexOf("win") !== -1)
                error_html += " " + _("consider reinstalling gpg4win") + " (<a href='http://gpg4win.org/'>gpg4win.org</a>)</li>";
            else
                error_html += "</li>";
        }
        error_html += "</ul>";

        var systemInfoHTML = "<h1>" + _("Error Details") + "</h1>";
        systemInfoHTML += _("Error in Method") + ": " + webpg.utils.escape(error_map["method"]) + "<br/\>";
        systemInfoHTML += _("Error Code") + ": " + webpg.utils.escape(error_map["gpg_error_code"]) + "<br/\>";
        systemInfoHTML += _("Error String") + ": " + webpg.utils.escape(error_map["error_string"]) + "<br/\>";
        file = error_map["file"];
        if (window.navigator.platform.toLowerCase().indexOf("win") !== -1) {
            file = file.substr(error_map["file"].lastIndexOf("\\") + 1);
        } else {
            file = file.substr(error_map["file"].lastIndexOf("/") + 1);
        }
        systemInfoHTML += _("File") + ": " + webpg.utils.escape(file) + "<br/\>";
        systemInfoHTML += _("Line") + ": " + webpg.utils.escape(error_map["line"]) + "<br/\>";
    } else {
        error_html = "<p>" + _("Unknown Error") + "</p>";
    }
    jQuery("#error-text")[0].innerHTML += error_html;

    systemInfoHTML += "<h1>" + _("System Information") + "</h1>";
    systemInfoHTML += _("Platform") + ": " + webpg.utils.escape(window.navigator.platform) + "<br/\>";
    systemInfoHTML += _("App Version") + ": " + webpg.utils.escape(window.navigator.appVersion) + "<br/\>";
    systemInfoHTML += _("User Agent") + ": " + webpg.utils.escape(window.navigator.userAgent) + "<br/\>";
    systemInfoHTML += _("Product") + ": " + webpg.utils.escape(window.navigator.product) + "<br/\>";
    systemInfoHTML += _("Sub-product") + ": " + webpg.utils.escape(window.navigator.productSub) + "<br/\>";
    systemInfoHTML += _("Vendor") + ": " + webpg.utils.escape(window.navigator.vendor) + "<br/\>";
    systemInfoHTML += _("Language") + ": " + webpg.utils.escape(window.navigator.language) + "<br/\>";

    jQuery("#system-info-list")[0].innerHTML = systemInfoHTML;

    if (webpg.utils.detectedBrowser['product'] == "chrome") {
        jQuery('#refresh').button().click(function(e) {
            ext.webpg.background.init();
            window.close();
        });
    } else {
        jQuery('#refresh').hide();
    }

    jQuery('#close').button().click(function(e) { window.close(); });

});
/* ]]> */
