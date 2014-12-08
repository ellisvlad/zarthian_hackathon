<?php
function compileHeader($compileOutput) {
	$compileOutput.=file_get_contents("compiler_data/header");
	return $compileOutput;
}
function compileFooter($compileOutput) {
	$compileOutput.=file_get_contents("compiler_data/footer");
	return $compileOutput;
}
function handleElements($elements, $compileOutput) {
	foreach ($elements as $j=>$act) {
		switch ($act->action) {
			case "prompt":
				$compileOutput.="    ".$act->answer."=prompt(".$act->question.", ".$act->defaultText.");\n";
			break;
			case "alert":
				$compileOutput.="    alert(".$act->text.");\n";
			break;
			case "var":
				$compileOutput.="    ".$act->variable."=".$act->value.";\n";
			break;
			case "load_image":
				$compileOutput.="    ".$act->imgId."=new Image();\n";
				$compileOutput.="    ".$act->imgId.".src=\"".$act->src."\";\n";
			break;
			case "text_properties":
				$compileOutput.="    __drawContext.font=\"".$act->size." ".$act->font."\";\n";
				$compileOutput.="    __drawContext.fillStyle=\"blue\";\n";
			break;
			case "draw_text":
				$compileOutput.="    __drawContext.fillText(".$act->text.", ".$act->x.", ".$act->y.");\n";
			break;
			case "draw_image":
				$compileOutput.="    __drawContext.drawImage(".$act->imgId.", ".$act->x.", ".$act->y.");\n";
			break;
			default: die("Action Not Defined! [".$act->action."]");
		}
	}
	return $compileOutput;
}
function compile($data) {
	$compileOutput="";
	$compileOutput=compileHeader($compileOutput);
	
	$objectMap=array();

	for ($i=0; $i!=count($data->objects); $i++) {
		$obj=$data->objects[$i];
		$objectName="object_".$i;
		$objectMap[$data->objects[$i]->name]=$objectName;
		
		$compileOutput.="var ".$objectName."={\n";
		
		foreach ($obj->actionTopics as $section=>$elements) {
			switch ($section) {
			case "Create":
				$compileOutput.="  create: function() {\n";
			break;
			case "Draw":
				$compileOutput.="  draw: function() {\n";
			break;
			case "KeyPress":
				$compileOutput.="  keypresshandler: function(e) {\n";
			break;
			default: die("Action Type Not Defined! [".$section."]");
			}
			if ($section=="KeyPress") {
				if (count($elements)!=0) {
					//$compileOutput.="  	console.log(e.keyCode);\n";
					$compileOutput.="  	switch (e.keyCode) {\n";
					foreach ($elements[0]->keys as $key=>$keyEvents) {
						$keyCode=$key;
						$compileOutput.="  	case ".$keyCode.":\n";
						$compileOutput=handleElements($keyEvents, $compileOutput);
						$compileOutput.="  	break;\n";
					}
					$compileOutput.="  	}\n";
					$compileOutput.="  },\n";
					continue;
				}
			} else {
				$compileOutput=handleElements($elements, $compileOutput);
			}
			$compileOutput.="  },\n";
		}
		$compileOutput.="}\n";
	}
	
	$compileOutput.="__instances=[]\n";

	$compileOutput.="function __create_instance(object) {\n";
	$compileOutput.="  var inst={};\n";
	$compileOutput.="  for (i=0; i!=Object.keys(object).length; i++) {\n";
	$compileOutput.="    switch (typeof object[Object.keys(object)[i]]) {\n";
	$compileOutput.="    case 'function': inst[Object.keys(object)[i]]=object[Object.keys(object)[i]]; break;\n";
	$compileOutput.="    default: console.error('Undefined type during instanciation! ['+(typeof object[Object.keys(object)[i]])+']');\n";
	$compileOutput.="    }\n";
	$compileOutput.="  }\n";
	$compileOutput.="  return inst;\n";
	$compileOutput.="}\n";

	$compileOutput.="function __drawTimer() {\n";
	$compileOutput.="  __drawContext.clearRect(0,0, window.innerWidth,window.innerHeight)\n";
	$compileOutput.="  for (i=0; i!=__instances.length; i++) {\n";
	$compileOutput.="    __instances[i].draw(__drawContext);\n";
	$compileOutput.="  }\n";
	$compileOutput.="}\n";

	$compileOutput.="function __keyDownHandler(e) {\n";
	$compileOutput.="  for (i=0; i!=__instances.length; i++) {\n";
	$compileOutput.="    __instances[i].keypresshandler(e);\n";
	$compileOutput.="  }\n";
	$compileOutput.="}\n";
	
	$compileOutput.="function __init() {\n";
	for ($i=0; $i!=count($data->instances); $i++) {
		$compileOutput.="  __instances.push(__create_instance(".$objectMap[$data->instances[$i]]."));\n";
	}
	if (! (isset($_POST['update'])&&$_POST['update']=='true')) {
		$compileOutput.="\n  for (i=0; i!=__instances.length; i++) {\n";
		$compileOutput.="    __instances[i].create();\n";
		$compileOutput.="  }\n";
	}
	$compileOutput.="  __drawContext=document.getElementById('__game').getContext('2d');\n";
	$compileOutput.="  document.getElementById('__game').width  = window.innerWidth;\n";
	$compileOutput.="  document.getElementById('__game').height = window.innerHeight;\n";
	$compileOutput.="  document.getElementById('__game').style.width  = window.innerWidth+'px';\n";
	$compileOutput.="  document.getElementById('__game').style.height = window.innerHeight+'px';\n";
	$compileOutput.="  window.addEventListener('keydown', __keyDownHandler, true);\n";
	$compileOutput.="  setInterval(__drawTimer, 33)\n";
	$compileOutput.="}";
	

	$compileOutput=compileFooter($compileOutput);
	return $compileOutput;
}


if (isset($_POST['data'])) {
	$data=json_decode($_POST['data']);
	
	//print_r($data); echo "\n\n\n\n";

	if (empty($_POST['final'])) {
		echo compile($data);
	} else {
		file_put_contents("/var/www/runnables/".$_POST['pid'].".html", compile($data));
		echo "<script>alert('Exported successfully!\\n\\nYou will now be taken to the export url'); document.location=document.location.origin+'/runnables/".$_POST['pid'].".html'</script>";
	}
	die();
}
?>

<h2>TEXT HERE</h2>