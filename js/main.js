'use strict';

var ws = {};

const constraints = window.constraints = {
    audio: false,
    video: { facingMode: "environment",
        width: { min: 480, max: 640 },
        height:{ min: 640, max: 640 }
    }
};

var scan = {
    interval: 300,
    scaledW : 400,
    scaledH : 534,
    imagedata: null
};

scan.captureToCanvas = function() {
    try{
        if(scan.video.videoWidth == 0) {
            setTimeout(scan.captureToCanvas, scan.interval);
            return;
        }
        try{
            const start = new Date().getTime();
            scan.context.drawImage(scan.video,0,0,scan.scaledW,scan.scaledH);
            scan.imagedata = scan.context.getImageData(0, 0, scan.scaledW, scan.scaledH);
            let grayImg = scan.grayscale(scan.imagedata.data);
            let compressed = pako.deflate(grayImg, { level: 9 });

            // for(let i = 0; i < grayImg.length; i++){
            //     frameData[i] = [grayImg[i], grayImg[i], grayImg[i], 255];
            // }
            // var png = UPNG.encode(frameData, scan.scaledW, scan.scaledH, 0);
            // var png = UPNG.encodeLL(scan.imagedata.data, scan.scaledW, scan.scaledH, 1, 0);

	        ws.uploadImage(compressed);
            let time = new Date().getTime()-start;
            console.log("time taken : "+(new Date().getTime()-start));
            if(time>scan.interval){
                scan.captureToCanvas();
            } else {
                setTimeout(scan.captureToCanvas, (scan.interval-time));
            }
        } catch(e){
            console.log(e);
            setTimeout(scan.captureToCanvas, scan.interval);
        };
    } catch(e){
        console.log(e);
        setTimeout(scan.captureToCanvas, scan.interval);
    };
}

scan.grayscale = function(data) {
    let ret = new Uint8Array(new ArrayBuffer(scan.scaledW*scan.scaledH));
    for (let y = 0; y < scan.scaledH; y++){
        let yy = y*scan.scaledW;
        for (let x = 0; x < scan.scaledW; x++){
            let p = (x+yy)<<2;// <<2 is bitwise operation of *4
            ret[x+yy] = (data[p]*33 + data[p + 1]*34 + data[p + 2]*33)/100;
        }
    }
    return ret;
}

async function initialize() {
    ws.instance = new window.WebSocket("ws://localhost:8888");

    ws.instance.onopen = function(e) {
        console.log('ws on open');
        ws.instance.send("My name is John");
    };

    ws.instance.onmessage = function(message) {
        if(message){
            ws.instance.close();
            alert("on message : " + message);
            //go to message page
        }
    }

    ws.instance.onerror = function(err) {
        console.log("error : "+JSON.stringify(err, ["message", "arguments", "type", "name"]));
    }

    ws.uploadImage = function(file) {
        if(ws.instance.readyState==1){
            ws.instance.send(file);
            console.log('file sent');
        }
    }

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    const video = document.querySelector('video');
    window.stream = stream;
    video.srcObject = stream;
    scan.video = video;
    scan.c = document.getElementById('canvas');
    scan.context = scan.c.getContext('2d');
    scan.video.src = stream;
    scan.c.style.display = 'none';
    scan.captureToCanvas();
}

window.onload = (function(){
    return function(){
        initialize();
    };
})();

