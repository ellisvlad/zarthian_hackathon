<!DOCTYPE html>
<html>
<head>
	<link rel="stylesheet" href="css/login.css"/>
</head>
<body>
	<form action="index.php" method="post"> 
	<table>
		<tr height="90px"><td colspan="2"><h1>Login</h1></td></tr>
		<?php
		if (isset($_POST['u'])&&isset($_POST['p'])) {
			include("connect.php");
			$username=$_POST['u'];
			if (strlen($_POST['u'])<4) {
				echo "<tr height='40px'><td colspan='2'><error>Error: Username too short!</error></td></tr>";
			} elseif (strlen($_POST['u'])>20) {
				echo "<tr height='40px'><td colspan='2'><error>Error: Username too long!</error></td></tr>";
			} elseif (strlen($_POST['p'])<4) {
				echo "<tr height='40px'><td colspan='2'><error>Error: Password too short!</error></td></tr>";
			} elseif (strlen($_POST['p'])>20) {
				echo "<tr height='40px'><td colspan='2'><error>Error: Password too long!</error></td></tr>";
			} else {
				try {
					$stmt=$db->prepare("SELECT * FROM users WHERE username=:username");
					$result=$stmt->execute(array(':username'=>$username));
				} catch (Exception $e) {
					die("Query failed! ".$e->getMessage());
				}
				$row=$stmt->fetch();
				if (!$row) {
					echo "<tr height='40px'><td colspan='2'><error>Error: Username not found!</error></td></tr>";
				} else {
					try {
						$check_password=hash('sha256', $_POST['password'].$row['salt']);
						for ($i=0; $i<65536; $i++) {
							$check_password=hash('sha256', $check_password.$row['salt']);
						}
						if ($check_password!=$row['password']) {
							echo "<tr height='40px'><td colspan='2'><error>Error: Password incorrect!".$check_password." ".$row['password']."</error></td></tr>";
						} else {
							$_SESSION['u']=$row['username'];
							$_SESSION['s']=$row['session'];
							die("<script>alert('Logged in!'); document.location=document.location.origin+'/projects.php';</script>");
						}
					} catch (Exception $e) {
						die("Query failed! ".$e->getMessage());
					}
				}
			}
		}
		?>
		<tr height="30px"><td style="text-align:right;">Username:</td><td style="text-align:left;"><input type="text" name="u" value="<?php echo $username; ?>"/></td></tr>
		<tr height="30px"><td style="text-align:right;">Password:</td><td style="text-align:left;"><input type="password" name="p" value=""/></td></tr>
		<tr height="40px"><td colspan="2"><input type="submit" value="Log In" /></td></tr>
		<tr height="40px"><td colspan="2"><a href="register.php">Register</a></td></tr>
		<tr><td></td></tr>
	</table>
	</form>
</body>
</html>