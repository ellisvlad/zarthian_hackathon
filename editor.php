<?php
$check_session=true;
include("connect.php");

try {
	$stmt=$db->prepare("SELECT * FROM projects, project_users WHERE project_users.pid=:pid AND project_users.pid=projects.id");
	$result=$stmt->execute(array(':pid'=>$_SERVER['QUERY_STRING']));
	$row=$stmt->fetch();
	if (!$row) {
		die('<script>alert("You are not authorised to edit this project!!"); document.location=document.location.origin+"/projects.php";</script>');
	}
} catch (Exception $e) {
	die("Query failed! ".$e->getMessage());
}
?>
<!DOCTYPE html>
<html>
<head>
<meta charset="ISO-8859-1">
<title>Insert title here</title>
<link rel="stylesheet" href="css/editor.css"/>
<script src="//cdnjs.cloudflare.com/ajax/libs/json2/20121008/json2.min.js"></script>
<script src="http://cdn.pubnub.com/pubnub.min.js"></script>
<script src="js/editor/main.js"></script>
<script src="js/editor/project.js?<?php echo $_SERVER['QUERY_STRING']; ?>"></script>
<script src="js/editor/menu.js?<?php echo $_SERVER['QUERY_STRING']; ?>"></script>
<script src="js/editor/compiler.js?<?php echo $_SERVER['QUERY_STRING']; ?>"></script>
<script src="js/editor/collab.js"></script>
</head>
<body>

<pageContent>
	<menuBar>
		<menuButton menu="file">File</menuButton>
		<menuButton menu="run">Run</menuButton>
		<menuButton menu="export">Export Runnable</menuButton>
		<menuButton menu="logout" last>Log Out</menuButton>
		<menuButton menu="trash" last>TRASH</menuButton>
	</menuBar>
	
	<mainArea>
		<panes>
			<pane pane_name="instances" pane_width="10%" pane_height="100%" addX>
				<header>Instances</header>
				<selectionList id="instancesList" name="Instances">
				</selectionList>
			</pane>
			<pane pane_name="objects" pane_width="15%" pane_height="100%" addX>
				<header>Objects <a href="#" onmousedown="newObjectDialog();">+</a></header>
				<selectionList id="objectsList" name="Objects">
				</selectionList>
			</pane>
			<pane pane_name="actionsList" pane_width="35%" pane_height="100%" addX>
				<header>Actions</header>
				<selectionList id="actionsList" name="Actions">
				</selectionList>
			</pane>
			<pane pane_name="actionsSelect" pane_width="40%" pane_height="60%" addY>
				<header>Action Selection</header>
			</pane>
			<pane pane_name="collab" pane_width="40%" pane_height="40%">
				<header>Collaboration</header>
				<chat>
					<chatHistory id="chatHistory"></chatHistory>
					<input onkeyup="chatCheck(this, event);"/>
				</chat>
			</pane>
		</panes>
	</mainArea>
	
	<borders></borders>
	
	<selectionList mouseList></selectionList>
	<selectionList id="trashList" name="trash"></selectionList>
	<mouseDropDownMenu></mouseDropDownMenu>
	
	<popup>
		<overlay></overlay>
		<box id="overlayBox"></box>
	</popup>
	<popup>
		<overlay onmouseup="this.parentNode.style.display='none';"></overlay>
		<box popups id="overlayPopupBox"><h2>Popup Blockers</h2>Your game runs in a popup which is blocked by default in most browsers. Allow popups to test your games.<img src='/img/popup.png'/></box>
	</popup>
	
	<form id="compileSubmition" method="post" action="compile.php" target="newTab1"></form>
</pageContent>

<script>load();</script>

</body>
</html>