import TableStore from './TableStore'

class TemplateListStore extends TableStore {
  queryFunc = params => axios.get(API.queryTemplateList, { params })
}

export default new TemplateListStore()
