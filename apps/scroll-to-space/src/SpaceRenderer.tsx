import { useEffect, useRef } from 'react';
import type { CityId } from './story';

export function SpaceRenderer({ progress, cityId, quality }: { progress: number; cityId: CityId; quality: 'full3d' | 'degraded3d' | 'static' }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ratio = quality === 'full3d' ? Math.min(devicePixelRatio, 1.5) : 1;
    const width = Math.floor(innerWidth * ratio); const height = Math.floor(innerHeight * ratio); canvas.width = width; canvas.height = height;
    const gl = quality === 'static' ? null : canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: quality === 'full3d' ? 'high-performance' : 'low-power' });
    if (!gl) {
      const context = canvas.getContext('2d'); if (!context) return;
      const gradient = context.createLinearGradient(0, 0, 0, height); gradient.addColorStop(0, progress > .65 ? '#02040a' : '#0a3152'); gradient.addColorStop(1, progress > .65 ? '#10162d' : '#e3a158');
      context.fillStyle = gradient; context.fillRect(0, 0, width, height); context.fillStyle = '#080b12'; context.beginPath(); context.arc(width * .5, height * (1.58 - progress * .3), width * 1.05, Math.PI, Math.PI * 2); context.fill(); return;
    }
    const vertex = gl.createShader(gl.VERTEX_SHADER)!; gl.shaderSource(vertex, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'); gl.compileShader(vertex);
    const fragment = gl.createShader(gl.FRAGMENT_SHADER)!; gl.shaderSource(fragment, `precision highp float;uniform float u;uniform float city;uniform vec2 res;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){vec2 uv=gl_FragCoord.xy/res;float t=clamp(u,0.,1.);vec3 dawn=vec3(.98,.48,.20);vec3 blue=vec3(.03,.20,.34);vec3 ink=vec3(.006,.008,.025);vec3 sky=mix(mix(dawn,blue,smoothstep(.0,.22,uv.y)),ink,smoothstep(.12,.75,t));float star=step(mix(1.0,.992,t),hash(floor(gl_FragCoord.xy/3.)));sky+=star*pow(t,2.2)*vec3(.7,.85,1.);float r=mix(1.8,.77,smoothstep(.55,1.,t));vec2 c=vec2(.5,mix(-1.18,-.46,t));float d=length((uv-c)/vec2(1.,res.x/res.y));float earth=1.-smoothstep(r,r+.005,d);float limb=smoothstep(r-.028,r,d)*(1.-smoothstep(r,r+.015,d));vec3 surface=mix(vec3(.018,.035,.045),vec3(.02,.12,.16),smoothstep(.45,1.,t));vec3 color=mix(sky,surface,earth);color+=limb*mix(vec3(.98,.48,.18),vec3(.12,.62,1.),t)*1.8;float cityNoise=hash(floor(uv*vec2(210.,110.)));float lights=step(.988-city*.002,cityNoise)*(1.-smoothstep(.18,.62,t))*earth;color+=lights*vec3(1.,.48,.12);gl_FragColor=vec4(color,1.);}`); gl.compileShader(fragment);
    const program = gl.createProgram()!; gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program); gl.useProgram(program);
    const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    const location = gl.getAttribLocation(program, 'p'); gl.enableVertexAttribArray(location); gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
    gl.viewport(0, 0, width, height); gl.uniform1f(gl.getUniformLocation(program, 'u'), progress); gl.uniform1f(gl.getUniformLocation(program, 'city'), cityId === 'beijing' ? 1 : 0); gl.uniform2f(gl.getUniformLocation(program, 'res'), width, height); gl.drawArrays(gl.TRIANGLES, 0, 6);
    return () => { gl.deleteBuffer(buffer); gl.deleteProgram(program); gl.deleteShader(vertex); gl.deleteShader(fragment); };
  }, [cityId, progress, quality]);
  return <canvas className="space-canvas" ref={ref} aria-hidden="true"/>;
}
