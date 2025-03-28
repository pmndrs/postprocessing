"use strict";(()=>{var S=(l=>typeof require!="undefined"?require:typeof Proxy!="undefined"?new Proxy(l,{get:(e,t)=>(typeof require!="undefined"?require:e)[t]}):l)(function(l){if(typeof require!="undefined")return require.apply(this,arguments);throw Error('Dynamic require of "'+l+'" is not supported')});var g=S("three");var c=S("three");var D=class{constructor(){this.startTime=performance.now(),this.previousTime=0,this.currentTime=0,this._delta=0,this._elapsed=0,this._fixedDelta=1e3/60,this.timescale=1,this.useFixedDelta=!1,this._autoReset=!1}get autoReset(){return this._autoReset}set autoReset(e){typeof document!="undefined"&&document.hidden!==void 0&&(e?document.addEventListener("visibilitychange",this):document.removeEventListener("visibilitychange",this),this._autoReset=e)}get delta(){return this._delta*.001}get fixedDelta(){return this._fixedDelta*.001}set fixedDelta(e){this._fixedDelta=e*1e3}get elapsed(){return this._elapsed*.001}update(e){this.useFixedDelta?this._delta=this.fixedDelta:(this.previousTime=this.currentTime,this.currentTime=(e!==void 0?e:performance.now())-this.startTime,this._delta=this.currentTime-this.previousTime),this._delta*=this.timescale,this._elapsed+=this._delta}reset(){this._delta=0,this._elapsed=0,this.currentTime=performance.now()-this.startTime}getDelta(){return this.delta}getElapsed(){return this.elapsed}handleEvent(e){document.hidden||(this.currentTime=performance.now()-this.startTime)}dispose(){this.autoReset=!1}};var f=S("three"),W=(()=>{let l=new Float32Array([-1,-1,0,3,-1,0,-1,3,0]),e=new Float32Array([0,0,2,0,0,2]),t=new f.BufferGeometry;return t.setAttribute("position",new f.BufferAttribute(l,3)),t.setAttribute("uv",new f.BufferAttribute(e,2)),t})(),p=class l{static get fullscreenGeometry(){return W}constructor(e="Pass",t=new f.Scene,s=new f.Camera){this.name=e,this.renderer=null,this.scene=t,this.camera=s,this.screen=null,this.rtt=!0,this.needsSwap=!0,this.needsDepthTexture=!1,this.enabled=!0}get renderToScreen(){return!this.rtt}set renderToScreen(e){if(this.rtt===e){let t=this.fullscreenMaterial;t!==null&&(t.needsUpdate=!0),this.rtt=!e}}set mainScene(e){}set mainCamera(e){}setRenderer(e){this.renderer=e}isEnabled(){return this.enabled}setEnabled(e){this.enabled=e}get fullscreenMaterial(){return this.screen!==null?this.screen.material:null}set fullscreenMaterial(e){let t=this.screen;t!==null?t.material=e:(t=new f.Mesh(l.fullscreenGeometry,e),t.frustumCulled=!1,this.scene===null&&(this.scene=new f.Scene),this.scene.add(t),this.screen=t)}getFullscreenMaterial(){return this.fullscreenMaterial}setFullscreenMaterial(e){this.fullscreenMaterial=e}getDepthTexture(){return null}setDepthTexture(e,t=f.BasicDepthPacking){}render(e,t,s,r,a){throw new Error("Render method not implemented!")}setSize(e,t){}initialize(e,t,s){}dispose(){for(let e of Object.keys(this)){let t=this[e];(t instanceof f.WebGLRenderTarget||t instanceof f.Material||t instanceof f.Texture||t instanceof l)&&this[e].dispose()}this.fullscreenMaterial!==null&&this.fullscreenMaterial.dispose()}};var E=class extends p{constructor(){super("ClearMaskPass",null,null),this.needsSwap=!1}render(e,t,s,r,a){let i=e.state.buffers.stencil;i.setLocked(!1),i.setTest(!1)}};var w=S("three");var x=S("three");var A=`#include <common>
#include <dithering_pars_fragment>
#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D inputBuffer;
#else
uniform lowp sampler2D inputBuffer;
#endif
uniform float opacity;varying vec2 vUv;void main(){vec4 texel=texture2D(inputBuffer,vUv);gl_FragColor=opacity*texel;
#include <colorspace_fragment>
#include <dithering_fragment>
}`;var I="varying vec2 vUv;void main(){vUv=position.xy*0.5+0.5;gl_Position=vec4(position.xy,1.0,1.0);}";var R=class extends x.ShaderMaterial{constructor(){super({name:"CopyMaterial",uniforms:{inputBuffer:new x.Uniform(null),opacity:new x.Uniform(1)},blending:x.NoBlending,toneMapped:!1,depthWrite:!1,depthTest:!1,fragmentShader:A,vertexShader:I})}set inputBuffer(e){this.uniforms.inputBuffer.value=e}setInputBuffer(e){this.uniforms.inputBuffer.value=e}getOpacity(e){return this.uniforms.opacity.value}setOpacity(e){this.uniforms.opacity.value=e}};var T=class extends p{constructor(e,t=!0){super("CopyPass"),this.fullscreenMaterial=new R,this.needsSwap=!1,this.renderTarget=e,e===void 0&&(this.renderTarget=new w.WebGLRenderTarget(1,1,{minFilter:w.LinearFilter,magFilter:w.LinearFilter,stencilBuffer:!1,depthBuffer:!1}),this.renderTarget.texture.name="CopyPass.Target"),this.autoResize=t}get resize(){return this.autoResize}set resize(e){this.autoResize=e}get texture(){return this.renderTarget.texture}getTexture(){return this.renderTarget.texture}setAutoResizeEnabled(e){this.autoResize=e}render(e,t,s,r,a){this.fullscreenMaterial.inputBuffer=t.texture,e.setRenderTarget(this.renderToScreen?null:this.renderTarget),e.render(this.scene,this.camera)}setSize(e,t){this.autoResize&&this.renderTarget.setSize(e,t)}initialize(e,t,s){s!==void 0&&(this.renderTarget.texture.type=s,s!==w.UnsignedByteType?this.fullscreenMaterial.defines.FRAMEBUFFER_PRECISION_HIGH="1":e!==null&&e.outputColorSpace===w.SRGBColorSpace&&(this.renderTarget.texture.colorSpace=w.SRGBColorSpace))}};var U=S("three");var _=new U.Color,C=class extends p{constructor(e=!0,t=!0,s=!1){super("ClearPass",null,null),this.needsSwap=!1,this.color=e,this.depth=t,this.stencil=s,this.overrideClearColor=null,this.overrideClearAlpha=-1}setClearFlags(e,t,s){this.color=e,this.depth=t,this.stencil=s}getOverrideClearColor(){return this.overrideClearColor}setOverrideClearColor(e){this.overrideClearColor=e}getOverrideClearAlpha(){return this.overrideClearAlpha}setOverrideClearAlpha(e){this.overrideClearAlpha=e}render(e,t,s,r,a){let i=this.overrideClearColor,n=this.overrideClearAlpha,o=e.getClearAlpha(),d=i!==null,h=n>=0;d?(e.getClearColor(_),e.setClearColor(i,h?n:o)):h&&e.setClearAlpha(n),e.setRenderTarget(this.renderToScreen?null:t),e.clear(this.color,this.depth,this.stencil),d?e.setClearColor(_,o):h&&e.setClearAlpha(o)}};var k=class extends p{constructor(e,t){super("MaskPass",e,t),this.needsSwap=!1,this.clearPass=new C(!1,!1,!0),this.inverse=!1}set mainScene(e){this.scene=e}set mainCamera(e){this.camera=e}get inverted(){return this.inverse}set inverted(e){this.inverse=e}get clear(){return this.clearPass.enabled}set clear(e){this.clearPass.enabled=e}getClearPass(){return this.clearPass}isInverted(){return this.inverted}setInverted(e){this.inverted=e}render(e,t,s,r,a){let i=e.getContext(),n=e.state.buffers,o=this.scene,d=this.camera,h=this.clearPass,B=this.inverted?0:1,M=1-B;n.color.setMask(!1),n.depth.setMask(!1),n.color.setLocked(!0),n.depth.setLocked(!0),n.stencil.setTest(!0),n.stencil.setOp(i.REPLACE,i.REPLACE,i.REPLACE),n.stencil.setFunc(i.ALWAYS,B,4294967295),n.stencil.setClear(M),n.stencil.setLocked(!0),this.clearPass.enabled&&(this.renderToScreen?h.render(e,null):(h.render(e,t),h.render(e,s))),this.renderToScreen?(e.setRenderTarget(null),e.render(o,d)):(e.setRenderTarget(t),e.render(o,d),e.setRenderTarget(s),e.render(o,d)),n.color.setLocked(!1),n.depth.setLocked(!1),n.stencil.setLocked(!1),n.stencil.setFunc(i.EQUAL,1,4294967295),n.stencil.setOp(i.KEEP,i.KEEP,i.KEEP),n.stencil.setLocked(!0)}};var F=class{constructor(e=null,{depthBuffer:t=!0,stencilBuffer:s=!1,multisampling:r=0,frameBufferType:a}={}){this.renderer=null,this.inputBuffer=this.createBuffer(t,s,a,r),this.outputBuffer=this.inputBuffer.clone(),this.copyPass=new T,this.depthTexture=null,this.passes=[],this.timer=new D,this.autoRenderToScreen=!0,this.setRenderer(e)}get multisampling(){return this.inputBuffer.samples||0}set multisampling(e){let t=this.inputBuffer,s=this.multisampling;s>0&&e>0?(this.inputBuffer.samples=e,this.outputBuffer.samples=e,this.inputBuffer.dispose(),this.outputBuffer.dispose()):s!==e&&(this.inputBuffer.dispose(),this.outputBuffer.dispose(),this.inputBuffer=this.createBuffer(t.depthBuffer,t.stencilBuffer,t.texture.type,e),this.inputBuffer.depthTexture=this.depthTexture,this.outputBuffer=this.inputBuffer.clone())}getTimer(){return this.timer}getRenderer(){return this.renderer}setRenderer(e){if(this.renderer=e,e!==null){let t=e.getSize(new c.Vector2),s=e.getContext().getContextAttributes().alpha,r=this.inputBuffer.texture.type;r===c.UnsignedByteType&&e.outputColorSpace===c.SRGBColorSpace&&(this.inputBuffer.texture.colorSpace=c.SRGBColorSpace,this.outputBuffer.texture.colorSpace=c.SRGBColorSpace,this.inputBuffer.dispose(),this.outputBuffer.dispose()),e.autoClear=!1,this.setSize(t.width,t.height);for(let a of this.passes)a.initialize(e,s,r)}}replaceRenderer(e,t=!0){let s=this.renderer,r=s.domElement.parentNode;return this.setRenderer(e),t&&r!==null&&(r.removeChild(s.domElement),r.appendChild(e.domElement)),s}createDepthTexture(){let e=this.depthTexture=new c.DepthTexture;return this.inputBuffer.depthTexture=e,this.inputBuffer.dispose(),this.inputBuffer.stencilBuffer?(e.format=c.DepthStencilFormat,e.type=c.UnsignedInt248Type):e.type=c.UnsignedIntType,e}deleteDepthTexture(){if(this.depthTexture!==null){this.depthTexture.dispose(),this.depthTexture=null,this.inputBuffer.depthTexture=null,this.inputBuffer.dispose();for(let e of this.passes)e.setDepthTexture(null)}}createBuffer(e,t,s,r){let a=this.renderer,i=a===null?new c.Vector2:a.getDrawingBufferSize(new c.Vector2),n={minFilter:c.LinearFilter,magFilter:c.LinearFilter,stencilBuffer:t,depthBuffer:e,type:s},o=new c.WebGLRenderTarget(i.width,i.height,n);return r>0&&(o.ignoreDepthForMultisampleCopy=!1,o.samples=r),s===c.UnsignedByteType&&a!==null&&a.outputColorSpace===c.SRGBColorSpace&&(o.texture.colorSpace=c.SRGBColorSpace),o.texture.name="EffectComposer.Buffer",o.texture.generateMipmaps=!1,o}setMainScene(e){for(let t of this.passes)t.mainScene=e}setMainCamera(e){for(let t of this.passes)t.mainCamera=e}addPass(e,t){let s=this.passes,r=this.renderer,a=r.getDrawingBufferSize(new c.Vector2),i=r.getContext().getContextAttributes().alpha,n=this.inputBuffer.texture.type;if(e.setRenderer(r),e.setSize(a.width,a.height),e.initialize(r,i,n),this.autoRenderToScreen&&(s.length>0&&(s[s.length-1].renderToScreen=!1),e.renderToScreen&&(this.autoRenderToScreen=!1)),t!==void 0?s.splice(t,0,e):s.push(e),this.autoRenderToScreen&&(s[s.length-1].renderToScreen=!0),e.needsDepthTexture||this.depthTexture!==null)if(this.depthTexture===null){let o=this.createDepthTexture();for(e of s)e.setDepthTexture(o)}else e.setDepthTexture(this.depthTexture)}removePass(e){let t=this.passes,s=t.indexOf(e);if(s!==-1&&t.splice(s,1).length>0){if(this.depthTexture!==null){let i=(o,d)=>o||d.needsDepthTexture;t.reduce(i,!1)||(e.getDepthTexture()===this.depthTexture&&e.setDepthTexture(null),this.deleteDepthTexture())}this.autoRenderToScreen&&s===t.length&&(e.renderToScreen=!1,t.length>0&&(t[t.length-1].renderToScreen=!0))}}removeAllPasses(){let e=this.passes;this.deleteDepthTexture(),e.length>0&&(this.autoRenderToScreen&&(e[e.length-1].renderToScreen=!1),this.passes=[])}render(e){let t=this.renderer,s=this.copyPass,r=this.inputBuffer,a=this.outputBuffer,i=!1,n,o,d;e===void 0&&(this.timer.update(),e=this.timer.getDelta());for(let h of this.passes)h.enabled&&(h.render(t,r,a,e,i),h.needsSwap&&(i&&(s.renderToScreen=h.renderToScreen,n=t.getContext(),o=t.state.buffers.stencil,o.setFunc(n.NOTEQUAL,1,4294967295),s.render(t,r,a,e,i),o.setFunc(n.EQUAL,1,4294967295)),d=r,r=a,a=d),h instanceof k?i=!0:h instanceof E&&(i=!1))}setSize(e,t,s){let r=this.renderer,a=r.getSize(new c.Vector2);(e===void 0||t===void 0)&&(e=a.width,t=a.height),(a.width!==e||a.height!==t)&&r.setSize(e,t,s);let i=r.getDrawingBufferSize(new c.Vector2);this.inputBuffer.setSize(i.width,i.height),this.outputBuffer.setSize(i.width,i.height);for(let n of this.passes)n.setSize(i.width,i.height)}reset(){this.dispose(),this.autoRenderToScreen=!0}dispose(){for(let e of this.passes)e.dispose();this.passes=[],this.inputBuffer!==null&&this.inputBuffer.dispose(),this.outputBuffer!==null&&this.outputBuffer.dispose(),this.deleteDepthTexture(),this.copyPass.dispose(),this.timer.dispose(),p.fullscreenGeometry.dispose()}};var m=S("three"),O=!1,b=class{constructor(e=null){this.originalMaterials=new Map,this.material=null,this.materials=null,this.materialsBackSide=null,this.materialsDoubleSide=null,this.materialsFlatShaded=null,this.materialsFlatShadedBackSide=null,this.materialsFlatShadedDoubleSide=null,this.setMaterial(e),this.meshCount=0,this.replaceMaterial=t=>{if(t.isMesh){let s;if(t.material.flatShading)switch(t.material.side){case m.DoubleSide:s=this.materialsFlatShadedDoubleSide;break;case m.BackSide:s=this.materialsFlatShadedBackSide;break;default:s=this.materialsFlatShaded;break}else switch(t.material.side){case m.DoubleSide:s=this.materialsDoubleSide;break;case m.BackSide:s=this.materialsBackSide;break;default:s=this.materials;break}this.originalMaterials.set(t,t.material),t.isSkinnedMesh?t.material=s[2]:t.isInstancedMesh?t.material=s[1]:t.material=s[0],++this.meshCount}}}cloneMaterial(e){if(!(e instanceof m.ShaderMaterial))return e.clone();let t=e.uniforms,s=new Map;for(let a in t){let i=t[a].value;i.isRenderTargetTexture&&(t[a].value=null,s.set(a,i))}let r=e.clone();for(let a of s)t[a[0]].value=a[1],r.uniforms[a[0]].value=a[1];return r}setMaterial(e){if(this.disposeMaterials(),this.material=e,e!==null){let t=this.materials=[this.cloneMaterial(e),this.cloneMaterial(e),this.cloneMaterial(e)];for(let s of t)s.uniforms=Object.assign({},e.uniforms),s.side=m.FrontSide;t[2].skinning=!0,this.materialsBackSide=t.map(s=>{let r=this.cloneMaterial(s);return r.uniforms=Object.assign({},e.uniforms),r.side=m.BackSide,r}),this.materialsDoubleSide=t.map(s=>{let r=this.cloneMaterial(s);return r.uniforms=Object.assign({},e.uniforms),r.side=m.DoubleSide,r}),this.materialsFlatShaded=t.map(s=>{let r=this.cloneMaterial(s);return r.uniforms=Object.assign({},e.uniforms),r.flatShading=!0,r}),this.materialsFlatShadedBackSide=t.map(s=>{let r=this.cloneMaterial(s);return r.uniforms=Object.assign({},e.uniforms),r.flatShading=!0,r.side=m.BackSide,r}),this.materialsFlatShadedDoubleSide=t.map(s=>{let r=this.cloneMaterial(s);return r.uniforms=Object.assign({},e.uniforms),r.flatShading=!0,r.side=m.DoubleSide,r})}}render(e,t,s){let r=e.shadowMap.enabled;if(e.shadowMap.enabled=!1,O){let a=this.originalMaterials;this.meshCount=0,t.traverse(this.replaceMaterial),e.render(t,s);for(let i of a)i[0].material=i[1];this.meshCount!==a.size&&a.clear()}else{let a=t.overrideMaterial;t.overrideMaterial=this.material,e.render(t,s),t.overrideMaterial=a}e.shadowMap.enabled=r}disposeMaterials(){if(this.material!==null){let e=this.materials.concat(this.materialsBackSide).concat(this.materialsDoubleSide).concat(this.materialsFlatShaded).concat(this.materialsFlatShadedBackSide).concat(this.materialsFlatShadedDoubleSide);for(let t of e)t.dispose()}}dispose(){this.originalMaterials.clear(),this.disposeMaterials()}static get workaroundEnabled(){return O}static set workaroundEnabled(e){O=e}};var L=class extends p{constructor(e,t,s=null){super("RenderPass",e,t),this.needsSwap=!1,this.clearPass=new C,this.overrideMaterialManager=s===null?null:new b(s),this.ignoreBackground=!1,this.skipShadowMapUpdate=!1,this.selection=null}set mainScene(e){this.scene=e}set mainCamera(e){this.camera=e}get renderToScreen(){return super.renderToScreen}set renderToScreen(e){super.renderToScreen=e,this.clearPass.renderToScreen=e}get overrideMaterial(){let e=this.overrideMaterialManager;return e!==null?e.material:null}set overrideMaterial(e){let t=this.overrideMaterialManager;e!==null?t!==null?t.setMaterial(e):this.overrideMaterialManager=new b(e):t!==null&&(t.dispose(),this.overrideMaterialManager=null)}getOverrideMaterial(){return this.overrideMaterial}setOverrideMaterial(e){this.overrideMaterial=e}get clear(){return this.clearPass.enabled}set clear(e){this.clearPass.enabled=e}getSelection(){return this.selection}setSelection(e){this.selection=e}isBackgroundDisabled(){return this.ignoreBackground}setBackgroundDisabled(e){this.ignoreBackground=e}isShadowMapDisabled(){return this.skipShadowMapUpdate}setShadowMapDisabled(e){this.skipShadowMapUpdate=e}getClearPass(){return this.clearPass}render(e,t,s,r,a){let i=this.scene,n=this.camera,o=this.selection,d=n.layers.mask,h=i.background,B=e.shadowMap.autoUpdate,M=this.renderToScreen?null:t;o!==null&&n.layers.set(o.getLayer()),this.skipShadowMapUpdate&&(e.shadowMap.autoUpdate=!1),(this.ignoreBackground||this.clearPass.overrideClearColor!==null)&&(i.background=null),this.clearPass.enabled&&this.clearPass.render(e,t),e.setRenderTarget(M),this.overrideMaterialManager!==null?this.overrideMaterialManager.render(e,i,n):e.render(i,n),n.layers.mask=d,i.background=h,e.shadowMap.autoUpdate=B}};var j=S("tweakpane"),z=S("spatial-controls");var q=Math.PI/180,K=180/Math.PI;function G(l,e=16/9){return Math.atan(Math.tan(l*q*.5)/e)*K*2}var y=class{constructor(){this.fps="0",this.timestamp=0,this.acc=0,this.frames=0}update(e){++this.frames,this.acc+=e-this.timestamp,this.timestamp=e,this.acc>=1e3&&(this.fps=this.frames.toFixed(0),this.acc=0,this.frames=0)}};var u=S("three");function N(){let l=new u.AmbientLight(5390108),e=new u.PointLight(16704176,1,3);e.position.set(0,.93,0),e.castShadow=!0,e.shadow.bias=-.035,e.shadow.mapSize.width=1024,e.shadow.mapSize.height=1024,e.shadow.radius=4;let t=new u.DirectionalLight(16711680,.05);t.position.set(-1,0,0),t.target.position.set(0,0,0);let s=new u.DirectionalLight(65280,.05);s.position.set(1,0,0),s.target.position.set(0,0,0);let r=new u.Group;return r.add(e,t,s,l),r}function H(){let l=new u.PlaneGeometry,e=new u.MeshStandardMaterial({color:16777215}),t=new u.Mesh(l,e),s=new u.Mesh(l,e),r=new u.Mesh(l,e),a=new u.Mesh(l,e),i=new u.Mesh(l,e);t.position.y=-1,t.rotation.x=Math.PI*.5,t.scale.set(2,2,1),s.position.y=-1,s.rotation.x=Math.PI*-.5,s.scale.set(2,2,1),s.receiveShadow=!0,r.position.y=1,r.rotation.x=Math.PI*.5,r.scale.set(2,2,1),r.receiveShadow=!0,a.position.z=-1,a.scale.set(2,2,1),a.receiveShadow=!0,i.position.z=1,i.rotation.y=Math.PI,i.scale.set(2,2,1),i.receiveShadow=!0;let n=new u.Mesh(l,new u.MeshStandardMaterial({color:16711680})),o=new u.Mesh(l,new u.MeshStandardMaterial({color:65280})),d=new u.Mesh(l,new u.MeshStandardMaterial({color:16777215,emissive:16777215}));n.position.x=-1,n.rotation.y=Math.PI*.5,n.scale.set(2,2,1),n.receiveShadow=!0,o.position.x=1,o.rotation.y=Math.PI*-.5,o.scale.set(2,2,1),o.receiveShadow=!0,d.position.y=1-.001,d.rotation.x=Math.PI*.5,d.scale.set(.4,.4,1);let h=new u.Group;return h.add(t,s,r,a,i,n,o,d),h}function V(){let l=new u.MeshStandardMaterial({color:16777215}),e=new u.Mesh(new u.BoxGeometry(1,1,1),l),t=new u.Mesh(new u.BoxGeometry(1,1,1),l),s=new u.Mesh(new u.SphereGeometry(1,32,32),l);e.position.set(-.35,-.4,-.3),e.rotation.y=Math.PI*.1,e.scale.set(.6,1.2,.6),e.castShadow=!0,t.position.set(.35,-.7,.3),t.rotation.y=Math.PI*-.1,t.scale.set(.6,.6,.6),t.castShadow=!0,s.position.set(-.5,-.7,.6),s.scale.set(.3,.3,.3),s.castShadow=!0;let r=new u.Group;return r.add(e,t,s),r}function Y(){let l=new Map,e=new g.LoadingManager,t=new g.CubeTextureLoader(e),s=document.baseURI+"img/textures/skies/sunset/",r=".png",a=[s+"px"+r,s+"nx"+r,s+"py"+r,s+"ny"+r,s+"pz"+r,s+"nz"+r];return new Promise((i,n)=>{e.onLoad=()=>i(l),e.onError=o=>n(new Error(`Failed to load ${o}`)),t.load(a,o=>{o.colorSpace=g.SRGBColorSpace,l.set("sky",o)})})}window.addEventListener("load",()=>Y().then(l=>{let e=new g.WebGLRenderer({powerPreference:"high-performance",antialias:!1,stencil:!1,depth:!1});e.debug.checkShaderErrors=window.location.hostname==="localhost",e.shadowMap.type=g.VSMShadowMap,e.shadowMap.autoUpdate=!1,e.shadowMap.needsUpdate=!0,e.shadowMap.enabled=!0;let t=document.querySelector(".viewport");t.prepend(e.domElement);let s=new g.PerspectiveCamera,r=new z.SpatialControls(s.position,s.quaternion,e.domElement),a=r.settings;a.general.mode=z.ControlMode.THIRD_PERSON,a.rotation.sensitivity=2.2,a.rotation.damping=.05,a.zoom.damping=.1,a.translation.enabled=!1,r.position.set(0,0,5);let i=new g.Scene;i.background=l.get("sky"),i.add(N()),i.add(H()),i.add(V());let n=e.capabilities.maxSamples,o=new F(e,{multisampling:Math.min(4,n)});o.addPass(new L(i,s)),o.addPass(new T);let d=new y,h=new j.Pane({container:t.querySelector(".tp")});h.addBinding(d,"fps",{readonly:!0,label:"FPS"}),h.addFolder({title:"Settings"}).addBinding(o,"multisampling",{label:"MSAA",options:{OFF:0,LOW:Math.min(2,n),MEDIUM:Math.min(4,n),HIGH:Math.min(8,n)}});function M(){let P=t.clientWidth,v=t.clientHeight;s.aspect=P/v,s.fov=G(90,Math.max(s.aspect,16/9)),s.updateProjectionMatrix(),o.setSize(P,v)}window.addEventListener("resize",M),M(),requestAnimationFrame(function P(v){d.update(v),r.update(v),o.render(),requestAnimationFrame(P)})}));})();
