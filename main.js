const FILE_URL  = "./assets/sample_01.png";
const MODEL_URL = "./weights";

let img, canvas, context;

window.onload = (event)=>{
	console.log("onload!");
	loadModels();
}

async function loadModels(){
	console.log("loadModels");
	Promise.all([
		faceapi.loadSsdMobilenetv1Model(MODEL_URL),
		faceapi.loadFaceLandmarkModel(MODEL_URL),
		faceapi.loadFaceRecognitionModel(MODEL_URL)
	]).then(detectAllFaces);
}

async function detectAllFaces(){
	console.log("detectAllFaces");
	// 以下、画像解析を行います。

	// 1, 画像の読み込み
	img = await faceapi.fetchImage(FILE_URL);

	// 2, HTMLからキャンバスを取得し画像を描画
	canvas = document.getElementById("myCanvas");
	canvas.width = img.width;
	canvas.height = img.height;
	context = canvas.getContext("2d");
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.drawImage(img, 0, 0);// 画像の描画

	// 3, 顔認識の実行と認識結果の取得
	const iSize = {width: img.width, height: img.height};
	const fData = await faceapi.detectAllFaces(img).withFaceLandmarks();
	
	// 4, 認識結果のリサイズ
	const rData = await faceapi.resizeResults(fData, iSize);
	rData.forEach(data=>{drawResult(data);});
}

function drawResult(data){
	console.log("drawResult!!");

	const det = data.detection;// 長方形のデータ
	const mrks = data.landmarks.positions;
    const box = det.box;

	context.fillStyle = "red";
	context.strokeStyle = "red";
	context.lineWidth = 4;
	context.strokeRect(box.x, box.y, box.width, box.height);// 長方形の描画

    // Canvas APIを用いる
    drawNose(mrks);// 鼻を描きます
	drawGrasses(mrks);// メガネを描きます
}

// 鼻メガネを描いてみよう
function drawNose(mrks){
	context.strokeStyle = "black";
	context.lineWidth = 2;
	context.beginPath();
	for(let i=27; i<35; i++){
		let fX = mrks[i].x;
		let fY = mrks[i].y;
		let tX = mrks[i+1].x;
		let tY = mrks[i+1].y;
		context.moveTo(fX, fY);
		context.lineTo(tX, tY);
	}
	context.stroke();
}

function drawGrasses(mrks){
	context.strokeStyle = "black";
	context.lineWidth = 2;
	context.beginPath();
	context.moveTo(mrks[39].x, mrks[39].y);
	context.lineTo(mrks[42].x, mrks[42].y);
	context.stroke();
	// 左
	const lX = (mrks[39].x + mrks[36].x)/2;
	const lY = (mrks[41].y + mrks[38].y)/2;
	const lR = (mrks[39].x - mrks[36].x);
	context.beginPath();
	context.arc(lX, lY, lR, 0, Math.PI*2);
	context.stroke();
	// 右
	const rX = (mrks[45].x + mrks[42].x)/2;
	const rY = (mrks[46].y + mrks[43].y)/2;
	const rR = (mrks[45].x - mrks[42].x);
	context.beginPath();
	context.arc(rX, rY, rR, 0, Math.PI*2);
	context.stroke();
}