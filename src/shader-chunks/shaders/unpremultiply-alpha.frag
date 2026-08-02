gl_FragColor.rgb = (gl_FragColor.a == 0.0) ? vec3(0.0) : gl_FragColor.rgb / gl_FragColor.a;
