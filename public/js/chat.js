// This file is executed in the browser, when people visit /chat/<random id>

$(function(){

	// getting the id of the room from the url
	var id = Number(window.location.pathname.match(/\/chat\/(\d+)$/)[1]);

	//$('#yourEmail').val(localStorage.getItem('userEmail'));
	
	// connect to the socket
	var socket = io.connect('/socket');

	// variables which hold the data for each person
	var name = "",
		email = "",
		img = "",
		friend = "";

	// cache some jQuery objects
	var section = $(".section"),
		footer = $("footer"),
		onConnect = $(".connected"),
		inviteSomebody = $(".invite-textfield"),
		personInside = $(".personinside"),
		chatScreen = $(".chatscreen"),
		left = $(".left"),
		noMessages = $(".nomessages"),
		tooManyPeople = $(".toomanypeople");

	// some more jquery objects
	var chatNickname = $(".nickname-chat"),
		leftNickname = $(".nickname-left"),
		loginForm = $(".loginForm"),
		yourName = $("#yourName"),
		yourEmail = $("#yourEmail"),
		hisName = $("#hisName"),
		hisEmail = $("#hisEmail"),
		chatForm = $("#chatform"),
		textarea = $("#message"),
		revealButton = $("#reveal"),
		revealText = $("#reveal-text"),
		messageTimeSent = $(".timesent"),
		chats = $(".chats");

	// these variables hold images
	var ownerImage = $("#ownerImage"),
		leftImage = $("#leftImage"),
		noMessagesImage = $("#noMessagesImage");

	//counter to keep track of revelations
	var revelationCounter = 0;


	// on connection to server get the id of person's room
	socket.on('connect', function(){

		socket.emit('load', id);
	});

	// save the gravatar url
	socket.on('img', function(data){
		img = data;
	});

	// receive the names and avatars of all people in the chat room
	socket.on('peopleinchat', function(data){

		if(data.number === 0){

			showMessage("connected");

			loginForm.on('submit', function(e){

				e.preventDefault();

				name = $.trim(yourName.val());
				
				if(name.length < 1){
					alert("Please enter a nick name longer than 1 character!");
					return;
				}

				email = yourEmail.val();

				if(!isValid(email)) {
					alert("Please enter a valid email!");
				}
				else {

					showMessage("inviteSomebody");

					// call the server-side function 'login' and send user's parameters
					socket.emit('login', {user: name, avatar: email, id: id});
				}
			
			});
		}

		else if(data.number === 1) {

			showMessage("personinchat",data);

			loginForm.on('submit', function(e){

				e.preventDefault();

				name = $.trim(hisName.val());

				if(name.length < 1){
					alert("Please enter a nick name longer than 1 character!");
					return;
				}

				if(name == data.user){
					alert("There already is a \"" + name + "\" in this room!");
					return;
				}
				email = hisEmail.val();

				if(!isValid(email)){
					alert("Wrong e-mail format!");
				}
				else {
					socket.emit('login', {user: name, avatar: email, id: id});
				}

			});
		}

		else {
			showMessage("tooManyPeople");
			setTimeout(function(){ 
					alert("Redirecting you to the homepage");
					window.location = '/';
			}, 3000);
		}

	});

	// Other useful 
	var nameFlag;
	socket.on('startChat', function(data){
		console.log(data);
		if(data.boolean && data.id == id) {

			chats.empty();

			if(name === data.users[0]) {

				showMessage("youStartedChatWithNoMessages",data);
				nameFlag = data.users[0];
			}
			else {

				showMessage("heStartedChatWithNoMessages",data);
				nameFlag = data.users[1];
			}

			chatNickname.text(friend);
		}
	});

	socket.on('leave',function(data){

		if(data.boolean && id==data.room){

			showMessage("somebodyLeft", data);
			chats.empty();
			setTimeout(function(){ 
					alert("Redirecting you to the homepage");
					window.location = '/';
			}, 3000);
		}

	});

	socket.on('tooMany', function(data){

		if(data.boolean && name.length === 0) {

			showMessage('tooManyPeople');
			setTimeout(function(){ 
					alert("Redirecting you to the homepage");
					window.location = '/';
			}, 3000);
		}
	});

	//create a normal message to display
	socket.on('receive', function(data){

		showMessage('chatStarted');

		if(data.msg.trim().length) {
			createChatMessage(data.msg, data.user, data.img, moment());
			scrollToBottom();
		}
	});

	//create a special message to indicate revelation
	socket.on('receive2', function(data){
		showMessage('chatStarted');

		revelationCounter++;
		if(data.msg.trim().length) {
			createChatSpecialMessage(data.msg, data.user, data.img, moment());
			scrollToBottom();
		}
		//receive the other person's data and save it to local storage
		localStorage.setItem('otherLink', data.link);
		localStorage.setItem('otherName', data.realName);
		localStorage.setItem('otherPicture', data.picture);
	});


	socket.on('receive3', function(){
		showMessage('chatStarted');
		/*Async might lead to problems if the other user's counter hasnt updated yet..*/
		/*could use the wait until function??*/
		if(revelationCounter < 3) {
			createChatFacebookMessage(localStorage.getItem('userName'), localStorage.getItem('otherName'),
			localStorage.getItem('picture'), localStorage.getItem('otherPicture'), 
			localStorage.getItem('profileLink'), localStorage.getItem('otherLink'));
			scrollToBottom();
		}
	});

	/*The reveal button*/
	revealButton.one("click", (function(event) {

		showMessage("chatStarted");

		//Change color on reveal button
		revealButton.css('background-color', '#1d8c07');
		revealButton.css('cursor', 'default');
		var approve = $('<h6>You have chosen to reveal yourself!</h6>');
		//append text onto button
		revealText.append(approve);
		revelationCounter++;
		//emit revelation event to routes.js
		socket.emit("revelation", {counter: revelationCounter});
		//create special message
		createChatSpecialMessage(nameFlag + " has chosen to reveal their Facebook profile!", name, img, moment());
		scrollToBottom();
		//send special message to room
		socket.emit('msg', {msg: nameFlag + " has chosen to reveal their Facebook profile!", 
			user: name, img: img, special: true, link: localStorage.getItem('profileLink'),
			realName: localStorage.getItem('userName'), picture: localStorage.getItem('picture')});

	}));

	textarea.keypress(function(e){

		// Submit the form on enter

		if(e.which == 13) {
			e.preventDefault();
			chatForm.trigger('submit');
		}

	});

	chatForm.on('submit', function(e){

		e.preventDefault();

		// Create a new chat message and display it directly

		showMessage("chatStarted");

		if(textarea.val().trim().length) {
			createChatMessage(textarea.val(), name, img, moment());
			scrollToBottom();

			// Send the message to the other person in the chat
			socket.emit('msg', {msg: textarea.val(), user: name, img: img, special: false});

		}
		// Empty the textarea
		textarea.val("");
	});

	// Update the relative time stamps on the chat messages every minute

	setInterval(function(){

		messageTimeSent.each(function(){
			var each = moment($(this).data('time'));
			$(this).text(each.fromNow());
		});

	},60000);

	// Function that creates a new chat message

	function createChatMessage(msg,user,imgg,now){

		var who = '';

		if(user===name) {
			who = 'me';
		}
		else {
			who = 'you';
		}

		var li = $(
			'<li class=' + who + '>'+
				'<div class="image">' +
					'<img src=' + imgg + ' />' +
					'<b></b>' +
					'<i class="timesent" data-time=' + now + '></i> ' +
				'</div>' +
				'<p></p>' +
			'</li>');

		// use the 'text' method to escape malicious user input
		li.find('p').text(msg);
		li.find('b').text(user);

		chats.append(li);

		messageTimeSent = $(".timesent");
		messageTimeSent.last().text(now.fromNow());
	}

	//Function that creates a special message (when user hits reveal)
	function createChatSpecialMessage(msg,user,imgg,now){

		var li = $(
			'<li class=' + 'revelation' + '>'+
				'<p></p>' +
			'</li>');

		// use the 'text' method to escape malicious user input
		li.find('p').text(msg);
		chats.append(li);
	}

	//Function that creates a facebook message when users mutually reveal
	function createChatFacebookMessage(user1, user2, img1, img2, link1, link2){
		var li = $(
			'<li class=' + 'facebookMessage' + '>'+
				'<div class="image">' +
					'<a href="' + link2 + '" target="_blank">' + '<img src="' + img2 + '"/></a>' +
					'<b></b>' +
				'</div>' +
				'<p></p>' +
			'</li>');

		// use the 'text' method to escape malicious user input
		li.find('p').text("Hey ;) This is my real Facebook profile");
		li.find('b').text(user2);

		chats.append(li);
	}

	function scrollToBottom(){
		$("html, body").animate({ scrollTop: $(document).height()-$(window).height() },1000);
	}

	function isValid(thatemail) {

		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(thatemail);
	}

	function showMessage(status,data){

		if(status === "connected"){

			section.children().css('display', 'none');
			onConnect.fadeIn(1200);
		}

		else if(status === "inviteSomebody"){

			onConnect.fadeOut(1200, function(){
				inviteSomebody.fadeIn(1200);
			});
		}

		else if(status === "personinchat"){

			onConnect.css("display", "none");
			personInside.fadeIn(1200);

			chatNickname.text(data.user);
			ownerImage.attr("src",data.avatar);
		}

		else if(status === "youStartedChatWithNoMessages") {

			left.fadeOut(1200, function() {
				inviteSomebody.fadeOut(1200,function(){
					noMessages.fadeIn(1200);
					footer.fadeIn(1200);
				});
			});

			friend = data.users[1];
			noMessagesImage.attr("src",data.avatars[1]);
		}

		else if(status === "heStartedChatWithNoMessages") {

			inviteSomebody.fadeOut(120,function(){
				left.fadeOut(1200,function(){
					noMessages.fadeIn(1200);
					footer.fadeIn(1200);
					scrollToBottom();
				})
			});

			friend = data.users[0];
			noMessagesImage.attr("src",data.avatars[0]);
		}

		else if(status === "chatStarted"){

			section.children().css('display','none');
			chatScreen.css('display','block');
		}

		else if(status === "somebodyLeft"){

			leftImage.attr("src",data.avatar);
			leftNickname.text(data.user);

			section.children().css('display','none');
			footer.css('display', 'none');
			left.fadeIn(1200);
		}

		else if(status === "tooManyPeople") {

			section.children().css('display', 'none');
			tooManyPeople.fadeIn(1200);
		}
	}

});
