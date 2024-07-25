import { observable, action, runInAction } from 'mobx'
import uuidv4 from 'uuid/v4'

class FieldListStore {
  @observable cardsByIndex = []

  // 所有字段
  @observable selectedFields = []

  // 该模型拥有字段
  @observable formLayoutVoList = []

  // 单个卡片的字段列表
  @observable detailSliderVisible = false

  // 是否显示侧边栏
  @observable detailSelectItem = {}

  // 字段侧边栏的具体值
  @observable settingModalVisible = false

  // 控制字段联动策略
  @observable modelList = []

  // model卡片列表
  @observable cardClicked = false

  // 卡片页与表单页展示
  @observable frameShow = false

  // 新建字段弹框
  @observable.ref cardInformation = {}

  // 表单信息
  @observable fieldsLayout = []

  // 字段分组
  @observable loading = false

  @observable previewVisible = false

  // 预览侧边栏的展示
  @observable resTypeList = []

  // 同组之间字段的排序
  @action sortSelectFields (dragIndex, hoverIndex, parentIdx, type, tab) {
    if (type === 'group') {
      const dragCard = this.formLayoutVoList[parentIdx].fieldList[dragIndex]
      this.formLayoutVoList[parentIdx].fieldList.splice(dragIndex, 1)
      this.formLayoutVoList[parentIdx].fieldList.splice(hoverIndex, 0, dragCard)
    } else if (type === 'tab') {
      const dragCard = this.formLayoutVoList[parentIdx].tabs[tab].fieldList[dragIndex]
      this.formLayoutVoList[parentIdx].tabs[tab].fieldList.splice(dragIndex, 1)
      this.formLayoutVoList[parentIdx].tabs[tab].fieldList.splice(hoverIndex, 0, dragCard)
    }
  }

  // 预览
  @action handlePreview (visible) {
    this.previewVisible = visible
  }

  // 增加字段
  @action addNewCard (card, parentIdx, type, key) {
    if (type === 'group') {
      this.formLayoutVoList[parentIdx].fieldList.push(card)
    } else if (type === 'tab') {
      this.formLayoutVoList[parentIdx].tabs[key].fieldList.push(card)
    }
  }

  @action updateNewCard (index, card, parentIdx, type, key) {
    _.forEach(this.selectedFields, item => {
      if (item.code === card.code) {
        item.isSelect = 1
      }
    })
    if (type === 'group') {
      this.formLayoutVoList[parentIdx].fieldList[index] = card
    } else if (type === 'tab') {
      this.formLayoutVoList[parentIdx].tabs[key].fieldList[index] = card
    }
  }

  // 删除组(同时要解放自里面的字段)
  @action deleteGroup (index, type, key, callback) {
    const group = this.formLayoutVoList[index]
    let codes = []
    if (type === 'group') {
      codes = _.map(group.fieldList, field => field.code)
    } else if (type === 'tab') {
      if (typeof key === 'number') {
        codes = _.map(group.tabs[key].fieldList, field => field.code)
      } else {
      // 这个是一个二位数组，要转成一位数组
        codes = [].concat.apply([], _.map(group.tabs, val => _.map(val.fieldList, field => field.code)))
      }
    }

    if (type === 'group' || type === 'iframe' || (type === 'tab' && group.tabs.length === 1) || (type === 'tab' && typeof key !== 'number')) {
      this.formLayoutVoList = _.filter(this.formLayoutVoList, (item, idx) => idx !== index)
      callback && callback()
    } else {
      this.formLayoutVoList = _.map(this.formLayoutVoList, (item, idx) => {
        if (idx === index) {
          const tabs = _.filter(item.tabs, (tab, tabIndex) => tabIndex !== key)
          item.tabs = tabs
        }
        return item
      })
    }
    _.forEach(this.selectedFields, field => {
      if (_.includes(codes, field.code)) {
        field.isSelect = 0
      }
    })
  }

  // 删除组里的字段
  @action deleteNewCard (index, parentIdx, type, tab) {
    let group = {}
    let fieldList = []
    if (type === 'group') {
      group = _.find(this.formLayoutVoList[parentIdx].fieldList, (field, idx) => index === idx)
      fieldList = _.filter(this.formLayoutVoList[parentIdx].fieldList, (field, idx) => idx !== index)
      this.formLayoutVoList[parentIdx].fieldList = fieldList
    } else if (type === 'tab') {
      group = _.find(this.formLayoutVoList[parentIdx].tabs[tab].fieldList, (field, idx) => index === idx)
      fieldList = _.filter(this.formLayoutVoList[parentIdx].tabs[tab].fieldList, (field, idx) => index !== idx)
      this.formLayoutVoList[parentIdx].tabs[tab].fieldList = fieldList
    }
    this.selectedFields = _.map(this.selectedFields, field => {
      if (group.code === field.code) {
        field.isSelect = 0
      }
      return field
    })
  }

