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
        webpg.plugin = document.getElementById("webpgPlugin");

        if (!webpg.plugin.valid)
            return

        this.sendAction = false;
        this.actionPerformed = false;

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

    setSendAction: function(action) {

        switch (action) {
            case sendActions.PSIGN:
                this.sendAction = "PLAINSIGN";
                break;

            case sendActions.ASIGN:
                this.sendAction = "ATTACHSIGN";
                break;

            case sendActions.CRYPTSIGN:
                this.sendAction = "CRYPTSIGN";
                break;

            case sendActions.CRYPT:
                this.sendAction = "CRYPT";
                break;

            default:
                this.sendAction = false;

        }

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
                actionStatus = _this.clearSignMsg(msgContents);
                break;
        }

        return actionStatus;
    },

    clearSignMsg: function(msg) {
        var signKey = webpg.preferences.default_key.get();
        var signStatus = webpg.plugin.gpgSignText([signKey], msg, 2);
        if (!signStatus.error)
            _this.setEditorContents(signStatus.data);
        return signStatus;
    },
}

window.addEventListener('compose-window-init',
    function _init(aEvent) {
        webpg.thunderbird.compose.init(aEvent);
    }, true);
/* ]]> */
