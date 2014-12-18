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

			// When the server receives a message, it sends it to the other person in the room.
			socket.broadcast.to(socket.room).emit('receive', {msg: data.msg, user: data.user, img: data.img});
		});
	});

// Initialize a new socket.io application, named 'waiting'
	var waiting = io.of('/socket').on('connection', function (socket) {

		//var faceID = [1, 2];
		//var friendsID = [[4, 5, 2], [9]];
		var faceID = [];
		var friendsID = [];
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
						//console.log(ns.connected[id].room);
						//console.log("push complete "+ ns.connected[id].room);
						/*var index = ns.connected[id].rooms.indexOf(data.id);
						console.log(index);
						console.log(ns.connected[id].room[0]);
						console.log("data id" + data.id + "\n");
						console.log("waiting id" + data.waitID);*/
						var newPersonSocket = ns.connected[id];
						var otherPersonSocket;

						var newPersonId = ns.connected[id].room;
						var newPersonFriendList = ns.connected[id].friendList;
						//var matchedPerson = match(0, [3, 2], faceID, friendsID);
						var matchedPerson = match(newPersonId, newPersonFriendList, faceID, friendsID);

						if (matchedPerson) {
							var matchedPersonIndex = faceID.indexOf(matchedPerson);
							faceID.splice(matchedPersonIndex, 1);
							friendsID.splice(matchedPersonIndex, 1);
							console.log(data.id + " is matched to " + matchedPerson);
							otherPersonSocket = sockets[matchedPersonIndex];
							sockets.splice(matchedPersonIndex, 1);

							//add both newPerson and matchedPerson into a chat room
							var roomId = matchedPerson;
							newPersonSocket.emit('matchFound', {room: roomId});
							otherPersonSocket.emit('matchFound', {room: roomId});
							//console.log(ns);
						}
						else {							
							faceID.push(ns.connected[id].room);
							friendsID.push(ns.connected[id].friendList);
							sockets.push(ns.connected[id]);
						}						
					}
				}
			}

			/*console.log(faceID.length);
			for (var k = 0; k < friendsID.length; k++) {
			console.log("fb list" + friendsID[k]);
			}*/
			
			//matchingPeopleUp(faceID);
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
        //check 1st degree
        if(newPersonFriendList.indexOf(peopleList[i]) > -1) {
            //MATCH: newPerson and peopleList[i]
            return peopleList[i];
        }
        else {
        	var otherPersonsFriends = friendList[i];
            for(var j = 0; j < newPersonFriendList.length; j++) {
            	for (var k = 0; k < otherPersonsFriends.length; k++) {
            		if(newPersonFriendList[j]== otherPersonsFriends[k]) {
                     //MATCH: newPerson and peopleList[i]
                    return peopleList[i];
                }
                }
            	}
            }
            
        }
    return false;
}

