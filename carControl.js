var carLoaded = false;

function carEvents(){
    if(carObject.model){
        carObject.model.translateX(carObject.speed.x );
        carObject.model.translateZ(carObject.speed.z);
        carObject.speed.x *= 0.975;
        carObject.speed.z *= 0.975;
    }else{
        console.log("no model found for car...");
    }
}

var carmodel;

//Constructeur
function Car(x, y , z){
    this.speed = new Position(0, 0, 0);
    this.model;
    document.addEventListener('keydown', (event) => {
        const nomTouche = event.key;
            if (nomTouche === 'z') {
                carObject.speed.z -= 0.25;
                console.log("speed z:" + carObject.speed.z);
            }
            if (nomTouche === 's') {
                carObject.speed.z += 0.25;
                console.log("speed z:" + carObject.speed.z);
            }
            if (nomTouche === 'q') {
                carObject.speed.x -= 0.25;
                console.log("speed x:" + carObject.speed.x);
            }
            if (nomTouche === 'd') {
                carObject.speed.x += 0.25;
                console.log("speed x:" + carObject.speed.x);
            }
    });
}

 //Model load
 function loadCar(){
    const model_path = "resources/assets/volks";

    let mtlLoader = new THREE.MTLLoader();
    mtlLoader.load(model_path+".mtl", function(materials){
        materials.preload();
        let objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load(model_path+".obj", function(mesh){
            mesh.translateY(1);
            mesh.traverse( function ( child ) {
                if ( child instanceof THREE.Mesh ) {
                    child.material.map = scene.background;
                    child.castShadow = true;
                    mesh.receiveShadow = true;
            
                }
            } );
            carObject.model = mesh;
            scene.add(mesh);
        });
    });
    return 0;
 }

function Position(p_x, p_y, p_z){
    this.x = p_x;
    this.y = p_y;
    this.z = p_z;
}