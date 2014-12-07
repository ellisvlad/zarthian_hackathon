function _p(id) { //Gets a pane
	panes=document.getElementsByTagName("pane");
	for (i=0; i!=panes.length; i++) {
		if (panes[i].getAttribute("pane_name")==id) return panes[i];
	}
	return null;
}
function addAfter(parentGuest, childGuest) { //Credit to http://stackoverflow.com/questions/7258185/javascript-append-child-after-element for this extract
	if (parentGuest.nextSibling) {
	  parentGuest.parentNode.insertBefore(childGuest, parentGuest.nextSibling);
	}
	else {
	  parentGuest.parentNode.appendChild(childGuest);
	}
}

var mouse_x=0, mouse_y=0;
var listMoving=null, listMovingEl=null, outOfListArea=false, outOfListReturnList=null, outOfListReturnPos=-1, canMoveListElTo=null;
var mouseList=null;
var currentlyEditing=null;
var movingEl=null;
var DefaultActionData=[];
closeOverlay=function(){};

function sanity_checks() {
	panes=document.getElementsByTagName("pane");
	for (i=0; i!=panes.length; i++) {
		if (panes[i].getAttribute("pane_name")==null) {
			console.error("The pane["+i+"] is missing a pane_name!");
			return false;
		}
		if (panes[i].getAttribute("pane_width")==null) {
			console.error("The pane[\""+panes[i].getAttribute("pane_name")+"\"] is missing a pane_width!");
			return false;
		}
		if (panes[i].getAttribute("pane_height")==null) {
			console.error("The pane[\""+panes[i].getAttribute("pane_name")+"\"] is missing a pane_height!");
			return false;
		}
	}
	return true;
}

function makePanes() {
	var offsetX=0, offsetY=0;

	panes=document.getElementsByTagName("pane");
	for (i=0; i!=panes.length; i++) {
		panes[i].style.left=offsetX+"px";
		if (panes[i].getAttribute("pane_width").indexOf("%")!=-1)
			widthPixels=window.innerWidth/100*parseInt(panes[i].getAttribute("pane_width"))-3;
		else
			widthPixels=parseInt(panes[i].getAttribute("pane_width"))-3;
		panes[i].style.width=widthPixels+"px";
		if (panes[i].getAttribute("addX")!=null) offsetX+=widthPixels+3;
		panes[i].style.top=offsetY+"px";
		if (panes[i].getAttribute("pane_height").indexOf("%")!=-1)
			heightPixels=(window.innerHeight-32)/100*parseInt(panes[i].getAttribute("pane_height"))-3;
		else
			heightPixels=parseInt(panes[i].getAttribute("pane_height"))-3;
		if (panes[i].getAttribute("addY")!=null) offsetY+=heightPixels+3;
		panes[i].style.height=heightPixels+"px";
	}
}

function makeList(list) {
	items=list.children;
	for (j=items.length-1; j>=0; j--) {
		//items[j].children[0].setAttribute("data", items[j].children[0].innerHTML);
		//var changedText=false;
		//while (items[j].children[0].offsetWidth>(items[j].offsetWidth-28-32)) {
		//	items[j].children[0].innerHTML=items[j].children[0].innerHTML.substr(0, items[j].children[0].innerHTML.length-1);
		//	changedText=true;
		//}
		//if (changedText) items[j].children[0].innerHTML+="...";
		if (items[j].getAttribute("embedded")==null) {
			//mover=makeMoverNode();
			//items[j].appendChild(mover);
			makeMovable(items[j]);
		}
	}
}

function makeLists() {
	lists=document.getElementsByTagName("selectionList");
	for (i=0; i!=lists.length; i++) {
		makeList(lists[i]);
	}
	checkListsScroll();
}

function checkListsScroll() {
	lists=document.getElementsByTagName("selectionList");
	for (i=0; i!=lists.length; i++) {
		if ((lists[i].children.length-1)*26>parseInt(lists[i].parentNode.style.height)) {
			lists[i].parentNode.style.scroll="show";
		}
	}
}

