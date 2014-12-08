<?php
	$username="website";
	$password="websitePassword";
	$host="localhost";
	$dbname="koding";
	try {
		$db=new PDO("mysql:host={$host};dbname={$dbname};charset=utf8", $username, $password, array(PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8')); 
	} catch (Exception $e) {
		die("Connection Failed: ".$e->getMessage());
	}
	session_start();
	
	if ($check_session) {
			try {
				$stmt=$db->prepare("SELECT * FROM users WHERE username=:username AND session=:session");
				$result=$stmt->execute(array(':username'=>$_SESSION['u'], ':session'=>$_SESSION['s']));
			} catch (Exception $e) {
				die("Query failed! ".$e->getMessage());
			}
			$user_row=$stmt->fetch();
			if (!$user_row) {
				die("<script>alert('Login expired!\\nLog in again!'); document.location=document.location.origin+'/';</script>");
			}
	}
?>