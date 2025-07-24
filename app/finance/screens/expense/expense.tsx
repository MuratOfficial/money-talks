import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import AddButton from '../../components/ui/addButton'
import { Link } from 'expo-router'
import SegmentPicker from '../../components/ui/segmentPicker'
import Filters from '../../components/ui/filters'
import NavBar from '../../components/ui/navBar'
import { LuCirclePlus } from "react-icons/lu";
import { BsPencilSquare } from "react-icons/bs";
import AmountModal from '../../components/ui/amountModal'
import ModalSorting from '../../components/ui/sortingModal'


const Expense:React.FC=()=> {
//  const [blurScreen, setBlurScreen]= useState(false) сделай blur screen!!!!!!!!!!!
        //  {blurScreen && (<TouchableOpacity style={styles.blur} >
        // </TouchableOpacity>)}
 const [layerVisible, setLayerVisible]= useState(true);
 const [showHint,setShowHint] = useState(true);
 const [isModalVisible, setModalVisible]= useState(false);
 const [isSortVisible, setSortVisible] = useState(false);
 const handlePress = ()=>{
 setShowHint(false);//hide hint
 setLayerVisible(false);//hide Layer
  }

 const handleOpenModal=()=>{
 setModalVisible(true)
  }
 const handleSortModalOpen=()=>{
 setSortVisible(true)
 
 }

  return (
  <Pressable onPress={handlePress} style={styles.pressScreen}>
    <View style={styles.container}>
      <View style={styles.screen}>
        {showHint && (
          <View style={styles.tooltip}>
            <View style={styles.tail}></View> 
         {/* хвостик окна */}
            <Text style={styles.tooltipText}>
              Не знаете, что делать? Нажмите, здесь есть подсказки!
            </Text>
          </View>
        )}
        
        {layerVisible && (<TouchableOpacity style={styles.visible} onPress={handlePress}>
        </TouchableOpacity>)}
           <View>
      <NavBar link2='/finance/screens/expense/adviceExpense' link='/finance' title = 'Расходы' ></NavBar>
      <SegmentPicker></SegmentPicker>
      <Filters onPress={handleSortModalOpen}></Filters>
              <ModalSorting
                 visible={isSortVisible}
                 onClose={()=> setSortVisible(false)}/>

{/*  */}
      <View style={styles.pick}>
        <Text style={styles.picked}>Picked Item(Продукты)</Text>
        <View style={styles.icon}>
          <TouchableOpacity onPress={handleOpenModal}>
          <AmountModal
          title='Продукты'
          visible={isModalVisible}
          onClose={() => setModalVisible(false)}
          onSubmit={(amount) => {
          console.log('Вы ввели сумму:', amount);
          setModalVisible(false);
  }}>     </AmountModal>
          <LuCirclePlus size={20} color='#fff'></LuCirclePlus>
        </TouchableOpacity>
        <TouchableOpacity>
           <BsPencilSquare size={20} color='#fff'></BsPencilSquare>
        </TouchableOpacity>
        </View>
      </View>
{/*компонент pick временный, необходимо вывести в отдельный компонент  */}

           </View>

            <View style={styles.container2}>
                <Text style={styles.textBold} >У вас пока нет расходов</Text>
                <Text style={styles.text}>Добавьте ваши расходы, начните отслеживать свои{`\n`}                                       денежные потоки</Text>
                <Link href={'/finance/screens/expense/addExpense'} > <AddButton/>
                </Link>
            </View>
     
      </View>
    </View>
  </Pressable>
  )
}
const styles=StyleSheet.create({
  blur:{
     position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#5B5B5B',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    opacity: 0.5
  },
  icon:{
    flexDirection: 'row',
    gap: 10,
  },
  picked:{
    color: '#fff',
  },
  pick:{
    width: 343,
    height: 212,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1E1E1E',
    borderRadius: 14,
        paddingTop: 14,
    paddingLeft: 12,
    paddingRight: 12,
  },
  pressScreen:{ 
    backgroundColor: '#fff',
    width: 375,
    height:812,
  },
  screen:{
    width: 375,
    height: 812,
    backgroundColor: '#121212',
    display: 'flex',
    alignItems: 'center'
  },
  container:{
    position: 'relative',
    backgroundColor: '#121212',
    width: 366,
    height: 417,
  },
container2:{
  alignItems: 'center',
  width: 343,
  height: 127,
  gap: 20,
  top: 108,
},
  text:{
    color: '#BDBDBD',
    fontSize: 14,
    letterSpacing: -0.41,
    fontFamily: 'SFProDisplayRegular'
  },
  textBold:{
    color: '#fff',
    fontSize: 18,
    fontFamily: 'SFProDisplaySemiBold',
    letterSpacing: 0,
  },
  tooltip: {
    width: 333,
    height: 72,
    position: 'absolute',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    transform: [{ translateY: 73 }],
    zIndex: 2,
  },
  tail:{
    width: 10,
    height: 10,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#fff',
    position: 'absolute',
    zIndex: 3,
    left: 310,
    bottom: 72,
    
  },
  tooltipText: {
    width: 301,
    height: 40,
    color: '#000',
    fontSize: 14,
    fontFamily: 'SFProDisplayRegular',
  fontWeight: 400,},
    

  visible:{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#5B5B5B',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    opacity: 0.5
    }
})
export default Expense