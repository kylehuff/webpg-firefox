/* <![CDATA[ */
if (typeof(webpg)=='undefined') { webpg = {}; }
if (typeof(webpg.thunderbird)=='undefined') { webpg.thunderbird = {}; }

// Global reference to webpg.thunderbird.compose
var _this;

// Global list of valid PGP actions
var sendActions = {
    PSIGN: "PLAINSIGN", // Sign the message inline
    ASIGN: "ATTACHSIGN", // Create a detached signature and attach to the msg
    SIGN: "SIGN", // Create a signed data packet inline
    CRYPT: "CRYPT", // Encrypt the data inline
    CRYPTSIGN: "CRYPTSIGN", // Encrypt and Sign the data inline
    SYMCRYPT: "SYMCRYPT", // Perform Symmetric Encryption inline
}

webpg.thunderbird.compose = {

    init: function(aEvent) {
        var _ = webpg.utils.i18n.gettext;
        webpg.plugin = document.getElementById("webpgPlugin");

        if (!webpg.plugin.valid)
            return

        this.sendAction = false;
        this.actionPerformed = false;

        // Apply the labels to the compose window actions
        document.getElementById("webpg-msg-noaction").label = _("Do not use WebPG for this message");
        document.getElementById("webpg-msg-sign").label = _("Sign Inline");
        document.getElementById("webpg-msg-asign").label = _("Sign as Attachment");
        document.getElementById("webpg-msg-sign-enc").label = _("Sign and Encrypt");
        document.getElementById("webpg-msg-enc").label = _("Encrypt");
        document.getElementById("webpg-msg-symenc").label = _("Symmetric Encryption");
        
        

        _this = webpg.thunderbird.compose;

        this.stateListener = {
            NotifyComposeFieldsReady: _this.composeFieldsReady,  
            NotifyComposeBodyReady: _this.composeBodyReady,
            ComposeProcessDone: _this.composeProcessDone,
            SaveInFolderDone: _this.saveInFolderDone,
        }

        gMsgCompose.RegisterStateListener(this.stateListener);

        // The message window has been recycled
        window.addEventListener('compose-window-reopen',
            webpg.thunderbird.compose.reopenMessageListener, true);

        // The message is being sent
        window.addEventListener('compose-send-message',
            function _sendMessageListener (aEvent) {
                webpg.thunderbird.compose.sendMessageListener(aEvent);
            }, true);

        window.addEventListener('compose-window-close',
            webpg.thunderbird.compose.closeWindowListener, true);

    },

    composeFieldsReady: function() {
    },

    // The body of the message is available/ready
    composeBodyReady: function() {
        _this.editor = GetCurrentEditor();
    },

    // Called after message was sent/saved (fires twice)
    composeProcessDone: function(aResult) {
    },

    saveInFolderDone: function(folderURI) {
    },

    // The message was reopened or the window was recycled
    reopenMessageListener: function(aEvent) {
    },

    // The message window was closed
    closeWindowListener: function(aEvent) {
        _this.actionPerformed = false;
    },

    sendMessageListener: function(aEvent) {
        var msgcomposeWindow = document.getElementById("msgcomposeWindow");
        var msgType = msgcomposeWindow.getAttribute("msgtype");

        // Determine if this an actual send event
        if(!(msgType == nsIMsgCompDeliverMode.Now || msgType == nsIMsgCompDeliverMode.Later))
            return;

        // Determine if we have a defined sendAction
        if (!_this.sendAction)
            return;

        // Determine if we have already performed the required action
        if (_this.actionPerformed)
            return;

        // execute the current sendAction
        var actionResult = _this.performSendAction();

        // Handle any errors
        if (actionResult.error) {
            alert("WebPG - error: " + actionResult.error_string + "; Error code: " + actionResult.gpg_error_code);
            aEvent.preventDefault();
            aEvent.stopPropagation();
        } else {
            _this.actionPerformed = true;
        }
    },

    setSendAction: function(action, element) {
        var baseClass = "webpg-msg-btn toolbarbutton-1";
        document.getElementById('webpg-msg-btn').label = element.label;

        switch (action) {
            case sendActions.PSIGN:
                this.sendAction = "PLAINSIGN";
                document.getElementById("webpg-msg-btn").className = baseClass + " webpg-menu-sign";
                break;

            case sendActions.ASIGN:
                this.sendAction = "ATTACHSIGN";
                document.getElementById("webpg-msg-btn").className = baseClass + " webpg-menu-attachsign";
                break;

            case sendActions.CRYPTSIGN:
                this.sendAction = "CRYPTSIGN";
                document.getElementById("webpg-msg-btn").className = baseClass + " webpg-menu-cryptsign";
                break;

            case sendActions.CRYPT:
                this.sendAction = "CRYPT";
                document.getElementById("webpg-msg-btn").className = baseClass + " webpg-menu-crypt";
                break;

            case sendActions.SYMCRYPT:
                this.sendAction = "SYMCRYPT";
                document.getElementById("webpg-msg-btn").className = baseClass + " webpg-menu-crypt";
                break;

            default:
                document.getElementById("webpg-msg-btn").className = baseClass + " webpg-menu-donotuse";
                this.sendAction = false;

        }

    },

    getRecipients: function() {
        msgCompFields = gMsgCompose.compFields;
        var splitRecipients = msgCompFields.splitRecipients;
        var toList = [];
        var ccList = [];
        var bccList = [];
        var allList = [];
        var processed = new Object();
        
        if (msgCompFields.to.length > 0) {
            toList = msgCompFields.splitRecipients(msgCompFields.to, true, processed);
        }

        if (msgCompFields.cc.length > 0) {
            ccList = msgCompFields.splitRecipients(msgCompFields.cc, true, processed);
        }

        if (msgCompFields.bcc.length > 0) {
            bccList = msgCompFields.splitRecipients(msgCompFields.bcc, true, processed);
        }

        return { 'to': toList, 'cc': ccList, 'bcc': bccList, 'all': allList.concat(toList, ccList, bccList) };
    },

    /*
        Function: checkRecipients
            Checks the keyring for the required keys when performing GnuPG methods that require them

        Parameters:
            callback - <func> The function to execute when completed
    */
    checkRecipients: function(callback) {
        var _ = webpg.utils.i18n.gettext;
        var users = this.getRecipients().all;
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
               .getService(Components.interfaces.nsIWindowMediator);
        var winType = (webpg.utils.detectedBrowser['product'] == "thunderbird") ?
            "mail:3pane" : "navigator:browser";
        var browserWindow = wm.getMostRecentWindow(winType);

        browserWindow.webpg.background._onRequest({'msg': 'getNamedKeys',
            'users': users
        }, {}, function(response) {
            var recipKeys = {};
            var keys = response.result.keys;
            for (var u in keys) {
                for (var k in keys[u]) {
                    recipKeys[u] = keys[u][k];
                }
            }
            var notAllKeys = false;
            var missingKeys = [];
            for (var u in users) {
                if (!(users[u] in recipKeys)) {
                    notAllKeys = true;
                    missingKeys.push(users[u]);
                }
            }
            if (notAllKeys) {
                var status = _("You do not have any keys for") + " " +
                    missingKeys.toString().
                    replace(/((,))/g, _("or") + " ").replace(",", " ");
                console.log(status);
//                webpg.gmail.displayStatusLine(status);
            } else {
                if (callback)
                    callback(recipKeys);
            }
        });
    },

    getEditorContents: function() {
        const dce = Components.interfaces.nsIDocumentEncoder;
        var encFlags = dce.OutputFormatted | dce.OutputLFLineBreak;
        return _this.editor.outputToString("text/plain", encFlags);
    },

    setEditorContents: function(contents) {
        this.editor.selectAll();

        this.editor.beginTransaction();

        try {
            var editor = this.editor.QueryInterface(Components.interfaces.nsIEditorMailSupport);
            editor.insertTextWithQuotations(contents);
        } catch (ex) {
            this.editor.insertText(contents);
        }

        this.editor.endTransaction();
    },

    performSendAction: function() {
        // Retrieve the contents of the editor
        var msgContents = this.getEditorContents();

        var actionStatus = {'error': true};

        switch (this.sendAction) {
            case webpg.constants.overlayActions.PSIGN:
                actionStatus = _this.clearSignMsg(msgContents);
                break;

            case webpg.constants.overlayActions.ASIGN:
                actionStatus = _this.clearSignMsg(msgContents, true);
                break;

            case sendActions.CRYPTSIGN:
                actionStatus = _this.cryptMsg(msgContents, true);
                break;

            case sendActions.CRYPT:
                actionStatus = _this.cryptMsg(msgContents, false);
                break;

            case sendActions.SYMCRYPT:
                actionStatus = _this.symCryptMsg(msgContents);
                break;
        }

        return actionStatus;
    },

    clearSignMsg: function(msg, asAttachment) {
        var signKey = webpg.preferences.default_key.get();
        var signStatus = webpg.plugin.gpgSignText([signKey], msg, 2);
        if (!signStatus.error)
            _this.setEditorContents(signStatus.data);
        return signStatus;
    },

    cryptMsg: function(msg, sign) {
        var encryptKeys = [];
        var sign = (sign) ? 1 : 0;
        var encryptStatus = response = webpg.plugin.gpgEncrypt(msg,
                        request.keyid, sign);
    },
    
    symCryptMsg: function(msg) {
        var encryptStatus = webpg.plugin.gpgSymmetricEncrypt(msg, 0);
        if (!encryptStatus.error)
            _this.setEditorContents(encryptStatus.data);
        return encryptStatus;
    },
}

window.addEventListener('compose-window-init',
    function _init(aEvent) {
        webpg.thunderbird.compose.init(aEvent);
    }, true);
/* ]]> */
