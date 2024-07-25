import { observable, action } from 'mobx'

class NodeStore {
    @observable.ref nodeList = []

    @observable.ref pageNum = 1

    @observable.ref pageSize = 10

    @observable.ref kw = ''

    @observable.ref total = 0

    @action async getNodeList (data) {
      const newData = _.assign({
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        kw: this.kw
      }, data)
      const res = await axios.get(API.queryListWithPagination, { params: newData })
      this.nodeList = res.list
      this.total = res.total
    }

    @action setKw(value) {
      this.kw = value
    }

    @action async saveNodeName (values = {}) {
      const url = values.id ? API.updateNodeName : API.saveNodeName
      const res = await axios.post(url, values)
      return res
    }

    @action async deleteNodeName (id) {
      const res = await axios.post(API.deleteNodeName(id))
      this.pageNum = 1
      const data = {
        pageNum: 1,
        pageSize: this.pageSize,
        kw: this.kw
      }
      this.getNodeList(data)
      return res
    }

    @action changePage (pageNum, pageSize) {
      this.pageNum = pageNum
      this.pageSize = pageSize
    }
}
export default NodeStore