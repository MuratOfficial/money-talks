import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { PiChartPie } from "react-icons/pi";
import { GrPowerForceShutdown } from "react-icons/gr";
import { Link } from 'expo-router';
import { IoChevronBack } from "react-icons/io5"

interface NavBarProps {
  title: string; //title change Expense,Assets,Income etc.
  link: string; //IoChevronBack
  link2: string;//GrPowerForceShutdown
}

const NavBar: React.FC<NavBarProps> = ({ title, link, link2 }) =>  {
    

  return (
    <View style={styles.container}>
     <Link href={link as any} asChild>
        <TouchableOpacity>
             <IoChevronBack style={styles.icon}/>
        </TouchableOpacity>
     </Link>
      <Text style={styles.header}>{title}</Text>
<View style={styles.container2}>    
<TouchableOpacity>
     <PiChartPie style={styles.icon}/>
 </TouchableOpacity>   
  <Link href={link2 as any} asChild>
       <TouchableOpacity>
     <GrPowerForceShutdown style={styles.icon}/>  
       </TouchableOpacity>
  </Link>
 </View>
    </View>
  )
}
const styles = StyleSheet.create({
    icon: {
        width: 28,
        height: 28,
        color: '#fff'
    },
    header:{
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    container2:{
        flexDirection: "row"
   },
    container:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: 343,
        height: 52,
        marginBottom: 10,
    },
})
export default NavBar;