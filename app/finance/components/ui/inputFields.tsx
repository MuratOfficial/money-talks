import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'


interface InputFieldProps{
    placeHolderTitle: string;
    title: string;
}

const InputField: React.FC<InputFieldProps> = ({placeHolderTitle, title})=>{
const[text, onChangeText] = React.useState('');
   

return(
<View>
   <View style={styles.containerText}>
    <Text style={styles.text}>{title}</Text>
    <TextInput
          style={styles.input}
          onChangeText={onChangeText}
          value={text}
          placeholder={placeHolderTitle}
    />
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