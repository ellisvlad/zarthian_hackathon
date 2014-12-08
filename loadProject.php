<?php
$check_session=true;
include("connect.php");

try {
	$stmt=$db->prepare("SELECT * FROM projects, project_users WHERE project_users.pid=:pid AND project_users.pid=projects.id");
	$result=$stmt->execute(array(':pid'=>$_POST['pid']));
	$row=$stmt->fetch();
	if (!$row) {
		die('<script>alert("You are not authorised to load this project!!"); document.location=document.location.origin+"/projects.php";</script>');
	}
} catch (Exception $e) {
	die("Query failed! ".$e->getMessage());
}

if (!file_exists("/var/projectData/".$_POST['pid'].".dat")) {
	echo "{\"objects\":[],\"instances\":[]}";
} else {
	echo file_get_contents("/var/projectData/".$_POST['pid'].".dat");
}
?>