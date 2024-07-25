import { observable, action, runInAction } from 'mobx'
import uuid from '~/utils/uuid'
import switchData from '~/utils/switchData'

function getInitMatrixData() {
  const ID = uuid()
  return {
    id: '',
    code: '',
    name: '',
    description: '',
    status: 0,
    // {rowId: '', rowNum: 0, columns: [{columnId: '', valueList: [{type: 1, id: '', name: 'abc'}]}]}
    rowList: [
      {
        rowId: uuid(),
        columns: [
          {
            columnId: ID,
            valueList: []
          }
        ]
      }
    ],
    columnList: [{ columnId: ID, columnName: undefined }],
    tenantId: '',
    creator: '',
    createTime: 0,
    updateTime: 0
  }
}

class Matrix {
  @observable.ref matrixEnableList = []

  @observable.ref matrixList = []

  @observable.ref matrixData = getInitMatrixData()

  @observable total = 0

  @observable matrixImportInfo = {}

  @observable.ref queryDate = {
    pageNo: 1,
    pageSize: 10,
    kw: undefined
  }

  @action resetMatrixData = () => {
    this.matrixData = getInitMatrixData()
  }

  @action setMatrixData = (data) => {
    this.matrixData = {
      ...this.matrixData,
      ...data
    }
  }

  // 获取当前启用的矩阵状态
  @action async getEnableList() {
    const res = (await axios.get(API.getEnableList)) || []
    runInAction(() => {
      this.matrixEnableList = res
    })
  }

  // 获取矩阵详情
  @action async getMatrix(data) {
    const res = (await axios.get(API.getMatrix, { params: data })) || {}

    runInAction(() => {
      const template = {
        rowList: [{ columns: [{ valueList: [] }] }],
        columnList: [{ columnId: uuid(), columnName: undefined }]
      }
      this.matrixData = switchData(res, template)
    })
    return res
  }

  // 获取矩阵列表
  @action async getMatrixList() {
    const queryDate = this.queryDate
    const res = (await axios.get(API.getMatrixList, { params: queryDate })) || {
      list: [],
      count: 0
    }
    runInAction(() => {
      this.matrixList = res.list || []
      this.total = res.count || 0
    })
  }

  // 矩阵的保存
  @action async matrixSave(data) {
    const res = await axios.post(API.matrixSave, data)
    return res
  }

  @action setData(data, type) {
    this[type] = data
  }

  // 删除矩阵
  @action async deleteMatrix(id) {
    const res = await axios.get(API.deleteMatrix, { params: { id } })
    return res
  }

  // 改变矩阵的状态
  @action async changeStatus(id, status) {
    const res = await axios.get(API.changeStatusMatrix, { params: { id, status } })
    return res
  }

  @action async exportMatrixRow(id) {
    await axios.get(API.exportMatrixRow, { params: { id } })
  }

  @action async canDeleteMatrixColumn(data) {
    const res = await axios.get(API.canDeleteMatrixColumn, { params: data })
    return res
  }

  // 矩阵导入进度获取
  @action async getImportMatrixProgress(code) {
    const res = await axios.get(API.getImportMatrixProgress, { params: { code } })
    runInAction(() => {
      this.matrixImportInfo = res
    })
    return res
  }
}

export default new Matrix()
