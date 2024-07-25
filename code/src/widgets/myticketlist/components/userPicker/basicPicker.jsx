import { Component } from 'react'

export default class BasicPicker extends Component {
  state = {
    query: {
      pageNo: 1,
      pageSize: 20,
      kw: undefined
    },
    list: [],
    total: 0
  }

  componentDidMount() {
    this.getList()
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.type === 'variables' &&
      prevProps.extendQuery.modelId !== this.extendQuery.modelId
    ) {
      this.getList()
    }
  }

  getList = async () => {
    const { type, method } = this.props
    const { query, list } = this.state
    const res = await this.props.userPickStore.getList(
      _.assign({}, query, this.extendQuery),
      method
    )

    // 服务端返回的用户组标识是id，后面处理都是用groupId
    if (type === 'groups') {
      res.list = res.list.map((item) => ({
        ...item,
        groupId: item.id
      }))
    }
    let finalList = res.list || []
    if (query.lazyLoad) {
      finalList = list.concat(finalList)
    }
    this.setState({
      list: finalList,
      total: res.count || 0
    })
  }

  handleChangeQuery = (query) => {
    this.setState({ query }, () => {
      this.getList()
    })
  }

  onSelect = (changeRows, selected, type, notSelectedItems) => {
    const { rowKey, value, selectionType } = this.props
    let nextValue = [...value.all]
    if (selected) {
      nextValue =
        selectionType === 'radio'
          ? [...changeRows.map((item) => ({ ...item, type }))]
          : [...nextValue, ...changeRows.map((item) => ({ ...item, type }))]
      // 人员变量为单选需要特殊处理
      if (notSelectedItems && notSelectedItems.length > 0) {
        nextValue = nextValue.filter((d) => !notSelectedItems.includes(d.id))
      }
    } else {
      nextValue = _.differenceWith(nextValue, changeRows, (a, b) => {
        return a[rowKey] === b[rowKey]
        // return a.id === b.id
      })
    }
    this.props.onChange(_.assign({}, this.props.value, { all: nextValue }))
  }

  changeMatrixCol = (col, id) => {
    const selectedCol = col
      ? [
          {
            colId: col.key,
            colName: col.label
          }
        ]
      : null
    const newValue = _.map(this.props.value.all, (val) => {
      if (val.id === id) {
        val.matrixInfoVOS = selectedCol
      }
      return val
    })
    this.props.onChange(_.assign({}, this.props.value, { all: newValue }))
  }
}
