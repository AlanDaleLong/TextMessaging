function CheckInbox()
{
  var broadcasters = LoadBroadcasters();
  var inbox = GmailApp.getInboxThreads();
  for(var t = 0; t < inbox.length; t++)
  {
    var thread = inbox[t];
    var messages = thread.getMessages();
    if (messages == null)
      continue;
    for (var m = 0; m < messages.length; m++)
    {
      var message = messages[m];
      if (message.isUnread())
      {        
        var email = message.getFrom();
        var body = message.getBody();
        if (email.indexOf("@txt.voice.google.com") !== -1)
        {
          var bodyText = body.substring(0, body.lastIndexOf("<br>")).replace("<br>", "<br></br>").trim();
          var loweredBodyText = bodyText.toLowerCase();
          
          var reply;
          
          if ((loweredBodyText == "help") || (loweredBodyText == "?"))
            reply = "Text START with your name to receive messages or STOP to stop. Text GROUPS for available groups. Standard message rates apply."
          else if (loweredBodyText.indexOf("start") == 0)
            reply = StartContact(email, bodyText);
          else if (loweredBodyText == "stop")
            reply = StopContact(email);
          else if (loweredBodyText == "groups")
            reply = Groups(email);
          else if (loweredBodyText.indexOf("sub") == 0)
            reply = SubscribeContact(email, bodyText);
          else if (loweredBodyText.indexOf("unsub") == 0)
            reply = UnsubscribeContact(email, bodyText);
          else if (broadcasters.indexOf(email) != -1)
          {
            SendMessage(bodyText, email);
            reply = "Your message was broadcasted."
          }
          else
            reply = "What do you mean? Text HELP for help.";
            
          message.reply(reply);
          message.markRead();
        }
      }
    }
  }
}
  
function StartContact(emailToStart, bodyText)
{
  var name = bodyText.replace(/^(S|s)(T|t)(A|a)(R|r)(T|t)/, "").trim();
  if (!name)
    return "To start, text START with your name.";
  
  var reply;
  
  var contactListSheet = textingSpreadsheet.getSheetByName("<enter name of sheet with contact list information>");
  
  var started = false;
  var start = function (rowToEdit, isActive)
  {
    if (!started)
    {
      contactListSheet.getRange(rowToEdit, 1).setValue(name);
      contactListSheet.getRange(rowToEdit, 2).setValue(emailToStart);
      contactListSheet.getRange(rowToEdit, 3).setValue("Yes");
      started = true;
      
      if (!isActive)
        reply = "You have been subscribed to receive <organizational name> text messages. Text HELP for help.";
      else
        reply = "You were already subscribed to receive <organizational name> text messages. Text HELP for help.";
    }
  };
  
  var row = 2;
  while (true)
  {
    var values = contactListSheet.getSheetValues(row, 1, 1, 3);
    var email = values[0][1];
    var isActive = values[0][2] == "Yes";
    if (!email)
      break;
      
    if (emailToStart == email)
    {
      start(row, isActive);
      break;
    }
    row++;
  }
  
  if (!started)
     start(row);
   
  return reply;
}

function StopContact(emailToStop)
{
  var reply;

  var contactListSheet = textingSpreadsheet.getSheetByName("Contact List");
  
  var stopped = false;
  var stop = function (rowToEdit, isActive)
  {
    if (rowToEdit > 0)
      contactListSheet.getRange(rowToEdit, 3).setValue("No");
    stopped = true;
    
    if (isActive)
      reply = "You have been unsubscribed from the <organizational name> text messages. Text HELP for help.";
    else
      reply = "You were already unsubscribed from the <organizational name> text messages. Text HELP for help.";
  };
  
  var row = 2;
  while (true)
  {
    var values = contactListSheet.getSheetValues(row, 1, 1, 3);
    var email = values[0][1];
    var isSubscribed = values[0][2] == "Yes";
    if (!email)
      break;
    
    if (emailToStop == email)
    {
       stop(row, isSubscribed);
       break;
    }
    row++;
  }
  
  if (!stopped)
     stop(-1, false);
  
  return reply;
}

