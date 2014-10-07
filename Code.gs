var textingSpreadsheet = SpreadsheetApp.openById("<spreadsheetID>");

function doGet()
{
  var app = UiApp.createApplication();
  var form = app.createFormPanel();
  var flow = app.createFlowPanel();
  flow.add(app.createTextArea().setHeight(100).setWidth(400).setName("messageTextBox"));
  flow.add(app.createSubmitButton("Submit").setText("Broadcast Message"));
  form.add(flow);
  app.add(form);
  return app;
}

function doPost(eventInfo)
{
  var message = eventInfo.parameter.messageTextBox;
  var emailLog = SendMessage(message);
  
  var app = UiApp.getActiveApplication();
  app.add(app.createHTML(emailLog));
  return app;
}

function RunTriggers()
{
  CheckMessageQueue();
  CheckInbox();
}

function SendMessage(message, emailToExclude)
{
  // html (xml) decode the message
  message = XmlService.parse('<d>' + message + '</d>');
  message = message.getRootElement().getValue();
  
  // is this a group message
  var groupSubscribers = false;
  var colonIndex = message.indexOf(":");
  if (colonIndex != -1)
  {
    var group = message.substring(0, colonIndex).trim();
    var groups = LoadGroupNames();
    if (groups.indexOf(group) != -1)
    {
      groupSubscribers = LoadGroupSubscribers(group);
      message = group + ": " + message.substring(colonIndex + 1);
    }
  }


  // load the contacts
  var contacts = LoadActiveContacts();
  
  // send messages
  var emailLog = "Sent texts to: <br />";
  for (var i = 0; i < contacts.length; i++)
  {
    var contact = contacts[i];
    var name = contact["name"];
    var email = contact["email"];
    
    if (email != emailToExclude)
    {
      // if this is a group message, send only to group subscribers
      if (!groupSubscribers || (groupSubscribers.indexOf(email) != -1))
      {
        var firstName = name.split(" ")[0];
        var currentMessage = message.replace("%NAME%", firstName);
        MailApp.sendEmail(email, "", currentMessage);
        emailLog += (name + ": " + email + "<br />");
      }
    }
  }
  
  return emailLog;
}

Array.prototype.remove = function()
{
  var what, a = arguments, L = a.length, ax;
  while (L && this.length)
  {
    what = a[--L];
    while ((ax = this.indexOf(what)) !== -1)
    {
      this.splice(ax, 1);
    }
  }
  return this;
};