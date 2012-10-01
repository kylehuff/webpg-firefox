/* <![CDATA[ */
if (typeof(webpg)=='undefined') { webpg = {}; }
if (typeof(webpg.thunderbird)=='undefined') { webpg.thunderbird = {}; }

webpg.thunderbird.utils = {

    accountManager: function() {
        return Components.classes["@mozilla.org/messenger/account-manager;1"]
                        .getService(Components.interfaces.nsIMsgAccountManager);
    }(),

    getIdentities: function() {
        var idSupports = this.accountManager.allIdentities;
        var identities = queryISupportsArray(idSupports,
                                           Components.interfaces.nsIMsgIdentity);

        return identities;
    },

    getCurrentIdentity: function() {
        var msgIdentity = document.getElementById('msgIdentity').value;
        return this.accountManager.getIdentity(msgIdentity);
    },

    getDefaultIdentity: function() {
        // Default identity
        var defaultIDs = this.accountManager.defaultAccount.identities;
        return (defaultIDs.Count() >= 1) ? defaultIDs.QueryElementAt(0,
            Components.interfaces.nsIMsgIdentity) : this.getIdentities()[0];
    },
}

/* ]]> */
