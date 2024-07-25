declare module '*.module.less' {
  const resource: { [key: string]: string }
  export = resouce
}


declare module '*/stores' {
  const resource: any
  export = resouce
}

declare module '*/model-list'
declare module '*/model' 
declare module '*/create-model'
declare module '*/trigger-list' 
declare module '*/trigger-list/logList' 
declare module '*/TriggerEdit2' 
declare module '*/form-management' 
declare module '*/field-list/merged' 
declare module '*/create-field' 
declare module '*/system/dictionary'

interface Window {
  LOWCODE_APP_KEY: string | undefined | null
}
