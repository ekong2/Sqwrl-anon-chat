// This file is required by app.js. It sets up event listeners
// for the two main URL endpoints of the application - /create and /chat/:id
// and listens for socket.io messages.

// Use the gravatar module, to turn email addresses into avatar images:

var gravatar = require('gravatar');

// Export a function, so that we can pass 
// the app and io instances from the app.js file:

module.exports = function(app,io){

	app.get('/', function(req, res){

		// Render views/home.html
		res.render('home');
	});

	app.get('/logout', function(req,res){

		// Redirects to the main home view
		res.redirect('/');
	});

	app.get('/waiting', function(req,res){

		res.render('waiting');
	});

	app.get('/create', function(req,res){

		// Generate unique id for the room
		var id = 523995323452562;

		// Redirect to the random room
		res.redirect('/chat/'+id);
	});

	app.get('/chat/:id', function(req,res){

		// Render the chat.html view
		res.render('chat');
	});

	// Initialize a new socket.io application, named 'chat'
	var chat = io.of('/socket').on('connection', function (socket) {

		// When the client emits the 'load' event, reply with the 
		// number of people in this chat room

		socket.on('load',function(data){

			var room = findClientsSocket(io,data,'/socket');
			if(room.length === 0 ) {

				socket.emit('peopleinchat', {number: 0});
			}
			else if(room.length === 1) {

				socket.emit('peopleinchat', {
					number: 1,
					user: room[0].username,
					avatar: room[0].avatar,
					id: data
				});
			}
			else if(room.length >= 2) {

				chat.emit('tooMany', {boolean: true});
			}
		});

		// When the client emits 'login', save his name and avatar,
		// and add them to the room
		socket.on('login', function(data) {

			var room = findClientsSocket(io, data.id, '/socket');
			// Only two people per room are allowed
			if (room.length < 2) {

				// Use the socket object to store data. Each client gets
				// their own unique socket object

				socket.username = data.user;
				socket.room = data.id;
				socket.avatar = gravatar.url(data.avatar, {s: '140', r: 'x', d: 'mm'});
				//hashmap to hold the key value pairs for revelation
				socket.reveals = {};

				// Tell the person what he should use for an avatar
				socket.emit('img', socket.avatar);


				// Add the client to the room
				socket.join(data.id);

				if (room.length == 1) {

					var usernames = [],
						avatars = [];

					usernames.push(room[0].username);
					usernames.push(socket.username);

					avatars.push(room[0].avatar);
					avatars.push(socket.avatar);

					// Send the startChat event to all the people in the
					// room, along with a list of people that are in it.

					chat.in(data.id).emit('startChat', {
						boolean: true,
						id: data.id,
						users: usernames,
						avatars: avatars
					});
				}
			}
			else {
				socket.emit('tooMany', {boolean: true});
			}
		});

		// Somebody left the chat
		socket.on('disconnect', function() {

			// Notify the other person in the chat room
			// that his partner has left

			socket.broadcast.to(this.room).emit('leave', {
				boolean: true,
				room: this.room,
				user: this.username,
				avatar: this.avatar
			});

			// leave the room
			socket.leave(socket.room);
		});


		// Handle the sending of messages
		socket.on('msg', function(data){
			if (data.special){
				// When the server receives a special message, it sends it to the other person in the room.
				socket.broadcast.to(socket.room).emit('receive2', {msg: data.msg, user: data.user, img: data.img, 
					link: data.link, realName: data.realName, picture: data.picture});
			} else {
				// When the server receives a normal message, it sends it to the other person in the room.
				socket.broadcast.to(socket.room).emit('receive', {msg: data.msg, user: data.user, img: data.img});
			}
		});

		//will only reveal if both users hit reveal button
		socket.on('revelation', function(data){
			if (data.counter === 2) {
				socket.emit('receive3');
				socket.broadcast.to(socket.room).emit('receive3');
			}
		});
	});

// Initialize a new socket.io application, named 'waiting'
	var waiting = io.of('/socket').on('connection', function (socket) {

		//var waitingRoomFBids = [1, 2];
		//var waitingRoomFriendList = [[4, 5, 2], [9]];

		//waitingRoomFBids is an array of fb ID in the waiting room
		var waitingRoomFBids = [];
		var waitingRoomFriendList = [];
		var sockets = [];

		// When the client emits the 'load' event, reply with the 
		// number of people in this chat room

		socket.on('load',function(data){

			//store the unique facebook id to the socket object that the client possess
			socket.room = data.id;
			socket.friendList = data.friendList;

			//join the waitroom
			socket.join(data.waitID);

			//initialize the namespace
			ns = io.of("/socket" ||"/");
			if (ns) {
				//iterate through all connected clients in this namespace, collect all facebook ids in an array
				for (var id in ns.connected) {
					if(data.id) {
						//store the newperson's socket object
						var newPersonSocket = ns.connected[id];
						var otherPersonSocket;

						//store the new person's fb id and friend list
						var newPersonId = ns.connected[id].room;
						var newPersonFriendList = ns.connected[id].friendList;
						//var matchedPerson = match(0, [3, 2], waitingRoomFBids, waitingRoomFriendList);

						//call matchPerson on new person to see whether there is is eligible match
						var matchedPerson = match(newPersonId, newPersonFriendList, waitingRoomFBids, waitingRoomFriendList);

						if (matchedPerson) {
							var matchedPersonIndex = waitingRoomFBids.indexOf(matchedPerson);
							//remove fbID, friendlist and socket from waiting room
							waitingRoomFBids.splice(matchedPersonIndex, 1);
							waitingRoomFriendList.splice(matchedPersonIndex, 1);
							console.log(data.id + " is matched to " + matchedPerson);
							otherPersonSocket = sockets[matchedPersonIndex];
							sockets.splice(matchedPersonIndex, 1);

							//add both newPerson and matchedPerson into a chat room
							var roomId = matchedPerson;
							newPersonSocket.emit('matchFound', {room: roomId});
							otherPersonSocket.emit('matchFound', {room: roomId});
							//leave the waitroom
							newPersonSocket.leave(data.waitID);
							otherPersonSocket.leave(data.waitID);
							//console.log(ns);
						}
						else {							
							//add fbID, friendlist and socket into waiting room
							waitingRoomFBids.push(ns.connected[id].room);
							waitingRoomFriendList.push(ns.connected[id].friendList);
							sockets.push(ns.connected[id]);
						}						
					}
				}
			}

			/*console.log(waitingRoomFBids.length);
			for (var k = 0; k < waitingRoomFriendList.length; k++) {
			console.log("fb list" + waitingRoomFriendList[k]);
			}*/
			
			//matchingPeopleUp(waitingRoomFBids);
			/*socket.leave(socket.room);

			ns.connected[id].rooms[data.waitingID]
			socket.emit('lol', {num: room.length});*/
		});
	});
};