function newObject() {
	projectData.objects.push({
		name:"TEST",
		actionTopics:{
			Create:[],
			Draw:[],
			KeyPress:[]
		}
	});
	
	item=document.createElement("item");
	content=document.createElement("content");
	
	content.innerHTML=projectData.objects[projectData.objects.length-1].name;
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

function makeMovable(item) {
	if (item.parentNode!=null&&item.parentNode.id=="objectsList") return;
	var imgs=item.getElementsByTagName("img");
	if (imgs.length==0) return;
	var ii;
	for (ii=0; ii!=imgs.length; ii++) {
		imgs[ii].setAttributeNode(document.createAttribute("moveable"));
		imgs[ii].onmousedown=function(){
			canMoveListElTo=this.parentNode.parentNode.getAttribute("moveto");
			if (canMoveListElTo==null) canMoveListElTo="*";
			listMoving=this.parentNode.parentNode.parentNode.parentNode;
			listMovingEl=this.parentNode.parentNode;
			outOfListReturnList=this.parentNode.parentNode.parentNode;
			mouseList.style.display="block";
			mouseList.style.width=this.parentNode.parentNode.offsetWidth+"px";
			for (i=0; i!=outOfListReturnList.children.length; i++) {
				if (outOfListReturnList.children[i]==this.parentNode.parentNode) outOfListReturnPos=i;
			}
			this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
			mouseList.innerHTML="";
			mouseList.appendChild(this.parentNode.parentNode);
		};
	}
	item.ondblclick=function() {
		document.getElementsByTagName("popup")[0].style.display="block";
		var box=document.getElementById("overlayBox"), elData;

		for (i=0; i!=item.parentNode.children.length; i++) {
			if (item.parentNode.children[i]==this) outOfListReturnPos=i;
		}

		switch (item.parentNode.getAttribute("name")) {
		case "Action_Section_Create":
			elData=projectData.objects[currentlyEditing].actionTopics['Create'][outOfListReturnPos];
		break;
		case "Action_Section_Draw":
			elData=projectData.objects[currentlyEditing].actionTopics['Draw'][outOfListReturnPos];
		break;
		default:
			if (item.parentNode.getAttribute("name").substr(0,23)=="Action_Section_KeyPress") {
				elData=projectData.objects[currentlyEditing].actionTopics['KeyPress'][0].keys[item.parentNode.getAttribute("name").substr(23)][outOfListReturnPos];
			} else {
				console.error("==========");
				console.error("Double clicked undefined list! Del:["+item.parentNode.getAttribute("name")+"]");
				console.error("==========");
			}
		}
		
		switch (elData.action) {
		case "prompt":
			box.innerHTML="<img src='img/prompt.png'/><h1>Editing Prompt Box</h2><div>"+
			"<table>"+
			"<tr><td>Question:</td><td><input type='text' value="+elData.question+"></td></tr>"+
			"<tr><td>Default Text:</td><td><input type='text' value="+elData.defaultText+"></td></tr>"+
			"<tr><td>Store Variable:</td><td><input type='text' value="+elData.answer+"></td></tr>"+
			"</table>";
			closeOverlay=function(actData, item){return function(){
				inputs=document.getElementsByTagName("popup")[0].children[1].getElementsByTagName("input");
				actData.question='"'+inputs[0].value+'"';
				actData.defaultText='"'+inputs[1].value+'"';
				actData.answer=inputs[2].value;
				item.children[0].innerHTML=makeActionText(actData, item);
			}}(elData, item);
		break;
		case "alert":
			box.innerHTML="<img src='img/message.png'/><h1>Editing Message Box</h2><div>"+
			"<table>"+
			"<tr><td>Text:</td><td><input type='text' value="+elData.text+"></td></tr>"+
			"</table>";
			closeOverlay=function(actData, item){return function(){
				inputs=document.getElementsByTagName("popup")[0].children[1].getElementsByTagName("input");
				actData.text='"'+inputs[0].value+'"';
				item.children[0].innerHTML=makeActionText(actData, item);
			}}(elData, item);
		break;
		case "text_properties":
			box.innerHTML="<img src='img/prompt.png'/><h1>Editing Text Properties</h2><div>"+
			"<table>"+
			"<tr><td>Color:</td><td><input type='text' value="+elData.color+"></td></tr>"+
			"<tr><td>Font:</td><td><input type='text' value="+elData.font+"></td></tr>"+
			"<tr><td>Size:</td><td><input type='text' value="+elData.size+"></td></tr>"+
			"</table>";
			closeOverlay=function(actData, item){return function(){
				inputs=document.getElementsByTagName("popup")[0].children[1].getElementsByTagName("input");
				actData.color=inputs[0].value;
				actData.font=inputs[1].value;
				actData.size=inputs[2].value;
				item.children[0].innerHTML=makeActionText(actData, item);
			}}(elData, item);
		break;//TODO They find me...
		case "draw_text":
			box.innerHTML="<img src='img/prompt.png'/><h1>Editing Draw Text</h2><div>"+
			"<table>"+
			"<tr><td>Text:</td><td><input type='text' value="+elData.text+"></td></tr>"+
			"<tr><td>x:</td><td><input type='text' value="+elData.x+"></td></tr>"+
			"<tr><td>y:</td><td><input type='text' value="+elData.y+"></td></tr>"+
			"</table>";
			closeOverlay=function(actData, item){return function(){
				inputs=document.getElementsByTagName("popup")[0].children[1].getElementsByTagName("input");
				actData.text='"'+inputs[0].value+'"';
				actData.x=+inputs[1].value;
				actData.y=inputs[2].value;
				item.children[0].innerHTML=makeActionText(actData, item);
			}}(elData, item);
		break;
		case "var":
			box.innerHTML="<img src='img/prompt.png'/><h1>Editing Variable Assignment</h2><div>"+
			"<table>"+
			"<tr><td>Variable:</td><td><input type='text' value="+elData.variable+"></td></tr>"+
			"<tr><td>Value:</td><td><input type='text' value="+elData.value+"></td></tr>"+
			"</table>";
			closeOverlay=function(actData, item){return function(){
				inputs=document.getElementsByTagName("popup")[0].children[1].getElementsByTagName("input");
				actData.variable=inputs[0].value;
				actData.value=inputs[1].value;
				item.children[0].innerHTML=makeActionText(actData, item);
			}}(elData, item);
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
	}
}

function pressMouse() {
	document.getElementsByTagName("mouseDropDownMenu")[0].innerHTML="";
	document.getElementsByTagName("mouseDropDownMenu")[0].style.display="none";
}
function releaseMouse() {
	mouseHeldOnObj=false;
	movingEl=null;
	if (listMovingEl!=null) {
		if (listMoving==null) {
			listMovingEl=null;
			mouseList.style.display="none";
			return;
		}
		items=listMoving.children;
		if (outOfListArea) {
			item=mouseList.children[0];
			outOfListReturnList.insertBefore(item, outOfListReturnList.children[outOfListReturnPos]);
		} else {
			item=mouseList.children[0];
			if (listMoving.getAttribute("name")=="Instances") {
				if (outOfListReturnList.getAttribute("name")!="Instances") {
					outOfListReturnList.insertBefore(item, outOfListReturnList.children[outOfListReturnPos]);
					content=document.createElement("content");
					content.appendChild(document.createTextNode(item.children[0].innerText));
					item=document.createElement("item");
					item.setAttribute("moveTo", "Instances");
					item.appendChild(content);
					item.onmousedown=function(){
						var selArea=document.getElementById("instancesList");
						canMoveListElTo=this.getAttribute("moveto");
						if (canMoveListElTo==null) canMoveListElTo="*";
						listMoving=this.parentNode.parentNode;
						listMovingEl=this;
						outOfListReturnList=this.parentNode;
						mouseList.style.display="block";
						mouseList.style.width=this.offsetWidth+"px";
						for (i=0; i!=outOfListReturnList.children.length; i++) {
							if (outOfListReturnList.children[i]==this) outOfListReturnPos=i;
						}
						this.parentNode.removeChild(this);
						mouseList.innerHTML="";
						mouseList.appendChild(this);
					};
				}
			}
			for (j=0; j!=items.length; j++) {
				if (items[j].nodeName=="SELECTPAD") {
					removed=null;
					if (outOfListReturnList!=null) {
						if (outOfListReturnList.getAttribute("name")=="Objects" && listMoving.getAttribute("name")=="trash") {
							if (!confirm("You about to delete \""+projectData.objects[outOfListReturnPos].name+"\"\n\nDeleting objects is irreversable!")) {
								outOfListReturnList.insertBefore(item, outOfListReturnList.children[outOfListReturnPos]);
								listMovingEl=null;
								mouseList.style.display="none";
								return;
							}
							for (k=projectData.instances.length-1; k>=0; k--) {
								if (projectData.instances[k]==projectData.objects[outOfListReturnPos]) {
									projectData.instances.splice(k,1);
									lists[0].removeChild(lists[0].children[k]);
								}
							}
						}
					
						switch (outOfListReturnList.getAttribute("name")) {
						case "Action_Section_Create":
							removed=projectData.objects[currentlyEditing].actionTopics['Create'][outOfListReturnPos];
							projectData.objects[currentlyEditing].actionTopics['Create'].splice(outOfListReturnPos,1);
						break;
						case "Action_Section_Draw":
							removed=projectData.objects[currentlyEditing].actionTopics['Draw'][outOfListReturnPos];
							projectData.objects[currentlyEditing].actionTopics['Draw'].splice(outOfListReturnPos,1);
						break;
						case "Objects":
							removed=projectData.objects[outOfListReturnPos];
							if (listMoving.getAttribute("name")!="Instances")
								projectData.objects.splice(outOfListReturnPos,1);
						break;
						case "Instances":
							removed=projectData.instances[outOfListReturnPos];
							projectData.instances.splice(outOfListReturnPos,1);
						break;
						default:
							if (outOfListReturnList.getAttribute("name").substr(0,23)=="Action_Section_KeyPress") {
								removed=projectData.objects[currentlyEditing].actionTopics['KeyPress'][0].keys[outOfListReturnList.getAttribute("name").substr(23)][outOfListReturnPos];
								projectData.objects[currentlyEditing].actionTopics['KeyPress'][0].keys[outOfListReturnList.getAttribute("name").substr(23)].splice(outOfListReturnPos,1);
							} else {
								console.error("==========");
								console.error("Moving to undefined list! Del:["+outOfListReturnList.getAttribute("name")+"]");
								console.error("==========");
							}
						}
					} else {
						removed=newElementData;
					}
					
					switch (listMoving.getAttribute("name")) {
					case "Action_Section_Create":
						projectData.objects[currentlyEditing].actionTopics['Create'].splice(j,0,removed);
					break;
					case "Action_Section_Draw":
						projectData.objects[currentlyEditing].actionTopics['Draw'].splice(j,0,removed);
					break;
					case "Objects":
						projectData.objects.splice(j,0,removed);
					break;
					case "Instances":
						projectData.instances.splice(j,0,removed);
					break;
					case "trash":
					break;
					default:
						if (listMoving.getAttribute("name").substr(0,23)=="Action_Section_KeyPress") {
							projectData.objects[currentlyEditing].actionTopics['KeyPress'][0].keys[listMoving.getAttribute("name").substr(23)].splice(j,0,removed);
						} else {
							console.error("==========");
							console.error("Moving to undefined list! Add:["+listMoving.getAttribute("name")+"]");
							console.error("==========");
						}
					}
					
					addAfter(items[j], item);
					listMoving.removeChild(items[j]);
				}
			}
		}
		
		listMovingEl=null;
		mouseList.style.display="none";
	}
}

function initActionSelection() {
	var str="", i;
	str+="<action style='background-image:url(img/prompt.png);'></action>";
	DefaultActionData.push({
		action:"prompt",
		question:"\"Question?\"",
		defaultText:"\"Answer\"",
		answer:"storeVariable"
	});
	str+="<action style='background-image:url(img/message.png);'></action>";
	DefaultActionData.push({
		action:"alert",
		text:"\"Message\""
	});
	str+="<action style='background-image:url(img/text_properties.png);'></action>";
	DefaultActionData.push({
		action:"text_properties",
		color:"White",
		font:"Arial",
		size:"12pt"
	});
	str+="<action style='background-image:url(img/draw_text.png);'></action>";
	DefaultActionData.push({
		action:"draw_text",
		text:"\"Text\"",
		x:"10",
		y:"10"
	});
	str+="<action style='background-image:url(img/var.png);'></action>";
	DefaultActionData.push({
		action:"var",
		variable:"x",
		value:"y"
	});
	str+="<action style='background-image:url(img/load_img.png);'></action>";
	DefaultActionData.push({
		action:"load_image",
		src:"src",
		imgId:"storeVariable"
	});
	str+="<action style='background-image:url(img/draw_img.png);'></action>";
	DefaultActionData.push({
		action:"draw_image",
		imgId:"storeVariable",
		x:"10",
		y:"10"
	});
	
	acts=document.getElementsByTagName("pane")[3];
	acts.innerHTML=str;
	
	actionsList=document.getElementsByTagName("action");
	for (i=0; i!=actionsList.length; i++) {
		actionsList[i].onmousedown=function(action) {return function() {
			canMoveListElTo="Action_Section_*";
			listMoving=null;
			newElementData=action;
			
			item=document.createElement("item");
			content=document.createElement("content");
			content.innerHTML=makeActionText(action, item);
			item.appendChild(content);
			makeMovable(item);
			item.setAttribute("moveTo", "Action_Section_*");

			listMovingEl=item;
			outOfListReturnList=null;
			mouseList.style.display="block";
			mouseList.style.width="200px";
			outOfListReturnPos=0;
			mouseList.innerHTML="";
			mouseList.appendChild(item);
		}}(DefaultActionData[i]);
	}
}

function remakeBorders() {
	borders=document.getElementsByTagName("borders")[0];
	panes=document.getElementsByTagName("panes")[0].children;
	
	var x=0, y=32;

	for (i=0; i!=3; i++) {
		item=document.createElement("border");
		item.setAttributeNode(document.createAttribute("y"));
		item.setAttribute("paneId", i);
		item.onmousedown=function(){movingEl=this;};
		x+=parseInt(panes[i].style.width);
		item.style.left=x+"px";
		x+=4;
		borders.appendChild(item);
	}
	for (i=3; i!=4; i++) {
		item=document.createElement("border");
		item.setAttributeNode(document.createAttribute("x"));
		item.setAttribute("paneId", i);
		item.onmousedown=function(){movingEl=this;};
		y+=parseInt(panes[i].style.height);
		item.style.left=x+"px";
		item.style.top=y+"px";
		y+=4;
		borders.appendChild(item);
	}
}

function resizePaneX(paneId, paneIdpp) {
	var oldArea=parseInt(panes[paneIdpp].style.width)+parseInt(panes[paneIdpp].style.left);
	var sizeOK=true, moveEl=true;
	if (mouse_x<parseInt(panes[paneId].style.left)+130) {
		moveEl=false;
		movingEl.style.left=parseInt(panes[paneId].style.left)+130+"px";
	}
	if (mouse_x==parseInt(panes[paneId].style.left)+(paneId==1?200:130)) sizeOK=false;
	if (mouse_x>oldArea-(paneId==1?200:130)) {
		moveEl=false;
		movingEl.style.left=oldArea-(paneId==1?200:130)+"px";
	}
	if (mouse_x==oldArea-(paneId==1?200:130)) sizeOK=false;
	
	if (sizeOK) {
		if (moveEl) movingEl.style.left=mouse_x+"px";
		
		panes[paneId].style.width=parseInt(movingEl.style.left)-parseInt(panes[paneId].style.left)-2+"px";
		panes[paneIdpp].style.left=parseInt(movingEl.style.left)+4+"px";//parseInt(panes[movingEl.getAttribute("paneId")].style.left)+parseInt(panes[parseInt(movingEl.getAttribute("paneId"))+1].style.width)+"px";
		panes[paneIdpp].style.width=oldArea-parseInt(movingEl.style.left)-4+"px";
	}
}
function resizePaneY(paneId, paneIdpp) {
	var oldArea=parseInt(panes[paneIdpp].style.height)+parseInt(panes[paneIdpp].style.top);
	var sizeOK=true, moveEl=true;
	if (mouse_y<parseInt(panes[paneId].style.top)+130) {
		moveEl=false;
		movingEl.style.top=parseInt(panes[paneId].style.top)+130+"px";
	}
	if (mouse_y==parseInt(panes[paneId].style.top)+(paneId==1?200:130)) sizeOK=false;
	if (mouse_y>oldArea-(paneId==1?200:130)) {
		moveEl=false;
		movingEl.style.top=oldArea-(paneId==1?200:130)+"px";
	}
	if (mouse_y==oldArea-(paneId==1?200:130)) sizeOK=false;
	
	if (sizeOK) {
		if (moveEl) movingEl.style.top=mouse_y+"px";
		
		panes[paneId].style.height=parseInt(movingEl.style.top)-32-parseInt(panes[paneId].style.top)+"px";
		panes[paneIdpp].style.top=parseInt(movingEl.style.top)-32+"px";//parseInt(panes[movingEl.getAttribute("paneId")].style.left)+parseInt(panes[parseInt(movingEl.getAttribute("paneId"))+1].style.width)+"px";
		panes[paneIdpp].style.height=oldArea-parseInt(movingEl.style.top)+32+"px";
	}
}

function step() {
	if (movingEl!=null) {
		panes=document.getElementsByTagName("panes")[0].children;
		if (movingEl.getAttribute("y")!=null) {
			var paneId=parseInt(movingEl.getAttribute("paneId"));
			if (paneId==2) {
				for (i=paneId, paneId++; paneId!=5; paneId++) 
					resizePaneX(i, paneId);
				borders=document.getElementsByTagName("borders")[0].children;
				for (i=3; i!=borders.length; i++) {
					borders[i].style.left=panes[4].style.left;
				}
			} else
				resizePaneX(paneId, paneId+1);
		}
		if (movingEl.getAttribute("x")!=null) {
			var paneId=parseInt(movingEl.getAttribute("paneId"));
			resizePaneY(paneId, paneId+1);
		}
	}
	if (listMovingEl!=null) {
		lists=document.getElementsByTagName("selectionList");
		canMoveListElToList=canMoveListElTo.split("|");
		for (i=0; i!=lists.length-1; i++) {
			rect=lists[i].getBoundingClientRect();
			if (rect.left<mouse_x && rect.left+rect.width>mouse_x && rect.top<mouse_y && rect.top+rect.height+32>mouse_y) {
				for (j=0; j!=canMoveListElToList.length; j++) {
					if (canMoveListElToList[j]==lists[i].getAttribute("name") ||
							(lists[i].getAttribute("name")!=null&&lists[i].getAttribute("name")!="Action_Section_KeyPress"&&
							 canMoveListElToList[j].charAt(canMoveListElToList[j].length-1)=='*'&&
							 canMoveListElToList[j].substr(0,canMoveListElToList[j].length-1)==lists[i].getAttribute("name").substr(0,canMoveListElToList[j].length-1))) {
						//Cleanup first
						if (listMoving!=null) {
							items=listMoving.children;
							for (k=0; k<items.length; k++) {
								if (items[k].nodeName=="SELECTPAD") listMoving.removeChild(items[k]);
							}
						}
						
						listMoving=lists[i];
					}
				}
			}
		}
		
		mouseList.style.display="block";
		mouseList.style.top=mouse_y+4+"px";
		mouseList.style.left=mouse_x+4+"px";
		var addAfterEl=null;
		if (listMoving!=null) {
			items=listMoving.children;
			for (j=0; j<items.length; j++) {
				if (items[j].nodeName=="SELECTPAD") listMoving.removeChild(items[j]);
			}
			rect=listMoving.getBoundingClientRect();
			rectMouse=mouseList.getBoundingClientRect();
			outOfListArea=rectMouse.left<rect.left;
			outOfListArea|=rectMouse.left>rect.left+rect.width;
			outOfListArea|=rectMouse.top<rect.top;
			outOfListArea|=rectMouse.top>rect.top+rect.height+32;
			
			if (mouse_x>trash.offsetLeft && mouse_x<trash.offsetLeft+trash.offsetWidth && mouse_y<32) {
				items=listMoving.children;
				for (k=0; k<items.length; k++) {
					if (items[k].nodeName=="SELECTPAD") listMoving.removeChild(items[k]);
				}
				
				listMoving=trash;
				outOfListArea=false;
			}
			
			for (j=0; j!=items.length; j++) {
				if (items[j].offsetTop<mouseList.offsetTop-mouseList.offsetHeight && !outOfListArea) addAfterEl=items[j];
			}
			if (!outOfListArea) {
				var sel=document.createElement("selectPad");
				//if (listMoving.getAttribute("name")=="Instances") sel.innerText="Insert";
				if (addAfterEl==null)
					listMoving.insertBefore(sel, listMoving.children[0]);
				else
					addAfter(addAfterEl, sel);
			}
		}
	}
}

function load() {
	if (!sanity_checks()) { //Error checking
		return;
	}

	document.onmousemove=function(e) {
		mouse_x=e.x; mouse_y=e.y;
	};
	document.onmousedown=pressMouse;
	document.onmouseup=releaseMouse;
	makePanes();
	remakeBorders();
	initMenu();
	initActionSelection();
	
	document.getElementsByTagName("popup")[0].children[0].onmousedown=function() {
		document.getElementsByTagName("popup")[0].style.display="none";
		closeOverlay();
	}

	trash=document.getElementById("trashList");
	lists=document.getElementsByTagName("selectionList");
	for (i=0; i!=lists.length; i++) {
		if (lists[i].getAttribute("mouseList")!=null) {
			mouseList=lists[i];
			mouseList.style.position="absolute";
			mouseList.style.display="none";
			document.body.appendChild(mouseList);
		}
	}
	
	setInterval(step, 30);
}