  @action updateFieldDataAndSelectData (cardsByIndex, selectedFields) {
    runInAction(() => {
      this.cardsByIndex = cardsByIndex
      this.selectedFields = selectedFields
    })
  }

  @action triggerDetail (visible) {
    this.detailSliderVisible = visible
  }

  @action updateSelectedDetail (item) {
    this.detailSelectItem = item
  }

  // 初始化设置一个组
  @action setFormFields () {
    const fieldList = []
    const codes = ['title', 'urgentLevel', 'ticketDesc', 'file', 'resource']
    _.forEach(this.cardsByIndex, (item, index) => {
      if (index < 5) {
        if (_.includes(['title', 'urgentLevel'], item.code)) {
          item.isRequired = 1
          item.fieldLine = 2
        } else {
          item.isRequired = 0
          item.fieldLine = 1
        }
        fieldList.push(item)
      } else {
        return false
      }
    })
    const formLayoutVoList = [{
      name: i18n('conf.model.basicInfo', '基本信息'),
      type: 'group',
      id: uuidv4(),
      description: undefined,
      fieldList: fieldList,
      fold: 0
    }]
    // 将字段进行排序（选中的放在前边，没有选中的放后边）
    let topFields = _.filter(this.selectedFields, field => _.includes(codes, field.code))
    let bottemFields = _.filter(this.selectedFields, field => !_.includes(codes, field.code))
    topFields = _.map(topFields, field => _.assign({}, field, { isSelect: 1 }))
    bottemFields = _.map(bottemFields, field => _.assign({}, field, { isSelect: 0 }))

    this.selectedFields = [...topFields, ...bottemFields]
    this.formLayoutVoList = formLayoutVoList
    this.cardInformation = _.assign({}, this.cardInformation, { formLayoutVoList })
  }

  // 添加组
  @action addFormLayoutVoList (item) {
    this.formLayoutVoList.push(item)
  }

  // 组排序
  @action sortFormLayoutVoList (prevIdx, nextIdx) {
    const dragCard = this.formLayoutVoList[prevIdx]
    this.formLayoutVoList.splice(prevIdx, 1)
    this.formLayoutVoList.splice(nextIdx, 0, dragCard)
  }

  // 数据的替换
  @action replaceFormLayoutVoList (index, item) {
    this.formLayoutVoList.splice(index, 1, item)
  }

  @action delFormLayoutVoList (index) {
    this.formLayoutVoList.splice(index, 1)
  }

  @action triggerSettingModal (visible) {
    this.settingModalVisible = visible
  }

  @action changeCardClicked = async (flag, modelId) => {
    if (flag) {
      this.loading = true
      if (_.isEmpty(this.cardsByIndex)) {
        await this.getALLFields()
      }
      if (_.isEmpty(this.selectedFields)) {
        await this.queryModelFields(modelId) // 获取模型字段列表
      }
      this.loading = false
    }
    // 当切回卡片页面的时候清空
    if (flag === false) {
      this.detailSliderVisible = false
      this.detailSelectItem = {}
    }
    this.cardClicked = flag
  }

  @action changeFrameStatu = flag => {
    this.frameShow = flag
  }

  // 改变当前的一些选中状态
  @action changeRequired = (val, fieldType, index, parentIdx, type, tab) => {
    runInAction(() => {
      this.detailSelectItem[fieldType] = val
      if (type === 'group') {
        this.formLayoutVoList[parentIdx].fieldList[index][fieldType] = val
      } else {
        this.formLayoutVoList[parentIdx].tabs[tab].fieldList[index][fieldType] = val
      }
    })
  }

  @action changeField = (field, index, parentIdx, type, tab) => {
    runInAction(() => {
      if (type === 'group') {
        this.formLayoutVoList[parentIdx].fieldList[index] = field
      } else {
        this.formLayoutVoList[parentIdx].tabs[tab].fieldList[index] = field
      }
    })
  }

  // 设置表单信息
  @action setCardsData = values => {
    if (_.isEmpty(values)) {
      this.cardInformation = {}
    } else {
      this.cardInformation = _.assign({}, this.cardInformation, values)
    }
  }

