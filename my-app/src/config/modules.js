// Note: Icons are passed in from the component layer, not imported here.
// This file exports factory functions that accept an Icons object.

export function createModules(Icons) {
  return [
    { id:"topic", label:"选题发现", labelEn:"Topic Discovery", icon:Icons.Search, color:"#E8A838" },
    { id:"knowledge", label:"知识库", labelEn:"Knowledge Base", icon:Icons.Database, color:"#5BA4E6" },
    { id:"reading", label:"阅读素材", labelEn:"Reading & Clips", icon:Icons.Book, color:"#6DC584" },
    { id:"experiment", label:"实验设计", labelEn:"Experiment Design", icon:Icons.Beaker, color:"#D46B8C" },
    { id:"writing", label:"写作助手", labelEn:"Writing Assistant", icon:Icons.Edit, color:"#9B7FD4" },
    { id:"checklist", label:"自查清单", labelEn:"Checklist", icon:Icons.Check, color:"#E07B54" },
    { id:"lablog", label:"实验记录", labelEn:"Lab Log", icon:Icons.Clipboard, color:"#5BBFB5" },
  ];
}

export const AI_MODS = ["topic","writing","experiment"];

export const PAPERS = [
  { id:1,title:"Co₃O₄ Nanosheets as Efficient OER Catalysts",authors:"Zhang, Y. et al.",journal:"ACS Nano",year:2024,tags:["Co基催化剂","OER","纳米片"],cited:47,group:"核心文献" },
  { id:2,title:"N-doped Carbon for Bifunctional Zn-Air Batteries",authors:"Li, H. et al.",journal:"Adv. Mater.",year:2023,tags:["N掺杂","双功能","碳材料"],cited:112,group:"核心文献" },
  { id:3,title:"MOF-derived Electrocatalysts: A Review",authors:"Wang, J. et al.",journal:"Chem. Rev.",year:2024,tags:["MOF","综述","电催化"],cited:89,group:"综述文献" },
  { id:4,title:"Defect Engineering in Metal Oxides for ORR",authors:"Chen, M. et al.",journal:"Nature Commun.",year:2023,tags:["缺陷工程","ORR","金属氧化物"],cited:65,group:"核心文献" },
  { id:5,title:"Single-Atom Catalysts for Oxygen Electrocatalysis",authors:"Liu, S. et al.",journal:"Joule",year:2024,tags:["单原子催化","OER","ORR"],cited:203,group:"高被引" },
  { id:6,title:"Perovskite Oxides in Metal-Air Batteries",authors:"Kim, D. et al.",journal:"Energy Environ. Sci.",year:2023,tags:["钙钛矿","金属空气电池"],cited:78,group:"拓展阅读" },
];

export const CK_DATA = [
  { category:"格式规范", items:[{text:"标题格式符合目标期刊要求",done:true},{text:"摘要字数在规定范围内",done:true},{text:"关键词数量与格式正确",done:false},{text:"参考文献格式统一",done:false}]},
  { category:"图表检查", items:[{text:"所有图片分辨率 ≥ 300 DPI",done:true},{text:"图表编号与正文引用一致",done:false},{text:"坐标轴标签与单位完整",done:true},{text:"配色对色觉障碍友好",done:false}]},
  { category:"语言与逻辑", items:[{text:"无语法与拼写错误",done:false},{text:"每段主题句明确",done:true},{text:"因果关系表述准确",done:false},{text:"避免过度概括性表述",done:false}]},
  { category:"数据与引用", items:[{text:"所有数据可追溯至原始记录",done:true},{text:"统计方法描述完整",done:false},{text:"引用文献均已阅读原文",done:false},{text:"无自引过多问题",done:true}]},
];

export const DEFAULT_TOPICS = [
  { id: "1", name: "锌空气电池催化剂研究", status: "进行中" },
];
