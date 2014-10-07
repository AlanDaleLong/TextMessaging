function CheckMessageQueue()
{
  var messageQueue = LoadMessageQueue();
  var messageQueueSheet = textingSpreadsheet.getSheetByName("<name of message queue sheet>");
  
  var now = new Date(new Date().getTime() + 30000); // now + 30 seconds
  
  for (var i = 0; i < messageQueue.length; i++)
  {
    var queuedMessage = messageQueue[i];
    var time = queuedMessage["time"];
    var message = queuedMessage["message"];
    var row = queuedMessage["row"];
    
    if (time < now)
    {
      SendMessage(message);
      messageQueueSheet.getRange(row, 3).setValue("Yes");
    }
  }
}