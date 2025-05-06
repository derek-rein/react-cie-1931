export const VERTEX_SHADER_SOURCE = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

export const FRAGMENT_SHADER_SOURCE = `
  precision highp float;
  uniform vec2 u_resolution;
  uniform vec2 u_scale;

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    
    // Scale using the props
    float x = uv.x * u_scale.x;
    float y = uv.y * u_scale.y;
    
    if (y == 0.0) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // Black for y=0
      return;
    }
    
    // Keep Y constant for uniform luminance
    float Y = 0.8; // Higher value for brighter colors overall
    float X = (x / y) * Y;
    float Z = ((1.0 - x - y) / y) * Y;
    
    // Standard XYZ to RGB conversion matrix for sRGB (D65 white point)
    float R =  3.2404542 * X - 1.5371385 * Y - 0.4985314 * Z;
    float G = -0.9692660 * X + 1.8760108 * Y + 0.0415560 * Z;
    float B =  0.0556434 * X - 0.2040259 * Y + 1.0572252 * Z;
    
    // Gamut mapping - preserve hue while fitting into RGB space
    float maxChannel = max(max(R, G), max(B, 0.0001));
    
    // Normalize colors to fit in RGB gamut while preserving hue
    if (maxChannel > 1.0) {
      R /= maxChannel;
      G /= maxChannel;
      B /= maxChannel;
    }
    
    // Ensure values are in valid range
    R = clamp(R, 0.0, 1.0);
    G = clamp(G, 0.0, 1.0);
    B = clamp(B, 0.0, 1.0);
    
    // Apply gamma correction for sRGB
    R = pow(R, 1.0/2.2);
    G = pow(G, 1.0/2.2);
    B = pow(B, 1.0/2.2);
    
    gl_FragColor = vec4(R, G, B, 1.0);
  }
`;
