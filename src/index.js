import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { gsap } from 'gsap';

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false }),
        scene = new THREE.Scene(),
        camera = new THREE.PerspectiveCamera( 35, window.innerWidth/window.innerHeight, 0.25, 100 ),
        gltfLoader = new GLTFLoader(),
        mixer = new THREE.AnimationMixer(scene),
        clock = new THREE.Clock(),
        controls = new OrbitControls(camera, renderer.domElement),
        pmremGenerator = new THREE.PMREMGenerator(renderer);
        
  renderer.physicallyCorrectLights = true;

  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;

  // renderer.setPixelRatio( window.devicePixelRatio );

  renderer.setClearColor( 0x828282, 1 );

  function setSize() {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize( window.innerWidth, window.innerHeight );
  }

  addEventListener('resize',setSize);
  
  setSize();

  camera.position.set(0.5,-0.25,-3);
  camera.rotation.set(0,Math.PI,0);

  controls.target.set(0.5,-0.25,0);
  controls.minDistance = 2;
  controls.maxDistance = 6;
  controls.minPolarAngle = Math.PI * 0.12;
  controls.maxPolarAngle = Math.PI * 0.56;
        
  let gid;

  function render(){
    gid = requestAnimationFrame(render);
    
    mixer.update( clock.getDelta() );
          
    renderer.render(scene,camera);
  }

  let envMap,
      buffer = [],
      xrayMats = Object.create(null),
      xrayMatNames = [
        'Conditioner PBR',
        'Pellet Mill Door PBR',
        'Door Latch Material PBR',
        'Dump Chute PBR',
        'Feeder PBR',
        'Gearbox PBR',
        'Miscellaneous Parts PBR'
      ],
      animsByName = Object.create(null);

  function showOnLoad(gltf) {
    
    buffer.push(gltf);
    
    if(buffer.length === 11) {
      buffer.forEach(gltf => {
        
        scene.add(gltf.scene);
        
        scene.traverse( c => {
          if(c.isMesh) {
            
            let mat = c.material;
            
            mat.envMap = envMap;
            mat.envMapIntensity = 2.8;
          
            if(xrayMatNames.indexOf(mat.name) !== -1) {
              mat.transparent = true;
              xrayMats[mat.uuid] = mat;
            }
          }
        });
        
        if(gltf.animations) {
          
          gltf.animations.forEach( clip => {          
            let index = clip.name;
            
            if(animsByName[index] === undefined) animsByName[index] = [];
            
            animsByName[index].push(clip);
          });
        }
      
      });
      
      animsByName["RotatingParts"].forEach(clip => {
      	let action = mixer.clipAction(clip);
      	action.setLoop( THREE.LoopRepeat );
      	action.reset().play();
      });
      
      gsap.to(loadingIndicator, {
        duration:0.5,
        autoAlpha: 0
      });
    }
  }

  var xrayMode = false;

  function toggleXRay() {
    if(xrayMode) {
      for(mat in xrayMats) {
        gsap.to(xrayMats[mat],{
          duration: 0.25,
          opacity:1
        });
      }
      
      xrayMode = false;
    } else {
      for(mat in xrayMats) {
        gsap.to(xrayMats[mat],{
          duration: 0.25,
          opacity:0.25
        });
      }
      
      xrayMode = true;
    }
  }

  var doorIsOpen = false,
      doorIsAnimating = false,
      _actionCache = [];

  mixer.addEventListener('finished',function(e){
    // set animating flag and disable button
    doorIsAnimating = false;
    toggleDoorOpen.disabled = false;
    
    toggleDoorOpen.innerText = (doorIsOpen?"Close":"Open") + " Door";
  });

  function toggleDoor() {
    if(doorIsAnimating) return;
    
    // set animating flag and disable button
    doorIsAnimating = true;
    toggleDoorOpen.disabled = true;
    
    // stop previous actions
    if(_actionCache.length) _actionCache.forEach(action => action.stop());
    
    if(doorIsOpen) {
      
      animsByName["DoorClose"].forEach(clip => {
      	let action = mixer.clipAction(clip);
        
      	action.setLoop( THREE.LoopOnce );
      	action.clampWhenFinished = true;
      	action.reset().play();
        
        _actionCache.push(action);
      });
      
      doorIsOpen = false;
      
    } else {
      
      animsByName["DoorOpen"].forEach(clip => {
      	let action = mixer.clipAction(clip);
        
      	action.setLoop( THREE.LoopOnce );
      	action.clampWhenFinished = true;
      	action.reset().play();
        
        _actionCache.push(action);
      });
      
      doorIsOpen = true;
    }
  }

  var buttonMenu;
  var toggleDoorOpen;
  var toggleXRayButton;
  
  var loadingIndicator;

  var built;

  function init() {
    if(built) return;
    
    new RGBELoader().load('./textures/royal_esplanade_1k.hdr',function(tex){
  	   envMap = pmremGenerator.fromEquirectangular(tex).texture;
       
       // load GLTF model pieces
       gltfLoader.load('models/gltf/PelletMill_Conditioner.gltf',showOnLoad);
       gltfLoader.load('models/gltf/PelletMill_ConditionerShaft_WithAnimClips.gltf',showOnLoad);
       gltfLoader.load('models/gltf/PelletMill_Door_WithAnimClips.gltf',showOnLoad);
       gltfLoader.load('models/gltf/PelletMill_DoorLatch_WithAnimClips.gltf',showOnLoad);
       gltfLoader.load('models/gltf/PelletMill_DumpChute_WithAnimClips.gltf',showOnLoad);
       gltfLoader.load('models/gltf/PelletMill_DumpChuteInternals_WithAnimClips.gltf',showOnLoad);
       gltfLoader.load('models/gltf/PelletMill_Feeder.gltf',showOnLoad);
       gltfLoader.load('models/gltf/PelletMill_FeederScrew_WithAnimClips.gltf',showOnLoad);
       gltfLoader.load('models/gltf/PelletMill_GearboxAndBase.gltf',showOnLoad);
       gltfLoader.load('models/gltf/PelletMill_MiscellaneousParts.gltf',showOnLoad);
       gltfLoader.load('models/gltf/PelletMill_PelletDieAndInternals_WithAnimClips.gltf',showOnLoad);
    });
    
    // append WebGL canvas to DOM
    document.body.appendChild(renderer.domElement);
    
    loadingIndicator = DOMHELPER.create("div", {
      classes:['loading-indicator'],
      parent:document.body
    })
    
    // create and append button menu
    buttonMenu = DOMHELPER.create("div", {
      classes:['button-menu'],
      parent:document.body
    });
    
    // toggle door button
    toggleDoorOpen = DOMHELPER.create("button", {
      classes:['toggle-door'],
      parent:buttonMenu
    });
    toggleDoorOpen.textContent = "Open Door";
    toggleDoorOpen.addEventListener('click',toggleDoor);

    // toggle xray button
    toggleXRayButton = DOMHELPER.create("button", {
      classes:['toggle-xray'],
      parent:buttonMenu
    });
    toggleXRayButton.textContent = "Toggle X-Ray Mode";
    toggleXRayButton.addEventListener('click',toggleXRay);
    
    gid = render();
    
    built = true;
  }

  addEventListener('load',init);
  
//   return {
//     toggleDoor: toggleDoor,
//     toggleXRay: toggleXRay
//   }