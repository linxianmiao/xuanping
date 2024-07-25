import React, { Component } from 'react'
import { Cascader, TreeSelect, Input, Tooltip } from '@uyun/components'
import FormItem from '../components/formItem'
import Secrecy from '../components/Secrecy'
import classnames from 'classnames'
import { DownOutlined } from '@uyun/icons'

class CascaderOwn extends Component {
  constructor(props) {
    super(props)
    this.state = {
      treeData: [],
      searchValue: undefined
    }
  }

  componentDidMount() {
    const { field } = this.props
    const { tabStatus, dictionarySource, onlyLeafNode } = field

    if (tabStatus === '2') {
      if (dictionarySource === 'CHANGE_DIRECTORY') {
        this.axiosDir({ parentDepartId: '0' }, '0')
      } else {
        this.queryCasacdeDictData(undefined, onlyLeafNode)
      }
    }
  }

  _render = () => {
    const { field, getFieldValue } = this.props
    const isDir = field.tabStatus === '2'
    const initialValue = getFieldValue(field.code)
    const value = initialValue

    var val = []
    /**
     *
     * @param {默认值} defaultValue
     * @param {树的级联} treeVos
     * @param {返回的lable} labels
     */

    function getTreeData(defaultValue, treeVos, labels) {
      treeVos.forEach((treeEntityVo) => {
        if (defaultValue && defaultValue.indexOf(treeEntityVo.value) !== -1) {
          labels.push(treeEntityVo.label)
        }
        if (treeEntityVo.children) {
          getTreeData(defaultValue, treeEntityVo.children || [], labels)
        }
      })
    }
    !isDir && getTreeData(value, field.cascade || [], val)
    if (isDir) {
      if (initialValue) {
        if (field.directoryFullPath && field.directoryFullPath[initialValue.value]) {
          return field.directoryFullPath[initialValue.value]
        }
        return initialValue.label
      }
      return '--'
    } else {
      return val.join('/')
    }
  }

  queryCasacdeDictData = async (parentId, onlyLeafNode) => {
    const { dictionarySource } = this.props.field
    const params = { dicCode: dictionarySource, parentId }
    const res = (await axios.get(API.queryCascadeDictionaryData, { params })) || []
    const data = res.map((item) => ({
      title: item.name,
      value: item.id,
      id: item.id,
      pId: item.parentId,
      disabled: onlyLeafNode ? item.hasChildren : false,
      isLeaf: !item.hasChildren
    }))
    const newData = this.state.treeData.concat(data)
    res.length > 0 &&
      newData.forEach((d) => {
        if (d.id === parentId) {
          d.disabled = true
        }
      })
    this.setState({
      treeData: this.state.treeData.concat(data)
    })
  }

  onLoadData = (treeNode, onlyLeafNode) =>
    new Promise((resolve) => {
      if (this.props.field.dictionarySource === 'CHANGE_DIRECTORY') {
        const { id, type, code, parentDepartId } = treeNode.props
        const data = {}
        if (type === 'GROUP') {
          data.parentGroupCode = code
          data.parentDepartId = parentDepartId
        }
        if (type === 'DEPART') {
          data.parentDepartId = id
        }
        setTimeout(() => {
          this.axiosDir(data, id)
          resolve()
        }, 300)
      } else {
        const { id } = treeNode.props
        setTimeout(() => {
          this.queryCasacdeDictData(id, onlyLeafNode)
          resolve()
        }, 300)
      }
    })

  handleTreeSearch = _.debounce(async (value) => {
    const { dictionarySource, onlyLeafNode } = this.props.field

    if (dictionarySource === 'CHANGE_DIRECTORY') {
      return
    }

    if (!value) {
      this.setState({ treeData: [] })
      this.queryCasacdeDictData(undefined, onlyLeafNode)
      return
    }

    const params = {
      page_num: 1,
      page_size: 9999,
      kw: value
    }
    const res = (await axios.get(API.queryDictionaryData(dictionarySource), { params })) || {}
    const data = (res.list || []).map((item) => ({
      value: item.id,
      id: item.id,
      title: item.name
    }))
    this.setState({
      treeData: data
    })
  }, 300)

