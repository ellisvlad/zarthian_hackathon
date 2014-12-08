<!DOCTYPE html>
<html>
<head>
	<link rel="stylesheet" href="css/login.css"/>
</head>
<body>
	<form action="register.php" method="post"> 
	<table>
		<tr height="90px"><td colspan="2"><h1>Register</h1></td></tr>
		<?php
		if (isset($_POST['u'])&&isset($_POST['p'])&&isset($_POST['p2'])) {
			include("connect.php");
			$username=$_POST['u'];
			if ($_POST['p']!=$_POST['p2']) {
				echo "<tr height='40px'><td colspan='2'><error>Error: Passwords don't match!</error></td></tr>";
			} elseif (strlen($_POST['u'])<4) {
				echo "<tr height='40px'><td colspan='2'><error>Error: Username too short!</error></td></tr>";
			} elseif (strlen($_POST['u'])>20) {
				echo "<tr height='40px'><td colspan='2'><error>Error: Username too long!</error></td></tr>";
			} elseif (strlen($_POST['p'])<4) {
				echo "<tr height='40px'><td colspan='2'><error>Error: Password too short!</error></td></tr>";
			} elseif (strlen($_POST['p'])>20) {
				echo "<tr height='40px'><td colspan='2'><error>Error: Password too long!</error></td></tr>";
			} else {
				try {
					$stmt=$db->prepare("SELECT 1 FROM users WHERE username=:username");
					$result=$stmt->execute(array(':username'=>$username));
				} catch (Exception $e) {
					die("Query failed! ".$e->getMessage());
				}
				$row=$stmt->fetch();
				if ($row) {
					echo "<tr height='40px'><td colspan='2'><error>Error: Username taken!</error></td></tr>";
				} else {
					try {
						$stmt=$db->prepare("INSERT INTO users(username,password,salt,session) VALUES(:username,:password,:salt,:session)");
						$salt="";
						for ($i=0; $i!=50; $i++) $salt.=chr(rand(65, 90));
						for ($i=0; $i!=50; $i++) $session.=chr(rand(65, 90));
						$password=hash('sha256', $_POST['password'].$salt);
						for ($i=0; $i<65536; $i++) {
							$password=hash('sha256', $password.$salt);
						}
						$result=$stmt->execute(array(':username'=>$username, ':password'=>$password, ':salt'=>$salt, ':session'=>$session));
						die("<script>alert('User created sucessfully!\\nYou can now log in!'); document.location=document.location.origin+'/';</script>");
					} catch (Exception $e) {
						die("Query failed! ".$e->getMessage());
					}
				}
			}
		}
		?>
		<tr height="30px"><td style="text-align:right;">Username:</td><td style="text-align:left;"><input type="text" name="u" value="<?php echo $username; ?>"/></td></tr>
		<tr height="30px"><td style="text-align:right;">Password:</td><td style="text-align:left;"><input type="password" name="p" value=""/></td></tr>
		<tr height="30px"><td style="text-align:right;">Confirm Password:</td><td style="text-align:left;"><input type="password" name="p2" value=""/></td></tr>
		<tr height="40px"><td colspan="2"><input type="submit" value="Register" /></td></tr>
		<tr height="40px"><td colspan="2"><a href="register.php">Log In</a></td></tr>
		<tr><td></td></tr>
	</table>
	</form>
</body>
</html>