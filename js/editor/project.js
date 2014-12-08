projectData={
	objects:[],
	instances:[]
}

var http=new XMLHttpRequest();
http.onreadystatechange=function() {
	if (http.readyState==4&&http.status==200) {
		hasChangedSinceSave=false;
		projectData=JSON.parse(http.response);
		reloadObjects();
	}
}
http.open("POST", "loadProject.php", true);
http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
http.send("pid=<?php echo $_SERVER['QUERY_STRING']; ?>");

selectedObject=null;
makeInnerLists=[];

function ProjectImport(but) {
	try {
		console.log(but.parentNode.children[but.parentNode.children.length-2].value);
		projectData1=JSON.parse(but.parentNode.children[but.parentNode.children.length-2].value);
		projectData=projectData1;
		document.getElementById("overlayBox").innerHTML+="<br style='clear:both;'><h1>Loaded!</h1>";
		setTimeout(function(){document.getElementsByTagName("popup")[0].style.display="none";}, 2000);
		collab_send(1, projectData);
	} catch (e) {
		document.getElementById('importText').innerHTML="<font style='color:red;'>Error when loading! "+e.message+"</font>";
	}
}

function makeActionText(action, item) {
	var retStr="?? "+action.action+" ??";
	switch (action.action) {
	case "prompt":
		retStr="<img src='img/prompt.png'/><itemSep></itemSep>\""+action.question+"\":\""+action.defaultText+"\" => "+action.answer+"";
	break;
	case "alert":
		retStr="<img src='img/message.png'/><itemSep></itemSep>\""+action.text+"\"";
	break;
	case "text_properties":
		retStr="<img src='img/text_properties.png'/><itemSep></itemSep>Colour="+action.color+", Font="+action.font+", Size="+action.size;
	break;
	case "draw_text":
		retStr="<img src='img/draw_text.png'/><itemSep></itemSep>Position=["+action.x+","+action.y+"]<itemSep></itemSep>"+action.text;
	break;
	case "var":
		retStr="<img src='img/var.png'/><itemSep></itemSep>"+action.variable+" = "+action.value;
	break;
	case "keyPress":
		retStr="";
		for (keyAction in action.keys) {
			var keyStr=String.fromCharCode(keyAction);
			if (parseInt(keyAction)<48) {
				switch (parseInt(keyAction)) {
				case 8: keyStr="Backspace"; break;
				case 13: keyStr="Enter"; break;
				case 16: keyStr="Shift"; break;
				case 17: keyStr="Control"; break;
				case 32: keyStr="Space"; break;
				case 37: keyStr="Left"; break;
				case 38: keyStr="Up"; break;
				case 39: keyStr="Right"; break;
				case 40: keyStr="Down"; break;
				default: keyStr="Unknown key? ["+keyAction+"]";
				}
			}
			retStr+="<itemregion data='keyPress"+keyAction+"'>"+keyStr+"</itemregion><selectionlist id='innerlist_"+makeInnerLists.length+"' name='Action_Section_KeyPress"+keyAction+"'>";
			for (keyActions in action.keys[keyAction]) {
				retStr+="<item moveTo='Action_Section_*'><content>"+makeActionText(action.keys[keyAction][keyActions], null)+"</content></item>";
			}
			retStr+="</selectionlist>";
			item.setAttributeNode(document.createAttribute("embedded"));
			makeInnerLists.push("innerlist_"+makeInnerLists.length);
		}
	break;
	case "load_image":
		retStr="<img src='img/load_img.png'/><itemSep></itemSep>"+action.imgId+" = "+action.src;
	break;
	case "draw_image":
		retStr="<img src='img/draw_img.png'/><itemSep></itemSep>"+action.imgId+" at ["+action.x+","+action.y+"]";
	break;
	default:
		console.error("==========");
		console.error("makeActionText for \""+action.action+"\" was no handled!");
		console.error(action);
		console.error("==========");
	}
	return retStr;
}

