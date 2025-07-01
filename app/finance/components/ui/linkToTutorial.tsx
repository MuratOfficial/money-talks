import { View, Text, Linking, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { IoIosLink } from "react-icons/io";
// не получилось поместить иконку цепи в один ряд!!!
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
                <View style={styles.linkContainerIn}>
                   <TouchableOpacity onPress={handleOpenLink}>
                    <IoIosLink height={12} width={12} color='#fff'></IoIosLink>
                     <Text style={styles.linkText}>{link}</Text>
                   </TouchableOpacity>
                 </View>
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
        fontWeight: 'medium',
        color: '#fff',
        letterSpacing: -0.41,
        lineHeight: 24,
        
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
       flexDirection: 'row'
    },
    linkText:{
        fontSize: 12,
        color: '#fff',
    }
})


export default LinkToTutorial;