let scene, renderer, camera, plane;
let controls;
let cubelight, pl, ambientLight;
let sphereCamera = new THREE.CubeCamera(1,1000,200);
let materialTerrain, transparentMaterial;
let sea = [
    'cubemap_sea/px.png','cubemap_sea/nx.png',
    'cubemap_sea/py.png', 'cubemap_sea/ny.png',
    'cubemap_sea/pz.png', 'cubemap_sea/nz.png'
];

let carObject;
let rowWidth;

var vrEnabled;
if ( ('xr' in navigator) || ('getVRDisplays' in navigator ) ){
    vrEnabled = true;
}else{
    vrEnabled = false;
}


//Object : GUI class for our menu.
let Controls = function(){
    this.height = 20;
    this.wireframe = false;
    this.terrainColorControl = function(){
        terrainColor();
    }
    this.heightColor = function(){
        colorHeight();
    }
}; let guicontrols;

//Massive pre-render function
//This is where I initialize every materials, renderer, scene and objects properties.
function init()
{
    renderer = new THREE.WebGLRenderer( {antialias:true} );
    var container = document.getElementById("div3DView");
    //Here i get my container for my view to display on
    let width = container.offsetWidth;
    let height = 600;
    renderer.setSize (width, height);
    container.appendChild(renderer.domElement);

    if (vrEnabled){
        renderer.vr.enabled = true;
        document.body.appendChild( VRButton.createButton( renderer ) );
    }
    //Renderer inserted in my div.

    renderer.shadowMap.enabled =true;
    //renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene = new THREE.Scene();
    //The scene is the crucial object defining the world position and objects positions.
    camera = new THREE.PerspectiveCamera (60, width/height, 1, 8000);
    //Our camera is a virtual object with properties such as Field Of View (Here set to 60°); Aspect Ratio, near and far planes
        // --> Near plane = 1 (clip for object under distance of 1)
        // --> far plane = 8000 (max render distance, don't show objects that are further)
    camera.position.y = 160;
    camera.position.z = 400;
    camera.lookAt (new THREE.Vector3(0,0,0)); //Our camera is always looking at one position

    //Once the renderer is initialized, I can listen for changes in its parent size
    //I also want the camera to be initialised in order to change its aspect ratio
    new ResizeSensor( document.getElementById("div3DView"), function() {
        resizeCanvas();
    });

    //Mouse based view controller initialisation (see OrbitControls.js)
    controls = new THREE.OrbitControls (camera, renderer.domElement);
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    //Background (= CubeMap) initialisation
    let urls = [ //Our different textures for faces
        'cubemap_bg/px.png','cubemap_bg/nx.png',
        'cubemap_bg/py.png', 'cubemap_bg/ny.png',
        'cubemap_bg/pz.png', 'cubemap_bg/nz.png'
    ];
    let loader = new THREE.CubeTextureLoader();
    let texCube = loader.load(urls);
    scene.background = texCube;

    let c = document.getElementById("myCanvas"); //I get my imported image data (height)

    let geometry = new THREE.PlaneGeometry(400, 400, c.width-1, c.height-1);
    rowWidth = c.width - 1;

    //Set the heightmap (2D image) size and position to thumbnail, top left.
    resizeMap();
    let data= array; //Here i get my previously made array
    
    //Key point : for each vertices (data) in our array, i set an height value
    for (let i = 0, l = geometry.vertices.length; i < l; i++) {
            geometry.vertices[i].z = (data[i]/255) * 50;
            //So for data[i] = 128, i have here 128/255 = 0.5
            //I then multiply this value by 50 as an offset for perceiptible depth
    }
    //I don't know what these are, just leave'em here in case :)
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    /* --- Materials declaration --- */
    //Please note you can assign as many materials as you wish to a mesh.
    //Material types : Basic(no light effect), Phong(glossy), Lambert(Mate)
        //In later versions, ThreeJS introduced an abstract material : StandardMaterial. 
        //  you can set Metalness and Roughness based on physics instead of percentage of glossiness.
    materialTerrain = new THREE.MeshStandardMaterial({
        roughness : 0.7,
        metalness : 0.6,
        wireframe: false,
        vertexColors : THREE.FaceColors,
        envMap: texCube
        });
    transparentMaterial = new THREE.MeshPhongMaterial({
        envMap: scene.background,
        reflectivity : 0.8
    });

    /* --- 3D OBJECTS AND LIGHTING --- */

    //Our main 3D Object is a geometryPlain Object, affected by the later objects and materials.
    plane = new THREE.Mesh(geometry, [materialTerrain, transparentMaterial]);
    plane.rotation.x = - Math.PI/2; //Rotation needed to view object from above
    scene.add(plane);
    
    //Just to see where the lightsource is in the scene, i put in the scene a little green cube.
    let d = new THREE.BoxGeometry( 1, 1, 1 ); //First declare size and type of geometry
    let dm = new THREE.MeshPhongMaterial( {color: 0x00ff00} );  //Then declare a material with properties
    cubelight = new THREE.Mesh( d, dm );    //Create a mesh made of the geometry and the material
    cubelight.position.y = 100;         //3D objects can be set to specific positions/rotations
    scene.add( cubelight );         //Add the object in the scene - can be accessed later using variables.

    /* -- Lighting -- */
    ambientLight = new THREE.AmbientLight( 0xFFFFFF, 0.9 );
    scene.add(ambientLight);

    pl = new THREE.PointLight(0xffffff,4, 120);
    scene.add(pl);
    pl.position.y = cubelight.position.y + 10;

    pl.castShadow = true;
    plane.receiveShadow = true;
    plane.castShadow = true;

    // GUI Menu : Overlaying 2D properties menu and events
    guicontrols = new Controls();
    let gui = new dat.GUI();
    let heightControl = gui.add(guicontrols, 'height',1,100);
    let wireframeControl = gui.add(guicontrols, 'wireframe');
    let terrainColorControl = gui.add(guicontrols, 'terrainColorControl');
    let heightColorControl = gui.add(guicontrols, 'heightColor');

    heightControl.onChange(function(value) {
        updateHeight(value);
      });
    
    wireframeControl.onChange(function(value) {
        materialTerrain.wireframe = value;
        if(value){}
      });
      //Car 3D model loading
      //carObject = new Car();
      //var check= loadCar();

}