  // 设置前端触发策略
  @action setLinkageStrategyVos = (rules, index, parentIdx, type, tab) => {
    this.detailSelectItem.linkageStrategyVos = rules
    if (type === 'group') {
      this.formLayoutVoList[parentIdx].fieldList[index].linkageStrategyVos = rules
    } else {
      this.formLayoutVoList[parentIdx].tabs[tab].fieldList[index].linkageStrategyVos = rules
    }
  }

  // 保存模型表单
  @action saveModelForm = async (fields, callback) => {
    const res = await axios.post(API.saveModelForm, fields)
    runInAction(() => {
      if (res) {
        this.cardClicked = false
        this.detailSliderVisible = false
        this.detailSelectItem = {}
        callback && callback()
        this.queryModelForms(fields.modelId)
      }
    })
    return res
  }

  // 更新模型表单
  @action updateModelForm = async (fields, callback) => {
    const res = await axios.post(API.updateModelForm, fields)
    runInAction(() => {
      if (res === '200') {
        this.cardClicked = false
        this.detailSliderVisible = false
        this.detailSelectItem = {}
        callback && callback()
        this.queryModelForms(fields.modelId)
      }
    })
    return res
  }

  // 删除模型表单
  @action deleteModelForm = (formId, modelId, callback) => {
    axios.post(API.deleteModelForm(formId)).then(res => {
      if (res === '200') {
        callback && callback()
        this.queryModelForms(modelId)
      }
    })
  }

  // 获取模型表单详情
  @action async getModelForm (modelId, formId) {
    const res = await axios.get(API.getModelForm, { params: { modelId, formId } })
    const selectedFields = this.selectedFields
    const { fieldList, formLayoutVos } = res
    const codes = _.map(fieldList, field => field.code) // 遍历获取禁止拖拽的字段
    // 将字段进行排序（选中的放在前边，没有选中的放后边）
    let topFields = _.filter(selectedFields, field => _.includes(codes, field.code))
    let bottemFields = _.filter(selectedFields, field => !_.includes(codes, field.code))
    topFields = _.map(topFields, field => _.assign({}, field, { isSelect: 1 }))
    bottemFields = _.map(bottemFields, field => _.assign({}, field, { isSelect: 0 }))
    runInAction(() => {
      this.cardClicked = true
      this.selectedFields = [...topFields, ...bottemFields]
      this.formLayoutVoList = formLayoutVos || []
      this.cardInformation = res || {}
    })
  }

  // 查询模型表单列表
  @action async queryModelForms (modelId) {
    this.loading = true
    const res = await axios.get(API.queryModelForms(modelId))
    runInAction(() => {
      this.loading = false
      this.modelList = res || []
    })
  }

  // 获取所有字段
  @action getALLFields = async () => {
    const allFields = await axios.get(API.get_all_field)
    runInAction(() => {
      this.cardsByIndex = allFields
    })
  }

  // 查询模型的表单列表
  @action queryModelFields = async modelId => {
    const selectedFields = await axios.get(API.queryModelFields, { params: { modelId } })
    runInAction(() => {
      this.selectedFields = selectedFields
    })
  }

  // 保存模型列表字段库
  @action saveModelFields = data => {
    axios.post(API.saveModelFields, data)
  }

  // 获取字段分组
  @action getLayouts () {
    axios.get(API.query_field_layouts).then(res => {
      this.fieldsLayout = res || []
    })
  }

  @action async queryAllResType (data) {
    return new Promise(resolve => {
      axios.get(API.queryAllResType, { params: data }).then(res => {
        resolve(res)
      })
    })
  }

  @action async queryAssetExpand (data) {
    return new Promise(resolve => {
      axios.get(API.queryCiAttributes, { params: data }).then(res => {
        resolve(res)
      })
    })
  }

  // 初始化
  @action distroy () {
    this.cardsByIndex = [] // 所有字段
    this.selectedFields = [] // 该模型拥有字段
    this.formLayoutVoList = [] // 单个卡片的字段列表
    this.detailSliderVisible = false // 是否显示侧边栏
    this.detailSelectItem = {} // 字段侧边栏的具体值
    this.settingModalVisible = false // 控制字段联动策略
    this.modelList = [] // model卡片列表
    this.cardInformation = {}
    this.cardClicked = false // 卡片页与表单页展示
    this.frameShow = false // 新建字段弹框
    this.fieldsLayout = [] // 字段分组
    this.loading = false
    this.previewVisible = false // 预览侧边栏的展示
  }
}

export default FieldListStore
