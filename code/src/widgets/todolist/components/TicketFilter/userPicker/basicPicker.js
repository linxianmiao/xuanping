import React, { Component } from 'react'

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

  get currentValue() {
    const { roles, dutys, variables, groups } = this.props.value
    const { type } = this.extendQuery
    switch (type) {
      case 0: return ['groups', groups]
      case 3: return ['roles', roles]
      case 4: return ['dutys', dutys]
      case 5: return ['variables', variables]
    }
  }

  componentDidMount() {
    this.getList()
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.type === 'variables' && prevProps.extendQuery.modelId !== this.extendQuery.modelId) {
      this.getList()
    }
  }

  getList = async () => {
    const { type, method } = this.props
    const { query } = this.state
    const res = await this.props.userPickStore.getList(_.assign({}, query, this.extendQuery), method)

    // 服务端返回的用户组标识是id，后面处理都是用groupId
    if (type === 'groups') {
      res.list = res.list.map(item => ({
        ...item,
        groupId: item.id
      }))
    }

    this.setState({
      list: res.list,
      total: res.count || 0
    })
  }

  handleChangeQuery = (query) => {
    this.setState({ query }, () => {
      this.getList()
    })
  }

  onSelect = (changeRows, selected) => {
    const { rowKey } = this.props
    let [key, value] = this.currentValue
    if (selected) {
      value = [...value, ...changeRows]
    } else {
      value = _.differenceWith(value, changeRows, (a, b) => {
        return a[rowKey] === b[rowKey]
      })
    }
    this.props.onChange(_.assign({}, this.props.value, { [key]: value }))
  }
}
