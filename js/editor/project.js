projectData={
	objects:[{
		name:"Demo Object",
		actionTopics:{
			Create:[{
				action:"prompt",
				question:"\"What's your name?\"",
				defaultText:"\"ellisvlad\"",
				answer:"this.name"
			},{
				action:"alert",
				text:"\"This is a demo :D\""
			},{
				action:"prompt",
				question:"\"How old are you?\"",
				defaultText:"\"18\"",
				answer:"this.age"
			}],
			Draw:[{
				action:"text_properties",
				color:"White",
				font:"Arial",
				size:"24pt"
			},{
				action:"draw_text",
				text:"\"Hi there \"+this.name+\"! You are \"+this.age+\" years old.\"",
				x:"32",
				y:"32"
			}],
			KeyPress:[]
		}
	},{
		name:"Demo Object2",
		actionTopics:{
			Create:[{
				action:"var",
				variable:"x",
				value:"32"
			},{
				action:"var",
				variable:"y",
				value:"32"
			},{
				action:"load_image",
				src:"http://www.html5canvastutorials.com/demos/assets/darth-vader.jpg",
				imgId:"playerImg"
			}],
			Draw:[{
				action:"draw_image",
				imgId:"playerImg",
				x:"x",
				y:"32"
			},{
				action:"text_properties",
				color:"White",
				font:"Arial",
				size:"24pt"
			},{
				action:"draw_text",
				text:"\"Use arrow keys to move!\"",
				x:"16",
				y:"20+4"
			}],
			KeyPress:[{
				action:"keyPress",
				keys:{
					_LEFT:[{
						action:"var",
						variable:"x",
						value:"x-1"
					}],
					_RIGHT:[{
						action:"var",
						variable:"x",
						value:"x+1"
					}]
				}
			}]
		}
	}],
	instances:[]
};

selectedObject=null;
makeInnerLists=[];

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
			retStr+="<itemregion data='keyPress"+keyAction+"'>"+keyAction+"</itemregion><selectionlist id='innerlist_"+makeInnerLists.length+"' name='Action_Section_KeyPress"+keyAction+"'>";
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

setTimeout(function() {reloadObjects();}, 100);