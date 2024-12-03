global.AnimTemplate = 
{ 
    ColorAnimation : function(material, parameterName, colorBase, colorEnd, duration, easing, repeatMode, jumpTo, pingPongBackValue)
    {
        const animationColor = new Animation(script.getSceneObject(), duration, UpdateColorAnimation, repeatMode);
        animationColor.Easing = easing;
        function UpdateColorAnimation(ratio)
        {
            material.mainPass[parameterName] = vec4.lerp(colorBase, colorEnd, ratio);
        }        
        if (pingPongBackValue != undefined)
        {
            animationColor.OnLoop = function(ratio)
            {
                colorBase = pingPongBackValue;
            }
        }
        if (jumpTo != undefined && jumpTo)
        {
            animationColor.JumpTo(1);
        }
        else
        {
            animationColor.Start(1);
        }    
        return animationColor;
    },
    
    TextColorAnimation : function(textComponent, colorBase, colorEnd, duration, easing, repeatMode, jumpTo, pingPongBackValue)
    {
        const animationTextColor = new Animation(script.getSceneObject(), duration, UpdateTextColorAnimation, repeatMode);
        animationTextColor.Easing = easing;
        function UpdateTextColorAnimation(ratio)
        {
            textComponent.textFill.color = vec4.lerp(colorBase, colorEnd, ratio);
        }
        if (pingPongBackValue != undefined)
        {
            animationTextColor.OnLoop = function(ratio)
            {
                colorBase = pingPongBackValue;
            }
        }
        if (jumpTo != undefined && jumpTo)
        {
            animationTextColor.JumpTo(1);
        }
        else
        {
            animationTextColor.Start(1);
        }    
        return animationTextColor;
    },
    
    ScaleScreenTransformAnimation : function(screentTransform, scaleBase, scaleEnd, duration, easing, repeatMode, jumpTo, pingPongBackValue)
    {

        const animationScreenTransformScale = new Animation(script.getSceneObject(), duration, UpdateScreenTransformScaleAnimation, repeatMode);
        animationScreenTransformScale.Easing = easing;
        function UpdateScreenTransformScaleAnimation(ratio)
        {
            screentTransform.scale = vec3.lerp(vec3.one().uniformScale(scaleBase), vec3.one().uniformScale(scaleEnd), ratio);
        }
        if (pingPongBackValue != undefined)
        {
            animationScreenTransformScale.OnLoop = function(ratio)
            {
                scaleBase = pingPongBackValue;
            }
        }
        if (jumpTo != undefined && jumpTo)
        {
            animationScreenTransformScale.JumpTo(1);
        }
        else
        {
            animationScreenTransformScale.Start(1);
        }
        return animationScreenTransformScale;
    }
}







