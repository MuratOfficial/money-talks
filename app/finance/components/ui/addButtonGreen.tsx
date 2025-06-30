import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'

//большая кнопка(зеленая)



interface AddButtonGreenProps{
  title: string;

}
const AddButtonGreen: React.FC<AddButtonGreenProps>=({title})=> {
  return (
    <TouchableOpacity style={styles.button} onPress={alert}>
            <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
    button:{
   width: 343,
   height: 50,
   backgroundColor:'#2AA651',
   borderRadius: 14,
    alignItems:'center',
    justifyContent: 'center',
    marginLeft:16,
    marginRight: 16,
    marginBottom: 50,
},
buttonText:{
    width: 76,
    height: 22,
    color: '#FFFFFF'
}
    
})
export default AddButtonGreen;