import React, { Component } from 'react'
import { TreeSelect, Input, Tooltip } from '@uyun/components'
import FormItem from '../components/formItem'
import LazyLoad from '../components/LazyLoad'
import Secrecy from '../components/Secrecy'
import classnames from 'classnames'
import { DownOutlined } from '@uyun/icons'

export default class Dictionary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      treeData: [],
      searchValue: undefined
    }
  }

  componentDidMount() {
    const { dictionarySource } = this.props.field

    if (dictionarySource === 'CHANGE_DIRECTORY') {
      this.axiosDir({ parentDepartId: '0' }, '0')
    } else {
      this.queryCasacdeDictData()
    }
  }

  _render = () => {
    const { field, getFieldValue } = this.props
    const initialValue = getFieldValue(field.code)
    if (Array.isArray(initialValue)) {
      return initialValue
        .map((item) => {
          if (field.directoryFullPath && field.directoryFullPath[item.value]) {
            return field.directoryFullPath[item.value]
          }
          return item.label
        })
        .filter(Boolean)
        .join(', ')
    } else if (initialValue) {
      if (field.directoryFullPath && field.directoryFullPath[initialValue.value]) {
        return field.directoryFullPath[initialValue.value]
      }
      return initialValue.label
    }
    return '--'
  }

  queryCasacdeDictData = async (parentId) => {
    const { dictionarySource, onlyLeafNode } = this.props.field
    const params = { dicCode: dictionarySource, parentId }
    const res = (await axios.get(API.queryCascadeDictionaryData, { params })) || []

    const data = res.map((item) => ({
      title: item.name,
      value: item.id,
      id: item.id,
      pId: item.parentId,
      isLeaf: !item.hasChildren,
      disabled: onlyLeafNode === 1 && item.hasChildren
    }))

    this.setState({
      treeData: this.state.treeData.concat(data)
    })
  }

  onLoadData = (treeNode) =>
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
          this.queryCasacdeDictData(id)
          resolve()
        }, 300)
      }
    })

  handleTreeSearch = _.debounce(async (value) => {
    const { dictionarySource } = this.props.field

    if (dictionarySource === 'CHANGE_DIRECTORY') {
      return
    }

    if (!value) {
      this.setState({ treeData: [] })
      this.queryCasacdeDictData()
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
    const { onlyLeafNode } = this.props.field
    axios.get(API.listDepartWithDirectory, { params: data }).then((resp) => {
      _.forEach(resp, (res) => {
        res.pId = pId
        res.isLeaf = res.type === 'DIRECTORY'
        res.title = res.name
        res.value = res.id
        res.disabled = onlyLeafNode === 1 && res.type !== 'DIRECTORY'
      })
      this.setState({
        treeData: this.state.treeData.concat(resp)
      })
    })
  }

  renderReadOnly() {
    const { secrecy, disabled, field } = this.props
    if (secrecy) {
      return <Secrecy />
    }
    if (disabled) {
      return <div className="pre-wrap disabled-ticket-form ">{this._render()}</div>
      // if (!_.isEmpty(this._render())) {
      //   return <div className="pre-wrap disabled-ticket-form read-only">{this._render()}</div>
      // } else {
      //   return <Input disabled />
      // }
    }
    return null
  }

  render() {
    const {
      field,
      getFieldDecorator,
      disabled,
      initialValue,
      popupContainerId,
      fieldMinCol,
      type,
      formLayoutType
    } = this.props
    const { treeData } = this.state
    const ref = document.getElementById(`${popupContainerId}`)

    return (
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
          ]
        })(
          // <LazyLoad type={type}>
          <TreeSelect
            className={classnames('ticket-forms-trees', {
              'disabled-item': disabled
            })}
            id={field.code}
            treeDataSimpleMode
            allowClear
            multiple
            treeCheckable
            showSearch
            filterTreeNode={
              field.dictionarySource !== 'CHANGE_DIRECTORY'
                ? false
                : (inputValue, treeNode) => {
                    const { title } = treeNode.props
                    return title.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
                  }
            }
            disabled={field.isRequired === 2}
            // treeNodeLabelProp="label"
            dropdownStyle={{ maxHeight: 300 }}
            // showCheckedStrategy={TreeSelect.SHOW_PARENT}
            treeCheckStrictly
            placeholder={field.isRequired ? '' : i18n('globe.select', '请选择') + field.name}
            notFoundContent={`${i18n('globe.notFound', '无法找到')}`}
            //   getPopupContainer={() => ref || document.body}
            getPopupContainer={(triggerNode) => triggerNode || document.body}
            labelInValue
            treeData={treeData}
            loadData={this.onLoadData}
            // showSearch={field.dictionarySource !== 'CHANGE_DIRECTORY'}
            autoClearSearchValue={false}
            searchValue={this.state.searchValue}
            onSearch={(value) => {
              this.setState({ searchValue: value })
              this.handleTreeSearch(value)
            }}
            onDropdownVisibleChange={(visible) => {
              if (!visible && this.state.searchValue) {
                this.setState({ searchValue: '', treeData: [] })
                this.queryCasacdeDictData()
              }
            }}
          />
          // </LazyLoad>
        )}
        {this.renderReadOnly()}
      </FormItem>
    )
  }
}
