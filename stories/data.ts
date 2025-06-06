type ColorSpace = {

    name: string;
    rgb: {
        r: [number, number];
        g: [number, number];
        b: [number, number];
    };
    whitepoint: {
        x: number;
        y: number;
    };
}
export const colorspaces = [
    {
      "name": "ACES2065-1",
      "rgb": {
        "r": [0.7347, 0.2653],
        "g": [0, 1],
        "b": [0.0001, -0.077]
      },
      "whitepoint": {
        "x": 0.32168,
        "y": 0.33767
      }
    },
    {
      "name": "ACEScc",
      "rgb": {
        "r": [0.713, 0.293],
        "g": [0.165, 0.83],
        "b": [0.128, 0.044]
      },
      "whitepoint": {
        "x": 0.32168,
        "y": 0.33767
      }
    },
    {
      "name": "ACEScct",
      "rgb": {
        "r": [0.713, 0.293],
        "g": [0.165, 0.83],
        "b": [0.128, 0.044]
      },
      "whitepoint": {
        "x": 0.32168,
        "y": 0.33767
      }
    },
    {
      "name": "ACEScg",
      "rgb": {
        "r": [0.713, 0.293],
        "g": [0.165, 0.83],
        "b": [0.128, 0.044]
      },
      "whitepoint": {
        "x": 0.32168,
        "y": 0.33767
      }
    },
    {
      "name": "ACESproxy",
      "rgb": {
        "r": [0.713, 0.293],
        "g": [0.165, 0.83],
        "b": [0.128, 0.044]
      },
      "whitepoint": {
        "x": 0.32168,
        "y": 0.33767
      }
    },
    {
      "name": "ARRI Wide Gamut 3",
      "rgb": {
        "r": [0.684, 0.313],
        "g": [0.221, 0.848],
        "b": [0.0861, -0.102]
      },
      "whitepoint": {
        "x": 0.3127,
        "y": 0.329
      }
    },
    {
      "name": "ARRI Wide Gamut 4",
      "rgb": {
        "r": [0.7347, 0.2653],
        "g": [0.1424, 0.8576],
        "b": [0.0991, -0.0308]
      },
      "whitepoint": {
        "x": 0.3127,
        "y": 0.329
      }
    },
    {
      "name": "Adobe RGB (1998)",
      "rgb": {
        "r": [0.64, 0.33],
        "g": [0.21, 0.71],
        "b": [0.15, 0.06]
      },
      "whitepoint": {
        "x": 0.3127,
        "y": 0.329
      }
    },
    {
      "name": "Adobe Wide Gamut RGB",
      "rgb": {
        "r": [0.7347, 0.2653],
        "g": [0.1152, 0.8264],
        "b": [0.1566, 0.0177]
      },
      "whitepoint": {
        "x": 0.3457,
        "y": 0.3585
      }
    },
    {
      "name": "Apple RGB",
      "rgb": {
        "r": [0.625, 0.34],
        "g": [0.28, 0.595],
        "b": [0.155, 0.07]
      },
      "whitepoint": {
        "x": 0.3127,
        "y": 0.329
      }
    },
    {
      "name": "Best RGB",
      "rgb": {
        "r": [0.735191637630662, 0.264808362369338],
        "g": [0.215336134453781, 0.774159663865546],
        "b": [0.130122950819672, 0.03483606557377]
      },
      "whitepoint": {
        "x": 0.3457,
        "y": 0.3585
      }
    },
    {
      "name": "Beta RGB",
      "rgb": {
        "r": [0.6888, 0.3112],
        "g": [0.1986, 0.7551],
        "b": [0.1265, 0.0352]
      },
      "whitepoint": {
        "x": 0.3457,
        "y": 0.3585
      }
    },
    {
      "name": "Blackmagic Wide Gamut",
      "rgb": {
        "r": [0.7177215, 0.3171181],
        "g": [0.228041, 0.861569],
        "b": [0.1005841, -0.0820452]
      },
      "whitepoint": {
        "x": 0.312717,
        "y": 0.3290312
      }
    },
    {
      "name": "CIE RGB",
      "rgb": {
        "r": [0.734742840005998, 0.265257159994002],
        "g": [0.273779033824958, 0.717477700256116],
        "b": [0.16655562958028, 0.008910726182545]
      },
      "whitepoint": {
        "x": 0.333333333333333,
        "y": 0.333333333333333
      }
    },
    {
      "name": "Cinema Gamut",
      "rgb": {
        "r": [0.74, 0.27],
        "g": [0.17, 1.14],
        "b": [0.08, -0.1]
      },
      "whitepoint": {
        "x": 0.3127,
        "y": 0.329
      }
    },
    {
      "name": "ColorMatch RGB",
      "rgb": {
        "r": [0.63, 0.34],
        "g": [0.295, 0.605],
        "b": [0.15, 0.075]
      },
      "whitepoint": {
        "x": 0.3457,
        "y": 0.3585
      }
    },
    {
      "name": "DCDM XYZ",
      "rgb": {
        "r": [1, 0],
        "g": [0, 1],
        "b": [0, 0]
      },
      "whitepoint": {
        "x": 0.333333333333333,
        "y": 0.333333333333333
      }
    },
    {
      "name": "DCI-P3",
      "rgb": {
        "r": [0.68, 0.32],
        "g": [0.265, 0.69],
        "b": [0.15, 0.06]
      },
      "whitepoint": {
        "x": 0.314,
        "y": 0.351
      }
    },
    {
      "name": "DCI-P3-P",
      "rgb": {
        "r": [0.74, 0.27],
        "g": [0.22, 0.78],
        "b": [0.09, -0.09]
      },
      "whitepoint": {
        "x": 0.314,
        "y": 0.351
      }
    },
    {
      "name": "DJI D-Gamut",
      "rgb": {
        "r": [0.71, 0.31],
        "g": [0.21, 0.88],
        "b": [0.09, -0.08]
      },
      "whitepoint": {
        "x": 0.3127,
        "y": 0.329
      }
    },
    {
      "name": "DRAGONcolor",
      "rgb": {
        "r": [0.758655892599321, 0.330355348611293],
        "g": [0.294923619810175, 0.708053242065117],
        "b": [0.085961601167585, -0.045879436983969]
      },
      "whitepoint": {
        "x": 0.3127,
        "y": 0.329
      }
    },
    {
      "name": "DRAGONcolor2",
      "rgb": {
        "r": [0.758656214177604, 0.330355835762678],
        "g": [0.294923887732982, 0.708053363192126],
        "b": [0.144168726866337, 0.050357384587121]
      },
      "whitepoint": {
        "x": 0.3127,
        "y": 0.329
      }
    },
    {
      "name": "DaVinci Wide Gamut",
      "rgb": {
        "r": [0.8, 0.313],
        "g": [0.1682, 0.9877],
        "b": [0.079, -0.1155]
      },
      "whitepoint": {
        "x": 0.3127,
        "y": 0.329
      }
    },
    {
      "name": "Display P3",
      "rgb": {
        "r": [0.68, 0.32],
        "g": [0.265, 0.69],
        "b": [0.15, 0.06]
      },
      "whitepoint": {
        "x": 0.3127,
        "y": 0.329
      }
    },
    {
      "name": "Don RGB 4",
      "rgb": {
        "r": [0.696120689655172, 0.299568965517241],
        "g": [0.2146829810901, 0.765294771968854],
        "b": [0.12993762993763, 0.035343035343035]
      },
      "whitepoint": {
        "x": 0.3457,
        "y": 0.3585
      }
    },
    {
      "name": "EBU Tech. 3213-E",
      "rgb": {
        "r": [0.64, 0.33],
        "g": [0.29, 0.6],
        "b": [0.15, 0.06]
      },
      "whitepoint": {
        "x": 0.313,
        "y": 0.329
      }
    },
    {
      "name": "ECI RGB v2",
      "rgb": {
        "r": [0.670103092783505, 0.329896907216495],
        "g": [0.209905660377358, 0.709905660377358],
        "b": [0.140061791967044, 0.08032955715757]
      },
      "whitepoint": {
        "x": 0.3457,
        "y": 0.3585
      }
    },
    {
      "name": "ERIMM RGB",
      "rgb": {
        "r": [0.7347, 0.2653],
        "g": [0.1596, 0.8404],
        "b": [0.0366, 0.0001]
      },
      "whitepoint": {
        "x": 0.3457,
        "y": 0.3585
      }
    },
    {
      "name": "Ekta Space PS 5",
      "rgb": {
        "r": [0.694736842105263, 0.305263157894737],
        "g": [0.26, 0.7],
        "b": [0.10972850678733, 0.004524886877828]
      },
      "whitepoint": {
        "x": 0.3457,
        "y": 0.3585
      }
    },
    {
      "name": "F-Gamut",
      "rgb": {
        "r": [0.708, 0.292],
        "g": [0.17, 0.797],
        "b": [0.131, 0.046]
      },
      "whitepoint": {
        "x": 0.3127,
        "y": 0.329
      }
    },
    {
      "name": "FilmLight E-Gamut",
      "rgb": {
        "r": [0.8, 0.3177],
        "g": [0.18, 0.9],
        "b": [0.065, -0.0805]
      },
      "whitepoint": {
        "x": 0.3127,
        "y": 0.329
      }
    },
    {
      "name": "ITU-R BT.2020",
      "rgb": {
        "r": [0.708, 0.292],
        "g": [0.17, 0.797],
        "b": [0.131, 0.046]
      },
      "whitepoint": {
        "x": 0.3127,
        "y": 0.329
      }
    },
    {
      "name": "ITU-R BT.470 - 525",
      "rgb": {
        "r": [0.67, 0.33],
        "g": [0.21, 0.71],
        "b": [0.14, 0.08]
      },
      "whitepoint": {
        "x": 0.31006,
        "y": 0.31616
      }
    },
    {
      "name": "ITU-R BT.470 - 625",
      "rgb": {
        "r": [0.64, 0.33],
        "g": [0.29, 0.6],
        "b": [0.15, 0.06]
      },
      "whitepoint": {
        "x": 0.3127,
        "y": 0.329
      }
    },
    {
      "name": "ITU-R BT.709",
      "rgb": {
        "r": [0.64, 0.33],
        "g": [0.3, 0.6],
        "b": [0.15, 0.06]
      },
      "whitepoint": {
        "x": 0.3127,
        "y": 0.329
      }
    },
    {
      "name": "ITU-T H.273 - 22 Unspecified",
      "rgb": {
        "r": [0.63, 0.34],
        "g": [0.295, 0.605],
        "b": [0.155, 0.077]
      },
      "whitepoint": {
        "x": 0.3127,
        "y": 0.329
      }
    },
    {
      "name": "ITU-T H.273 - Generic Film",
      "rgb": {
        "r": [0.681, 0.319],
        "g": [0.243, 0.692],
        "b": [0.145, 0.049]
      },
      "whitepoint": {
        "x": 0.31,
        "y": 0.316
      }
    },
    {
      "name": "Max RGB",
      "rgb": {
        "r": [0.73413379, 0.26586621],
        "g": [0.10039113, 0.89960887],
        "b": [0.03621495, 0]
      },
      "whitepoint": {
        "x": 0.3457,
        "y": 0.3585
      }
    },
    {
      "name": "N-Gamut",
      "rgb": {
        "r": [0.708, 0.292],
        "g": [0.17, 0.797],
        "b": [0.131, 0.046]
      },
      "whitepoint": {
        "x": 0.3127,
        "y": 0.329
      }
    },
    {
      "name": "NTSC (1953)",
      "rgb": {
        "r": [0.67, 0.33],
        "g": [0.21, 0.71],
        "b": [0.14, 0.08]
      },
      "whitepoint": {
        "x": 0.31006,
        "y": 0.31616
      }
    },
    {
      "name": "NTSC (1987)",
      "rgb": {
        "r": [0.63, 0.34],
        "g": [0.31, 0.595],
        "b": [0.155, 0.07]
      },
      "whitepoint": {
        "x": 0.3127,
        "y": 0.329
      }
    },
    {
      "name": "P3-D65",
      "rgb": {
        "r": [0.68, 0.32],
        "g": [0.265, 0.69],
        "b": [0.15, 0.06]
      },
      "whitepoint": {
        "x": 0.3127,
        "y": 0.329
      }
    },
    {
      "name": "PLASA ANSI E1.54",
      "rgb": {
        "r": [0.7347, 0.2653],
        "g": [0.1596, 0.8404],
        "b": [0.0366, 0.0001]
      },
      "whitepoint": {
        "x": 0.4254,
        "y": 0.4044
      }
    },
    {
      "name": "Pal/Secam",
      "rgb": {
        "r": [0.64, 0.33],
        "g": [0.29, 0.6],
        "b": [0.15, 0.06]
      },
      "whitepoint": {
        "x": 0.3127,
        "y": 0.329
      }
    },
    {
      "name": "ProPhoto RGB",
      "rgb": {
        "r": [0.7347, 0.2653],
        "g": [0.1596, 0.8404],
        "b": [0.0366, 0.0001]
      },
      "whitepoint": {
        "x": 0.3457,
        "y": 0.3585
      }
    },
    {
      "name": "Protune Native",
      "rgb": {
        "r": [0.698480461493841, 0.193026445370121],
        "g": [0.329555378387345, 1.02459662413464],
        "b": [0.108442631407675, -0.034678569754016]
      },
      "whitepoint": {
        "x": 0.3127,
        "y": 0.329
      }
    },
    {
      "name": "REDWideGamutRGB",
      "rgb": {
        "r": [0.780308, 0.304253],
        "g": [0.121595, 1.493994],
        "b": [0.095612, -0.084589]
      },
      "whitepoint": {
        "x": 0.3127,
        "y": 0.329
      }
    },
    {
      "name": "REDcolor",
      "rgb": {
        "r": [0.701058563171395, 0.330180975940326],
        "g": [0.298811317306316, 0.625169245953133],
        "b": [0.135038675201355, 0.035261776551191]
      },
      "whitepoint": {
        "x": 0.3127,
        "y": 0.329
      }
    },
    {
      "name": "REDcolor2",
      "rgb": {
        "r": [0.897407221929776, 0.330776225980398],
        "g": [0.296022094516625, 0.684635550900945],
        "b": [0.099799512883393, -0.023000513177992]
      },
      "whitepoint": {
        "x": 0.3127,
        "y": 0.329
      }
    },
    {
      "name": "REDcolor3",
      "rgb": {
        "r": [0.702598658589917, 0.330185588938484],
        "g": [0.295782235737268, 0.689748258397534],
        "b": [0.111090529079787, -0.004332320984771]
      },
      "whitepoint": {
        "x": 0.3127,
        "y": 0.329
      }
    },
    {
      "name": "REDcolor4",
      "rgb": {
        "r": [0.702598154635438, 0.330185096210515],
        "g": [0.295782328047083, 0.689748253964859],
        "b": [0.144459236489795, 0.050837720977386]
      },
      "whitepoint": {
        "x": 0.3127,
        "y": 0.329
      }
    },
    {
      "name": "RIMM RGB",
      "rgb": {
        "r": [0.7347, 0.2653],
        "g": [0.1596, 0.8404],
        "b": [0.0366, 0.0001]
      },
      "whitepoint": {
        "x": 0.3457,
        "y": 0.3585
      }
    },
    {
      "name": "ROMM RGB",
      "rgb": {
        "r": [0.7347, 0.2653],
        "g": [0.1596, 0.8404],
        "b": [0.0366, 0.0001]
      },
      "whitepoint": {
        "x": 0.3457,
        "y": 0.3585
      }
    },
    {
      "name": "Russell RGB",
      "rgb": {
        "r": [0.69, 0.31],
        "g": [0.18, 0.77],
        "b": [0.1, 0.02]
      },
      "whitepoint": {
        "x": 0.33243,
        "y": 0.34744
      }
    },
    {
      "name": "S-Gamut",
      "rgb": {
        "r": [0.73, 0.28],
        "g": [0.14, 0.855],
        "b": [0.1, -0.05]
      },
      "whitepoint": {
        "x": 0.3127,
        "y": 0.329
      }
    },
    {
      "name": "S-Gamut3",
      "rgb": {
        "r": [0.73, 0.28],
        "g": [0.14, 0.855],
        "b": [0.1, -0.05]
      },
      "whitepoint": {
        "x": 0.3127,
        "y": 0.329
      }
    },
    {
      "name": "S-Gamut3.Cine",
      "rgb": {
        "r": [0.766, 0.275],
        "g": [0.225, 0.8],
        "b": [0.089, -0.087]
      },
      "whitepoint": {
        "x": 0.3127,
        "y": 0.329
      }
    },
    {
      "name": "SMPTE 240M",
      "rgb": {
        "r": [0.63, 0.34],
        "g": [0.31, 0.595],
        "b": [0.155, 0.07]
      },
      "whitepoint": {
        "x": 0.3127,
        "y": 0.329
      }
    },
    {
      "name": "SMPTE C",
      "rgb": {
        "r": [0.63, 0.34],
        "g": [0.31, 0.595],
        "b": [0.155, 0.07]
      },
      "whitepoint": {
        "x": 0.3127,
        "y": 0.329
      }
    },
    {
      "name": "Sharp RGB",
      "rgb": {
        "r": [0.6898, 0.3206],
        "g": [0.0736, 0.9003],
        "b": [0.1166, 0.0374]
      },
      "whitepoint": {
        "x": 0.333333333333333,
        "y": 0.333333333333333
      }
    },
    {
      "name": "V-Gamut",
      "rgb": {
        "r": [0.73, 0.28],
        "g": [0.165, 0.84],
        "b": [0.1, -0.03]
      },
      "whitepoint": {
        "x": 0.3127,
        "y": 0.329
      }
    },
    {
      "name": "Venice S-Gamut3",
      "rgb": {
        "r": [0.740464264304292, 0.27936437475066],
        "g": [0.089241145423286, 0.893809528608105],
        "b": [0.110488236673827, -0.052579333080476]
      },
      "whitepoint": {
        "x": 0.3127,
        "y": 0.329
      }
    },
    {
      "name": "Venice S-Gamut3.Cine",
      "rgb": {
        "r": [0.775901871567345, 0.274502392854799],
        "g": [0.188682902773355, 0.828684937020288],
        "b": [0.101337382499301, -0.089187517306263]
      },
      "whitepoint": {
        "x": 0.3127,
        "y": 0.329
      }
    },
    {
      "name": "Xtreme RGB",
      "rgb": {
        "r": [1, 0],
        "g": [0, 1],
        "b": [0, 0]
      },
      "whitepoint": {
        "x": 0.3457,
        "y": 0.3585
      }
    },
    {
      "name": "sRGB",
      "rgb": {
        "r": [0.64, 0.33],
        "g": [0.3, 0.6],
        "b": [0.15, 0.06]
      },
      "whitepoint": {
        "x": 0.3127,
        "y": 0.329
      }
    },
    {
      "name": "aces",
      "rgb": {
        "r": [0.7347, 0.2653],
        "g": [0, 1],
        "b": [0.0001, -0.077]
      },
      "whitepoint": {
        "x": 0.32168,
        "y": 0.33767
      }
    },
    {
      "name": "adobe1998",
      "rgb": {
        "r": [0.64, 0.33],
        "g": [0.21, 0.71],
        "b": [0.15, 0.06]
      },
      "whitepoint": {
        "x": 0.3127,
        "y": 0.329
      }
    },
    {
      "name": "prophoto",
      "rgb": {
        "r": [0.7347, 0.2653],
        "g": [0.1596, 0.8404],
        "b": [0.0366, 0.0001]
      },
      "whitepoint": {
        "x": 0.3457,
        "y": 0.3585
      }
    }
  ] satisfies ColorSpace[]