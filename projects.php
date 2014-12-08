<?php
$check_session=true;
include("connect.php");
?>
<!DOCTYPE html>
<html>
<head>
	<link rel="stylesheet" href="css/login.css"/>
</head>
<body>
	<form action="index.php" method="post"> 
	<table>
		<tr height="90px"><td><h1>My Projects</h1></td></tr>
		<?php
		try {
			$stmt=$db->prepare("SELECT * FROM projects, project_users WHERE project_users.uid=:uid AND project_users.pid=projects.id");
			$result=$stmt->execute(array(':uid'=>$user_row['id']));
			while ($row=$stmt->fetch()) {
				echo '<tr height="30px"><td><a href="editor.php?'.$row['pid'].'">'.$row['name'].'</a></td></tr>';
			}
		} catch (Exception $e) {
			die("Query failed! ".$e->getMessage());
		}
		?>
		<tr height="20px"><td></td></tr>
		<tr height="30px"><td><a href="addProject.php">Create Project</a></td></tr>
		<tr><td></td></tr>
	</table>
	</form>
</body>
</html>
