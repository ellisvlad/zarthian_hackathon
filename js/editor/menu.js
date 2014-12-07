function initMenu() {
	var menuItems=document.getElementsByTagName("menuBar")[0].children;
	for (i=0; i!=menuItems.length; i++) {
		menuItems[i].onmousedown=function(item){return function(){setTimeout(function(){dropDownMenu(item);},10);}}(menuItems[i]);
	}
}

function menuElClick(el) {
	switch (el.getAttribute("action")) {
	case "runDemo":
		runDemo();
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
	el.onmousedown=function(){menuElClick(this);};
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
		addToDropDown(dropdown, "New Object", "");
		addToDropDown(dropdown, "Save", "");
		addToDropDown(dropdown, "Import", "");
		addToDropDown(dropdown, "Export", "");
		addToDropDown(dropdown, "Team Settings", "");
	break;
	case "code":
		addToDropDown(dropdown, "Undo", "");
		addToDropDown(dropdown, "Redo", "");
		addToDropDown(dropdown, "Find", "");
		addToDropDown(dropdown, "Replace", "");
	break;
	case "run":
		addToDropDown(dropdown, "Run as demo", "runDemo");
		addToDropDown(dropdown, "Run in new window", "runWindow");
		addToDropDown(dropdown, "Export as runnable", "");
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