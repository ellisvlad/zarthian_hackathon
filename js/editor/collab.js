var PUBNUB_session=PUBNUB.init({
	publish_key: 'pub-c-c0dc86a6-df09-443b-8d08-4525f1f98479',
	subscribe_key: 'sub-c-6eecb0f2-7cb2-11e4-b908-02ee2ddab7fe'
});

PUBNUB_session.subscribe({
	channel: 'session_<?php echo $_SERVER['QUERY_STRING']; ?>',
	message: collab_recv
});

my_username="<?php session_start(); echo $_SESSION['u']; ?>";

function collab_recv(data) {
	switch (data.id) {
	case 0: //make object
		hasChangedSinceSave=true;
		if (data.from==my_username) return;
		newObject(data.data);
	break;
	case 1: //update project data
		hasChangedSinceSave=true;
		if (data.from==my_username) return;
		projectData=data.data;
		oldSelect=currentlyEditing;
		reloadObjects();
		selectObject(oldSelect);
	break;
	case 2: //chat
		document.getElementById("chatHistory").innerHTML+=data.from+": "+data.data+"<br>";
	break;
	case 3: //join/leave
		if (data.data.joining) {
			document.getElementById("chatHistory").innerHTML+=data.from+" has joined the session!<br>";
			collab_send(1, projectData);
		} else {
			document.getElementById("chatHistory").innerHTML+=data.from+" has left the session!<br>";
		}
	break;
	}
}
function collab_send(actionId, actionData) {
	PUBNUB_session.publish({
		channel: 'session_0',
		message: {
			from:my_username,
			id:actionId,
			data:actionData
		}
	});
}

collab_send(3, {joining:true});
window.onbeforeunload=function(){collab_send(3, {joining:false});};

function chatCheck(input, e) {
	if (e.keyCode==13) {
		collab_send(2, input.value);
		input.value="";
	}
}