<?php
$check_session=true;
include("connect.php");

if (!empty($_POST['team'])) {
	$teamObj=[$user_row['id']];
	foreach (split(",",$_POST['team']) as $value) {
		if (!in_array($value, $teamObj)) {
			if (empty($_POST['teamRemove'])||$value!=$_POST['teamRemove']) {
				$teamObj[]=$value;
			}
		}
	}
	array_shift($teamObj);
	$team=$user_row['id'];
	foreach ($teamObj as $value) {
		$team.=",".$value;
	}
} else {
	$teamObj=[];
	$team=$user_row['id'];
}
?>
<!DOCTYPE html>
<html>
<head>
	<link rel="stylesheet" href="css/login.css"/>
</head>
<body>
	<form action="addProject.php" method="post" id='form'> 
	<table>
		<tr height="90px"><td colspan="2"><h1>Create Project</h1><input type="hidden" id="ready" name="ready" value=""/></td></tr>
		<?php
		if (!empty($_POST['ready'])) {
			try {
				$stmt=$db->prepare("SELECT * FROM projects WHERE name=:name");
				$result=$stmt->execute(array(':name'=>$_POST['name']));
				if ($row=$stmt->fetch()) {
					echo "<tr height='40px'><td colspan='2'><error>Error: Project name taken!</error></td></tr>";
				} else {
					$stmt=$db->prepare("INSERT INTO projects(name) VALUES(:name)");
					$result=$stmt->execute(array(':name'=>$_POST['name']));
					$stmt=$db->prepare("SELECT * FROM projects WHERE name=:name");
					$result=$stmt->execute(array(':name'=>$_POST['name']));
					$row=$stmt->fetch();
					$projId=$row['id'];
					echo $projId;

					$teamObj[]=$user_row['id'];
					foreach ($teamObj as $value) {
						$stmt=$db->prepare("INSERT INTO project_users(pid, uid) VALUES(:pid, :uid)");
						$result=$stmt->execute(array(':pid'=>$projId, ':uid'=>$value));
						$row=$stmt->fetch();
					}
					die("<script>alert('Project created sucessfully!\\nYou can edit it with your team!'); document.location=document.location.origin+'/projects.php';</script>");
				}
			} catch (Exception $e) {
				die("Query failed! ".$e->getMessage());
			}
		}
		?>
		<tr height="30px"><td style="text-align:right;">Project Name:</td><td style="text-align:left;"><input type="text" name="name" value="<?php echo $_POST['name']; ?>"/></td></tr>
		<tr height="30px"><td style="text-align:right;">Team Members:</td><td></td><input type="hidden" id="teamRemove" name="teamRemove" value=""/></tr>
		<tr height='20px'><td colspan='2'><?php echo $user_row['username']; ?></td></tr>
		<?php
		foreach ($teamObj as $value) {
			try {
				$stmt=$db->prepare("SELECT * FROM users WHERE id=:id;");
				$result=$stmt->execute(array(':id'=>$value));
				if ($row=$stmt->fetch()) {
					echo "<tr height='20px'><td colspan='2'>".$row['username']." [<a href='#' onmouseup='document.getElementById(\"teamRemove\").value=\"\"+".$row['id']."; document.getElementById(\"form\").submit();'>REMOVE</a>]</td></tr>";
				}
			} catch (Exception $e) {
				die("Query failed! ".$e->getMessage());
			}
		}
		?>
		<tr height="30px"><td style="text-align:right;">Add Team Member:</td><td><input type="hidden" id="team" name="team" value="<?php echo $team; ?>"/></td></tr>
		<?php
		try {
			$stmt=$db->prepare("SELECT * FROM users;");
			$result=$stmt->execute();
		} catch (Exception $e) {
			die("Query failed! ".$e->getMessage());
		}
		while ($row=$stmt->fetch()) {
			if ($row['id']!=$user_row['id'])
				echo "<tr height='20px'><td colspan='2'><a href='#' onmouseup='document.getElementById(\"team\").value+=\",\"+".$row['id']."; document.getElementById(\"form\").submit();'>".$row['username']."</a></td></tr>";
		}
		?>
		<tr height="60px"><td colspan="2"><input type="button" value="Make Project" onmouseup='document.getElementById("ready").value="true"; document.getElementById("form").submit();'/></td></tr>
		<tr><td></td></tr>
	</table>
	</form>
</body>
</html>
