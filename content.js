INBOX_SDK_PUBLIC_KEY = 'sdk_zjJLZkPv3CzHi4o_2ff72f7a41';

InboxSDK.load('1', INBOX_SDK_PUBLIC_KEY).then(function(sdk) {
	sdk.Compose.registerComposeViewHandler(function(composeView) {
    var statusBar = composeView.addStatusBar({
      height: 25,
    });
    statusBar.el.style.paddingLeft = '9px';

    var setStatusMessage = function(message) {
      statusBar.el.innerHTML = "<small>" + message + "</small>";
    };

    composeView.on('recipientsChanged', function(event) {
      var mixture = RecipientMixture.getMixtureType(composeView);
      switch (mixture) {
        case RecipientMixture.INTERNAL_ONLY:
          setStatusMessage("✅  You're only sending this to people <strong>inside your organization</strong>.");
          break;
        case RecipientMixture.EXTERNAL_ONLY:
          setStatusMessage("👍  This email is only going to people <strong>outside your organization</strong>.");
          break;
        case RecipientMixture.INTERNAL_AND_EXTERNAL:
          setStatusMessage("❓  Double check that you wanted to send this to people <strong>both in and out of your organization</strong>.");
          break;
        default:
          setStatusMessage("");
          break;
      }
    });
	});
});

var RecipientMixture = new function() {
  var getFromDomain = function(composeView) {
    var from = composeView.getFromContact().emailAddress;
    return getEmailDomain(from);
  };

  var getAllRecipients= function(composeView) {
    var recipients = [];
    recipients = recipients.concat(composeView.getToRecipients());
    recipients = recipients.concat(composeView.getCcRecipients());
    recipients = recipients.concat(composeView.getBccRecipients());
    return recipients;
  };

  var getEmailDomain = function(email) {
    var parts = email.split('@');
    return parts[1];
  }

  this.NO_RECIPIENTS = 0;
  this.INTERNAL_ONLY = 1;
  this.EXTERNAL_ONLY = 2;
  this.INTERNAL_AND_EXTERNAL = 3;

  this.getMixtureType = function(composeView) {
    var fromDomain = getFromDomain(composeView);
    var sameOrgIncluded = false;
    var domains = new Set();
    var recipients = getAllRecipients(composeView);

    // Check all recipients for organization (by domain)
    for (var i = 0; i < recipients.length; i++) {
      var email = recipients[i].emailAddress;
      var domain = getEmailDomain(email);

      if (domain === fromDomain) {
        sameOrgIncluded = true;
      }

      domains.add(getEmailDomain(email));
    }

    if (domains.size === 1 && sameOrgIncluded) {
      return this.INTERNAL_ONLY;
    } else if (domains.size > 1 && sameOrgIncluded) {
      return this.INTERNAL_AND_EXTERNAL;
    } else if (domains.size >= 1) {
      return this.EXTERNAL_ONLY;
    } else {
      return this.NO_RECIPIENTS;
    }
  }
};
