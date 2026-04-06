import { useEffect, useRef } from "react";

export function MistBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const vsSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_seed;

      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 6; i++) {
          v += a * noise(p);
          p *= 2.0;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        uv.x *= u_resolution.x / u_resolution.y;

        vec2 mPos = u_mouse / u_resolution.xy;
        mPos.x *= u_resolution.x / u_resolution.y;
        float dist = distance(uv, mPos);

        vec2 q = vec2(0.0);
        q.x = fbm(uv + 0.03 * u_time);
        q.y = fbm(uv + vec2(1.0, 1.0));

        vec2 r = vec2(0.0);
        r.x = fbm(uv + 1.0 * q + vec2(1.7, 9.2) + 0.15 * u_time);
        r.y = fbm(uv + 1.0 * q + vec2(8.3, 2.8) + 0.126 * u_time);

        // Animate UV space smoothly across entire screen
        vec2 flow = uv + vec2(u_time * 0.05, u_time * 0.03);

        // Add seed offset (different every load)
        flow += vec2(u_seed * 0.1, u_seed * 0.07);

        // Subtle warp to break repetition
        vec2 warp = vec2(
          fbm(flow + u_seed),
          fbm(flow - u_seed)
        );
        flow += warp * 0.15;

        // Slight random scale variation
        float scale = 1.9 + fract(u_seed) * 0.7;
        
        // Layered FBM for cloud structure
        float f1 = fbm(flow * scale);
        float f2 = fbm(flow * (scale * 1.7) + 10.0);

        // Combine for richer clouds
        float f = mix(f1, f2, 0.5);

        // Shape into clouds
        f = smoothstep(0.5, 0.8, f);
        f = pow(f, 1.4);

        // Softer morning sky
        vec3 skyColor = vec3(0.294, 0.573, 0.859); // 4th last
        vec3 cloudColor = vec3(0.97, 0.94, 0.88);  // subtle cream for clouds

        // Vertical gradient for sunrise effect
        // vec3 sunrise = mix(vec3(1.0, 0.6, 0.5), skyColor, uv.y);

        // Blend clouds more subtly
        vec3 color = mix(skyColor, cloudColor, f * 0.6); // f * x = reduces x to reduce cloud brightness

        // Soft lighting
        color += 0.1 * f * vec3(1.0, 0.85, 0.7); // subtle glow

        // Mouse glow
        float mouseGlow = pow(smoothstep(0.1, 0.0, dist), 3.0);
        color += mouseGlow * 0.02 * vec3(0.6, 0.7, 1.0);

        color = pow(color, vec3(1.1)) * 1.4;
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    function compileShader(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    }

    const program = gl.createProgram();
    gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vsSource));
    gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fsSource));
    gl.linkProgram(program);
    gl.useProgram(program);

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const posAttrib = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(posAttrib);
    gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(program, "u_time");
    const resLoc = gl.getUniformLocation(program, "u_resolution");
    const mouseLoc = gl.getUniformLocation(program, "u_mouse");
    const seedLoc = gl.getUniformLocation(program, "u_seed");
    const seed = Math.random() * 1000;

    let mouse = { x: 0, y: 0 };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = window.innerHeight - e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);

    let raf;
    const render = (time) => {
      if (
        canvas.width  !== window.innerWidth ||
        canvas.height !== window.innerHeight
      ) {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }

      gl.uniform1f(timeLoc, time * 0.001);
      gl.uniform1f(seedLoc, seed);
      gl.uniform2f(resLoc, canvas.width, canvas.height);
      gl.uniform2f(mouseLoc, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: -1,
        background: "#09090b",
      }}
    />
  );
}