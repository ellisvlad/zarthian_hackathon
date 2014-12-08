function initMenu() {
	var menuItems=document.getElementsByTagName("menuBar")[0].children;
	for (i=0; i!=menuItems.length; i++) {
		menuItems[i].onmousedown=function(item){return function(){setTimeout(function(){dropDownMenu(item);},10);}}(menuItems[i]);
	}
}

warnedPopup=false;
hasChangedSinceSave=false;

function menuElClick(el) {
	switch (el) {
	case "new_object":
		newObjectDialog();
	break;
	case "save_all":
		document.getElementsByTagName("popup")[0].style.display="block";
		var box=document.getElementById("overlayBox");
		box.innerHTML="<h1>Saving...</h1>";
		closeOverlay=function(){
		};
		
		var http=new XMLHttpRequest();
		http.onreadystatechange=function() {
			if (http.readyState==4&&http.status==200) {
				box.innerHTML+="<br style='clear:both;'><h1>"+http.responseText+"</h1>";
				setTimeout(function(){document.getElementsByTagName("popup")[0].style.display="none";}, 2000);
				hasChangedSinceSave=false;
			}
		}
		http.open("POST", "saveProject.php", true);
		http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		
		instanceList=projectData.instances;
		projectData.instances=[];
		for (i=0; i!=instanceList.length; i++) {
			projectData.instances.push(instanceList[i].name);
		}
		
		http.send("pid=<?php echo $_SERVER['QUERY_STRING']; ?>&saveData="+encodeURIComponent(JSON.stringify(projectData)));
		
		projectData.instances=instanceList;
	break;
	case "import":
		document.getElementsByTagName("popup")[0].style.display="block";
		var box=document.getElementById("overlayBox");
		box.innerHTML="<h1>Import Project</h1><br style='clear:both;'>"+
		"<p id='importText'>If you know what you are doing, you can import project data by pasting the JSON in the form below."+
		"<br>(Be warned! This feature is not fully supported and may yeild unpredictable results if used incorrectly!)"+
		"</p><textarea style='width:calc(100% - 4px); height:300px;'></textarea><input type='button' onmouseup='ProjectImport(this);' value='Import'/>";
		closeOverlay=function(){
		};
	break;
	case "export":
		document.getElementsByTagName("popup")[0].style.display="block";
		var box=document.getElementById("overlayBox");
		box.innerHTML="<h1>Export Project</h1><br style='clear:both;'>"+
		"<p>This is all data associated with your project in JSON form. You can read, modify, or archive this and import it back at any time!"+
		"<br>(Be warned! This feature is not fully supported and may yeild unpredictable results if you import a modified export with errors in it!)"+
		"</p><textarea style='width:calc(100% - 4px); height:300px;' id='exportText'></textarea>";
		document.getElementById("exportText").value=JSON.stringify(projectData);
		closeOverlay=function(){
		};
	break;
	default:
		console.error("==========");
		console.error("Menu Action Undefined!");
		console.error(el);
		console.error("==========");
	}
}

function addToDropDown(dropdown, text, actionId) {
	var el=document.createElement("dropDownEl");
	el.innerText=text;
	el.setAttribute("action", actionId);
	el.onmousedown=function(){menuElClick(this.getAttribute("action"));};
	dropdown.appendChild(el);
}

function dropDownMenu(menu) {
	var dropdown=document.getElementsByTagName("mouseDropDownMenu")[0];
	dropdown.innerHTML="";
	dropdown.style.display="block";
	if (menu.getAttribute("menu")==null) {
		console.error("==========");
		console.error("Menu undefined!");
		console.error(menu);
		console.error("==========");
		return;
	}
	
	switch (menu.getAttribute("menu")) {
	case "file":
		addToDropDown(dropdown, "New Object", "new_object");
		addToDropDown(dropdown, "Save", "save_all");
		addToDropDown(dropdown, "Import", "import");
		addToDropDown(dropdown, "Export", "export");
	break;
	case "run":
		if (!warnedPopup) document.getElementsByTagName("popup")[1].style.display="block";
		warnedPopup=true;
		runDemo();
	break;
	case "export":
		exportDemo();
	break;
	case "logout":
		if (hasChangedSinceSave&&confirm("You are about to log out!\n\nDo you want to save your project first?")) {
			menuElClick("save_all");
		} else {
			document.location=document.location.origin;
		}
	break;
	case "debug":
		addToDropDown(dropdown, "Debug in demo", "");
		addToDropDown(dropdown, "Debug in new window", "");
	break;
	case "team":
		addToDropDown(dropdown, "Add team member", "");
		addToDropDown(dropdown, "Remove team member", "");
		addToDropDown(dropdown, "Team settings", "");
	break;
	}
	
	dropdown.style.left=menu.offsetLeft+"px";
	dropdown.style.top=menu.offsetTop+menu.offsetHeight+"px";
}