import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import Drawer from './Drawer';
import InfoModal from './Hint';
import useFinancialStore, { Asset } from '@/hooks/useStore';
import PaymentModal from './PaymentModal';

interface PageComponentProps {
  title: string;
  emptyTitle: string;
  emptyDesc: string;
  categories?:{
    id:string;
    label:string;
  }[];
  tabs?:{
    id:string;
    label:string;
  }[];
  tab1?:string;
  tab2?:string;
  addLink?:Href;
  assets?:Asset[];
  assetName?:string;
  isAnalyze?:boolean;
  analyzeList?: AnalyzeList[];
  diagramLink?:Href
  isPassive?:boolean;
}



interface AnalyzeList {
   name: string;
   id: string;
   item:Asset[]
}

const PageComponent = ({title, analyzeList, isAnalyze = false, isPassive, assetName, diagramLink, emptyDesc, emptyTitle, categories, tab1, tab2, addLink, assets}:PageComponentProps) => {
  
  const{setCurrentAsset, setCategoryOption, currentCategoryOption, currentRegOption, setRegOption, currency} = useFinancialStore();
  

 const router = useRouter();
  const [showDrawerFilter, setShowDrawerFilter] = useState(false);
  const [selectedSortFilter, setSelectedSortFilter] = useState('Сегодня');

  const [paymentModalShow, setPaymentModalShow] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);

  useEffect(()=>{
    setCategoryOption(categories&& categories[0].id || "")
  }, [])
  
  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  const markdownContent = `
## Доходы 💰

### Активный доход
**Активный доход** - деньги которые ты получаешь за свою работу (зарплата, фриланс, бизнес). Без твоего участия доходов нет.

### Пассивный доход  
**Пассивный доход** - деньги которые приходят без твоего активного труда (дивиденды, аренда, проценты по вкладам). Чем больше пассивного дохода, тем ближе финансовая свобода.

### Источники дохода
**Доход** - это не только зарплата. Есть много способов получать деньги: инвестиции в акции, доходы от недвижимости, партнерские программы:

#### 1. Регулярные доходы:
- Зарплата, пенсия, аренда или плата
- *Стоит стремиться увеличить источники регулярных доходов*

#### 2. Нерегулярные доходы:
- Подарки, подработка  
- *Подсказка: рассматривать возможность сделать нерегулярные доходы в регулярные для увеличения доходности*

---

> 💡 **Совет**: Диверсифицируйте источники дохода для финансовой стабильности
    `;
  

  const currentAnalyzeList = analyzeList || [];

  


   const handleSortSelectFilter = (value:any) => {
    setSelectedSortFilter(value);
    console.log('Selected sort:', value);
  };
  

   const liquidAssets: Asset[] = assets?.filter(x=>x.regularity==="regular") || [];

  const illiquidAssets: Asset[] = assets?.filter(x=>x.regularity==="irregular") || [];

  const filteredAssets = currentRegOption === 'regular' ? liquidAssets : currentRegOption === 'irregular' ? illiquidAssets : (assets || []);
  const currentAssets = (categories && categories[0].id !== "effect") ? filteredAssets.filter(x=>x.categoryTab===currentCategoryOption) :filteredAssets

  const totalAmount = currentAssets?.reduce((sum, asset) => sum + asset.amount, 0);

  const getTotal = (assets:Asset[]): string => {
    const sum = assets.reduce((sum, asset) => sum + asset.amount, 0) || 0;

    return new Intl.NumberFormat('ru-RU').format(sum) + ` ${currency}`;
  }

  const formatAmount = (amount: number, amount2?:number): string => {

    if(currentCategoryOption==="effect"){
      return new Intl.NumberFormat('ru-RU').format(amount2 || 0) + ' %';
    } else{
      return new Intl.NumberFormat('ru-RU').format(amount) + ` ${currency}`;
    }

    
  };


  const inc = analyzeList?.find(x=>x.id==="income")?.item.reduce((sum, asset) => sum + asset.amount, 0) || 0;
  const exp = analyzeList?.find(x=>x.id==="expences")?.item.reduce((sum, asset) => sum + asset.amount, 0) || 0;
  
  const delta = new Intl.NumberFormat('ru-RU').format(inc - exp) + ` ${currency}`;

  const act = analyzeList?.find(x=>x.id==="actives")?.item.reduce((sum, asset) => sum + asset.amount, 0) || 0;
  const pass = analyzeList?.find(x=>x.id==="passives")?.item.reduce((sum, asset) => sum + asset.amount, 0) || 0;
  
  const defActPass = new Intl.NumberFormat('ru-RU').format(act - pass) + ` ${currency}`;

  const handleCategory = (term:string) => {
    setCategoryOption(term);
  }

  const handleAssetInfo = (asset:Asset) => {
    console.log('Информация об активе:', asset);
    setCurrentAsset(asset);
    setPaymentModalShow(true);
  
  };

  const handleEditAsset = (asset:Asset) => {

    console.log('Редактировать актив:', asset);
    setCurrentAsset(asset);

    
    router.replace(addLink || "/main/finance")
  };




  const handleAddExpense = () => {
    setCurrentAsset(null)
    router.replace(addLink || "/main/finance")
  };

  const handleBack = () => {
    
    router.replace("/main/finance")
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity onPress={handleBack} className="p-2">
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <Text className="text-white text-base font-['SFProDisplaySemiBold']">
          {title}
        </Text>
        
        <View className="flex-row">
          {diagramLink && <TouchableOpacity className="p-2 mr-1" onPress={()=>router.replace(diagramLink)}>
            <Ionicons name="pie-chart-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>}
          
          <TouchableOpacity className="p-2" onPress={openModal}>
            <Ionicons name="information-circle-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {tab1 && <View className="mx-4 mb-2">
        <View className="bg-[#7676803D] rounded-lg p-0.5 flex-row">
          <TouchableOpacity
            className={`flex-1 py-1 px-4 rounded-lg ${
              currentRegOption === 'regular' ? 'bg-[#636366]' : ''
            }`}
            onPress={() => setRegOption('regular')}
          >
            <Text className={`text-center text-xs font-['SFProDisplayRegular'] text-white`}>
              {tab1}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className={`flex-1 py-1 px-4 rounded-lg ${
              currentRegOption === 'irregular' ? 'bg-[#636366]' : ''
            }`}
            onPress={() => setRegOption('irregular')}
          >
            <Text className={`text-center text-xs font-['SFProDisplayRegular'] text-white`}>
              {tab2}
            </Text>
          </TouchableOpacity>
        </View>
      </View>}
      

      <View className="mx-4 mb-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row space-x-3">
            {categories?.map((category) => (
              <TouchableOpacity
                key={category.id}
                className={`px-2 py-1 rounded-full border ${
                  currentCategoryOption === category.id
                    ? 'bg-[#2AA651] border-[#2AA651]'
                    : 'border-gray-600 bg-transparent'
                }`}
                onPress={()=> handleCategory(category.id)}
              >
                <Text className={`text-xs font-['SFProDisplayRegular'] text-white`}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
            
            {categories && 
              <TouchableOpacity
                className={`px-2 py-1 rounded-full border flex-row items-center border-[#2AA651]`}
                onPress={() => setShowDrawerFilter(true)}
              >
                <Text className={`text-xs mr-1 text-white font-['SFProDisplayRegular'] `}>
                  {selectedSortFilter}
                </Text>
                <Ionicons 
                  name="chevron-down" 
                  size={14} 
                  color="#FFF" 
                />
              </TouchableOpacity>
            }
          </View>
        </ScrollView>
      </View>


      {isAnalyze && <View className="mx-4 mb-2">
        <ScrollView  className="flex-1 " showsVerticalScrollIndicator={false}>
          <View className="flex-row w-full justify-between items-center">
           
            <Text className="text-gray-400 text-sm font-['SFProDisplayRegular']">
            {assetName}
          </Text>
            
              <TouchableOpacity
                className={`px-2 py-1 rounded-full border flex-row items-center border-[#2AA651]`}
                onPress={() => setShowDrawerFilter(true)}
              >
                <Text className={`text-xs mr-1 text-white font-['SFProDisplayRegular'] `}>
                  {selectedSortFilter}
                </Text>
                <Ionicons 
                  name="filter-outline" 
                  size={14} 
                  color="#FFF" 
                />
              </TouchableOpacity>
       
          </View>
        </ScrollView>
      </View>}

      


      {
        currentAssets.length>0 ? <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Total Assets */}
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-gray-400 text-sm font-['SFProDisplayRegular']">
            {assetName}
          </Text>
          {currentCategoryOption !== "effect" && <Text className="text-emerald-400 text-sm font-['SFProDisplayRegular']">
            {formatAmount(totalAmount)}
          </Text>}
          
        </View>

        <View className="bg-white/10 rounded-xl px-3 mb-2">
          {currentAssets.map((asset, index) => ( 
            <View key={asset.id}>
              <View className="flex-row items-center justify-between py-3">
                <View className="flex-1">
                  <Text className="text-white text-sm mb-1 font-['SFProDisplayRegular']">
                    {asset.name}
                  </Text>

                  {asset.yield && !isPassive && <Text className="text-gray-400 text-xs font-['SFProDisplayRegular']">
                    Доходность {asset.yield}%
                  </Text>}
                 
                </View>
                
                <View className="flex-row items-center">
                  <Text className="text-white text-sm font-medium mr-3 font-['SFProDisplayRegular']">
                    {formatAmount(asset.amount, asset.yield)}
                  </Text>
                  
                  <TouchableOpacity 
                    onPress={() => handleAssetInfo(asset)}
                    className=" mr-2"
                  >
                    <Ionicons name="add-circle-outline" size={20} color="#FFF" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={() => handleEditAsset(asset)}
                    className=""
                  >
                    <Ionicons name="create-outline" size={20} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </View>
              
              
            </View>
          ))}
        </View>
        
      </ScrollView> : currentAnalyzeList.length > 0 ? <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        
          {currentAnalyzeList.map((asset, index) => ( 
            <View key={index}>
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-gray-400 text-sm font-['SFProDisplayRegular']">
                  {asset.name}
                </Text>
                <Text className="text-emerald-400 text-sm font-['SFProDisplayRegular']">
                  {getTotal(asset.item)}
                </Text>
              </View>
                <View className="bg-white/10 rounded-xl px-3 mb-3">
                  {asset.item.map((el, index) => ( 
                  <View key={el.id} >
                    <View className="flex-row items-center justify-between py-3">
                      <View className="flex-1">
                        <Text className="text-white text-sm font-medium mb-1 font-['SFProDisplayRegular']">
                          {el.name}
                        </Text>

                      
                      
                      </View>
                      
                      <View className="flex-row items-center">
                        <Text className="text-white text-sm font-medium mr-3 font-['SFProDisplayRegular']">
                          {formatAmount(el.amount)}
                        </Text>
                        
                      
                      </View>
                    </View>
                    
                    
                  </View>
                ))}
                  </View>

            </View>
            
          ))}

           <View >
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-gray-400 text-sm font-['SFProDisplayRegular']">
                  Дельта
                </Text>
                <Text className="text-emerald-400 text-sm font-['SFProDisplayRegular']">
                  {delta}
                </Text>
              </View>
                <View className="bg-white/10 rounded-xl px-3 mb-3">
                 
                  <View  >
                    <View className="flex-row items-center justify-between py-3">
                      <View className="flex-1">
                        <Text className="text-white text-sm font-medium mb-1 font-['SFProDisplayRegular']">
                          Доход-расходы
                        </Text>

                      
                      
                      </View>
                      
                      <View className="flex-row items-center">
                        <Text className="text-white text-sm font-medium mr-3 font-['SFProDisplayRegular']">
                        {delta}
                        </Text>
                        
                      
                      </View>
                    </View>
                    
                    
                  </View>
          
                  </View>

            </View>

            <View >
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-gray-400 text-sm font-['SFProDisplayRegular']">
                  Расчет чистого капитала
                </Text>
                <Text className="text-emerald-400 text-sm font-['SFProDisplayRegular']">
                  {defActPass}
                </Text>
              </View>
                <View className="bg-white/10 rounded-xl px-3 mb-3">
                 
                  <View  >
                    <View className="flex-row items-center justify-between py-3">
                      <View className="flex-1">
                        <Text className="text-white text-sm font-medium mb-1 font-['SFProDisplayRegular']">
                          Активы-пассивы
                        </Text>

                      
                      
                      </View>
                      
                      <View className="flex-row items-center">
                        <Text className="text-white text-sm font-medium mr-3 font-['SFProDisplayRegular']">
                        {defActPass}
                        </Text>
                        
                      
                      </View>
                    </View>
                    
                    
                  </View>
          
                  </View>

            </View>
       
        
      </ScrollView> : <View className="flex-1 justify-center items-center px-8">
        <Text className="text-white text-base font-['SFProDisplayRegular'] mb-3 text-center">
         {emptyTitle }
        </Text>
        
        <Text className="text-white/60 text-xs text-center font-['SFProDisplayRegular'] mb-8 leading-5">
          {emptyDesc}
        </Text>
        {isAnalyze === true ? "" : <TouchableOpacity
          className="border-2 border-white rounded-2xl px-8 py-1 flex-row items-center"
          onPress={handleAddExpense}
          activeOpacity={0.8}
        >
          <Text className="text-white text-sm font-medium mr-2 font-['SFProDisplayRegular']">
            Добавить
          </Text>
          <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
        </TouchableOpacity>}
        
        
      </View> 
      

      }
      
      {currentAssets.length>0 && <View className="absolute bottom-6 right-6">
        <TouchableOpacity
          className="w-14 h-14 bg-[#2AA651] rounded-full justify-center items-center shadow-lg"
          onPress={handleAddExpense}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>} 
       <Drawer 
          title='Период'
          visible={showDrawerFilter}
          onClose={() => setShowDrawerFilter(false)}
          onSelect={handleSortSelectFilter}
          selectedValue={selectedSortFilter}
          options={ ['Сегодня', 'За месяц', 'За год']}
          animationType='fade'
          
          />

          <InfoModal 
            visible={modalVisible} 
            onClose={closeModal}
            title="Подсказки про доходы"
            content={markdownContent}
            linkUrl="https://web.telegram.org/a/#-1002352034763_2"
            linkText="Видеоурок на Telegram"
          />

          <PaymentModal
          onClose={()=>setPaymentModalShow(false)}
          
          visible={paymentModalShow}
          
          
          />
      
    </SafeAreaView>
  );
};

export default PageComponent;