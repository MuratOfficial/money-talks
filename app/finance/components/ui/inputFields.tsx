import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'




const InputField = ()=>{
    const[text, onChangeText] = React.useState('');
    const [number, onChangeNumber] = React.useState('');

return(
<View style={styles.container}>
   <View style={styles.containerText}>
    <Text style={styles.text}>Название</Text>
    <TextInput
          style={styles.input}
          onChangeText={onChangeText}
          value={text}
          placeholder='Введите название'
    />
    </View>
    <View style={styles.containerNum}>
    <Text style={styles.num}>Сумма</Text>
    <TextInput
          style={styles.input}
          onChangeText={onChangeNumber}
          value={number}
          placeholder  ='Введите сумму'/>
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
 container:{
    width: 343,
    height: 400,
    gap : 16,
 }, 
})
export default InputField