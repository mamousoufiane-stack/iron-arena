import * as THREE from './three.module.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
const canvas=document.getElementById('game');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0x18282d);
const scene=new THREE.Scene();scene.fog=new THREE.Fog(0x22383b,18,65);const camera=new THREE.PerspectiveCamera(37,16/9,.1,100);camera.position.set(0,4.5,12);
scene.add(new THREE.HemisphereLight(0xc4e5e1,0x333421,2));const sun=new THREE.DirectionalLight(0xffe9b0,3);sun.position.set(-5,10,4);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-10,right:10,top:10,bottom:-10});sun.shadow.bias=-.002;scene.add(sun);const rim=new THREE.DirectionalLight(0x9ddfff,2);rim.position.set(4,5,-7);scene.add(rim);
const mat=(c,extra={})=>new THREE.MeshStandardMaterial({color:c,roughness:.86,flatShading:true,...extra});
function box(w,h,d,m,x=0,y=0,z=0,parent=scene){let o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function texture(kind,c1,c2){let c=document.createElement('canvas');c.width=c.height=128;let g=c.getContext('2d');g.fillStyle=c1;g.fillRect(0,0,128,128);let seed=781;for(let i=0;i<1300;i++){seed=(seed*16807)%2147483647;g.fillStyle=i%2?'#ffffff0b':'#00000016';g.fillRect(seed%128,(seed>>8)%128,2,2);}g.strokeStyle=c2;g.lineWidth=3;if(kind==='floor'){g.strokeRect(2,2,124,124);g.beginPath();g.moveTo(0,64);g.lineTo(128,64);g.stroke();}else{g.fillStyle=c2;g.fillRect(4,0,7,128);g.fillRect(115,0,7,128);g.strokeRect(16,12,96,102);}let t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}
let floorTex=texture('floor','#596056','#333e37');floorTex.repeat.set(12,8);box(22,.3,14,mat(0xffffff,{map:floorTex}),0,-.17,0);const metal=mat(0x354942),lime=mat(0xb4cc64,{emissive:0x182309});for(let z of [-3.7,3.7])box(14,.015,.055,lime,0,.003,z);for(let x of [-7,7])box(.055,.015,7.4,lime,x,.003,0);for(let x=-10;x<=10;x+=2){box(.09,1.1,.09,metal,x,.5,-5.2);box(2,.06,.08,metal,x,.95,-5.2);box(2,.04,.08,metal,x,.5,-5.2);}for(let x of [-9,9]){box(1.8,.6,1.2,mat(0x63766c),x,.3,-3.6);box(1.6,.1,1.1,metal,x,.65,-3.6);}
for(let i=0;i<48;i++){let x=(i%16)*3.3-25,h=2+(i*13%9),z=-12-Math.floor(i/16)*7;box(2.5,h,2.8,mat(i%2?0x2c4247:0x364f52),x,h/2-2,z);for(let j=0;j<h-1;j++)for(let k=0;k<3;k++)if((i+j+k)%3)box(.15,.3,.01,mat(0xaeb78b,{emissive:0x737950}),x-.8+k*.7,j-1,z+1.41);}
const moon=new THREE.Mesh(new THREE.SphereGeometry(1.6,16,12),new THREE.MeshBasicMaterial({color:0xe5e0b5}));moon.position.set(17,13,-35);scene.add(moon);
let decal=document.createElement('canvas');decal.width=512;decal.height=256;let dg=decal.getContext('2d');dg.strokeStyle='#d1e288';dg.lineWidth=4;dg.beginPath();dg.ellipse(256,128,238,115,0,0,7);dg.stroke();dg.fillStyle='#d1e288';dg.textAlign='center';dg.font='italic 900 62px Arial';dg.fillText('IRON ARENA',256,148);let dt=new THREE.CanvasTexture(decal);let dm=new THREE.Mesh(new THREE.PlaneGeometry(5,2.5),new THREE.MeshBasicMaterial({map:dt,transparent:true,opacity:.22,depthWrite:false}));dm.rotation.x=-Math.PI/2;dm.position.y=.004;scene.add(dm);
const loader=new GLTFLoader();
const characterFiles=['kai','aya'];
const loaded=await Promise.all(characterFiles.map(name=>loader.loadAsync(new URL('./assets/'+name+'.glb',import.meta.url).href)));
function dress(material,type){
 const m=material.clone();m.roughness=.8;m.metalness=0;m.flatShading=false;
 m.onBeforeCompile=shader=>{
  shader.uniforms.kitColor={value:new THREE.Color(type?'#e77c52':'#c0dc62')};
  shader.vertexShader='varying vec3 garmentPosition;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ngarmentPosition = position;');
  shader.fragmentShader='varying vec3 garmentPosition; uniform vec3 kitColor;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
   float h=garmentPosition.y; float ax=abs(garmentPosition.x);
   bool pants=h<1.02; bool shirt=h>1.09 && h<1.47 && ax<0.255;
   if(pants || shirt){
    vec3 fabric=pants?vec3(0.055,0.073,0.09):kitColor;
    if(pants && ax>0.12 && ax<0.15)fabric=kitColor;
    if(h<0.16)fabric=vec3(0.035);
    if(h>0.96 && h<1.02)fabric=kitColor*0.65;
    float weave=0.94+0.06*sin(h*650.0)*sin(garmentPosition.x*650.0);
    diffuseColor.rgb=fabric*weave;
   }`);
 };m.customProgramCacheKey=()=> 'fight-kit-'+type;return m;
}
const actors=loaded.map((gltf,type)=>{
 const root=new THREE.Group();scene.add(root);root.add(gltf.scene);gltf.scene.updateMatrixWorld(true);
 const bounds=new THREE.Box3().setFromObject(gltf.scene),height=bounds.max.y-bounds.min.y;
 gltf.scene.scale.setScalar(2.15/height);gltf.scene.position.y=-bounds.min.y*(2.15/height);
 gltf.scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;if(o.material.name.includes('Superhero'))o.material=dress(o.material,type);else{o.material=o.material.clone();o.material.flatShading=false;}}});
 const mixer=new THREE.AnimationMixer(gltf.scene);const actions={};for(const clip of gltf.animations){actions[clip.name]=mixer.clipAction(clip);}
 const bones={};gltf.scene.traverse(o=>{if(o.isBone)bones[o.name]=o;});
 const aura=new THREE.Mesh(new THREE.TorusGeometry(.72,.035,8,48),new THREE.MeshBasicMaterial({color:type?0xff8155:0xd4ff58,transparent:true,opacity:.8,depthWrite:false}));aura.visible=false;root.add(aura);
 return{aura,root,model:gltf.scene,mixer,actions,bones,current:null,lastAttack:null,lastClock:0,previousX:0,previousZ:0,kickOffset:null};
});
function action(a,name,once=false,duration=0){
 const next=a.actions[name];if(!next)return;
 if(a.current===next)return;
 const prev=a.current;next.reset();next.enabled=true;next.clampWhenFinished=once;next.setLoop(once?THREE.LoopOnce:THREE.LoopRepeat,once?1:Infinity);next.setEffectiveTimeScale(duration?next.getClip().duration/duration:1);next.setEffectiveWeight(1);next.play();if(prev)prev.crossFadeTo(next,.09,false);a.current=next;
}
function pose(a,f,time){
 const delta=Math.max(0,Math.min(.05,time-a.lastClock));a.lastClock=time;
 const moving=Math.abs(f.x-a.previousX)+Math.abs(f.z-a.previousZ)>.0001;a.previousX=f.x;a.previousZ=f.z;
 a.root.position.set(f.x,0,f.z*1.5);a.root.rotation.y=f.face*Math.PI/2;const visual=f.attack?.visual;const progress=f.attack?Math.min(1,f.attack.t/f.attack.duration):0;a.aura.visible=!!visual;if(visual){a.aura.material.opacity=Math.sin(progress*Math.PI)*.85;a.aura.position.set(0,1.25,visual==='wave'?progress*3.3:.45);a.aura.scale.setScalar(visual==='wave'?.5+progress*1.5:1);a.aura.rotation.set(visual==='spin'?Math.PI/2:0,0,progress*6);if(visual==='spin')a.root.rotation.y+=progress*Math.PI*2;}
 // Undo the previous procedural kick before the animation mixer evaluates this frame.
 if(a.kickOffset){for(const [name,q] of Object.entries(a.kickOffset))a.bones[name]?.quaternion.copy(q);a.kickOffset=null;}
 if(f.hp<=0)action(a,'Death01',true);
 else if(f.attack){
  if(f.attack!==a.lastAttack){a.lastAttack=f.attack;a.current?.fadeOut(.05);a.current=null;}
  const kick=f.attack.type==='kick'||f.attack.visual==='spin';action(a,f.attack.clip||(f.attack.type==='punch'?'Punch_Jab':'Idle_Shield_Loop'),!kick&&f.attack.visual!=='rush',kick?0:f.attack.duration/(f.attack.visual==='rush'?3:1));
 }else if(f.stun>0)action(a,'Hit_Chest',true,.3);
 else if(f.guard)action(a,'Idle_Shield_Loop');
 else if(moving)action(a,'Walk_Loop');
 else action(a,'Idle_Loop');
 a.mixer.update(delta);
 if(f.attack?.type==='kick'||f.attack?.visual==='spin'){
  const t=f.attack.t/f.attack.duration;const lift=Math.sin(Math.min(1,t)*Math.PI);
  a.kickOffset={};
  for(const [name,angle] of [['thigh_r',-lift*1.4],['calf_r',lift*.24],['spine_01',lift*.16]]){
   const bone=a.bones[name];if(!bone)continue;a.kickOffset[name]=bone.quaternion.clone();bone.rotateX(angle);
  }
 }
}
const sparks=[];for(let i=0;i<16;i++){let s=new THREE.Mesh(new THREE.OctahedronGeometry(.035),new THREE.MeshBasicMaterial({color:0xebff95}));s.visible=false;scene.add(s);sparks.push(s);}
let lastWidth=0,lastHeight=0;
export function drawScene(fighters,time,effects,shake){const width=canvas.clientWidth,height=canvas.clientHeight;const w=Math.min(960,Math.round(width)),h=Math.round(w*height/width);if(lastWidth!==w||lastHeight!==h){lastWidth=w;lastHeight=h;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}for(let i=0;i<2;i++){const f=fighters[i],a=actors[f.type];pose(a,f,time);}const center=(fighters[0].x+fighters[1].x)/2,dist=Math.abs(fighters[0].x-fighters[1].x);camera.position.lerp(new THREE.Vector3(center*.45,3.5,Math.max(9.4,dist*1.3)),.06);camera.lookAt(center*.6+(Math.random()-.5)*shake*.006,1.02,0);const effect=effects.at(-1);sparks.forEach((s,i)=>{s.visible=!!effect;if(effect){let a=i*Math.PI*2/16,r=(.3-effect.life)*4;s.position.set(effect.x+Math.cos(a)*r,effect.y+Math.sin(a)*r,effect.z*1.5+.2);s.material.color.set(effect.block?0xbbeeff:0xedff87);}});renderer.render(scene,camera);}
