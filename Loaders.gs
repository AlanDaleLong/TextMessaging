function LoadActiveContacts()
{
  var contacts = new Array();
  var contactListSheet = textingSpreadsheet.getSheetByName("<Enter Name of Spreadsheet where contact list is stored>");
  var row = 2;
  while (true)
  {
    var values = contactListSheet.getSheetValues(row, 1, 1, 3);
    row++;
    
    var name = values[0][0];
    var email = values[0][1];
    var isActive = values[0][2] == "Yes";
    if (!email)
      break;
      
    if (isActive)
    {
      var contact = {};
      contact["name"] = name;
      contact["email"] = email;
      contacts.push(contact);
    }
  }
  
  return contacts;
}

function IsContactActive(emailToCheck)
{
  var isActive = false;
  var contacts = LoadActiveContacts();
  for (var i = 0; i < contacts.length; i++)
  {
    var contact = contacts[i];
    var name = contact["name"];
    var email = contact["email"];
    if (emailToCheck == email)
    {
      isActive = true;
      break;
    }
  }
  return isActive;
}

function LoadMessageQueue()
{
  var messageQueue = new Array();
  var messageQueueSheet = textingSpreadsheet.getSheetByName("<insert name of spreadsheet for message queue creation>");
  var row = 2;
  while (true)
  {
    var values = messageQueueSheet.getSheetValues(row, 1, 1, 3);
    
    var time = new Date(values[0][0]);
    var message = values[0][1];
    var isSent = values[0][2] == "Yes";
    if (!message)
      break;
      
    if (!isSent)
    {
      var queuedMessage = {};
      queuedMessage["time"] = time;
      queuedMessage["message"] = message;
      queuedMessage["row"] = row;
      messageQueue.push(queuedMessage);
    }
    row++;
  }
  
  return messageQueue;
}

function LoadBroadcasters()
{
  var broadcasters = new Array();
  var contactListSheet = textingSpreadsheet.getSheetByName("<Enter sheet where approved message broadcasters are listed>");
  var row = 2;
  while (true)
  {
    var values = contactListSheet.getSheetValues(row, 1, 1, 1);

    var email = values[0][0];
    if (!email)
      break;
    
    broadcasters.push(email);
    row++;
  }
  
  return broadcasters;
}

function LoadGroupNames()
{
  var groups = new Array();
  var groupsSheet = textingSpreadsheet.getSheetByName("<enter name of sheet where groups are named>");
  var column = 1;
  while (true)
  {
    var values = groupsSheet.getSheetValues(1, column, 1, 1);

    var group = values[0][0].trim();
    if (!group)
      break;
    
    groups.push(group);
    column++;
  }
  
  return groups;
}

function LoadGroupSubscribers(group)
{
  var subscribers = new Array();
  
  var groups = LoadGroupNames();
  var groupsSheet = textingSpreadsheet.getSheetByName("<enter name of sheet where groups are named>");
  var column = groups.indexOf(group.trim()) + 1;
  var row = 2;
  while (true)
  {
    var values = groupsSheet.getSheetValues(row, column, 1, 1);

    var email = values[0][0];
    if (!email)
      break;
    
    subscribers.push(email);
    row++;
  }
  
  return subscribers;
}

function LoadSubscribedGroups(email)
{
  var subscribedGroups = new Array();
  
  var groups = LoadGroupNames();
  for (var i = 0; i < groups.length; i++)
  {
    var group = groups[i];
    var groupSubscribers = LoadGroupSubscribers(group);
    
    if (groupSubscribers.indexOf(email) != -1)
      subscribedGroups.push(group);
  }
  
  return subscribedGroups;
}