  axiosDir = (data, pId) => {
    axios.get(API.listDepartWithDirectory, { params: data }).then((resp) => {
      _.forEach(resp, (res) => {
        res.pId = pId
        res.isLeaf = res.type === 'DIRECTORY'
        res.title = res.name
        res.value = res.id
        res.disabled = res.type !== 'DIRECTORY'
      })
      this.setState({
        treeData: this.state.treeData.concat(resp)
      })
    })
  }

  // 子节点的children为空数组，这里将其设为null，防止子节点出现空的子选项
  setEmptyChildrenForCascade = (cascade = []) => {
    if (!cascade || cascade.length === 0) {
      return []
    }

    return cascade.map((item) => {
      if (item.children && item.children.length > 0) {
        return { ...item, children: this.setEmptyChildrenForCascade(item.children) }
      }
      return { ...item, children: null }
    })
  }

  renderReadOnly() {
    const { secrecy, type, disabled } = this.props

    if (secrecy) {
      return <Secrecy />
    }

    if (type !== 'config' && disabled) {
      return <div className="pre-wrap disabled-ticket-form">{this._render()}</div>
      // return (
      //   <Tooltip title={this._render()}>
      //     <Input value={this._render()} readOnly className="disabled-ticket-input" />
      //   </Tooltip>
      // )
    }

    return null
  }

  render() {
    const {
      field,
      getFieldDecorator,
      disabled,
      initialValue,
      type,
      fieldMinCol,
      containerId,
      secrecy,
      formLayoutType
    } = this.props
    const { treeData = [] } = this.state
    const isDir = field.tabStatus === '2'
    const fullPath =
      field.directoryFullPath && initialValue
        ? { label: field.directoryFullPath[initialValue.value], value: initialValue.value }
        : initialValue
    const ref = document.getElementById(`${containerId}`)
    return isDir ? (
      <FormItem
        field={field}
        fieldMinCol={fieldMinCol}
        className={classnames({
          'table-style-item': formLayoutType
        })}
      >
        {getFieldDecorator(field.code, {
          initialValue: fullPath,
          rules: [
            {
              required: +field.isRequired === 1,
              message: `${i18n('globe.select', '请选择')}${field.name}`
            }
          ]
        })(
          <TreeSelect
            className={classnames({
              'disabled-item': disabled
            })}
            id={field.code}
            treeDataSimpleMode
            loadData={(treeNode) => this.onLoadData(treeNode, field.onlyLeafNode)}
            getPopupContainer={(triggerNode) => triggerNode || document.body}
            placeholder={
              field.isRequired === 2
                ? ''
                : `${i18n('ticket.forms.select', '请选择')}${i18n('Sub-headings', '上级分类')}`
            }
            treeData={treeData}
            disabled={field.isRequired === 2}
            labelInValue
            filterTreeNode={false}
            showSearch={field.dictionarySource !== 'CHANGE_DIRECTORY'}
            searchValue={this.state.searchValue}
            onSearch={(value) => {
              this.setState({ searchValue: value })
              this.handleTreeSearch(value)
            }}
          />
        )}
        {this.renderReadOnly()}
      </FormItem>
    ) : (
      <FormItem
        field={field}
        fieldMinCol={fieldMinCol}
        className={classnames({
          'table-style-item': formLayoutType
        })}
      >
        {getFieldDecorator(field.code, {
          initialValue: initialValue || undefined,
          rules: [
            {
              required: +field.isRequired === 1,
              message: `${i18n('globe.select', '请选择')}${field.name}`
            }
          ],
          onChange: (value) => {
            this.props.changeTrigger && this.props.changeTrigger(field.code, value)
          }
        })(
          <Cascader
            className={classnames({
              'disabled-item': disabled
            })}
            id={field.code}
            disabled={field.isRequired === 2}
            changeOnSelect={field.onlyLeafNode === 0}
            allowClear
            showSearch
            placeholder={
              field.isRequired === 2 ? '' : `${i18n('globe.select', '请选择')}${field.name}`
            }
            notFoundContent={`${i18n('globe.notFound', '无法找到')}`}
            getPopupContainer={(triggerNode) => triggerNode || document.body}
            options={this.setEmptyChildrenForCascade(field.cascade)}
          />
        )}
        {this.renderReadOnly()}
      </FormItem>
    )
  }
}

export default CascaderOwn