function selectObject(id) {
	makeInnerLists=[];
	
	actArea=document.getElementById("actionsList");
	actArea.innerHTML="";
	currentlyEditing=id;
	selectedObject=projectData.objects[currentlyEditing];
	if (selectedObject==null) return;

	keys=Object.keys(selectedObject.actionTopics);
	for (i=0; i!=keys.length; i++) {
		itemGroup=document.createElement("item");
		itemRegion=document.createElement("itemRegion");
		innerList=document.createElement("selectionList");
		
		itemGroup.setAttributeNode(document.createAttribute("embedded"));
		minimise=document.createElement("minimise");
		minimiseLink=document.createElement("a");
		minimiseLink.href="#";
		minimiseLink.text="-";
		minimiseLink.onmousedown=function() {
			if (this.text=="+") {
				this.parentNode.parentNode.parentNode.children[1].style.display="block";
				this.text="-";
			} else {
				this.parentNode.parentNode.parentNode.children[1].style.display="none";
				this.text="+";
			}
		};
		minimise.appendChild(minimiseLink);
		itemRegion.appendChild(minimise);
		itemRegion.appendChild(document.createTextNode(keys[i]));
		if (keys[i]=="KeyPress") {
			addKey=document.createElement("addKey");
			addKeyLink=document.createElement("a");
			addKeyLink.href="#";
			addKeyLink.text="[ADD]";
			addKeyLink.onmousedown=function(selectedObject) {return function() {
				document.getElementsByTagName("popup")[0].style.display="block";
				var box=document.getElementById("overlayBox");
				box.innerHTML="<h1>Adding Key Press Event</h2><div>"+
				"<table>"+
				"<tr><td>Key Code:</td><td><input type='text' onkeyup='this.value=event.keyCode;'></td></tr>"+
				"</table>";
				closeOverlay=function(actData, item){return function(){
					inputs=document.getElementsByTagName("popup")[0].children[1].getElementsByTagName("input");
					actData[inputs[0].value]=[];
					selectObject(currentlyEditing);
				}}(selectedObject.actionTopics.KeyPress[0].keys, itemGroup.children[1]);
			}}(selectedObject);
			addKey.appendChild(addKeyLink);
			itemRegion.appendChild(addKey);
		}
		innerList.setAttribute("name", "Action_Section_"+keys[i]);
		//innerList.style.display="none";
		elements=selectedObject.actionTopics[keys[i]];
		for (j=0; j!=elements.length; j++) {
			item=document.createElement("item");
			content=document.createElement("content");
			
			content.innerHTML=makeActionText(elements[j], item);
			item.setAttribute("moveTo", "Action_Section_*");
			
			item.appendChild(content);
			innerList.appendChild(item);
		}
		
		itemGroup.appendChild(itemRegion);
		itemGroup.appendChild(innerList);
		actArea.appendChild(itemGroup);
		makeList(innerList);
	}
	for (i=0; i!=makeInnerLists.length; i++) {
		makeList(document.getElementById(makeInnerLists[i]));
	}
	makeList(actArea);
}

function reloadObjects() {
	selArea=document.getElementById("objectsList");
	selArea.innerHTML="";
	for (i=0; i!=projectData.objects.length; i++) {
		item=document.createElement("item");
		content=document.createElement("content");
		
		content.innerHTML=projectData.objects[i].name;
		item.setAttribute("moveTo", "Objects|Instances");
		item.setAttributeNode(document.createAttribute("object"));
		item.onmousedown=function(){
			var selArea=document.getElementById("objectsList");
			for (ii=0; ii!=selArea.children.length; ii++) {
				if (selArea.children[ii].getAttribute("selected")!=null) selArea.children[ii].removeAttribute("selected");
				if (selArea.children[ii]==this) {
					this.setAttributeNode(document.createAttribute("selected"));
					selectObject(ii);
				}
			}

			mouseHeldOnObj=true;
			setTimeout(function(el){return function() {
				if (mouseHeldOnObj!=true) return;
				canMoveListElTo=el.getAttribute("moveto");
				if (canMoveListElTo==null) canMoveListElTo="*";
				listMoving=el.parentNode.parentNode;
				listMovingEl=el;
				outOfListReturnList=el.parentNode;
				mouseList.style.display="block";
				mouseList.style.width=el.offsetWidth+"px";
				for (i=0; i!=outOfListReturnList.children.length; i++) {
					if (outOfListReturnList.children[i]==el) outOfListReturnPos=i;
				}
				el.parentNode.removeChild(el);
				mouseList.innerHTML="";
				mouseList.appendChild(el);
			};}(this), 100);
		};
		
		item.appendChild(content);
		selArea.appendChild(item);
	}
	if (projectData.objects.length!=0 && selectedObject==null) {
		selArea.children[0].setAttributeNode(document.createAttribute("selected"));
		selectObject(0);
	}
	makeList(selArea);
}
