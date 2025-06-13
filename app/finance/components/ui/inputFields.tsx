import { View, Text, TextInput, StyleSheet } from 'react-native'
import React from 'react'


const InputField = ()=>{
    const[text, onChangeText] = React.useState('Введите название');
    const [number, onChangeNumber] = React.useState('');

return(
<View style={styles.container}>
    <Text style={styles.text}>Название</Text>
    <TextInput
          style={styles.input}
          onChangeText={onChangeText}
          value={text}
    />
    <Text style={styles.text}>Сумма</Text>
    <TextInput
          style={styles.input}
          onChangeText={onChangeNumber}
          value={number}
          placeholder='Введите сумму'/>
          
</View>

);
}

const styles= StyleSheet.create({
    input:{
        width: 343,
        height: 48,
        backgroundColor: '#333333',
        color: '#fff'
    },
    text:{
        width: 44,
        height: 22,
        color: '#fff'
 },
 container:{
    width: 343,
    height: 400,

 }
    
})


export default InputField