import { View, Text, Button, StyleSheet, TouchableOpacity, TouchableOpacityProps } from 'react-native'
import React, { ReactNode } from 'react'

//большая кнопка(зеленая)



interface AddButtonGreenProps extends TouchableOpacityProps{
  title: string;

}

// onPress  другом комоненте!!!
const AddButtonGreen: React.FC<AddButtonGreenProps>=({title, onPress,})=> {
  return (
    <TouchableOpacity onPress={onPress} style={styles.button} >
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