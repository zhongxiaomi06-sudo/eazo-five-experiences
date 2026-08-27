import { useEffect, useRef } from 'react';

export function SpaceRenderer({ progress }: { progress: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const gl = canvas?.getContext('webgl', { antialias: false, alpha: false });
    if (!canvas || !gl) return;
    const vertex = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertex, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'); gl.compileShader(vertex);
    const fragment = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragment, 'precision mediump float;uniform float u;void main(){vec2 p=gl_FragCoord.xy/vec2(900.,600.);float horizon=smoothstep(.05,.85,p.y+u*.45);vec3 ground=vec3(.04,.17,.12);vec3 sky=mix(vec3(.04,.35,.64),vec3(.015,.01,.08),u);vec3 c=mix(ground,sky,horizon);float star=step(.998,fract(sin(dot(floor(gl_FragCoord.xy/4.),vec2(12.9898,78.233)))*43758.5453));c+=star*u;gl_FragColor=vec4(c,1.);}'); gl.compileShader(fragment);
    const program = gl.createProgram()!; gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program); gl.useProgram(program);
    const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    const location = gl.getAttribLocation(program, 'p'); gl.enableVertexAttribArray(location); gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
    gl.viewport(0, 0, canvas.width, canvas.height); gl.uniform1f(gl.getUniformLocation(program, 'u'), progress); gl.drawArrays(gl.TRIANGLES, 0, 6);
    return () => { gl.deleteBuffer(buffer); gl.deleteProgram(program); gl.deleteShader(vertex); gl.deleteShader(fragment); };
  }, [progress]);
  return <canvas ref={ref} width="900" height="600" aria-hidden="true" />;
}
