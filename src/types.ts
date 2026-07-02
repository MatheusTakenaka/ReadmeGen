export interface FormData {
  name: string
  description: string
  status: 'active' | 'done' | 'archived'
  demo: string
  techs: string[]
  features: string[]
  prereqs: string
  install: string
  run: string
  screenshot: string
}

export interface StepMeta {
  id: number
  label: string
}