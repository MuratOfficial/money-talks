import { View, Text, Linking, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { IoIosLink } from "react-icons/io";
import { Entypo, Feather } from '@expo/vector-icons';


// corect css!!
interface LinkToTutorialProps{
    link: string;
}



const LinkToTutorial:React.FC<LinkToTutorialProps>=({link})=> {
  const handleOpenLink = () => {
  Linking.openURL(link)};
  


  return (
    <View>
       <View style={styles.linkContainer}>
            <Text style={styles.title}>Ссылка на видеоурок:
            </Text>
                <TouchableOpacity onPress={handleOpenLink}>
                    <View style={styles.linkContainerIn}>
                   <Feather name='link' size={13} color={"#fff"}></Feather>
                   <Text style={styles.linkText}>{link}</Text>
                 </View>
                  </TouchableOpacity>
              </View>
    </View>
  )
}


const styles = StyleSheet.create({
    linkContainer:{
        width: 343,
        height: 102,
        gap: 12,
        backgroundColor: '#333333',
        borderRadius: 16,
        padding: 14,
      
    },
    title:{
        fontSize: 16,
        color: '#fff',
        letterSpacing: -0.41,
        lineHeight: 24,
        fontFamily: 'SFProDisplayMedium',

    },
    linkContainerIn:{
        width:315,
        height: 38,
        backgroundColor: '#3C3C3C',
        borderRadius: 12,
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 12,
        paddingRight: 12,
     justifyContent: 'center',
     alignItems: 'center',
       flexDirection: 'row',
       gap: 8,
    },
    linkText:{
        fontSize: 12,
        color: '#fff',
        fontFamily: 'SFProDisplayMedium',
        lineHeight:18,
        letterSpacing: 0,
    }
})


export default LinkToTutorial;