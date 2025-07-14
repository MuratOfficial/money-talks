import { View, Text, TextInput, StyleSheet, TouchableOpacity, TextInputProps } from 'react-native'
import React, { useState } from 'react'

interface InputFieldProps extends TextInputProps{
    placeHolder: string;
    title: string;
}
const InputField: React.FC<InputFieldProps> = ({placeHolder, title,...textInputProps})=>{
return(
<View>
   <View style={styles.containerText}>
    <Text style={styles.text}>{title}</Text>
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
    containerNum:{
        gap: 8,
    },
    input:{
        width: 343,
        height: 48,
        backgroundColor: '#333333',
        color: '#BDBDBD',
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
    },
    text:{
        color: '#BDBDBD',
        width: 64,
        height: 22,
 },
    num:{
        color: '#BDBDBD',
        width: 44,
        height: 22,
    },

})
export default InputField