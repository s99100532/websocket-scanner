window.onload = function () {

    // upload then show the image
    document.querySelector("#image-upload").addEventListener('change', function (evt) {
        var tgt = evt.target || window.event.srcElement,
            files = tgt.files;
        // 
        if (FileReader && files && files.length) {
            var fr = new FileReader();
            fr.onload = function () {
                var image = document.querySelector("#image-preview img");
                image.src = fr.result;
            }
            fr.readAsDataURL(files[0]);
        }

    });


    // compress then show the compressed image
    document.querySelector("#btn-compress").addEventListener('click', function () {
        var files = document.querySelector("#image-upload").files;

        console.log(files);

        var fr = new FileReader();

        fr.onload = function () {
            if (fr.readyState == FileReader.DONE) {
                var img = new Image();
                var canvas = document.querySelector("#image-compressed");
                var context = canvas.getContext("2d");
                img.src = fr.result;
                context.drawImage(img, 0, 0, 300, 200);
                // 0.5 is compress rate
                const compressed = canvas.toDataURL("image/jpeg", 0.3);
                img.src = compressed;
                context.drawImage(img, 0, 0, 200, 200);

            }

        }
        fr.readAsDataURL(files[0]);

    })

    document.querySelector("#download").addEventListener('click', download);
}


var download = function () {
    var link = document.createElement('a');
    link.download = 'XXX.jpg';
    link.href = document.getElementById('image-compressed').toDataURL("image/jpeg")
    link.click();
}