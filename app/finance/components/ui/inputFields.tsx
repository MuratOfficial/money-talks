import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native'
import React, { useState } from 'react'

interface InputFieldProps extends TextInputProps{
    placeHolder: string;
    title: string;
}
const InputField: React.FC<InputFieldProps> = ({placeHolder, title,...textInputProps})=>{
return(
<View>
   <View style={styles.containerText}>
    <Text numberOfLines={1}    style={styles.text}>{title}</Text>
    <TextInput
          
          style={styles.input}
          placeholder={placeHolder}

         {...textInputProps}/>
    </View>  
    
</View>

);
}
const styles= StyleSheet.create({
    containerText:{
        gap: 4
    },

    input:{
        width: 343,
        height: 48,
        backgroundColor: '#333333',
        color: '#BDBDBD',
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        fontFamily: 'SFProDisplayRegular',
        fontSize: 16,
        letterSpacing: 0,
        lineHeight: 24,
        fontWeight: 400,
    },
    text:{
        color: '#BDBDBD',
        height: 22,
        // fontFamily: '', не работает шрифе Actor
        fontSize: 14,
        letterSpacing: -0.41,
        lineHeight: 22,
        fontWeight: 400,


      
        
        
 },
    num:{
        color: '#BDBDBD',
        width: 44,
        height: 22,
    },

})
export default InputField