function Groups(email)
{
  var reply;
  
  var groups = LoadGroupNames();
  var subscribedGroups = LoadSubscribedGroups(email);
  for (var i = 0; i < subscribedGroups.length; i++)
    groups.remove(subscribedGroups[i]);
  
  if ((subscribedGroups.length == 0) && (groups.length == 0))
  reply = "There are currently no groups. Please check back later.";
  else
  {
    reply = subscribedGroups.length > 0 ? "Your groups: " + subscribedGroups.join(", ") + "; " : "";
    reply += groups.length > 0 ? "Available groups: " + groups.join(", ") + "; " : "No other groups; ";
    reply += "Text SUB or UNSUB with a group name to subscribe or unsubscribe.";
  }
  
  return reply;
}

function SubscribeContact(emailToSubscribe, bodyText)
{
  var group = bodyText.replace(/^(S|s)(U|u)(B|b)/, "").trim();
  if (!group)
    return "To subscribe to a group, text SUB with a group name. Text GROUPS for available groups."

  var reply;
  
  var groups = LoadGroupNames();
  if (groups.indexOf(group) != -1)
  {
    var isActive = IsContactActive(emailToSubscribe);
    
    if (!isActive)
      reply = "Please text START with your name to subscribe to receive <organizational name> text messages.";
    else
    {
      var groupSubscribers = LoadGroupSubscribers(group);
      var isSubscribed = (groupSubscribers.indexOf(emailToSubscribe) != -1);
    
      if (isSubscribed)
        reply = "You are already subscribed to the '" + group + "' group. Text 'UNSUB " + group + "' to unsubscribe.";
      else
      {
        var groupsSheet = textingSpreadsheet.getSheetByName("Groups");
        var row = groupSubscribers.length + 2;
        var column = groups.indexOf(group) + 1;
        groupsSheet.getRange(row, column).setValue(emailToSubscribe);
        reply = "You have been subscribed to the '" + group + "' group. Text 'UNSUB " + group + "' to unsubscribe.";
      }
    }
  }
  else
    reply = "Unknown group. Text GROUP for available groups. (Groups name are case-sensitive.)";
  
  return reply;
}

function UnsubscribeContact(emailToUnsubscribe, bodyText)
{
  var group = bodyText.replace(/^(U|u)(N|n)(S|s)(U|u)(B|b)/, "").trim();
  if (!group)
    return "To unsubscribe from a group, text UNSUB with a group name. Text GROUPS for your groups."

  var reply;
  
  var groups = LoadGroupNames();
  if (groups.indexOf(group) != -1)
  {
    var isActive = IsContactActive(emailToUnsubscribe);
    
    if (!isActive)
      reply = "Please text START with your name to subscribe to receive <organizational name> text messages.";
    else
    {
      var groupSubscribers = LoadGroupSubscribers(group);
      var isSubscribed = (groupSubscribers.indexOf(emailToUnsubscribe) != -1);
    
      if (!isSubscribed)
        reply = "You are not subscribed to the '" + group + "' group. Text 'SUB " + group + "' to subscribe.";
      else
      {
        var groupsSheet = textingSpreadsheet.getSheetByName("Groups");
        var row = groupSubscribers.indexOf(emailToUnsubscribe) + 2;
        var column = groups.indexOf(group) + 1;
        var lastSubscriberRow = groupSubscribers.length + 1;
        var lastSubscriber = groupSubscribers[groupSubscribers.length - 1];
        groupsSheet.getRange(row, column).setValue(lastSubscriber);
        groupsSheet.getRange(lastSubscriberRow, column).setValue("");
        reply = "You have been unsubscribed from the '" + group + "' group. Text 'SUB " + group + "' to subscribe.";
      }
    }
  }
  else
    reply = "Unknown group. Text GROUP for your groups. (Groups name are case-sensitive.)";
  
  return reply;
}