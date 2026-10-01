import {defineField, defineType} from 'sanity'
export const source = defineType({name:'source',type:'document',title:'Pinned source',fields:[
  ...['id','repository','ref','commit','path','license','collected'].map(name=>defineField({name,type:'string',validation:r=>r.required()})),
  defineField({name:'url',type:'url',validation:r=>r.required()})
]})
export const compatibilityRule = defineType({name:'compatibilityRule',type:'document',title:'Compatibility rule',fields:[
  ...['topic','claim','action','sourceId','evidence'].map(name=>defineField({name,type:'string',validation:r=>r.required()})),
  defineField({name:'priority',type:'number'}),
  defineField({name:'status',type:'string',options:{list:['current','historical']},validation:r=>r.required()}),
  defineField({name:'when',type:'object',fields:[
    defineField({name:'device',type:'string',options:{list:['cpu','cuda']}}),
    defineField({name:'cuda',type:'number'}),defineField({name:'cudnn',type:'number'}),
    defineField({name:'input',type:'string',options:{list:['file','array']}})
  ]})
]})
export const schemaTypes=[source,compatibilityRule]
