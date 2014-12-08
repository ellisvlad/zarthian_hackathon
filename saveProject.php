<?php
$check_session=true;
include("connect.php");

try {
	$stmt=$db->prepare("SELECT * FROM projects, project_users WHERE project_users.pid=:pid AND project_users.pid=projects.id");
	$result=$stmt->execute(array(':pid'=>$_POST['pid']));
	$row=$stmt->fetch();
	if (!$row) {
		die('<script>alert("You are not authorised to save this project!!"); document.location=document.location.origin+"/projects.php";</script>');
	}
} catch (Exception $e) {
	die("Query failed! ".$e->getMessage());
}

file_put_contents("/var/projectData/".$_POST['pid'].".dat", $_POST['saveData']);
echo "SAVED!";
?>