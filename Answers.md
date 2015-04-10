### Principle and assumptions ###

#### Socket.io / Peer.js ####
**Socket.io** is used to keep a link with the server. Directory updates, when a user connect/disconnect come from there.


**Peer.js** is used to talk with other peers only.

#### Messenger ####
**About the group conversation :** when inviting a third person to a conversation, either we gave this person the conversation history, or we create a second conversation.


I don't like the first solution, so in order not to have deal with complicate conversation trees, I decided to avoid the invitation feature.


Group conversation are therefore available using the appropriate button.

However, when a user leaves, it does not close the conversation for the other participants. 

#### Conversation ####
Each conversation contains :
* a title
* the members of the conversations
* the DataConnection object for each user
* a header, used to identify the conversation, also passed in the messages
* the messages of the conversation

### Difficulties ###
###### Group conversation ######
When a user create a group conversation, he - *the initiator* - send a `new conversation` event.

The *recipients*, after receiving a `connection`, and then a `new conversation` event, create the conversation and initiate the DataConnection with the others recipients. *MessengerController*, line ~195.

I tried to set up listeners there, after the `//Save the sender conversation` :
* one for the sender : `connection.on('data', function....`
* **other listeners for the others recipients, in the map function creating the corresponding DataConnection objects.**

This part did not work. The listener for the sender of the `new conversation` event was working, but the listeners for the others recipients were not, 
though the DataConnection objects were created.

I didn't know why, so I used another solution, less elegant, by having just one listener and identify the conversation using a header.  

##### Notifications #####
I tried to add notifications using angularjs-toastr and angular-ui-notification, but their CSS was not working.


### Areas for improvement  ###
#### Features ####
* Account feature
* Persistence of the messages and users, using mongodb.
* Encryption of the messages, for data circulates in plain text.
* Display of images and videos in the chat : I would probably do it using a regex to detect if the message contains a link to an image or a video, and then display it with a CSS / angular module activated by a ng-if.
* A real banishment feature
* Error handling, for disconnection, message lost etc.

#### Code ####
* Maybe try to handle the `DataConnection` provided by a connection to a remote Peer with an AngularJS factory or service, in order not to have to use `$scope.$apply()`.
* Didn't succeed on using a boolean with the PeopleFilter, so banned / hidden properties are string.
