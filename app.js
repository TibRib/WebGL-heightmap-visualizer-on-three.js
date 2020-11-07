var array = new Array(1);
var minH;

var openFile = function(file) {
  console.log(file);
    var input = file.target;

    var reader = new FileReader();
    reader.onload = function(){
      var dataURL = reader.result;
      var output = document.getElementById('output');

      output.src = dataURL;
    };
    reader.readAsDataURL(input.files[0]);

    //Read the image pixel data : 
    var img = document.getElementById("output");
    var imgh, imgw;

    img.onload = function(){
      imgh = img.height;
        imgw = img.width;
      if(imgh > 1024 || imgw> 1024){
        alert("Image resolution is too large, reloading the page...");
        window.location.reload(false); 
        return;
      }else{
        var c = document.getElementById("myCanvas");
        var ctx = c.getContext("2d");
        c.height = img.height;
        c.width = img.width;
        
        
        ctx.drawImage(img, 0, 0);
        img.style.display = 'none';

        var imageData = ctx.getImageData(0, 0, c.width, c.height);
        var data = imageData.data;
          
        var cpt=0;
        array = new Array(img.width * img.height);
        minH= data[0];
        //alert("new Array of "+ array.length);
          for (var i = 0; i < data.length; i += 4) {
            array[cpt] =  data[i];
            cpt++;
            if(minH < data[i]) minH = data[i];
          }

       var p = document.getElementById("content");
       p.innerText = cpt.toString() + " Vertices";

        init();
        animate();

      }

    };

  };

  /*If VR is enabled, you need a preselected file in order to get the render */
  //Because file selection does not work in a VR mobile browser
  if ( /* ('xr' in navigator) || */ ('getVRDisplays' in navigator ) ){
    var img = document.getElementById("output");
    img.src = "resources/height.png";
    function launchTest(){
        var imgh, imgw;

        img.onload = function(){
          imgh = img.height;
            imgw = img.width;
          if(imgh > 1024 || imgw> 1024){
            alert("Image resolution is too large, reloading the page...");
            window.location.reload(false); 
            return;
          }else{
            var c = document.getElementById("myCanvas");
            var ctx = c.getContext("2d");
            c.height = img.height;
            c.width = img.width;
            
            
            ctx.drawImage(img, 0, 0);
            img.style.display = 'none';

            var imageData = ctx.getImageData(0, 0, c.width, c.height);
            var data = imageData.data;
              
            var cpt=0;
            array = new Array(img.width * img.height);
            minH= data[0];
            //alert("new Array of "+ array.length);
              for (var i = 0; i < data.length; i += 4) {
                array[cpt] =  data[i];
                cpt++;
                if(minH < data[i]) minH = data[i];
              }

          var p = document.getElementById("content");
          p.innerText = cpt.toString() + " Vertices";

            init();
            animate();

          }

        };
    }
    launchTest();
  }