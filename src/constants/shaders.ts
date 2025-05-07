export const VERTEX_SHADER_SOURCE = `
  attribute vec2 a_position;
  varying vec2 v_texCoord; // Pass texture coordinates to fragment shader

  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_position * 0.5 + 0.5; // Transform from [-1, 1] to [0, 1]
  }
`;

export const FRAGMENT_SHADER_SOURCE = `
  precision mediump float; // Using highp for more precision in color calcs
  uniform vec2 u_resolution; // Canvas resolution
  uniform float u_xScale;    // Max x for chromaticity coords
  uniform float u_yScale;    // Max y for chromaticity coords
  uniform mat3 u_XYZ_to_TargetRGB_Matrix; // Matrix to convert XYZ to target linear RGB
  uniform bool u_applyGamma; // ADDED: To control manual gamma application in shader

  varying vec2 v_texCoord; // Interpolated texture coordinates from vertex shader

  // sRGB/Display P3 EOTF (gamma correction)
  // This function is the same for sRGB and Display P3
  float gammaCorrect(float C_linear) {
    // Using 0.0031308 threshold
    return (C_linear <= 0.0031308) ? 12.92 * C_linear : 1.055 * pow(C_linear, 1.0/2.4) - 0.055;
  }

  vec3 linearToTargetRGB(vec3 linearRGB) {
    return vec3(
      gammaCorrect(linearRGB.r),
      gammaCorrect(linearRGB.g),
      gammaCorrect(linearRGB.b)
    );
  }

  void main() {
    float x_chroma = (gl_FragCoord.x / u_resolution.x) * u_xScale;
    float y_chroma = (gl_FragCoord.y / u_resolution.y) * u_yScale;
    float z_chroma = 1.0 - x_chroma - y_chroma;

    if (x_chroma < 0.0 || y_chroma <= 0.0 || z_chroma < 0.0) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0); // Transparent for out-of-bounds
      return;
    }

    // Convert (x, y) chromaticity to XYZ (assuming Y_luminance = 0.8 for brightness)
    float Y_luminance = 0.8; // Reverted from 1.0 to match previous brightness levels
    vec3 XYZ = vec3((x_chroma / y_chroma) * Y_luminance, Y_luminance, (z_chroma / y_chroma) * Y_luminance);

    vec3 linear_RGB = u_XYZ_to_TargetRGB_Matrix * XYZ;

    // Normalize brightness for out-of-gamut colors to preserve hue/saturation before hard clamp
    float max_component = max(max(linear_RGB.r, linear_RGB.g), linear_RGB.b);
    if (max_component > 1.0) {
      linear_RGB /= max_component;
    }

    // Clip to [0, 1] after normalization, ensures values are valid for gamma correction
    vec3 clipped_linear_RGB = clamp(linear_RGB, 0.0, 1.0);

    vec3 final_RGB;
    if (u_applyGamma) {
      final_RGB = linearToTargetRGB(clipped_linear_RGB);
    } else {
      final_RGB = clipped_linear_RGB;
    }

    gl_FragColor = vec4(final_RGB, 1.0);
  }
`;
