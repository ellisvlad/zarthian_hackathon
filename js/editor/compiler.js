function compile() {
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
	compiler.submit();
	
	projectData.instances=instanceList;
}

function runDemo() {
	compile();
	game_running=true;
}
