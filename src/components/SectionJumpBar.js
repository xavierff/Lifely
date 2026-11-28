import React from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
import {palette as C} from '../content/visual-system.mjs';
export default function SectionJumpBar({items,onJump}){
 if(!items.length)return null;
 return <View testID="section-jump-bar" style={S.board}><Text style={S.title}>Jump to a section</Text><View style={S.wrap}>{items.map(x=><Pressable key={x.id} testID={'jump-'+x.id} accessibilityRole="button" accessibilityLabel={'Jump to '+x.label} onPress={()=>onJump(x.id)} style={({pressed})=>[S.chip,pressed&&S.pressed]}><Text style={S.text}>Jump: {x.label}</Text></Pressable>)}</View></View>;
}
const S=StyleSheet.create({board:{padding:10,borderWidth:1,borderColor:C.border,borderRadius:12,backgroundColor:C.surface,gap:7},title:{fontSize:12,fontWeight:'700',color:C.muted},wrap:{flexDirection:'row',flexWrap:'wrap',gap:6},chip:{borderWidth:1,borderColor:'#54736A',borderRadius:9,minHeight:44,paddingHorizontal:10,paddingVertical:7,justifyContent:'center',backgroundColor:C.raised},text:{color:C.text,fontWeight:'700',fontSize:13},pressed:{opacity:.65}});
