function compile(finalCompile) {
	instanceList=projectData.instances;
	projectData.instances=[];
	for (i=0; i!=instanceList.length; i++) {
		projectData.instances.push(instanceList[i].name);
	}
	
	compiler=document.getElementById("compileSubmition");
	el=document.createElement("input");
	el.name="data";
	el.setAttribute("type", "hidden");
	el.setAttribute("value", JSON.stringify(projectData));
	compiler.appendChild(el);
	if (finalCompile) {
		el=document.createElement("input");
		el.name="final";
		el.setAttribute("type", "hidden");
		el.setAttribute("value", "true");
		compiler.appendChild(el);
		el=document.createElement("input");
		el.name="pid";
		el.setAttribute("type", "hidden");
		el.setAttribute("value", "<?php echo $_SERVER['QUERY_STRING']; ?>");
		compiler.appendChild(el);
	}
	compiler.submit();
	
	projectData.instances=instanceList;
}

function runDemo() {
	compile(false);
	game_running=true;
}
function exportDemo() {
	compile(true);
	game_running=true;
}