//Funny function: applies a color to a plane face based on the height of the first vertice.
function colorHeight(){
    let arr = plane.geometry.faces;
    let l = arr.length;
    for ( let i = 0;i < l;i++){
        let zVert = plane.geometry.vertices[arr[i].a].z;
        arr[i].color.setRGB(zVert/28, 1-zVert/32, 1- zVert/32);
       
        //console.log(plane.geometry.vertices[arr[i].a].z );
    }
    reloadVertices();
}

//Funny function : manually applied colors, related to landscapes, depending on vertices height:
//Currently : Blue(0), Green(grass >0), Brown(cliffs > 10), Grey (stone > 20), White (Snowy mountains > 32)
function terrainColor() {
    ambientLight.intensity = 1;
    pl.decay = 2;
    pl.distance = 0;
    pl.intensity = 1;
    let cubeloader = new THREE.CubeTextureLoader();
    let bg = cubeloader.load(sea);
    scene.background = bg;

    let arr = plane.geometry.faces;
    let l = arr.length;
    for ( let i = 0;i < l;i++){
        let zVert = plane.geometry.vertices[arr[i].a].z;
        if (zVert> 32){
            arr[i].color.setHex(0xffffff);
        }else if(zVert>20){
            arr[i].color.setHex(0xb8b09b);
        }else if(zVert>10){
            arr[i].color.setHex(0x654321);
        }
        else if(zVert>0.25){
            arr[i].color.setHex(0x567d46);
        }else{
            arr[i].materialIndex = 1;
            arr[i].color.setHex(0x0020ff);
        }
        //console.log(plane.geometry.vertices[arr[i].a].z );
    }
    reloadVertices();
    reloadMaterials();
    console.log("number of faces : "+ l);
    console.log("number of vertices : "+plane.geometry.vertices.length);
}

//Loop function
function animate()
{
    controls.update();
    //console.log(camera.position.x +", "+camera.position.y+", "+camera.position.z );
    let time =Date.now() * 0.005;

    /*
    if(carObject.model){
        carEvents();

        let carx = Math.floor(carObject.model.position.x);
        let carz = Math.floor(carObject.model.position.z);
        let id = (rowWidth+carz)*rowWidth;
        console.log("accessing plane["+id+"] : ");
        
        let zHeightofId = plane.geometry.vertices[plane.geometry.faces[id].a].z;
        plane.geometry.faces[id].color.setHex(0xff0000);
        reloadVertices();
        console.log ("  = "+zHeightofId);
        carObject.model.position.y = zHeightofId;
    }
    */
    cubelight.position.x = Math.sin(time/10) * 200;
    cubelight.position.z = Math.cos(time/10) * 200;
    pl.position.x = cubelight.position.x;
    pl.position.z = cubelight.position.z;
    
    renderer.render (scene, camera);
    requestAnimationFrame ( animate );  
}

//Set a new height to 3D object depending on user's preferences
function updateHeight(value){
    cubelight.position.y = parseInt(100) + parseInt(value);
    pl.position.y = cubelight.position.y;
    plane.scale.set(1,1,parseInt(value)/50);
}

//Window / Container resize function : Resizes the 3D view
function resizeCanvas(){
    var container = document.getElementById("div3DView");
    let width = container.offsetWidth;
    let height = 600;

    camera.aspect = width/height;
    camera.updateProjectionMatrix();
    renderer.setSize (width, height);
    console.log("FOV: "+camera.fov);
}

//HeightMap thumbnail auto-resize function : puts the heightmap in a square view top left
function resizeMap(){
    var c = document.getElementById("myCanvas");
    c.style.display = 'block';
    c.style.float = 'left';
    c.style.position = 'absolute';
    c.style.top = '50px';
    c.style.left = '50px';
    c.style.width = '100px';
    c.style.height = 'auto';
    c.style.boxShadow = '1px 3px 5px black;'

    var btn = document.getElementById("file-section");
    btn.style.display = 'none';
}

//Tells the program our 3D model needs to update its colors
function reloadVertices(){
    plane.geometry.colorsNeedUpdate =true;
    plane.geometry.verticesNeedUpdate = true;
}

//Tells the program to update our materials properties
function reloadMaterials(){
    materialTerrain.envMap = scene.background;
    transparentMaterial.envMap = scene.background;
    materialTerrain.needsUpdate = true;
    transparentMaterial.needsUpdate = true;
}