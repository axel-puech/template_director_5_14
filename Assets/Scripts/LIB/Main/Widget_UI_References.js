//@ui {"widget":"label", "label":" "}
//@ui {"widget":"separator"}
//@ui {"widget":"label", "label":"/// VARIABLES ///"}
//@ui {"widget":"separator"}

///VARIABLES///
//@input bool myBool
//@input int myInt
//@input float myFloat
//@input string myString
//@input SceneObject[] myObjArray
//@input vec2 myVec2
//@input vec3 myVec3
//@input vec4 myVec4


///CUSTOM WIDGET///
//@ui {"widget":"label", "label":" "}
//@ui {"widget":"separator"}
//@ui {"widget":"label", "label":"/// CUSTOM WIDGET ///"}
//@ui {"widget":"separator"}

//@ui {"widget":"label", "label":"TEXT"}
//@input string text {"widget" : "text_area"}
//@input vec3 myColor = {1,0,0} {"widget":"color"}
//@input vec4 myColorAlpha = {1,1,1,1} {"widget":"color"}
//@input string myCombobox {"widget":"combobox", "values":[{"label":"VALUE 0", "value":"value 0"}, {"label":"VALUE 1", "value":"value 1"}]}
//@input string string1 = "hello" {"label":"String #1"}
//@input int number1 {"label":"Number (1.0)", "hint":"This is a number variable"}

//@input int myIntClamp {"widget":"spinbox", "label":"My Clamp Int", "min":0, "max":25, "step":5}
//@input float myFloatClamp {"widget":"spinbox", "label":"My Clamp Float", "min":0.0, "max":1.0, "step":0.001}
//@input int myIntSlider {"widget":"slider", "min":0, "max":10, "step":1}
//@input float myFloatSlider = 0.5 {"widget":"slider", "min":0.0, "max":1.0, "step":0.01}

//@input string animalType {"widget":"combobox", "values":[{"label":"cat", "value":"cat"}, {"label":"dog", "value":"dog"}, {"label":"bird", "value":"bird"}]}

///ON BOOL ACTIVATION
//@ui {"widget":"label", "label":" "}
//@ui {"widget":"separator"}
//@ui {"widget":"label", "label":"/// CONTROL WIDGET VIEW ///"}
//@ui {"widget":"separator"}
//@input bool showIfBool
//@input int intExample {"showIf":"showIfBool", "showIfValue":"true"}
//@input vec4 myColorExample = {1,1,1,1} {"widget":"color", "showIf":"showIfBool"}

//@ui {"widget":"separator"}
//@ui {"widget":"group_start", "label":"My Group"}
//@input float float0
//@input string str0
//@ui {"widget":"group_end"}

//@ui {"widget":"label", "label":" "}
//@ui {"widget":"separator"}
//@input string controlUser {"widget":"combobox", "values":[{"label":"USER 0", "value":"user0"}, {"label":"USER1", "value":"user1"}]}

//@ui {"widget":"group_start", "label":"USER 0", "showIf":"controlUser", "showIfValue":"user0"}
//@input float floatUser0
//@input string strUser0
//@ui {"widget":"group_end"}

//@ui {"widget":"group_start", "label":"USER 1", "showIf":"controlUser", "showIfValue":"user1"}
//@input float floatUser1
//@input string strUser1
//@ui {"widget":"group_end"}

//@ui {"widget":"label", "label":" "}
//@ui {"widget":"separator"}
//@ui {"widget":"label", "label":"/// STRUCT ///"}
///MY STRUCT
/*
@typedef struct
@property {vec3} a {"widget": "color"}
@property {int} c {"label":"My Int", "min":0, "max":25, "step":5}
@property {string} h {"widget":"combobox", "values":[{"label":"cat", "value":"cat"}, {"label":"dog", "value":"dog"}, {"label":"bird", "value":"bird"}]}
*/
//@input struct myStruct
//@ui {"widget":"separator"}

//@input struct[] myStructArray
//@ui {"widget":"separator"}
/*
@typedef structInStruct
@property {struct} properties
@property {int} v {"label":"My Int", "min":0, "max":25, "step":5}
*/
//@input structInStruct myStructInStruct
//@ui {"widget":"separator"}