function findClientsSocket(io,roomId, namespace) {
	var res = [],
		ns = io.of(namespace ||"/");    // the default namespace is "/"

	if (ns) {
		for (var id in ns.connected) {
			if(roomId) {
				var index = ns.connected[id].rooms.indexOf(roomId) ;
				if(index !== -1) {
					res.push(ns.connected[id]);
				}
			}
			else {
				res.push(ns.connected[id]);
			}
		}
	}
	return res;
}

function match(newPersonId, newPersonFriendList, peopleList, friendList) {
    if (!newPersonFriendList)
    	return false;
    for(var i = 0; i<peopleList.length; i++) {
        //check 1st degree to find match
        if(newPersonFriendList.indexOf(peopleList[i]) > -1) {
        	//looks through new friendlist and see whether anyone matches each person in waiting room
        	//return 1st degree match fb id
            return peopleList[i];
        }
        else {
        	//the friendlist of each person in the waiting room
        	var otherPersonsFriends = friendList[i];
        	//loop through newPersonFriendList and otherPersonFriendList and if match
        	//then there is a 2nd degree connection. Match found!
            for(var j = 0; j < newPersonFriendList.length; j++) {
            	for (var k = 0; k < otherPersonsFriends.length; k++) {
            		if(newPersonFriendList[j]== otherPersonsFriends[k]) {
                    return peopleList[i];
                }
                }
            	}
            }
            
        }
    return false;
}

